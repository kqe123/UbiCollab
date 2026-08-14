import type {DriveItem} from "../../types/driveitem";
import axios from "axios";
import toast from "react-hot-toast";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import ChangeNameModal from "./ChangeNameModal"
import ShareModal from "./ShareModal"
import PermissionModal from "./PermissionModal"
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import EditIcon from '@mui/icons-material/Edit';
import StarIcon from '@mui/icons-material/StarBorder';
import ShareIcon from '@mui/icons-material/Share';
import PermissionIcon from '@mui/icons-material/CoPresent';
import DeleteIcon from '@mui/icons-material/Delete';

function DriveItemMenuModal({
    x, y, driveItem, onClose
} : {
    x : number;
    y : number;
    driveItem : DriveItem;
    onClose : () => void;
}) {

    const queryClient = useQueryClient(); // QueryClient 가져옴
    // 메뉴 모드를 CONTEXT/RENAME으로 나눠서 CONTEXT일때는 CONTEXT 메뉴를,
    // RENAME일때는 CONTEXT 메뉴 대신 RENAME 메뉴를 출력한다.
    const [menuMode, setMenuMode] = useState<"CONTEXT" | "RENAME" | "SHARE" | "PERMISSION">("CONTEXT");
    const accessToken = localStorage.getItem("accessToken"); // accessToken (JWT) 불러오기

    // 메뉴 닫는 함수
    const closeMenu = () => {
        onClose();
    }

    // "즐겨찾기 추가" 함수
    const addFavorite = async () => {
        try {
            // Backend API 호출
            const response = await axios.post(`http://localhost:8080/api/favorite/create/${driveItem.publicId}`,
            null,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
            );
        
            console.log("즐겨찾기 추가 성공", response.data);
            await queryClient.invalidateQueries({
                queryKey: ["driveItems"]
            });
            toast.success("해당 폴더/파일이 즐겨찾기로 등록되었습니다.");
            onClose();
        } catch (error: unknown) {
            console.error("즐겨찾기 추가 실패.. : ", error);

            // axios에서 발생한 오류인 경우
            if (axios.isAxiosError(error)) {
                console.error("백엔드 응답:", error.response?.data);
                toast.error(error.response?.data?.message ?? "폴더/파일을 즐겨찾기에 등록하는데 실패했습니다.");
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

    // "즐겨찾기 해제" 함수
    const deleteFavorite = async () => {
        try {
            // Backend API 호출
            const response = await axios.delete(`http://localhost:8080/api/favorite/delete/${driveItem.publicId}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
            );
        
            console.log("즐겨찾기 해제 성공", response.data);
            await queryClient.invalidateQueries({
                queryKey: ["driveItems"]
            });
            toast.success("해당 폴더/파일을 즐겨찾기 해제했습니다.");
            onClose();
        } catch (error: unknown) {
            console.error("즐겨찾기 해제 실패.. : ", error);

            // axios에서 발생한 오류인 경우
            if (axios.isAxiosError(error)) {
                console.error("백엔드 응답:", error.response?.data);
                toast.error(error.response?.data?.message ?? "폴더/파일을 즐겨찾기를 해제하는데 실패했습니다.");
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

    // "휴지통으로 보내기" 함수
    const throwTrash = async () => {
        try {
            // Backend API 호출
            const response = await axios.patch(`http://localhost:8080/api/driveitem/trash/${driveItem.publicId}`,
            null,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
            );
        
            console.log("문서를 휴지통으로 보내기 성공", response.data);
            await queryClient.invalidateQueries({
                queryKey: ["driveItems"]
            });
            toast.success("파일이 휴지통으로 이동되었습니다.");
            onClose();
        } catch (error: unknown) {
            console.error("문서를 휴지통으로 보내기 실패.. : ", error);

            // axios에서 발생한 오류인 경우
            if (axios.isAxiosError(error)) {
                console.error("백엔드 응답:", error.response?.data);
                toast.error(error.response?.data?.message ?? "문서를 휴지통으로 보내기에 실패했습니다.");
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
        <>
        {/* menuMode = CONTEXT일때 */}
        {menuMode === "CONTEXT" && (
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
                        onClick={() => {setMenuMode("RENAME")}}
                        sx={{ width : '100%', justifyContent: 'flex-start', px : 2, color : 'black'}}
                        startIcon={<EditIcon sx={{ mb : '3px'}} />}
                    >
                        <Typography variant="body2" sx={{color: 'black' }}>이름 변경</Typography>
                    </Button>
                    {driveItem.isFavorite === true ? (
                        <Button 
                            type="button"
                            onClick={deleteFavorite}
                            sx={{width : '100%', justifyContent: 'flex-start', px : 2, color : 'black'}}
                            startIcon={<StarIcon sx={{ mb : '3px'}}/>}
                        >
                            <Typography variant="body2" sx={{color: 'black' }}>즐겨찾기 해제</Typography>
                        </Button>
                    ) : 
                        <Button 
                            type="button" 
                            onClick={addFavorite}
                            sx={{width : '100%', justifyContent: 'flex-start', px : 2, color : 'black'}}
                            startIcon={<StarIcon sx={{ mb : '3px'}}/>}
                        >
                            <Typography variant="body2" sx={{color: 'black' }}>즐겨찾기 추가</Typography>
                        </Button>
                    }
                    <Button 
                        type="button" 
                        onClick={() => {setMenuMode("SHARE")}}
                        sx={{width : '100%', justifyContent: 'flex-start', px : 2, color : 'black'}}
                        startIcon={<ShareIcon sx={{ mb : '3px'}}/>}
                    >
                        <Typography variant="body2" sx={{color: 'black' }}>공유 추가</Typography>
                    </Button>
                    <Button 
                        type="button" 
                        onClick={() => {setMenuMode("PERMISSION")}}
                        sx={{width : '100%', justifyContent: 'flex-start', px : 2, color : 'black'}}
                        startIcon={<PermissionIcon sx={{ mb : '3px'}}/>}
                    >
                        <Typography variant="body2" sx={{color: 'black' }}>권한 관리</Typography>
                    </Button>
                    <Divider sx={{my : 0.5}}/>
                    <Button 
                        type="button" 
                        onClick={throwTrash}
                        sx={{
                            width : '100%',
                            justifyContent: 'flex-start',
                            px : 2,
                            color : 'red',
                            '&:hover': {
                                bgcolor: '#fdc2c2'
                            },
                        }}
                        startIcon={<DeleteIcon sx={{ mb : '3px'}}/>}
                    >
                        <Typography variant="body2" sx={{color: 'red', fontWeight: 600 }}>휴지통으로 이동</Typography>
                    </Button>
                </Paper>
            </Box>
        )}
        {/* menuMode = RENAME일때 */}
        {menuMode === "RENAME" && (
            <ChangeNameModal
                driveItem={driveItem}
                onClose={closeMenu}
            />
        )}

        {/* menuMode = SHARE일때 */}
        {menuMode === "SHARE" && (
            <ShareModal
                driveItem={driveItem}
                onClose={closeMenu}
            />
        )}

        {/* menuMode = PERMISSION일때 */}
        {menuMode === "PERMISSION" && (
            <PermissionModal
                driveItem={driveItem}
                onClose={closeMenu}
            />
        )}
        </>
    );

}

export default DriveItemMenuModal;