import logo from '../../assets/logo.jpg'
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';

function Header() {

    const navigate = useNavigate(); // navigate 훅
    const accessToken = localStorage.getItem("accessToken"); // accessToken (JWT) 불러오기

    // [+ 새 문서] 버튼 클릭 시 이벤트
    const createFile = async () => {
        const fileData = {
            itemName: "제목 없는 문서",
            type : "FILE",
            content: "",
            extension: "UC",
        };
        
        // DB에 새 문서 생성 후 response 받음
        try {
            const response = await axios.post(
                "http://localhost:8080/api/driveitem/create",
                fileData,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            console.log("문서 생성 성공:", response.data);
            navigate(`/editor/${response.data}`); // editor에게 documentId만 전달
        } catch (error : unknown) {
            // axios에서 발생한 오류인 경우
            if (axios.isAxiosError(error)) {
                console.error("백엔드 응답:", error.response?.data);
                toast.error(error.response?.data?.message ?? "문서 저장에 실패했습니다.");
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
            component="header" 
            sx={{ width: '100%', height: '70px', bgcolor: '#104FCD', display: 'flex',
                alignItems: 'center', boxSizing: 'border-box', px: 2,}}
        >
            {/* Logo */}
            <Box 
                component="img"
                src={logo}
                sx={{ width: '15%', maxWidth: 200, height: '60%', mx: 'auto'}}
            />

            {/* Search */}
            <Box sx={{ flex: 1, height : '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <TextField 
                    sx={{
                        width: '60%',
                        bgcolor: 'white',
                        borderRadius: '9px',
                        '& .MuiInputBase-root': {
                            height: '48px', // 원하는 높이는 여기서 지정
                            borderRadius: '9px',
                        },
                    }}
                />
            </Box>

            {/* Buttons */}
            <Box sx={{ width : '20%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap : 2}}>
                <Button 
                    disableElevation
                    type="button"
                    onClick={createFile}
                    variant="contained"
                    size="large"
                    color="primary"
                    sx={{
                        color: 'black',
                        fontWeight : 700,
                        bgcolor : 'white',
                        borderRadius: '9px',
                    }}
                > + 새 파일
                </Button>
                <Avatar alt="프로필사진" sx={{ width: 50, height: 50, cursor : 'pointer'}} />
            </Box>
        </Box>
    );
}

export default Header;