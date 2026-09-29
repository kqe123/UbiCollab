import axios from "axios";
import toast from "react-hot-toast";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DeletePopup from '../../popup/DeletePopup';

function UserDelete() {

    const accessToken = localStorage.getItem("accessToken"); // accessToken (JWT) 불러오기
    const navigate = useNavigate();
    const queryClient = useQueryClient(); // QueryClient 가져옴
    const [isChecked, setIsChecked] = useState<boolean>(false); // 체크박스 체크/비체크
    const [deleteConfirm, setDeleteConfirm] = useState(false); // delete 팝업창 열림/닫힘

    // 체크박스 상태 변화 메서드
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsChecked(event.target.checked);
    };

    // 회원탈퇴 팝업창을 여는 메서드
    const confirmChange = async () => {
        if (!isChecked) {
            toast.error("회원탈퇴 안내사항 확인 후 체크박스를 선택해주세요.")
            return;
        }

        setDeleteConfirm(true);
    };

    // "회원 탈퇴" 함수
    const deleteUser = async () => {
        try {
            // 영구 삭제 Backend API 호출
            await axios.delete("http://localhost:8080/api/user/delete",
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );

            console.log("알림 : 회원 탈퇴 완료");
            toast.success("회원 탈퇴가 완료되었습니다.");
            localStorage.removeItem("accessToken"); // JWT 토큰 제거
            queryClient.clear(); // 모든 쿼리 데이터 초기화
            navigate('/login');
        } catch (error: unknown) {
            console.error("회원 탈퇴 실패... : ", error);
            // axios에서 발생한 오류인 경우
            if (axios.isAxiosError(error)) {
                console.error("백엔드 응답:", error.response?.data);
                toast.error(error.response?.data?.message ?? "회원 탈퇴 하는데 실패했습니다.");
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
        
        {/* 약관 확인 체크박스 */}
        <FormControlLabel 
            control={<Checkbox checked={isChecked} onChange={handleChange} />}
            sx={{my : 4}}
            label="위의 회원탈퇴 시 주의사항을 모두 확인했습니다."
        />
        
        {/* 탈퇴 버튼 */}
        <Button 
            disableElevation
            variant="contained"
            size="large"
            color="error"
            onClick={confirmChange}>
            회원탈퇴
        </Button>

        {/* 삭제 팝업 */}
        <DeletePopup
            open={deleteConfirm}
            title="회원 탈퇴"
            message="정말 회원 탈퇴를 진행하시겠습니까? 탈퇴 시 모든 정보가 삭제되며 복구할 수 없습니다."
            onConfirm={deleteUser}
            onClose={() => setDeleteConfirm(false)}
        />
        </>
    );
}

export default UserDelete;
