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
            console.log(response.data);
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
        <div className="w-full h-screen bg-sky-100 flex
            items-center justify-center box-border px-6" >
            <div className="w-[600px] h-[600px] rounded-[24px] flex flex-col bg-white px-6 ">
                {/* logo */}
                <img src={logo} className="w-[250px] h-[60px] mx-auto mt-20"></img>

                {/* Login Panel */}
                <form onSubmit={login} className="w-[350px] mt-10 flex mx-auto gap-3">
                    <div className="flex flex-1 flex-col gap-3">
                        {/* ID */}
                        <input type="text" 
                            className=" w-full h-[40px] border border-gray-300 rounded-md
                                text-sm focus:outline-none focus:border-black-300"
                                onChange={changeUsername}
                                value={username}
                                placeholder="아이디" />
                        {/* PW */}
                        <input type="password" 
                            className="w-full h-[40px] border border-gray-300 rounded-md
                                text-sm focus:outline-none focus:border-black-300"
                                onChange={changePassword}
                                value={password}
                                placeholder="비밀번호" />
                    </div>
                    {/* login Button */}
                    <input type="submit" className="w-[80px] h-[92px] bg-[#104FCD] rounded-[12px]
                        text-white text-sm border-0" value="로그인"/>
                </form>

            </div>
        </div>
    </>
    )
}

export default LoginPage;