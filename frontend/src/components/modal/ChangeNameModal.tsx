import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import type {DriveItem} from "../../types/driveitem";
import { useQueryClient } from "@tanstack/react-query";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import EditIcon from '@mui/icons-material/Edit';


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
            const response = await axios.patch(
                `http://localhost:8080/api/driveitem/${driveItem.publicId}`,
                driveItemData,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            );
        
            console.log("파일명 변경 성공", response.data);
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
        <Box 
            sx={{
                position: 'fixed', // fixed
                inset: 0, // inset-0
                zIndex: 50, // z-50
                display: 'flex',
                bgcolor: 'rgba(0, 0, 0, 0.4)', // bg-black/40
                alignItems: 'center',
                justifyContent: 'center',
            }}
            onClick={onClose}
        >
            {/* 모달창 */}
            <Box 
                sx={{
                    width : '30%',
                    height : '30%',
                    bgcolor: 'white',
                    p : 3,
                    borderRadius: '8px',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <Typography variant="h5" sx={{ fontWeight: 500 }} ><EditIcon /> 이름 변경</Typography>
                {/* 입력창 */}
                <TextField
                    type="text"
                    value={driveItemName}
                    onChange={(e) => setDriveItemName(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            changeName();
                        }
                    }}
                    sx={{ mt : 4, width : '100%'}}
                />
                {/* 버튼 */}
                <Box sx={{ mt : 4, display : 'flex', justifyContent: 'flex-end', gap : 1.5 }}>
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
                </Box>
            </Box>
        </Box>
    )
}

export default ChangeNameModal;