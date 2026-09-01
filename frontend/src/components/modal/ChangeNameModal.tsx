import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import type {DriveItem} from "../../types/driveitem";
import { useQueryClient } from "@tanstack/react-query";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import EditIcon from '@mui/icons-material/Edit';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';


function ChangeNameModal ({
    onClose,
    driveItem
} : {
    onClose : () => void;
    driveItem : DriveItem;
}) {
    const [driveItemName, setDriveItemName] = useState(driveItem.itemName); // 현재 DriveItem 이름
    const accessToken = localStorage.getItem("accessToken"); // accessToken (JWT) 불러오기
    const queryClient = useQueryClient(); // QueryClient 가져옴
    const changeName = async () => {

        // 문서명 앞뒤 공백 제거
        const trimmedFileName = driveItemName.trim();

        // backend api에 보낼 body
        const driveItemData = {
            itemName:
                trimmedFileName === ""
                ? "제목 없는 문서"
                : trimmedFileName,
            };

        try {
            // 문서 변경 Backend API 호출  
            await axios.patch(
                `http://localhost:8080/api/driveitem/${driveItem.publicId}`,
                driveItemData,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            );
        
            console.log("알림 : 파일명 변경 성공");
            await queryClient.invalidateQueries({
                queryKey: ["driveItems"]
            });
            toast.success("파일명 변경이 완료되었습니다.");     
            onClose();       
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
    };

    return ( 
        <Dialog
            open={true}
            onClose={onClose}
            fullWidth
            maxWidth="xs"
        >
            {/* 메뉴명 */}
            <DialogTitle sx={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap : 1 }}>
                <EditIcon /> 이름 변경
            </DialogTitle>

            {/* 입력창 */}
            <DialogContent>
                <TextField
                    type="text"
                    value={driveItemName}
                    onChange={(e) => setDriveItemName(e.target.value)}
                    onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        changeName();
                        }
                    }}
                    sx={{ mt : 2, width : '100%'}}
                />
            </DialogContent>
            <DialogActions>
                {/* 버튼 */}
                <Button
                    type="button"
                    onClick={onClose}
                    size="large"
                    sx={{ borderRadius: '8px',
                        fontWeight: 500, 
                        color: 'grey.700', 
                        '&:hover': {
                            bgcolor: 'grey.100',
                        },
                    }}
                >
                    취소
                </Button>

                <Button
                    disableElevation
                    type="button"
                    size="large"
                    variant="contained"
                    onClick={changeName}
                    color='primary'
                    sx={{ borderRadius: '8px', fontWeight: 500,}}
                >
                    확인
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default ChangeNameModal;