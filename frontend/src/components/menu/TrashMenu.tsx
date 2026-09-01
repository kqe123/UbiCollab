import type {DriveItem} from "../../types/driveitem";
import axios from "axios";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import RestoreIcon from '@mui/icons-material/RestoreFromTrash';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
function TrashMenu({
    open, x, y, driveItem, onClose
} : {
    open: boolean;
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
            console.log("알림 : " + response.data);
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
            await axios.delete(`http://localhost:8080/api/driveitem/delete/${driveItem.publicId}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
            );
        
            console.log("알림 : 영구 삭제 완료");
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
        <Menu                 
            open={open}
            onClose={onClose}
            anchorReference="anchorPosition"
            anchorPosition={{ top: y, left: x }}
            slotProps={{
                paper: {
                    sx: { width: 176, borderRadius: 2 } // 기존 Paper의 width/borderRadius만 유지
                },
                list: {
                    sx: { py: 0.5 } // 기존 Paper의 py도 여기로
                }
            }} 
        >
            <MenuList>
                <MenuItem
                    onClick={restoreTrash}
                    sx={{width : '100%', justifyContent: 'flex-start', px : 2, color: 'black'}}
                >
                    <ListItemIcon> <RestoreIcon fontSize="small" /></ListItemIcon>
                    <Typography variant="body2" sx={{color: 'black' }}>복원</Typography>
                </MenuItem>

                <Divider sx={{my : 0.5}}/>
                
                <MenuItem
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
                >
                    <ListItemIcon> <DeleteForeverIcon fontSize="small" /></ListItemIcon>
                    <Typography variant="body2" sx={{fontWeight: 600 }}>영구 삭제</Typography>
                </MenuItem>
            </MenuList>
        </Menu>
    );
}

export default TrashMenu;