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
import Badge from '@mui/material/Badge';
import IconButton from  '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';

function SignupPage () {
    const [user, setUser] = useState({
        username : "",
        password : "",
        confirmPassword : "",
        nickname : "",
        profileImageKey : null
    });

    const [avatarSrc, setAvatarSrc] = useState<string | null>(null); // 이미지 -> BASE64 문자열
    const [avatarFile, setAvatarFile] = useState<File | null>(null); // 실제 업로드용 이미지(File 객체)
    
    // 입력된 이미지 파일을 미리보기(Base64 문자열)와 실제 업로드용 File 객체로 저장함.
    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
            if (file) {
                // Read the file as a data URL
                setAvatarFile(file);
                const reader = new FileReader();
                reader.onload = () => {
                    setAvatarSrc(reader.result as string);
                };
                reader.readAsDataURL(file);
        }
    };
    
    const navigate = useNavigate();
    
    // State 변경 함수
    const handleChange = (event : React.ChangeEvent<HTMLInputElement>) => {
        setUser({
            ...user, [event.target.name] : event.target.value
        })
    }

    
    // 아이디, 비밀번호, 닉네임 유효성 체크하는 함수
    const validCheck = (username: string, password: string, confirmPassword : string, nickname: string): boolean => {
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

        if (password !== confirmPassword) {
            toast.error("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
            return false;
        }

        if (nickname.trim().length < 2) {
            toast.error("닉네임 : 2자 이상 입력해주세요.");
            return false;
        }
        return true;
    };


    // 아이디 중복 체크하는 함수
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

    // 백엔드에 File 객체를 Multipart로 보내어,
    // S3 버킷에 업로드를 수행하는 함수
    const uploadToS3 = async (file: File, userId : string) => {
        const formData = new FormData();
        formData.append("file", file); 
        formData.append("userId", userId);  
        const response = await axios.post("http://localhost:8080/api/user/profile-image",
            formData,
            {
                headers: { "Content-Type": "multipart/form-data" }
            }
        );
        return response.data;
    };


    // 회원가입 함수 
    const signup = async (e : React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        // 1. 유효성 검사
        if (!validCheck(user.username, user.password, user.confirmPassword ,user.nickname)) {
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
        };

        try {
            // Backend Login API 호출
            const response = await axios.post(
                `http://localhost:8080/api/user`,
                credentials
            );
            
            console.log("회원가입 성공");
            const userId = response.data;  // User의 publicId를 임시 저장
            console.log(userId);
            toast.success("회원가입에 성공하였습니다!")
            
            // 4. (선택사항) 프로필 사진이 있다면, 백엔드에게 해당 프로필 사진을
            //    보내고, S3 버킷에 업로드한 뒤, 해당 유저의 ProfileImageKey를 수정한다.
            if (avatarFile) {
                try {
                    await uploadToS3(avatarFile, userId);
                    toast.success("프로필 사진 업데이트에 성공하였습니다!" )
                } catch (error: unknown) {
                    console.error("아바타 업로드 실패:", error);
                    if (axios.isAxiosError(error)) {
                        toast.error(error.response?.data?.message ?? "프로필 사진 업로드에 실패했습니다.");
                    } else {
                        toast.error("프로필 사진 업로드에 실패했습니다.");
                    }
                }
            }
            navigate('/login');
        } catch (error: unknown) {
            console.error("회원가입 실패 :", error);
            // axios에서 발생한 오류인 경우
            if (axios.isAxiosError(error)) {
                console.error("백엔드 응답:", error.response?.data);
                toast.error(error.response?.data?.message ?? "회원가입에 실패했습니다.");
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
                        gap: 1.5, mt : 1}}
                >
                    <Typography 
                        variant="body1"
                        sx={{ fontWeight: 700, mt: 2}}>
                        회원가입
                    </Typography>

                    {/* Profile Image */}
                    <Box sx={{display: 'flex', justifyContent: 'center'}}>
                        <Badge
                            overlap="circular"
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            badgeContent={
                            <IconButton component="label" size="large">
                                <AddIcon sx={{ color: 'white', bgcolor: 'blue', borderRadius: '6px', width : 25, height : 25}} />
                                <input
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    onChange={handleAvatarChange}
                                />
                            </IconButton>
                            }
                        >
                            <Avatar alt="Upload new avatar" src={avatarSrc} sx={{ width: 100, height: 100 }} />
                        </Badge>
                    </Box>
                    
                    <Typography variant="body2" color="error" >
                        ⚠️ 부적절한 콘텐츠(노출, 폭력, 약물·흡연 등)가 포함된 사진은 업로드가 차단될 수 있습니다.
                    </Typography>
                    
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
                    {/* confirm PW */}
                    <TextField
                        required
                        variant="standard"
                        type="password"
                        size="small"
                        name="confirmPassword"
                        onChange={handleChange}
                        value={user.confirmPassword}
                        label="비밀번호 확인"
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
                        color="primary"
                        sx={{mt : 1}}
                    >
                        회원가입
                    </Button>
                </Box>
            </Container>
        </Box>
    )
}

export default SignupPage;