package com.taskboard.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.taskboard.backend.security.JwtAuthFilter;
import com.taskboard.backend.security.JwtService;

@Configuration
public class SecurityConfig {

   @Bean // This is a placeholder for security configuration beans
   SecurityFilterChain securityFilterChain(HttpSecurity http, JwtService jwtService) throws Exception {
        return http
                .csrf(csrf ->csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**", "/error").permitAll()
                        .anyRequest().authenticated())
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
                .addFilterBefore(new JwtAuthFilter(jwtService), UsernamePasswordAuthenticationFilter.class)
                .build();       
   }

   @Bean 
   PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
   }

}


// This is like a global Middleware file that will be used to secure the application. 
// It defines the security configuration for the application, including disabling CSRF protection, setting the session
//  management policy to stateless,
//  and defining which endpoints are publicly accessible and which require authentication.
//  It also provides a bean for password encoding using BCrypt.