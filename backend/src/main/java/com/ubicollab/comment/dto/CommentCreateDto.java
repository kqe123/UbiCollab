package com.ubicollab.comment.dto;

import java.util.UUID;
import com.ubicollab.comment.enums.CommentAnchorType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CommentCreateDto(
		UUID parentId,
		CommentAnchorType anchorType,
		
		@NotNull(message = "fileId는 필수입니다.")
		UUID fileId,
		
		@NotBlank(message = "content는 필수입니다.")
		String content
		
		// 댓글 작성자는 Authorization header(JWT)로 전달하고,
		// 댓글 작성 시간은 LocalDateTime.now()로 현재 시간을 생성하면 됨.
) {}
