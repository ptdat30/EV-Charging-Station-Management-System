package com.analyticsservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AIChatRequest {
    private String message; // User's question/message
    private String context; // Optional context: 'revenue', 'usage', 'forecast', 'general'
    private Map<String, Object> analyticsData; // Current analytics data for context
    private List<Map<String, String>> conversationHistory; // Previous messages for context
}

