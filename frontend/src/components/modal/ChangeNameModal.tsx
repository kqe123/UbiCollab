import { useState } from "react";
import toast from "react-hot-toast";
import type {DriveItem} from "../../types/driveitem";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import EditIcon from '@mui/icons-material/Edit';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { changeName } from '../../api/driveitemApi.ts';

function ChangeNameModal ({
    onClose,
    driveItem
} : {
    onClose : () => void;
    driveItem : DriveItem;
}) {
    const [driveItemName, setDriveItemName] = useState(driveItem.itemName); // 현재 DriveItem 이름
    const queryClient = useQueryClient(); // QueryClient 가져옴


    // 폴더/파일명 변경 (useMutation)
    const { mutate } = useMutation({
        // 실제로 수행할 함수
        mutationFn : ({ trimmedItemName, driveItemId } : { trimmedItemName : string; driveItemId : string; }) =>
            changeName(trimmedItemName, driveItemId),
        // 성공 시 수행할 명령들
        onSuccess : async () => {
            console.log("알림 : 폴더/파일명 변경 성공");
            await queryClient.invalidateQueries({
                queryKey: ["driveItems"]
            });
            toast.success("폴더/파일명 변경 완료");     
            onClose();       
        },
        // 오류 시 수행할 명령들
        onError : (error) => {
            toast.error(error.message);
        }
    })
        
    // 폴더/파일명 변경 버튼 클릭 시 실행
    const handleSubmit = () => {
        const trimmedItemName = driveItemName.trim(); // 변경할 폴더/파일명
        const driveItemId = driveItem.publicId; // 선택된 폴더/파일 publicId

        // [예외 처리] itenName이 비어있을 때
        if (driveItemName.trim().length === 0) {
            toast.error("폴더/파일명을 입력해주세요.");
            return;
        }

        mutate({trimmedItemName, driveItemId});   // 폴더/파일명 변경 요청 실행
    };

    return ( 
        <Dialog
            open={true}
            onClose={onClose}
            fullWidth
            maxWidth="xs"
        >
            {/* 명 */}
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
                        handleSubmit();
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
                    onClick={handleSubmit}
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