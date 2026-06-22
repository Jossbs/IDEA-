package com.idea.shared.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web-layer (MVC) configuration hook.
 *
 * <p>CORS now lives in the security filter chain ({@code SecurityConfig}) so it
 * applies before authorization (preflight + bearer requests). Kept as the place
 * for any future MVC-level customization (formatters, interceptors, …).</p>
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {
}
