package com.analyticsservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AIChatResponse {
    private String response; // AI's response message
    private List<String> suggestions; // Suggested follow-up questions
    private String context; // Context used: 'revenue', 'usage', 'forecast', 'general'
    private boolean success;
    private String error;
}

