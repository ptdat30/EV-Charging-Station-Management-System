// FILE: StartSessionRequestDto.java
package com.userservice.dtos;

import lombok.Data;

@Data
public class StartSessionRequestDto {
    // [COMMAND]: ID của người dùng bắt đầu phiên sạc.
    private Long userId;

    // [COMMAND]: ID của trạm sạc.
    private Long stationId;

    // [COMMAND]: ID của trụ sạc cụ thể được sử dụng.
    private Long chargerId;
}