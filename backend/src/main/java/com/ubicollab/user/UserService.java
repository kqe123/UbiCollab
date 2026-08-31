package com.ubicollab.user;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ubicollab.common.exception.PermissionDeniedException;
import com.ubicollab.common.exception.ResourceNotFoundException;
import com.ubicollab.driveitem.DriveItem;
import com.ubicollab.driveitem.DriveItemRepository;
import com.ubicollab.permission.PermissionService;
import com.ubicollab.user.dto.PresignedUrlRequest;
import com.ubicollab.user.dto.PresignedUrlResponse;
import com.ubicollab.user.dto.UserResponse;

import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;


@Service
public class UserService {
	private final UserRepository userRepository;
	private final DriveItemRepository driveRepository;
	private final PasswordEncoder passwordEncoder;
	private final PermissionService permissionService;
	private final S3Presigner presigner;
    private final String bucket;

	public UserService (UserRepository userRepository,
			DriveItemRepository driveRepository,
			PasswordEncoder passwordEncoder,
			PermissionService permissionService,
			S3Presigner presigner,
			@Value("${AWS_S3_BUCKET}") String bucket) {
		this.userRepository = userRepository;
		this.driveRepository = driveRepository;
		this.passwordEncoder = passwordEncoder;
		this.permissionService = permissionService;
		this.presigner = presigner;
        this.bucket = bucket;
	}
	
	// User를 생성하는 메서드
	public UUID createUser(User user) {
		String username = user.getUsername();
		String password = user.getPassword();
		String nickname = user.getNickname();
		
		// 유효성 검사
		if (username == null || username.isBlank()) {
	        throw new IllegalArgumentException("username은 필수입니다.");
	    }
		
		if (password == null || password.isBlank()) {
	        throw new IllegalArgumentException("password은 필수입니다.");
	    }
		
		if (nickname == null || nickname.isBlank()) {
	        throw new IllegalArgumentException("nickname은 필수입니다.");
	    }
		
		// User 객체 생성 (username, password, nickname, createdDate, role, profileImageKey)
		// password는 Bean으로 등록된 passwordEncoder를 사용해 암호화한다.
		User newUser = new User(username, passwordEncoder.encode(password), nickname,
								LocalDateTime.now(),"USER", null);
		
		// User 저장 + User의 PublicId 반환
		userRepository.save(newUser);
		return newUser.getPublicId();
	}
	
	// 프로필 사진을 올릴 presigned URI를 반환하는 메서드
	public PresignedUrlResponse createAvatarUploadUrl(PresignedUrlRequest request) {
        // 경로 :  profiles/(User의 UUID)/profile.png
		int dotIndex = request.fileName().lastIndexOf('.');
		String extension = (dotIndex == -1) ? "" : request.fileName().substring(dotIndex);
        String key = "profiles/" + request.userId() + "/" + "profile" + extension;
        
        // "S3의 어느 버킷, 어느 경로(key)에, 어떤 타입(image/png 등)으로 파일을 넣을 것인가"를 정의하는 요청 객체
        // 아직 실제로 업로드하는 게 아니라 "이런 업로드가 있을 예정"이라는 명세만 만드는 단계이다.
        PutObjectRequest objectRequest = PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType(request.contentType())
                .build();
        
        // 위에서 만든 업로드 명세(objectRequest)를 감싸서, 
        // "이 업로드 요청에 서명(presign)해줘, 유효시간은 5분으로"라는 요청을 만듭니다.
        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(5))
                .putObjectRequest(objectRequest)
                .build();

        String url = presigner.presignPutObject(presignRequest).url().toString();
        return new PresignedUrlResponse(url, key);
    }
	
	// 방금 회원가입한 User에 프로필사진 경로를 업데이트하는 메서드
	public void updateProfileImageKey(String profileImageKey, UUID userId) {
		// 방금 회원가입한 유저가 존재하는지 확인
		User user = getUserByPublicIdOrThrow(userId);

		// 입력받은  profileImageKey 그대로 해당 유저에게 부여 + 저장
		user.setProfileImageKey(profileImageKey);
		userRepository.save(user);
	}

	// 중복 username 검사 메서드
	public Boolean checkSameUsername(String username) {
	    return userRepository.findByUsername(username).isPresent();
	}

	// username 검색 엔진 메서드
	public List<UserResponse> searchUsers(String username, String keyword, UUID publicId) {
		List<UserResponse> result = new ArrayList<>();

		// 현재 로그인 유저
		User currentUser = getUserOrThrow(username);

		// 현재 DriveItem
		DriveItem driveItem = driveRepository.findByPublicId(publicId).orElseThrow(
				() -> new ResourceNotFoundException("해당 아이템을 찾을 수 없습니다. publicId="+ publicId));

		// [권한 제어] 공유 대상을 검색하는 API이므로, createPermission과 동일하게 OWNER | MANAGER 권한 필요
		if (!permissionService.isOwnerOrManager(driveItem, currentUser)) {
			throw new PermissionDeniedException("사용자를 검색할 권한이 없습니다.");
		}

		// 해당 키워드를 기반으로 검색 결과 반환 (소유자(Owner),자기 자신 ,이미 공유중인 사용자들 제외)
		List<User> users = userRepository.searchByUsername(keyword, driveItem.getUser().getUsername(), publicId);
		for (User user : users) {
			if (username.equals(user.getUsername())) {
				continue;
			}
			result.add(new UserResponse(user));
		}
		return result;
	}

	// 현재 로그인중인 유저 반환 메서드
	public UserResponse getCurrentUser(String username) {
		return new UserResponse(getUserOrThrow(username));
	}

	// username으로 User를 조회하는 공통 헬퍼
	private User getUserOrThrow(String username) {
		return userRepository.findByUsername(username).orElseThrow(
				() -> new ResourceNotFoundException("User를 찾을 수 없습니다. : " + username));
	}

	// publicId로 User를 조회하는 공통 헬퍼
	private User getUserByPublicIdOrThrow(UUID userId) {
		return userRepository.findByPublicId(userId).orElseThrow(
				() -> new ResourceNotFoundException("존재하지 않는 사용자입니다."));
	}

}
