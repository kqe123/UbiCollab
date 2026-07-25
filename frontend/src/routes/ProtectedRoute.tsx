import { Navigate, Outlet } from "react-router-dom";

type JwtPayload = {
    exp?: number;
};

function ProtectedRoute() {
    const accessToken = localStorage.getItem("accessToken");

    // 토큰 자체가 없으면 로그인 페이지로 이동
    if (!accessToken) {
        return <Navigate to="/login" replace />;
    }

    try {
        const payloadBase64 = accessToken.split(".")[1];
        
        // payLoad가 없다면
        if (!payloadBase64) {
            localStorage.removeItem("accessToken");
            return <Navigate to="/login" replace />;
        }

        // Base64URL 형식을 일반 Base64 형식으로 변환
        const base64 = payloadBase64
        .replace(/-/g, "+")
        .replace(/_/g, "/");


        const payload: JwtPayload = JSON.parse(atob(base64));
        const currentTime = Math.floor(Date.now() / 1000);

        // exp가 없거나 토큰이 만료된 경우 제거
        if (!payload.exp || payload.exp <= currentTime) {
            localStorage.removeItem("accessToken");
            return <Navigate to="/login" replace />;
        }
    } catch (error) {
        // 토큰 형식이 잘못된 경우에도 제거
        console.error("유효하지 않은 JWT 토큰입니다.", error);
        localStorage.removeItem("accessToken");

        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}

export default ProtectedRoute;
