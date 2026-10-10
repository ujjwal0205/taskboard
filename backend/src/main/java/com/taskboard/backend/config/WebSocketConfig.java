package com.taskboard.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import com.taskboard.backend.realtime.StompAuthInterceptor;

import lombok.RequiredArgsConstructor;

@Configuration 
@EnableWebSocketMessageBroker 
@RequiredArgsConstructor 
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    
    private final StompAuthInterceptor stompAuthInterceptor;

    @Override 
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws").setAllowedOrigins("http://localhost:3000");
    }

    @Override 
    public void configureMessageBroker(MessageBrokerRegistry registry){
        registry.enableSimpleBroker("/topic");
    }

    @Override 
    public void configureClientInboundChannel(ChannelRegistration registration){
        registration.interceptors(stompAuthInterceptor);
    }


}
