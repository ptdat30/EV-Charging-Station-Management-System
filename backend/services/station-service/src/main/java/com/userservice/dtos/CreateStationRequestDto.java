// FILE: CreateStationRequestDto.java
package com.userservice.dtos;

import lombok.Data;

@Data
public class CreateStationRequestDto {
    private String stationCode;
    private String stationName;
    private String location; // Ví dụ: '{"address": "123 Main St", "city": "HCMC"}'
}