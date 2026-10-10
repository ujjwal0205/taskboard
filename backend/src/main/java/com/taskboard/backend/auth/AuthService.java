package com.taskboard.backend.auth;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.taskboard.backend.security.JwtService;
import com.taskboard.backend.user.User;
import com.taskboard.backend.user.UserRepository;
import com.taskboard.backend.user.UserResponse;

import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service 
@RequiredArgsConstructor 
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional 
    public UserResponse register(RegisterRequest request){
        String email = request.email().trim().toLowerCase();

        if(userRepository.existsByEmail(email)){
            throw new ResponseStatusException(HttpStatus.CONFLICT,"Email is already registered");
        }

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setName(request.name().trim());

        return UserResponse.from(userRepository.save(user));

    }


    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request){
        User user = userRepository.findByEmail(request.email().trim().toLowerCase())
            .filter(found -> passwordEncoder.matches(request.password(), found.getPasswordHash()))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

            return new AuthResponse(jwtService.generateToken(user.getId()), UserResponse.from(user));
    }
    
}
