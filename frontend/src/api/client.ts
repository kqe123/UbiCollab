import axios from 'axios';

// status를 함께 담는 커스텀 에러
export class ApiError extends Error {
    status?: number; // 응답이 없으면(네트워크 에러) undefined

    constructor(message: string, status?: number) {
        super(message);
        this.name = "ApiError";
        this.status = status;
    }
}

// 커스텀 axios (기본 url : http://localhost:8080/api)
const client = axios.create({ baseURL: "http://localhost:8080/api" });

// 토큰이 필요 없는 요청 (Authorization Header를 넣지 않음)
const PUBLIC_URLS = ["/login", "/user", "/user/check-username"];

// 요청 Interceptor : 요청이 나가기 직전에 끼어들어서 공통 작업을 수행함.
client.interceptors.request.use((config) => {
    if (config.url && PUBLIC_URLS.includes(config.url)) return config;

    // 요청에서 Authorization Header를 직접 지정했다면 그대로 사용 (ex. 회원가입 직후 임시 토큰)
    if (config.headers.Authorization) return config;

    // JWT 토큰을 Authorization Header에 넣음.
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
});

// 응답 Interceptor : 응답을 받기 전에 끼어들어서 공통 작업을 수행함.
client.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        // error.response === undefined : 서버가 꺼짐, 인터넷 끊김, 타임아웃 등 -> 네트워크 오류
        // 응답은 있는데 body에 messsage가 없음 : 모르는 오류
        const message = !error.response
            ? "네트워크 오류가 발생했습니다. 연결 상태를 확인해 주세요."
            : error.response.data?.message ?? "요청 처리 중 오류가 발생했습니다.";
        return Promise.reject(new ApiError(message, status));
    }
);

export default client;
