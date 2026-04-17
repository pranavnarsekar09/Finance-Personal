package com.personalproject.tracker.ai;

import com.personalproject.tracker.ai.dto.ChatRequest;
import com.personalproject.tracker.ai.dto.ChatResponse;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/chat")
    public ChatResponse chat(@RequestParam String userId, @RequestBody ChatRequest request) {
        return chatService.chat(userId, request);
    }
}
