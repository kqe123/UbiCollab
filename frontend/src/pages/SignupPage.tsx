import logo from "../assets/logo.png"
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function SignupPage () {
    const [user, setUser] = useState({
        username : "",
        password : "",
        nickname : "",
        profileImageKey : null
    });

    const navigate = useNavigate();

    const handleChange = (event : React.ChangeEvent<HTMLInputElement>) => {
        setUser({
            ...user, [event.target.name] : event.target.value
        })
    }

    

    const validCheck = (username: string, password: string, nickname: string): boolean => {
        // 아이디: 5~20자, 소문자, 숫자, _, -
        const usernameRegex = /^[a-z0-9_-]{5,20}$/;

        // 비밀번호: 8~16자, 대/소문자, 숫자, 특수문자 포함
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,16}$/;

        if (!usernameRegex.test(username)) {
            toast.error("아이디: 5~20자의 영문 소문자, 숫자와 특수기호(_),(-)만 사용 가능합니다.");
            return false;
        }

        if (!passwordRegex.test(password)) {
            toast.error("비밀번호: 8~16자의 영문 대/소문자, 숫자, 특수문자를 사용해 주세요.");
            return false;
        }

        if (nickname.trim().length < 2) {
            toast.error("닉네임 : 2자 이상 입력해주세요.");
            return false;
        }
        return true;
    };

    const checkDuplicateUsername = async (username : string) : Promise<boolean> => {
        try {
            const response = await axios.get<boolean>(
                "http://localhost:8080/api/user/check-username",
                {
                    params: {
                        username
                    }
                }
            );

            return response.data;

            } catch (error) {
                console.error("아이디 중복 확인 실패:", error);
                toast.error("아이디 중복 확인에 실패했습니다.");
                return false;
            }
    }

    const signup = async (e : React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        // 1. 유효성 검사
        if (!validCheck(user.username, user.password, user.nickname)) {
            return;
        }

        // 2. 같은 username이 DB에 있는지 검사
        const isDuplicate = await checkDuplicateUsername(user.username);

        if (isDuplicate) {
            toast.error("이미 사용 중인 아이디입니다.");
            return;
        }
        
        // 3. 회원가입 진행
        // backend api에 보낼 body
        const credentials = {
            username : user.username,
            password : user.password,
            nickname : user.nickname,
            profileImageKey : user.profileImageKey
        };

        try {
            // Backend Login API 호출
            const response = await axios.post(
                `http://localhost:8080/api/user`,
                credentials
            );
                
            console.log("회원가입 성공");
            console.log(response.data);
            toast.success("회원가입에 성공하였습니다!")
            navigate('/login');
            } catch (error: unknown) {
                console.error("회원가입 실패 :", error);
                // axios에서 발생한 오류인 경우
                if (axios.isAxiosError(error)) {
                    console.error("백엔드 응답:", error.response?.data);
                    toast.error(error.response?.data?.message ?? "회원가입에 실패했습니다.");
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
                <img src={logo} className="w-[250px] h-[60px] mx-auto mt-5"></img>
                
                {/* Login Panel */}
                <form onSubmit={signup} className="w-[350px] mt-10 flex mx-auto gap-3">
                    <div className="flex flex-1 flex-col gap-3">
                        <h1 className="text-lg font-bold">회원가입</h1>
                        {/* Profile Image */}
                        <div className="relative w-28 h-28 mx-auto">
                            <div className="w-full h-full rounded-full border-2 border-gray-300
                                    bg-gray-100 overflow-hidden">
                                <img className="w-full h-full object-cover"/>
                            </div>

                            <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-blue-600 text-center
                                text-white shadow">+</div>
                        </div>
                        {/* ID */}
                        <input type="text" 
                            className=" w-full h-[40px] border border-gray-300 rounded-md
                                text-sm focus:outline-none focus:border-sky-500 pl-2"
                                onChange={handleChange}
                                value={user.username}
                                placeholder="아이디: 5~20자의 영문 소문자, 숫자와 특수기호(_),(-)만 사용 가능"
                                name="username"  />
                        {/* PW */}
                        <input type="password" 
                            className="w-full h-[40px] border border-gray-300 rounded-md
                                text-sm focus:outline-none focus:border-sky-500 pl-2"
                                onChange={handleChange}
                                value={user.password}
                                placeholder="비밀번호: 8~16자의 영문 대/소문자, 숫자, 특수문자 포함"
                                name="password" />
                        {/* nickname */}   
                        <input type="text" 
                            className="w-full h-[40px] border border-gray-300 rounded-md
                                text-sm focus:outline-none focus:border-sky-500 pl-2"
                                onChange={handleChange}
                                value={user.nickname}
                                placeholder="닉네임 : 2자 이상 입력"
                                name="nickname" />
                        <input type="submit" className="w-full h-[40px] bg-[#104FCD] rounded-[12px]
                            text-white text-sm border-0 cursor-pointer" value="회원가입"/>
                    </div>
                </form>
            </div>
        </div>
    </>
    )
}

export default SignupPage;