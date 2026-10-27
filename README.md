# UbiCollab

> 문서 작성부터 폴더 관리, 공유·권한 관리, 댓글을 지원하는 **웹 기반 협업 문서 드라이브**

- **개발 기간**: 2026.07 ~ 진행 중
- **개발 인원**: 1인 (기획 · DB 설계 · 백엔드 · 프론트엔드 · AWS 연동)

<br>

## 기술 스택

| 구분 | 기술 |
| --- | --- |
| **Backend** | Java 21, Spring Boot 3.5, Spring Security, Spring Data JPA, JWT (jjwt), Bean Validation |
| **Frontend** | React 19, TypeScript, TanStack Query, MUI, Tiptap Editor, Axios |
| **Database** | PostgreSQL |
| **Infra / Cloud** | AWS S3, CloudFront, Rekognition |
| **Build** | Gradle, Vite |
| **IDE / 개발 환경** | Eclipse, VS Code, WSL2 (Ubuntu) |
| **Version Control** | Git, GitHub (Issue · PR 기반 개발) |

<br>

## 아키텍처

## 주요 기능

### 📁 드라이브
- 파일·폴더 생성, 이름 변경, 이동, 폴더 탐색(Breadcrumb 경로 네비게이션)
- **내 드라이브 / 공유 문서함 / 최근 문서 / 즐겨찾기 / 휴지통** 탭
- 휴지통 이동 · 복원 · 영구 삭제

### 📝 문서 편집
- Tiptap 라이브러리 기반 텍스트 에디터
- **자동 저장** (변경된 필드만 갱신)
- 에디터 안에서 내 드라이브 · 공유 · 즐겨찾기 문서 불러오기

### 🔐 공유 및 권한
- 사용자 검색 후 문서·폴더 공유
- **4단계 권한**: `VIEWER` → `COMMENTOR` → `EDITOR` → `MANAGER`
- 상위 폴더 권한이 하위 항목으로 **상속**
- 권한 수준에 따라 UI 메뉴 제한 + **모든 백엔드 API에서 권한 검증**

### 💬 협업
- 댓글 작성/수정/삭제, 답글 작성/수정/삭제
 
### 👤 회원
- 회원가입 · 로그인(JWT), 닉네임 · 비밀번호 변경, 회원 탈퇴
- 프로필 이미지 업로드 (S3 + CloudFront, 유해 이미지 자동 차단)

<br>

## 기술적 고민과 해결

### 1. 계층형 권한 시스템
**문제** — 폴더를 공유하면 그 안의 하위 파일에도 같은 권한이 적용되어야 하고, 화면에서 메뉴를 숨기는 것만으로는 API를 직접 호출해 우회할 수 있음

**해결**
- 항목에 직접 부여된 권한이 없으면 부모 폴더를 따라 올라가며 권한을 찾는 **상속 구조** 설계
- 기능마다 필요한 권한을 정해 검사 (예: 댓글은 `COMMENTOR` 이상, 공지 작성은 `MANAGER`)
- 프론트엔드 메뉴 제한과 별개로 **모든 API에서 서버 측 권한 검증** 수행

### 2. 내부 식별자 노출 방지
**문제** — URL과 응답에 DB 기본키(Auto Increment ID)가 드러나면 다른 리소스의 ID를 추측할 수 있음

**해결** — 엔티티마다 UUID 기반 `publicId`를 따로 두어 URL과 응답에서는 `publicId`만 사용, 기본키는 외부로 내보내지 않음

### 3. 비밀번호 해싱 강화 (Salt, Pepper)
**문제** — DB가 유출되면 BCrypt 해시만으로는 오프라인 대입 공격에 노출됨.

**해결** — 서버만 아는 pepper로 `HMAC-SHA256`을 먼저 적용한 뒤 BCrypt로 해싱
```
저장값 = BCrypt( Base64( HMAC-SHA256(password, pepper) ) )
```
단순 문자열 이어붙이기 대신 HMAC을 써서 입력 길이를 고정 길이로 만들어 72바이트 제한 문제도 함께 해결

### 4. 프로필 이미지 업로드 흐름 개선

**기존 방식의 문제점** — **S3 Presigned URL**로 바로 업로드 : 사용자가 부적절한 이미지를 올려도 막을 방법이 없음

**해결** — **백엔드에서 검사 후 업로드** : **AWS Rekognition**으로 유해 이미지를 검사한 후 업로드

### 5. 프로필 이미지 불러오기 흐름 개선

**기존 방식의 문제점** — **S3 Presigned URL**로 불러오기 : 매번 URL를 발급해야 되서 캐싱이 미적용됨.

**해결** — **CloudFront로 이미지 제공** : 요청마다 URL을 새로 발급할 필요 없음, 캐싱으로 응답 속도 개선.

### 5. 구조 개선 (리팩토링)
- 프론트엔드 **JavaScript → TypeScript** 전환
- 단일 `Document` 엔티티를 파일·폴더를 아우르는 `DriveItem` 구조로 재설계
- `@RestControllerAdvice` **전역 예외 처리**와 API 응답 상태 코드 통일
- DTO를 `Java record`로 바꾸고 입력 검증을 DTO 단계에 적용
- API 호출을 `api/` 계층으로 분리하고 **TanStack Query**(`useQuery`, `useMutation`)로 서버 상태 관리, 로그아웃 시 캐시 초기화
- UI 컴포넌트를 Tailwind에서 MUI로 통일, `window.confirm`을 MUI Dialog로 교체

<br>

## ERD


<br>

## API 개요

| 도메인 | Base Path | 주요 기능 |
| --- | --- | --- |
| 인증 | `/api/login` | 로그인 (JWT 발급) |
| 회원 | `/api/user` | 회원가입, 아이디 중복 확인, 사용자 검색, 프로필 업로드, 닉네임·비밀번호 변경, 탈퇴 |
| 드라이브 | `/api/driveitem` | 생성, 조회, 경로 조회, 이름 변경, 이동, 저장, 휴지통·복원·영구 삭제 |
| 권한 | `/api/permission` | 공유, 권한 변경·삭제, 공유받은 항목 조회 |
| 즐겨찾기 | `/api/favorite` | 추가, 조회, 삭제 |
| 댓글 | `/api/comment` | 작성, 조회, 수정, 삭제 |

<br>

## 프로젝트 구조

```
ubicollab
├── backend                         # Spring Boot
│   └── src/main/java/com/ubicollab
│       ├── user/                   # 회원, 로그인, JWT
│       ├── driveitem/              # 파일·폴더
│       ├── permission/             # 공유·권한
│       ├── favorite/               # 즐겨찾기
│       ├── comment/                # 댓글
│       ├── announcement/           # 공지
│       ├── common/                 # 전역 예외 처리
│       └── SecurityConfig.java ... # 보안 설정, 인증 필터, AWS 설정
└── frontend                        # React + TypeScript
    └── src
        ├── api/                    # API 호출 계층 (axios)
        ├── components/             # UI 컴포넌트 (modal, menu, editor ...)
        ├── hooks/
        └── pages/
```

<br>

## 실행 방법

현재 로컬 개발 환경에서 운영 중이며, AWS 배포를 준비하고 있습니다.

배포 전까지는 시연 영상으로 동작을 확인하실 수 있습니다.

<br>

## 향후 계획

- [ ] **실시간 동시 편집**: 현재는 자동 저장 방식이며, WebSocket(STOMP) 또는 Yjs 기반 동시 편집 도입 검토
- [ ] **챗봇 도입**: 편집기 화면에 챗봇 버튼을 추가하여, 사이드 패널에 챗봇 도입 검토
- [ ] **토큰 저장 방식**: JWT를 Local Storage에 저장하고 있어 XSS에 취약할 수 있음 → HttpOnly Cookie + Refresh Token 구조로 전환 예정
- [ ] **테스트 코드**: 권한 검증 로직을 중심으로 단위·통합 테스트 작성 예정
- [ ] **알림 기능** : 댓글 알림, 공유 알림 등을 표시할 예정
- [ ] **문서 버전 관리 기능** : 이전 버전 문서로 롤백하거나, 
- [ ] **설정 분리**: CORS 허용 도메인, `ddl-auto` 등을 프로필(dev/prod)별로 분리
- [ ] **배포**: Docker 컨테이너화 및 AWS 배포
