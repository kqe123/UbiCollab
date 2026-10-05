package com.ubicollab.announcement.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.ubicollab.announcement.Announcement;

public record AnnouncementResponseDto(
		// 퍼블릭 ID
		UUID announcementId,
		// 공지 대상 파일
		UUID fileId,
		// 공지 작성자 publicId
		UUID userId,
		// 공지 작성자 닉네임 (외래키)
		String nickname,
		// 공지 작성자의 프로필 사진 URL
		String profileUrl,
		// 공지 제목
		String title,
		// 공지 내용
		String content,
		// 댓글 작성 날짜
		LocalDateTime createdDate,
		// 댓글 수정 유무(true/false)
		boolean isUpdated
) {
	public AnnouncementResponseDto(Announcement announcement, String profileUrl) {
		this(	announcement.getPublicId(),
				announcement.getFile().getPublicId(),
				announcement.getUser().getPublicId(),
				announcement.getUser().getNickname(),
				profileUrl,
				announcement.getTitle(),
				announcement.getContent(),
				announcement.getCreatedDate(),
				announcement.getUpdatedDate() == null ? false : true // 업데이트 일자가 있다면 true, 아니면 false
		);
	}
}