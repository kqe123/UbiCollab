import type {DriveItem} from "../../types/driveitem";
import axios from "axios";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import RestoreIcon from '@mui/icons-material/RestoreFromTrash';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
function TrashMenu({
    x, y, driveItem, onClose
} : {
    x : number;
    y : number;
    driveItem : DriveItem;
    onClose : () => void;
}) {

    const queryClient = useQueryClient(); // QueryClient 가져옴
    const accessToken = localStorage.getItem("accessToken"); // accessToken (JWT) 불러오기


    // "복원" 함수
    const restoreTrash = async () => {
        try {
            // 문서 변경 Backend API 호출
            const response = await axios.patch(`http://localhost:8080/api/driveitem/restore/${driveItem.publicId}`,
            null,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
            );
        
            console.log("복원 완료", response.data);
            await queryClient.invalidateQueries({
                queryKey: ["driveItems"]
            });
            toast.success("파일/폴더가 복원되었습니다.");
            onClose();
        } catch (error: unknown) {
            console.error("복원 실패... : ", error);

            // axios에서 발생한 오류인 경우
            if (axios.isAxiosError(error)) {
                console.error("백엔드 응답:", error.response?.data);
                toast.error(error.response?.data?.message ?? "폴더/파일을 복원하는데 실패했습니다.");
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

    // "영구 삭제" 함수
    const deleteTrash = async () => {
        try {
            // 문서 변경 Backend API 호출
            const response = await axios.delete(`http://localhost:8080/api/driveitem/delete/${driveItem.publicId}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
            );
        
            console.log("영구 삭제 완료", response.data);
            await queryClient.invalidateQueries({
                queryKey: ["driveItems"]
            });
            toast.success("영구 삭제가 완료되었습니다.");
        } catch (error: unknown) {
            console.error("영구 삭제 실패... : ", error);

            // axios에서 발생한 오류인 경우
            if (axios.isAxiosError(error)) {
                console.error("백엔드 응답:", error.response?.data);
                toast.error(error.response?.data?.message ?? "폴더/파일을 영구 삭제 하는데 실패했습니다.");
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

    const handlePermanentDelete = async () => {
        const confirmed = window.confirm(
            "이 항목을 영구 삭제하시겠습니까?\n삭제한 항목은 복구할 수 없습니다."
        );

        if (!confirmed) 
            return;
        

        await deleteTrash();
        onClose();
        };

    return (
        <>
        <Box sx={{ position: 'fixed', inset: 0,  zIndex: 40}} onClick={onClose}>
            <Paper
                elevation={2}
                onClick={(e) => e.stopPropagation()}
                sx={{
                    position: 'fixed',
                    zIndex: 50,
                    width: 176, // w-44 (44 * 4px)
                    borderRadius: 2, // rounded-lg
                    bgcolor: 'background.paper',
                    py: 0.5, // py-2
                    left: `${x}px`,
                    top: `${y}px`,
                }}
            >
                <Button 
                    type="button"
                    onClick={restoreTrash}
                    sx={{width : '100%', justifyContent: 'flex-start', px : 2, color: 'black'}}
                    startIcon={<RestoreIcon sx={{ mb : '3px'}}/>}
                >
                    <Typography variant="body2" sx={{color: 'black' }}>복원</Typography>
                </Button>
                <Divider sx={{my : 0.5}}/>
                <Button 
                    type="button"
                    onClick={handlePermanentDelete}
                    sx={{
                            width : '100%',
                            justifyContent: 'flex-start',
                            px : 2,
                            color: 'red',
                            '&:hover': {
                                bgcolor: '#fdc2c2'
                            },
                    }}
                    startIcon={<DeleteForeverIcon sx={{ mb : '3px'}} />}
                >
                    <Typography variant="body2" sx={{color: 'red', fontWeight: 600 }}>영구 삭제</Typography>
                </Button>
            </Paper>
        </Box>
        </>
    );
}

export default TrashMenu;