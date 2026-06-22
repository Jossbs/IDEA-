package com.idea.auth.service;

import com.idea.auth.domain.Role;
import com.idea.auth.domain.User;
import com.idea.auth.dto.AuthResponse;
import com.idea.auth.dto.LoginRequest;
import com.idea.auth.dto.RegisterRequest;
import com.idea.auth.dto.UserResponse;
import com.idea.auth.mapper.AuthMapper;
import com.idea.auth.repository.UserRepository;
import com.idea.auth.security.JwtService;
import com.idea.shared.web.exception.DuplicateResourceException;
import java.util.List;
import java.util.UUID;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthServiceImpl(
            UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> listStudents() {
        return userRepository.findByRoleAndActiveRecordTrueOrderByFullNameAsc(Role.STUDENT).stream()
                .map(AuthMapper::toUserResponse)
                .toList();
    }

    @Override
    public AuthResponse register(RegisterRequest request) {
        String email = request.email().trim();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new DuplicateResourceException("Ya existe una cuenta con el correo \"" + email + "\".");
        }
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setFullName(request.fullName().trim());
        user.setRole(request.role());
        return tokensFor(userRepository.save(user));
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.email().trim())
                .orElseThrow(() -> new BadCredentialsException("Correo o contraseña incorrectos."));
        if (!user.isActiveRecord() || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Correo o contraseña incorrectos.");
        }
        return tokensFor(user);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse refresh(String refreshToken) {
        UUID userId;
        try {
            userId = jwtService.parseRefreshSubject(refreshToken);
        } catch (Exception ex) {
            throw new BadCredentialsException("Token de actualización inválido o expirado.");
        }
        User user = userRepository.findById(userId)
                .filter(User::isActiveRecord)
                .orElseThrow(() -> new BadCredentialsException("Token de actualización inválido o expirado."));
        return tokensFor(user);
    }

    private AuthResponse tokensFor(User user) {
        return AuthResponse.of(
                jwtService.generateAccessToken(user),
                jwtService.generateRefreshToken(user),
                AuthMapper.toUserResponse(user));
    }
}
