package com.ubicollab.comment.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.hibernate.annotations.UuidGenerator;

import com.ubicollab.comment.Comment;
import com.ubicollab.comment.enums.CommentAnchorType;
import com.ubicollab.driveitem.DriveItem;
import com.ubicollab.user.User;

import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

public record CommentResponseDto(
		// 퍼블릭 ID
		UUID commentId,
		// 부모 (상위 댓글, 자기 참조)
		UUID parentId,
		// 댓글이 달린 대상(텍스트/이미지)
		CommentAnchorType anchorType,
		// 댓글 대상 파일
	 	UUID fileId,
		// 댓글 작성자 (외래키)
		String nickname,
		// 내용
		String content,
		// 댓글 작성 날짜
		LocalDateTime createdDate
) {
	public CommentResponseDto(Comment comment) {
		this(	comment.getPublicId(),
				comment.getParent() == null ? null : comment.getParent().getPublicId(), // getParent()가 null이면 바로 null 반환
				comment.getAnchorType(),
				comment.getFile().getPublicId(),
				comment.getUser().getNickname(),
				comment.getContent(),
				comment.getCreatedDate()
			);
	}
}
