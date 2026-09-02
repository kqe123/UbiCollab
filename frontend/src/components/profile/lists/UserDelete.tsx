import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

function UserDelete() {

    const accessToken = localStorage.getItem("accessToken"); // accessToken (JWT) 불러오기
    const navigate = useNavigate();
    const [isChecked, setIsChecked] = useState<boolean>(false);

    // 체크박스 상태 변화 메서드
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsChecked(event.target.checked);
    };


    return (
        <>
        <Typography variant="h5" sx={{ fontWeight: 800, mt: 1}}>회원 탈퇴</Typography>
        <Box sx={{mt : 4}}>
            <Typography
                variant="body1"
                sx={{ fontWeight: 600, mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
                <WarningAmberIcon color="error" fontSize="small" />
                주의사항을 꼭 확인해 주세요.
            </Typography>
            <Box sx={{ bgcolor: '#f6f2f2', borderRadius: '12px', mt: 2, p: 2 }}>
                <Box
                    component="ul"
                    sx={{ m: 0, pl: 1, display: 'flex', flexDirection: 'column', gap: 1.3 }}
                >
                    <Typography component="li" variant="body1">
                        1. 회원탈퇴 시{" "}
                        <Box component="span" sx={{ color: 'error.main', fontWeight: 700 }}>
                            Ubicollab에 다시 로그인할 수 없습니다.
                        </Box>
                    </Typography>
                    <Typography component="li" variant="body1">
                        2.{" "}
                        <Box component="span" sx={{ color: 'error.main', fontWeight: 700 }}>
                            이용자가 생성한 모든 파일/폴더가 영구적으로 삭제됩니다.
                        </Box>{" "}
                        (휴지통에 있는 항목 포함)
                    </Typography>
                    <Typography component="li" variant="body1">
                        3. 소유자로 있는 파일/폴더를 다른 사람과 공유 중이었다면,{" "}
                        <Box component="span" sx={{ color: 'error.main', fontWeight: 700 }}>
                            탈퇴 시 그 항목 자체가 삭제되어 공유받았던 사람들도 더 이상 해당 문서에 접근할 수 없게 됩니다.
                        </Box>
                    </Typography>
                    <Typography component="li" variant="body1">
                        4. 다른 사람이 나에게 공유해준 파일/폴더에 대한 접근 권한도 함께 사라집니다.
                    </Typography>
                    <Typography component="li" variant="body1">
                        5. 즐겨찾기 등록 목록도 함께 삭제됩니다.
                    </Typography>
                    <Typography component="li" variant="body1" sx={{ fontWeight: 700 }}>
                        6. 삭제된 데이터는{" "}
                        <Box component="span" sx={{ color: 'error.main' }}>
                            복구할 수 없습니다.
                        </Box>
                    </Typography>
                </Box>
            </Box>
        </Box>
        
        <FormControlLabel 
            control={<Checkbox checked={isChecked} onChange={handleChange} />}
            sx={{my : 4}}
            label="위의 회원탈퇴 시 주의사항을 모두 확인했습니다."
        />
        
        
        {/* Submit Button */}
        <Button 
            disableElevation
            variant="contained"
            size="large"
            color="error">
            회원탈퇴
        </Button>

        </>
    );
}

export default UserDelete;
