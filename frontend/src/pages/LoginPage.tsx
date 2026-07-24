import logo from "../assets/logo.png"
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function LoginPage () {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const navigate = useNavigate();
    

    const changeUsername = (event : React.ChangeEvent<HTMLInputElement>) => {
        setUsername(event.target.value)
    }

    const changePassword = (event : React.ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value)
    }

    const login = async (e : React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // backend api에 보낼 body
        const credentials = {
            username : username,
            password : password
        };

        try {
            
            // Backend Login API 호출
            const response = await axios.post(
                `http://localhost:8080/api/login`,
                credentials
            );
            
            console.log("로그인 성공");
            
            // HTTP response에서 authorization 헤더 추출
            const authorization = response.headers.authorization;
            if (!authorization) {
                throw new Error("Authorization 응답 헤더가 없습니다.");
            }
            
            // PREFIX 제거한 JWT 토큰을 Local Storage에 저장
            const accessToken = authorization.replace("Bearer ", "");
            localStorage.setItem("accessToken", accessToken);

            // 메인 화면(드라이브)로 이동
            navigate('/');
            } catch (error: unknown) {
                console.error("로그인 실패 :", error);
                // axios에서 발생한 오류인 경우
                if (axios.isAxiosError(error)) {
                    console.error("백엔드 응답:", error.response?.data);
                    toast.error(error.response?.data?.message ?? "로그인에 실패했습니다.");
                } 
                // 일반 오류인 경우
                else if (error instanceof Error) {
                    console.error("일반 오류:", error.message);
                    toast.error(error.message);
                } 
                // 그 외의 오류인 경우
                else {
                    console.error("알 수 없는 오류:", error);
                    toast.error("알 수 없는 오류가 발생했습니다.");
                }
            } 
    }

    return (
    <>
        <div className="w-full h-screen bg-[#E6F8FE] flex
            items-center justify-center box-border px-6" >
            <div className="w-[600px] h-[600px] rounded-[24px] flex flex-col bg-white px-6 ">
                {/* logo */}
                <img src={logo} className="w-[250px] h-[60px] mx-auto mt-10"></img>

                {/* Login Panel */}
                <form onSubmit={login} className="w-[350px] mt-8 flex mx-auto gap-3">
                    <div className="flex flex-1 flex-col gap-3">
                        {/* ID */}
                        <input type="text" 
                            className=" w-full h-[40px] border border-gray-300 rounded-md
                                text-sm focus:outline-none focus:border-sky-500 pl-2"
                                onChange={changeUsername}
                                value={username}
                                placeholder="아이디" />
                        {/* PW */}
                        <input type="password" 
                            className="w-full h-[40px] border border-gray-300 rounded-md
                                text-sm focus:outline-none focus:border-sky-500 pl-2"
                                onChange={changePassword}
                                value={password}
                                placeholder="비밀번호" />
                        <input type="submit" className="w-full h-[40px] bg-[#104FCD] rounded-[6px]
                        text-white text-sm border-0 cursor-pointer" value="로그인"/>
                    </div>
                    
                </form>
                
                <div className="w-[350px] mt-3 flex mx-auto gap-3">
                    <p className="text-sm mx-auto text-gray-400 cursor-pointer hover:underline"
                        onClick={() => navigate('/signup')}>회원가입</p>
                </div>

                <div className="flex items-center mt-15 gap-4 w-full">
                    <hr className="flex-1 border-gray-300" />
                    <span className="text-gray-500 text-sm font-medium whitespace-nowrap">또는</span>
                    <hr className="flex-1 border-gray-300" />
                </div>
                <h1 className="mx-auto mt-5 font-semibold">다른 계정으로 로그인</h1>
            </div>
        </div>
    </>
    )
}

export default LoginPage;