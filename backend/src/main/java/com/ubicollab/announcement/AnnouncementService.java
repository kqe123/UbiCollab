package com.ubicollab.announcement;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.ubicollab.announcement.dto.AnnouncementCreateDto;
import com.ubicollab.announcement.dto.AnnouncementResponseDto;
import com.ubicollab.comment.Comment;
import com.ubicollab.comment.dto.CommentResponseDto;
import com.ubicollab.common.exception.PermissionDeniedException;
import com.ubicollab.common.exception.ResourceNotFoundException;
import com.ubicollab.driveitem.DriveItem;
import com.ubicollab.driveitem.DriveItemRepository;
import com.ubicollab.permission.PermissionService;
import com.ubicollab.permission.enums.PermissionType;
import com.ubicollab.user.User;
import com.ubicollab.user.UserRepository;

@Service
public class AnnouncementService {
	private final AnnouncementRepository announcementRepository;
	private final UserRepository userRepository;
	private final DriveItemRepository driveRepository;
	private final PermissionService permissionService;
	private final String cloudFrontDomain;
	
	public AnnouncementService(AnnouncementRepository announcementRepository,
			 UserRepository userRepository,
			 DriveItemRepository driveRepository,
			 PermissionService permissionService,
			 @Value("${CLOUDFRONT_DOMAIN}") String cloudFrontDomain) {
		this.announcementRepository = announcementRepository;
		this.userRepository = userRepository;
		this.driveRepository = driveRepository;
		this.permissionService = permissionService;
		this.cloudFrontDomain = cloudFrontDomain;
	}
	
	// 공지 생성 메서드
	public void createAnnouncement(String username, AnnouncementCreateDto request) {
		// 1. 현재 로그인 사용자,대상 파일,공지 내용,공지 제목을 우선 초기화
		User user = getUserOrThrow(username); 
		DriveItem file = getDriveItemOrThrow(request.fileId());
		String title = request.title();
		String content = request.content();
		
		// 2. (접근 제어) MANAGER가 아니면 접근 제한
		PermissionType permission = permissionService.getPermission(file ,user);
		if (!(permission == PermissionType.MANAGER)) {
			throw new PermissionDeniedException("공지를 생성할 권한이 없습니다.");
		}
		
		// 3. 저장
		Announcement newAnnoucement = new Announcement(file, user, title, content, LocalDateTime.now());
		announcementRepository.save(newAnnoucement);
	}
	
	// 공지 리스트 조회 메서드
	public List<AnnouncementResponseDto> getAnnouncements(String username, UUID fileId) {
		List<AnnouncementResponseDto> result = new ArrayList<>();
		
		// 1. 현재 로그인 사용자, 대상 파일이 존재하는지 검색
		User user = getUserOrThrow(username); 
		DriveItem file = getDriveItemOrThrow(fileId);
		
		// 2. (접근 제어) MANAGER | EDITOR가 아니면 접근 제한
		PermissionType permission = permissionService.getPermission(file ,user);
		if (!(permission == PermissionType.MANAGER || permission == PermissionType.EDITOR)) {
			throw new PermissionDeniedException("공지를 조회할 권한이 없습니다.");
		}
		
		// 3. 공지 목록을 ResponseDTO에 담아서 반환
		List<Announcement> announcements = announcementRepository.findByFile(file);
		for (Announcement announcement : announcements) {
			String profileUrl = null;
			String userProfileKey = announcement.getUser().getProfileImageKey();
			if (userProfileKey != null ) {
				profileUrl = "https://" + cloudFrontDomain + "/" + userProfileKey;
			}
			result.add(new AnnouncementResponseDto(announcement, profileUrl));
		}
		return result;
	}
	
	
	
	
	
	// 현재 로그인 사용자(username)를 조회하는 공통 헬퍼
	private User getUserOrThrow(String username) {
		return userRepository.findByUsername(username)
			.orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 사용자입니다."));
	}
	
	
	// publicId로 DriveItem을 조회하는 공통 헬퍼
	private DriveItem getDriveItemOrThrow(UUID publicId) {
		return driveRepository.findByPublicId(publicId)
			.orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 아이템입니다. publicId=" + publicId));
	}
	
}
