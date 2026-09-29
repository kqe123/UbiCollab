package com.ubicollab.comment;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.ubicollab.comment.dto.CommentCreateDto;
import com.ubicollab.comment.dto.CommentResponseDto;
import com.ubicollab.comment.enums.CommentAnchorType;
import com.ubicollab.common.exception.PermissionDeniedException;
import com.ubicollab.common.exception.ResourceNotFoundException;
import com.ubicollab.driveitem.DriveItem;
import com.ubicollab.driveitem.DriveItemRepository;
import com.ubicollab.permission.PermissionService;
import com.ubicollab.permission.enums.PermissionType;
import com.ubicollab.user.User;
import com.ubicollab.user.UserRepository;
import com.ubicollab.user.dto.UserResponse;

@Service
public class CommentService {
	private final CommentRepository commentRepository;
	private final DriveItemRepository driveRepository;
	private final UserRepository userRepository;
	private final PermissionService permissionService;
	private final String cloudFrontDomain;
	
	public CommentService(CommentRepository commentRepository,
			 DriveItemRepository driveRepository,
			 UserRepository userRepository,
			 PermissionService permissionService,
			 @Value("${CLOUDFRONT_DOMAIN}") String cloudFrontDomain) {
		this.commentRepository = commentRepository;
		this.driveRepository = driveRepository;
		this.userRepository = userRepository;
		this.permissionService = permissionService;
		this.cloudFrontDomain = cloudFrontDomain;
	}
			
	// 댓글 생성 메서드
	public void createComment(String username, CommentCreateDto request) {
		// 1. 현재 로그인 사용자, 대상 파일, 부모 댓글,
		// 댓글 내용, 댓글 대상 타입(텍스트/이미지)을 우선 초기화
		User user = getUserOrThrow(username);
		DriveItem file = getDriveItemOrThrow(request.fileId());
		Comment parentComment = null;
		String content = request.content();
		CommentAnchorType anchorType = null;
		
		// 2. (접근 제어) VIEWER이거나 권한이 없는 경우 접근 제한
		PermissionType permission = permissionService.getPermission(file ,user);
		if (permission == PermissionType.VIEWER || permission == null) {
			throw new PermissionDeniedException("댓글을 생성할 권한이 없습니다.");
		}
		
		// 3-1. 입력받은 부모 Comment ID가 존재한다면 해당 Comment를 찾아서 반환
		if (request.parentId() != null) {
			parentComment = commentRepository.findByPublicId(request.parentId()).orElseThrow
				(() -> new ResourceNotFoundException("존재하지 않는 댓글입니다."));
		}
		
		// 3-2. 입력받은 부모 Comment ID가 존재한다면 해당 Comment를 찾아서 반환
		if (request.anchorType() != null) {
			anchorType = request.anchorType();
		}
		
		// 4. 저장
		Comment newComment = new Comment(parentComment, anchorType, file, user, content, LocalDateTime.now());
		commentRepository.save(newComment);
	}
	
	// 댓글 리스트 조회 메서드
	public List<CommentResponseDto> getComments(String username, UUID fileId) {
		List<CommentResponseDto> result = new ArrayList<>();
		
		// 1. 현재 로그인 사용자, 대상 파일이 존재하는지 검색
		User currentUser = getUserOrThrow(username);
		DriveItem file = getDriveItemOrThrow(fileId);
		
		// 2. (접근 제어) VIEWER이거나 권한이 없는 경우 접근 제한
		PermissionType permission = permissionService.getPermission(file ,currentUser);
		if (permission == PermissionType.VIEWER || permission == null) {
			throw new PermissionDeniedException("댓글을 조회할 권한이 없습니다.");
		}
		
		// 3. 댓글 목록을 ResponseDTO에 담아서 반환
		List<Comment> comments = commentRepository.findByFile(file);
		for (Comment comment :  comments) {
			String profileUrl = null;
			String userProfileKey = comment.getUser().getProfileImageKey();
			if (userProfileKey != null ) {
				profileUrl = "https://" + cloudFrontDomain + "/" + userProfileKey;
			}
			result.add(new CommentResponseDto(comment, profileUrl));
		}
		
		return result;
	}
	
	// 댓글 삭제  메서드
	public void deleteComment(String username, UUID commentId) {
		Comment comment = getCommentOrThrow(commentId); // 삭제할 댓글
		User user = getUserOrThrow(username); // 현재 로그인 사용자
		
		// 1. (접근 제어) 현재 로그인 유저 ≠ 해당 댓글 작성자인 경우 접근 제한
		if (!comment.getUser().getId().equals(user.getId())) 
			throw new PermissionDeniedException("댓글을 삭제할 권한이 없습니다.");
		
		// 2. 댓글 삭제
		commentRepository.delete(comment);
		
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
	
	// publicId로 Comment을 조회하는 공통 헬퍼
	private Comment getCommentOrThrow(UUID publicId) {
		return commentRepository.findByPublicId(publicId)
			.orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 댓글입니다. publicId=" + publicId));
	}
}
