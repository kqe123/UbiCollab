package com.ubicollab.user.dto;

public record PresignedUrlResponse(
        String uploadUrl, // 프론트가 PUT할 URL
        String key        // DB profileImageKey에 저장할 값
) {}
