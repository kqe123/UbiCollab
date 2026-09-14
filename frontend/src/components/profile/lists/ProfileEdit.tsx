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
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import IconButton from  '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import { useState } from "react";
import { useCurrentUser } from "../../../hooks/use-current-user";

function ProfileEdit() {
    const accessToken = localStorage.getItem("accessToken"); // accessToken (JWT) 불러오기
    const {
        data: currentUser, // 백엔드에서 받아온 데이터
        isLoading : isUserLoading,    // 현재 요청 중인지 여부
        isError : isUserError,        // 요청이 실패했는지 여부
        error,            // 실패했을 때 오류 정보
    } = useCurrentUser();

    const [nickname, setNickname] = useState<string>("");
    const navigate = useNavigate();

    // 문서 리스트를 정상적으로 받아왔을 때
    return (
        <>
        <Typography variant="h5" sx={{ fontWeight: 800, mt: 1}}>프로필 수정</Typography>
        
        <Stack 
            component="form"
            spacing={2} sx={{mt : 6, justifyContent: 'center'}}>
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
                            
                        />
                    </IconButton>
                    }
                >   
                    <Avatar alt="Upload new avatar" sx={{ width: 100, height: 100 }} />
                </Badge>
            </Box>
            {/* 닉네임 입력칸 */}
            <Box sx={{}}>
                <Typography variant="body1" sx={{fontWeight: 600}}>닉네임</Typography>
                <TextField
                    required
                    type="text"
                    size="small"
                    name="nickname"
                    value={currentUser?.nickname}
                    placeholder="2자 이상 입력해주세요."
                    sx={{
                        width : '60%',
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
        
            {/* 프로필 수정 */}
            <Box>
                <Button
                    disableElevation
                    type="submit"
                    variant="contained"
                    size="medium"
                    color="primary"
                    sx={{mt : 4, width : '100%'}}
                >
                    프로필 수정
                </Button>
            </Box>
        </Stack>
        </>
    );
}

export default ProfileEdit;