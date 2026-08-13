import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import ButtonBase from '@mui/material/ButtonBase';

function SignupPage () {
    const [user, setUser] = useState({
        username : "",
        password : "",
        nickname : "",
        profileImageKey : null
    });

    const [avatarSrc, setAvatarSrc] = useState<string | undefined>(undefined);
    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
            if (file) {
                // Read the file as a data URL
                const reader = new FileReader();
                reader.onload = () => {
                    setAvatarSrc(reader.result as string);
                };
                reader.readAsDataURL(file);
            }
        };
    
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
                
                {/* Signup Panel */}
                <Box 
                    component="form"
                    onSubmit={signup}
                    sx={{ width : '60%', mx: 'auto', display: 'flex', flexDirection: 'column',
                        gap: 1.5, mt : 3}}
                >
                    <Typography 
                        variant="body1"
                        sx={{ fontWeight: 700, mt: 2}}>
                        회원가입
                    </Typography>

                    {/* Profile Image */}
                    <ButtonBase
                        component="label"
                        role={undefined}
                        tabIndex={-1} // prevent label from tab focus
                        aria-label="Avatar image"
                        sx={{ borderRadius: '40px', mt : 3, mb : 3,
                            '&:has(:focus-visible)': {
                                outline: '2px solid',
                                outlineOffset: '2px',
                            },
                        }}
                    >
                        <Avatar alt="Upload new avatar" src={avatarSrc} sx={{ width: 56, height: 56}} />
                        <input
                            type="file"
                            accept="image/*"
                            style={{
                            border: 0,
                            clip: 'rect(0 0 0 0)',
                            height: '1px',
                            margin: '-1px',
                            overflow: 'hidden',
                            padding: 0,
                            position: 'absolute',
                            whiteSpace: 'nowrap',
                            width: '1px',
                            }}
                            onChange={handleAvatarChange}
                        />
                    </ButtonBase>
                    {/* ID */}
                    <TextField
                        required
                        variant="standard"
                        type="text"
                        size="small"
                        name="username"
                        onChange={handleChange}
                        value={user.username}
                        label="아이디"
                        placeholder="5~20자의 영문 소문자, 숫자와 특수기호(_),(-)만 사용 가능"
                        sx={{'& .MuiInputBase-input': { fontSize: '15px'} }}
                    />
                    {/* PW */}
                    <TextField
                        required
                        variant="standard"
                        type="password"
                        size="small"
                        name="password"
                        onChange={handleChange}
                        value={user.password}
                        label="비밀번호"
                        placeholder="8~16자의 영문 대/소문자, 숫자, 특수문자 포함"
                        sx={{'& .MuiInputBase-input': { fontSize: '15px'} }}
                    />
                    {/* nickname */}
                    <TextField
                        required
                        variant="standard"
                        type="text"
                        size="small"
                        name="nickname"
                        onChange={handleChange}
                        value={user.nickname}
                        label="닉네임"
                        placeholder="2자 이상 입력"
                        sx={{'& .MuiInputBase-input': { fontSize: '15px'} }}
                    />
                    {/* Submit Button */}
                    <Button 
                        disableElevation
                        type="submit"
                        variant="contained"
                        size="medium"
                        color="primary">
                        회원가입
                    </Button>
                </Box>
            </Container>
        </Box>
    )
}

export default SignupPage;