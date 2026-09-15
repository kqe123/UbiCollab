package com.ubicollab.user;


import java.io.IOException;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.ubicollab.common.exception.InvalidPasswordException;
import com.ubicollab.common.exception.PermissionDeniedException;
import com.ubicollab.common.exception.ResourceNotFoundException;
import com.ubicollab.common.exception.S3UploadDeniedException;
import com.ubicollab.driveitem.DriveItem;
import com.ubicollab.driveitem.DriveItemRepository;
import com.ubicollab.permission.PermissionService;
import com.ubicollab.user.dto.NicknameChangeDto;
import com.ubicollab.user.dto.PasswordChangeDto;
import com.ubicollab.user.dto.SignupDto;
import com.ubicollab.user.dto.UserResponse;

import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.rekognition.RekognitionClient;
import software.amazon.awssdk.services.rekognition.model.DetectModerationLabelsRequest;
import software.amazon.awssdk.services.rekognition.model.DetectModerationLabelsResponse;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.Delete;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.DeleteObjectsRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Request;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Response;
import software.amazon.awssdk.services.s3.model.ObjectIdentifier;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;
import software.amazon.awssdk.services.rekognition.model.Image;

@Service
public class UserService {
	private final UserRepository userRepository;
	private final DriveItemRepository driveRepository;
	private final PasswordEncoder passwordEncoder;
	private final PermissionService permissionService;
	private final S3Client s3Client;
	private final S3Presigner s3Presigner;
    private final String bucket;
    private final RekognitionClient rekognitionClient;
    
	public UserService (UserRepository userRepository,
			DriveItemRepository driveRepository,
			PasswordEncoder passwordEncoder,
			PermissionService permissionService,
			S3Client s3Client,
			S3Presigner s3Presigner,
			RekognitionClient rekognitionClient,
			@Value("${AWS_S3_BUCKET}") String bucket) {
		this.userRepository = userRepository;
		this.driveRepository = driveRepository;
		this.passwordEncoder = passwordEncoder;
		this.permissionService = permissionService;
		this.s3Client = s3Client;
		this.s3Presigner = s3Presigner;
		this.rekognitionClient = rekognitionClient;
        this.bucket = bucket;
	}
	
	
	// [회원가입] User를 생성하는 메서드
	public UUID createUser(SignupDto request) {
		String username = request.username();
		String password = request.password();
		String nickname = request.nickname();
		
		// User 객체 생성 (username, password, nickname, createdDate, role, profileImageKey)
		// password는 Bean으로 등록된 passwordEncoder를 사용해 암호화한다.
		User newUser = new User(username, passwordEncoder.encode(password), nickname,
								LocalDateTime.now(),"USER", null);
		
		// User 저장 + User의 PublicId 반환
		userRepository.save(newUser);
		return newUser.getPublicId();
	}
	
	// [회원가입, 프로필] 프로필사진을 s3 버킷에 업로드하는  메서드
	// 대상 유저는 인증된 username으로 조회 — 요청 파라미터로 임의의 userId를 신뢰하지 않는다.
	public void uploadProfileImage(MultipartFile file, String username) {
		
		// 1. 기본 유효성 검사 — 비어있는지, 크기, Content-Type 화이트리스트
	    if (file.isEmpty()) {
	        throw new IllegalArgumentException("파일이 비어있습니다.");
	    }
	    
	    String contentType = file.getContentType();
	    if (contentType == null || !List.of("image/png", "image/jpeg", "image/webp").contains(contentType)) {
	        throw new IllegalArgumentException("허용되지 않는 파일 형식입니다.");
	    }

	    // 2. 바이트로 읽기 (Rekognition, S3 업로드 둘 다 이 바이트를 씀)
	    byte[] bytes;
	    try {
	        bytes = file.getBytes();
	    } catch (IOException e) {
	        throw new RuntimeException("파일을 읽는 중 오류가 발생했습니다.", e);
	    }
	    
	    // 3. AWS Rekognition로 유해 콘텐츠 검사 — 여기서 걸리면 아래로 못 내려감 (S3 저장 자체가 안 됨)
	    // Rekognition이 "이 라벨이 맞다"고 판단하는 신뢰도(confidence score)가 70% 이상인 것만 결과에 포함시킴.
	    DetectModerationLabelsRequest moderationRequest = DetectModerationLabelsRequest.builder()
	            .image(Image.builder().bytes(SdkBytes.fromByteArray(bytes)).build())
	            .minConfidence(70F)
	            .build();
	    
	    // Rekognition의 사전 학습된 모델이 이미지를 분석해서, 
	    // 폭력성/노출/약물/무기/충격적 콘텐츠 등 미리 정의된 카테고리(모더레이션 라벨) 중 해당하는 게 있는지 찾아냅니다.
	    DetectModerationLabelsResponse moderationResponse =
	            rekognitionClient.detectModerationLabels(moderationRequest);
	    
		// 디버그용: 감지된 라벨별 신뢰도 로그
		moderationResponse.moderationLabels().forEach(label ->
		System.out.printf("[Rekognition] %s (%s) - %.2f%%%n",
				label.name(),
		        label.parentName().isEmpty() ? "최상위" : label.parentName(),
		        label.confidence())
		   );
	    
	    // 신뢰도 70% 이상인 모더레이션 라벨이 하나라도 감지되면 (리스트가 비어있지 않으면) 예외를 던져서 업로드 로직을 중단시킵니다.
	    if (!moderationResponse.moderationLabels().isEmpty()) {
	        throw new S3UploadDeniedException("부적절한 이미지는 업로드할 수 없습니다.");
	    }
	    
	    // 4. User 존재 확인 (인증된 본인 계정)
	    User user = getUserOrThrow(username);
	    UUID userId = user.getPublicId();

	    // 5. S3 key(경로) 생성 : 'profiles/(User의 UUID)/profile'
	    // 확장자를 key에 넣지 않음 — 렌더링은 아래 contentType 헤더가 담당하므로,
	    // 나중에 다른 형식(png -> jpg 등)으로 사진을 바꿔도 항상 같은 key라 S3가 자동으로 덮어쓰고, 고아 파일이 안 생김.
        String key = "profiles/" + userId + "/profile";

	    // 6. S3에 실제 업로드 — presigned URL 없이 백엔드에서 자기 자격증명으로 직접 PUT
        // "S3의 어느 버킷, 어느 경로(key)에, 어떤 타입(image/png 등)으로 파일을 넣을 것인가"를 정의하는 명세만 만드는 단계이다.
	    PutObjectRequest objectRequest = PutObjectRequest.builder()
	            .bucket(bucket)
	            .key(key)
	            .contentType(contentType)
	            .build();
	    
	    // S3Client가 명세를 기반으로 해당 bytes 배열(이미지)를 S3 버킷에 PUT시킴 (Image Upload)
	    s3Client.putObject(objectRequest, RequestBody.fromBytes(bytes));

	    // 7. DB에 key 반영 + 만약 중간에 예외 발생 시 롤백
	    try {
	        user.setProfileImageKey(key);
	        userRepository.save(user);
	    } catch (Exception e) {
	        // DB 저장 실패 시 방금 올린 S3 객체를 다시 지워서 고아 파일 방지
	        s3Client.deleteObject(DeleteObjectRequest.builder().bucket(bucket).key(key).build());
	        throw e;
	    }
	}


	// [회원가입] 중복 username 검사 메서드
	public Boolean checkSameUsername(String username) {
	    return userRepository.findByUsername(username).isPresent();
	}

	// [공유 추가] username 검색 엔진 메서드
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
			// 본인 제외
			if (username.equals(user.getUsername())) {
				continue;
			}
			
			String presignedUri = getProfileUri(user.getProfileImageKey());
			result.add(new UserResponse(user,presignedUri));
		}
		return result;
	}

	// 현재 로그인중인 유저 반환 메서드
	public UserResponse getCurrentUser(String username) {
		// 1. User 정보 가져옴
		User user = getUserOrThrow(username); 
		String key = user.getProfileImageKey();
		
		// 2. 프로필 사진을 로드할 Presigned URI를 반환받는다 (key가 null이면  null 반환)
		String presignedUri = getProfileUri(key);
		
		return new UserResponse(user, presignedUri);
	}
	
	// [프로필] 비밀번호 변경 메서드
	public void changePassword(String username, PasswordChangeDto request) {
		// 1. 현재 사용자가 맞는지 검증
		// 현재 User 정보를 가져온뒤, 입력값(Rawpassword)과 해시된 비밀번호를 비교함
		User user = getUserOrThrow(username);
		if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
	        throw new InvalidPasswordException("현재 비밀번호가 일치하지 않습니다.");
	    }
		
		// 2. 새 비밀번호로 변경 (유효성 검증은 Dto에서 이미 수행함)
		user.setPassword(passwordEncoder.encode(request.newPassword()));
		userRepository.save(user);
	}
	
	// [프로필] 닉네임 변경 메서드
	public void changeNickname(String username, NicknameChangeDto request) {
		// 1. 현재 사용자가 맞는지 검증
		User user = getUserOrThrow(username);
			
		// 2. 새 닉네임으로 변경
		user.setNickname(request.nickname());
		userRepository.save(user);
	}
	
	// [프로필] 회원 탈퇴 메서드
	public void deleteUser(String username) {
		// 현재 로그인된 유저
		User user = getUserOrThrow(username);
		
		// 1. DB 해당  User 삭제
		userRepository.delete(user);
		
		// profileImageKey가 존재할 때만(프로필 사진이 존재할 때만) 로직 수행
		if (user.getProfileImageKey() != null) {
			// 2. S3에서 이 유저의 "profiles/{publicId}/" prefix에 해당하는 객체를 전부 찾아서 삭제
		    String prefix = "profiles/" + user.getPublicId() + "/"; // 삭제할 대상의 경로(prefix)
		    
		    // 3. "S3의 어느 버킷, 어느 prefix의 파일을 조회할지"를 정의하는 요청(명세)을 생성
		    ListObjectsV2Request listRequest = ListObjectsV2Request.builder()
		            .bucket(bucket)
		            .prefix(prefix)
		            .build();
		    
		    // 4. 위에서 만든 요청을 실제로 S3에 전송하고, 그 응답(조회 결과)을 받음
		    // listResponse : 해당 prefix로 시작하는 객체들의 메타데이터(key, size 등)
		    ListObjectsV2Response listResponse = s3Client.listObjectsV2(listRequest);
		    
		    // 5. 조회된 객체가 하나 이상 있다면 삭제 로직 진행
		    if (!listResponse.contents().isEmpty()) {
		    	// 5-1. 조회된 S3Object 리스트에서 key(파일 경로)만 추출해
		        // DeleteObjects 요청이 요구하는 ObjectIdentifier 형태로 변환
		        List<ObjectIdentifier> objectsToDelete = listResponse.contents().stream()
		                .map(s3Object -> ObjectIdentifier.builder().key(s3Object.key()).build())
		                .toList();
		        
		        // 5-2. 삭제할 객체 목록(objectsToDelete)을 담아, "이 버킷의 이 객체들을 지워줘"라는 삭제 요청(명세)을 생성 (실제 삭제 X)
		        DeleteObjectsRequest deleteRequest = DeleteObjectsRequest.builder()
		                .bucket(bucket)
		                .delete(Delete.builder().objects(objectsToDelete).build())
		                .build();
		        
		        // 5-3. 삭제 요청을 실제로 S3에 전송 (실제 삭제 O)
		        try {
		            s3Client.deleteObjects(deleteRequest);
		        } catch (Exception e) {
		            // 로그만 남기고 넘어가서,S3에 고아 파일만 남는 정도로 처리
		            System.err.println("탈퇴 후 S3 정리 실패 (유저: " + user.getPublicId() + "): " + e.getMessage());
		        }
		    }
		}
	}
	
	// 프로필 사진을 로드할 Presigned URI를 반환하는 헬퍼 메서드
	private String getProfileUri(String key) {
		String profileUri = null;
		// 프로필 키가 존재할 경우에만 수행
		if (key != null) {
			// 1. "S3의 어느 버킷, 어느 key를 GET할 것인가"를 정의하는 요청 명세 (아직 서명 X)
			GetObjectRequest getObjectRequest = GetObjectRequest.builder()
					.bucket(bucket)
					.key(key)
					.build();
			
			// 2. 위 요청에 "10분간만 유효한 GET"이라는 서명 조건을 씌운 presign 요청 생성
	        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
	                .signatureDuration(Duration.ofMinutes(10)) // URL 유효기간 10분
	                .getObjectRequest(getObjectRequest)
	                .build();
			
	        // 3. 실제 서명 수행 — AWS 자격증명으로 로컬에서 HMAC 서명 계산 (네트워크 호출 없음, 빠름)
	        profileUri = s3Presigner.presignGetObject(presignRequest).url().toString();
		}
		return profileUri;
	}
	
	// username으로 User를 조회하는 공통 헬퍼 메서드
	private User getUserOrThrow(String username) {
		return userRepository.findByUsername(username).orElseThrow(
				() -> new ResourceNotFoundException("User를 찾을 수 없습니다. : " + username));
	}

}
