package com.ubicollab.user.dto;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PresignedUrlRequest(
        @NotBlank String fileName,
        @NotBlank String contentType,
        @NotNull UUID userId
) {}
