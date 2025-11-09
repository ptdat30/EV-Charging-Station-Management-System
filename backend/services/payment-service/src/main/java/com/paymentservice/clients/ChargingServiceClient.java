package com.paymentservice.clients;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "CHARGING-SERVICE")
public interface ChargingServiceClient {
    
    @PutMapping("/api/sessions/{sessionId}/mark-paid")
    void markSessionAsPaid(@PathVariable("sessionId") Long sessionId, @RequestParam("paymentId") Long paymentId);
}

