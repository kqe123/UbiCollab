import logo from "../assets/logo.png"
import toast from "react-hot-toast";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { login } from '../api/userApi.ts';


function LoginPage () {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const navigate = useNavigate();
    const queryClient = useQueryClient(); // QueryClient 가져옴

    document.title = "로그인 - Ubicollab";

    const changeUsername = (event : React.ChangeEvent<HTMLInputElement>) => {
        setUsername(event.target.value)
    }

    const changePassword = (event : React.ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value)
    }

    // 로그인 (useMutation)
    const loginMutation = useMutation({
        mutationFn : () => login(username, password),
        onSuccess : async (accessToken) => {
            console.log('로그인 성공');
            localStorage.setItem('accessToken', accessToken);
            queryClient.clear(); // 이전 계정의 캐시 제거
            navigate('/');
        },
        onError : (error) => {
            toast.error(error.message);
        }
    })
    
    // 로그인 버튼 클릭 시 동작
    const doLogin = (e : React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        loginMutation.mutate();
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
                    onSubmit={doLogin}
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
                        disabled={loginMutation.isPending}
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