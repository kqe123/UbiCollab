import type { User } from '../types/user.ts';
import client from './client';

// [로그인] 로그인 API 호출
export const login = async (username : string, password : string) : Promise<string> => {
    const credentials = {
        username : username,
        password : password
    };

    const response = await client.post("/login", credentials);

    // HTTP response에서 authorization 헤더 추출
    const authorization = response.headers.authorization;
    if (!authorization) {
        throw new Error("Authorization 응답 헤더가 없습니다.");
    }

    // PREFIX 제거한 JWT 토큰을 반환
    return authorization.replace("Bearer ", "");
}

// [회원가입] 아이디 중복 확인 API 호출 (중복이면 true)
export const checkUsername = async (username : string) : Promise<boolean> => {
    const response = await client.get<boolean>("/user/check-username", { params: { username } });
    return response.data;
}

// [회원가입] 회원가입 API 호출
// 가입 직후 발급되는 JWT(프로필 사진 업로드용 임시 토큰)를 반환 (없으면 null)
export const signup = async (username : string, password : string, nickname : string) : Promise<string | null> => {
    const credentials = {
        username : username,
        password : password,
        nickname : nickname,
    };

    const response = await client.post("/user", credentials);

    const authorization = response.headers.authorization;
    return authorization ? authorization.replace("Bearer ", "") : null;
}

// [회원가입/프로필 수정] 프로필 사진 업로드 API 호출 (S3 버킷 업로드)
// 대상 유저는 JWT에서 백엔드가 직접 알아내므로 userId를 따로 안 보낸다.
// accessToken을 넘기면 LocalStorage 토큰 대신 해당 토큰을 사용함. (회원가입 직후 임시 토큰)
export const uploadProfileImage = async (file : File, accessToken? : string) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await client.post("/user/profile-upload", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
            ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        }
    });
    return response.data;
}

// [현재 유저] 현재 로그인중인 유저 정보 API 호출
export const getCurrentUser = async () : Promise<User> => {
    const response = await client.get("/user/currentUser");
    return response.data;
}

// [공유 추가] 공유할 사용자 검색 API 호출
export const searchUsers = async (keyword : string, driveItemId : string) : Promise<User[]> => {
    const response = await client.get<User[]>("/user/search", { params: { keyword: keyword, publicId: driveItemId } });
    return response.data;
}

// [프로필 메뉴] 닉네임 변경 API 호출
export const changeNickname = async (nickname : string) => {
    const response = await client.patch("/user/change-nickname", { nickname : nickname });
    return response.data;
}

// [프로필 메뉴] 비밀번호 변경 API 호출
export const changePassword = async (currentPassword : string, newPassword : string) => {
    const passwordData = {
        currentPassword : currentPassword,
        newPassword : newPassword
    };
    const response = await client.patch("/user/change-password", passwordData);
    return response.data;
}

// [프로필 메뉴] 회원 탈퇴 API 호출
export const deleteUser = async () => {
    const response = await client.delete("/user/delete");
    return response.data;
}
