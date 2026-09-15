import logo from "../assets/logo.png"
import axios from "axios";
import toast from "react-hot-toast";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

function LoginPage () {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const navigate = useNavigate();
    document.title = "로그인 - Ubicollab";

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
        <Box 
            sx={{ width: '100%',height : '100vh', bgcolor: '#E6F8FE', display: 'flex',
                alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', px: 6,
            }}
        >   
            {/* Card Layout */}
            <Container 
                sx={{ width : '50%', height : '70vh', borderRadius: '24px', display: 'flex',
                    flexDirection: 'column', bgcolor: 'white', px: 6
                }}
            >

                {/* logo */}
                <Box 
                    component="img"
                    src={logo}
                    sx={{ width: '100%', maxWidth: 250, height: 'auto', mx: 'auto', mt: 5}}
                />

                {/* Login Panel */}
                <Box 
                    component="form"
                    onSubmit={login}
                    sx={{ width : '60%', mx: 'auto', display: 'flex', flexDirection: 'column',
                        gap: 1.5, mt : 3}}
                >
                    {/* ID */}
                    <TextField 
                        type="text" 
                        size="small"
                        onChange={changeUsername}
                        value={username}
                        label="아이디"
                    />
                    {/* PW */}
                    <TextField 
                        type="password" 
                        size="small"
                        onChange={changePassword}
                        value={password}
                        label="비밀번호"
                    />
                    {/* Login Button */}
                    <Button 
                        disableElevation
                        type="submit"
                        variant="contained"
                        size="medium"
                        color="primary">
                        로그인
                    </Button>
                </Box>
                        
                <Typography
                    variant="body2"
                    sx={{ mx: 'auto', mt : 1, color: 'grey.500', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                    onClick={() => navigate('/signup')}
                > 회원가입
                </Typography>
            
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 5, gap: 2, width: '100%'}}>
                    <Divider sx={{ flex: 1 }} />
                    <Typography variant="body2" sx={{ color: 'grey.500', fontWeight: 500, whiteSpace: 'nowrap' }}>
                        또는
                    </Typography>
                    <Divider sx={{ flex: 1 }} />
                </Box>
                
                <Typography sx={{ mx: 'auto', fontWeight: 700, mt: 2}}>
                    다른 계정으로 로그인
                </Typography>
            </Container>
        </Box>
    )
}

export default LoginPage;