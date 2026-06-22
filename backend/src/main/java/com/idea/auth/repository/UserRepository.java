package com.idea.auth.repository;

import com.idea.auth.domain.Role;
import com.idea.auth.domain.User;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Persistence access for {@link User}. Internal to the {@code auth} module —
 * other modules must go through {@code AuthService}, never this repository.
 */
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    List<User> findByRoleAndActiveRecordTrueOrderByFullNameAsc(Role role);
}
