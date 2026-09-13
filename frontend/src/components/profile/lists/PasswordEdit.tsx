import axios from "axios";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useState } from "react";

type Password = {
    currentPw : string;
    newPw : string;
    newPwConfirm : string;
};

function PasswordEdit() {
    // TextField 입력값 (State)
    const [input, setInput] = useState<Password>({
        currentPw : "",
        newPw : "",
        newPwConfirm : ""
    });
    const [errors,setErrors] = useState<string[]>([]); // 에러 메시지 목록
    const accessToken = localStorage.getItem("accessToken"); // accessToken (JWT) 불러오기
    const navigate = useNavigate();

    // State 변경 함수
    const handleChange = (event : React.ChangeEvent<HTMLInputElement>) => {
        setInput({
            ...input, [event.target.name] : event.target.value
        })
    }

    // 새 비밀번호로 변경하는 함수 (예외처리 + 변경 로직)
    const changePassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // 네이티브 폼 제출(새로고침 + URL에 값 노출) 차단
        // currentErrors(임시변수) : 오류 메시지 목록
        // errors(State)는 바로 업데이트가 안되기 때문... 
        const currentErrors : string[] = [];

        // 비밀번호: 8~16자, 대/소문자, 숫자, 특수문자 포함
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,16}$/;

        // 입력값 유효성 체크 (비어있는지, 형식에 맞는지, 새 비밀번호와 새 비밀번호 확인이 일치하는지)
        if (input.currentPw === "") 
            currentErrors.push("현재 비밀번호 : 비밀번호를 입력해주세요.");
        
        if (input.newPw === "")
            currentErrors.push("새 비밀번호 : 비밀번호를 입력해주세요.");
        else if (!passwordRegex.test(input.newPw))
            currentErrors.push("새 비밀번호 : 8~16자의 영문 대/소문자, 숫자, 특수문자를 모두 포함해주세요.");

        if (input.newPwConfirm === "")
            currentErrors.push("새 비밀번호 확인 : 비밀번호를 입력해주세요.");
        else if (input.newPw !== input.newPwConfirm)
            currentErrors.push("새 비밀번호 확인 : 새 비밀번호와 새 비밀번호 확인이 일치하지 않습니다.");

        setErrors(currentErrors);  // errors State를 현재 currentErrors로 업데이트 (함수 모두 끝나면 적용)

        // 오류 메시지가 0개라면 비밀번호 변경 로직 실행
        if (currentErrors.length === 0) {
            // backend api에 보낼 body
            const passwordData = {
                currentPassword : input.currentPw,
                newPassword : input.newPw
            };

            try {
                // 비밀번호 변경 Backend API 호출  
                const response = await axios.patch("http://localhost:8080/api/user/change-password",
                    passwordData,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        }
                    }
                );
                console.log("알림 : 비밀번호 변경 성공")
                toast.success("비밀번호 변경이 완료되었습니다.")
                setInput({currentPw:"", newPw:"", newPwConfirm:""})
                localStorage.removeItem("accessToken"); // JWT 토큰 삭제(로그아웃)
                navigate('/login'); // Login 페이지로 이동
            } catch (error: unknown) {
                console.error("비밀번호 변경 실패 : ", error);
                // axios에서 발생한 오류인 경우
                if (axios.isAxiosError(error)) {
                    console.error("백엔드 응답:", error.response?.data);
                    toast.error(error.response?.data?.message ?? "비밀번호 변경에 실패했습니다.");
                }
                else {
                    console.error("알 수 없는 오류:", error);
                    toast.error("알 수 없는 오류가 발생했습니다.");
                }
            }
        }
    }

    return (
        <>
        <Typography variant="h5" sx={{ fontWeight: 800, mt: 1}}>비밀번호 수정</Typography>

        {errors.length > 0 && (
            <Box sx={{ bgcolor: '#f6f4f4', borderRadius: '12px', mt: 2, p : 1}}>
                <List>
                    {[...errors].map((error) => (
                        <ListItem 
                            sx={{ 
                                display: 'list-item',
                                listStyleType: 'disc', // 점 추가
                                listStylePosition: 'inside', // 네모 박스 안에 점 배치
                                py: 0.25,
                                px : 1,
                                color : '#ff2121',
                                fontWeight : 600,
                            }}
                        >
                            {error}
                        </ListItem>
                    ))}
                </List>
            </Box>
        )}

        <Stack 
            component="form"
            onSubmit={changePassword}
            spacing={2} sx={{mt : 6}}>
            {/* 현재 비밀번호 입력칸 */}
            <Box>
                <Typography variant="body1" sx={{fontWeight: 600}}>현재 비밀번호</Typography>
                <TextField
                    required
                    type="password"
                    size="small"
                    name="currentPw"
                    value={input.currentPw}
                    onChange={handleChange}
                    placeholder="현재 비밀번호를 입력해주세요."
                    sx={{
                        width : '100%',
                        mt : 1,
                        '& .MuiInputBase-input::placeholder': {
                            color: 'gray', // placeholder의 색깔 조정
                            opacity: 0.5,  // placeholder의 투명도 조정
                            fontSize: '14px',   // placeholder의 폰트사이즈 조정
                        },
                    }}
                >
                </TextField>
            </Box>

            {/* 새 비밀번호 입력칸 */}
            <Box>
                <Typography variant="body1" sx={{fontWeight: 600}}>새 비밀번호</Typography>
                <TextField
                    required
                    type="password"
                    size="small"
                    name="newPw"
                    value={input.newPw}
                    onChange={handleChange}
                    placeholder="8~16자의 영문 대/소문자, 숫자, 특수문자 포함"
                    sx={{
                        width : '100%',
                        mt : 1,
                        '& .MuiInputBase-input::placeholder': {
                            color: 'gray',      // placeholder의 색깔 조정
                            opacity: 0.5,       // placeholder의 투명도 조정
                            fontSize: '14px',   // placeholder의 폰트사이즈 조정
                        },
                    }}
                >
                </TextField>
            </Box>

            {/* 새 비밀번호 확인 입력칸 */}
            <Box>
                <Typography variant="body1" sx={{fontWeight: 600}}>새 비밀번호 확인</Typography>
                <TextField
                    required
                    type="password"
                    size="small"
                    name="newPwConfirm"
                    value={input.newPwConfirm}
                    onChange={handleChange}
                    placeholder="8~16자의 영문 대/소문자, 숫자, 특수문자 포함"
                    sx={{
                        width : '100%',
                        mt : 1,
                        '& .MuiInputBase-input::placeholder': {
                            color: 'gray', // placeholder의 색깔 조정
                            opacity: 0.5,  // placeholder의 투명도 조정
                            fontSize: '14px',   // placeholder의 폰트사이즈 조정
                        },
                    }}
                >
                </TextField>
            </Box>

            {/* 비밀번호 변경  */}
            <Box>
                <Button
                    disableElevation
                    type="submit"
                    variant="contained"
                    size="medium"
                    color="primary"
                    sx={{mt : 4, width : '100%'}}
                >
                    비밀번호 변경
                </Button>
            </Box>
        </Stack>
        </>
    );
}

export default PasswordEdit;
