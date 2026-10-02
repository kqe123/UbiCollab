package com.ubicollab.comment.dto;

import java.util.UUID;
import com.ubicollab.comment.enums.CommentAnchorType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CommentCreateDto(
		UUID parentId,
		CommentAnchorType anchorType,
		
		@NotNull(message = "fileId는 필수입니다.")
		UUID fileId,
		
		@NotBlank(message = "content는 필수입니다.")
		@Size(max = 500, message="댓글은 500자 이내로 작성해주세요.")
		String content
		
		// 댓글 작성자는 Authorization header(JWT)로 전달하고,
		// 댓글 작성 시간은 LocalDateTime.now()로 현재 시간을 생성하면 됨.
) {}
