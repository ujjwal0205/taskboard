package com.taskboard.backend.security;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor 
public class JwtAuthFilter extends OncePerRequestFilter{

    private final JwtService jwtService;

    @Override 
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response , FilterChain filterChain)
        throws ServletException, IOException {
            
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        
        if( header != null && header.startsWith("Bearer")){
            try{
                UUID userId = jwtService.parseUserId(header.substring(7));
                var authentication = new UsernamePasswordAuthenticationToken(userId, null, List.of());
                SecurityContextHolder.getContext().setAuthentication(authentication);   
            }catch (JwtException | IllegalArgumentException e){
                SecurityContextHolder.clearContext();
            }
        }
        filterChain.doFilter(request, response);
    }
    
}
