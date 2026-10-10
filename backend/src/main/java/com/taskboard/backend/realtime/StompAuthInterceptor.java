package com.taskboard.backend.realtime;

import java.util.List;
import java.util.UUID;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessagingException;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;

import com.taskboard.backend.board.BoardMemberService;
import com.taskboard.backend.security.JwtService;

import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;


@Component 
@RequiredArgsConstructor 
public class StompAuthInterceptor implements ChannelInterceptor {
    
    private static final String BOARD_TOPIC_PREFIX  = "/topic/board/";

    private final JwtService jwtService;
    private final BoardMemberService boardMemberService;


    @Override 
    public Message<?> preSend(Message<?> message, MessageChannel channel){
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message,StompHeaderAccessor.class);
        if(accessor == null || accessor.getCommand()== null){
            return message;
        }

        switch (accessor.getCommand()) {
            case CONNECT -> authenticate(accessor);
            case SUBSCRIBE -> authorizeSubscription(accessor);
            case SEND -> throw new MessagingException("Clients cannot send messages");
                
            default -> {

            }
            
        }
        return message;
    }


        private void authenticate(StompHeaderAccessor accessor){
            String header = accessor.getFirstNativeHeader("Authorization");
            if(header == null || !header.startsWith("Bearer ")){
                throw new MessagingException("Missing token");
            }
            try {
                UUID userId = jwtService.parseUserId(header.substring(7));
                accessor.setUser(new UsernamePasswordAuthenticationToken(userId,null,List.of()));
            } catch (JwtException | IllegalArgumentException e) {
                throw new MessagingException("Invalid token");
            }
        }


        private void authorizeSubscription(StompHeaderAccessor accessor) {
            String destination = accessor.getDestination();

            if(!(accessor.getUser() instanceof UsernamePasswordAuthenticationToken authentication)
            || destination == null || !destination.startsWith(BOARD_TOPIC_PREFIX)){
                throw new MessagingException("Subscription not allowed");
            }

            UUID boardId;
             try {
            boardId = UUID.fromString(destination.substring(BOARD_TOPIC_PREFIX.length()));
        } catch (IllegalArgumentException e) {
            throw new MessagingException("Subscription not allowed");
        }
        if (!boardMemberService.isMember(boardId, (UUID) authentication.getPrincipal())) {
            throw new MessagingException("Subscription not allowed");
        }
        }
    }

