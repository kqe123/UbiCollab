import toast from "react-hot-toast";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import IconButton from  '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAnnouncement } from "../../api/announcementApi.ts";

function AnnouncementModal ({
    open, onClose, fileId, permission
} : {
    open : boolean;
    onClose : () => void;
    fileId : string;
    permission : "VIEWER" | "COMMENTOR" | "EDITOR" |"MANAGER" | null;
}) {

    const [title, setTitle] = useState<string>(""); // 공지 제목
    const [content, setContent] = useState<string>(""); // 공지 내용
    const queryClient = useQueryClient(); // QueryClient 가져옴

    // 공지 생성 (useMutation)
    const { mutate : addAnnouncement, isPending } = useMutation({
        // 실제로 수행할 함수
        mutationFn : () => createAnnouncement(fileId, title, content),
        // 성공 시 수행할 명령들
        onSuccess : async (message : string) => {
            toast.success(message);
            await queryClient.invalidateQueries({ queryKey: ["announcements"] })
            setTitle("");
            setContent("");
            onClose();
        },
        // 오류 시 수행할 명령들
        onError : (error) => {
            toast.error(error.message);
        }
    })

    // 추가 버튼 클릭 시 실행
    const handleSubmit = () => {
        if (title.trim().length === 0) {
            toast.error("제목을 입력해주세요.");
            return;
        }
        if (content.trim().length === 0) {
            toast.error("내용을 입력해주세요.");
            return;
        }
        if (permission !== "MANAGER") {
            toast.error("공지를 추가할 권한이 없습니다.");
            return;
        }
        addAnnouncement();   // 공지 생성 요청 실행
    };

    return (
        <Dialog
            open={open}   
            onClose={onClose}   
            fullWidth
            maxWidth="sm"
            slotProps={{
                paper: {
                sx: {  maxWidth: '30vw' }}
            }}
        >   
            {/* 헤더 */}
            <DialogTitle sx={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap : 1, p : 2 }}>
                공지 추가
                <IconButton sx={{ml : 'auto'}} onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            {/* 입력창 */}
            <DialogContent sx={{ p : 2}}>
                <TextField
                    type="text"
                    value={title}
                    size="small"
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="제목을 입력하세요."
                    sx={{
                        mt: 1,
                        width : '100%',
                        borderRadius: '12px',
                        bgcolor: '#F3F4F6',
                        '& .MuiInputBase-input': {
                            fontSize: '14px',
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                            border: 'none',
                        },
                    }}
                    slotProps={{ htmlInput: { maxLength: 50 } }}
                />
                
                <TextField
                    type="text"
                    value={content}
                    size="small"
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="내용을 입력하세요."
                    multiline
                    rows={12}
                    sx={{ 
                        mt : 3,
                        width : '100%',
                        borderRadius: '12px',
                        border : "1px solid #D0D5DD",
                        '& .MuiInputBase-input': {
                            fontSize: '14px',
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                            border: 'none',
                        },
                    }}
                    slotProps={{ htmlInput: { maxLength: 1000 } }}
                />
            </DialogContent>
             
            {/* 제출 버튼 */}
            <DialogActions sx={{ p : 2}}>
                <Button
                    disableElevation
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={isPending}
                >
                    추가
                </Button>
            </DialogActions>
        </Dialog>
    )
}
export default AnnouncementModal;