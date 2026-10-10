import toast from "react-hot-toast";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import IconButton from  '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import type { Announcement } from "../../types/announcement.ts";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAnnouncement } from "../../api/announcementApi.ts";
import { useCurrentUser } from "../../hooks/use-current-user";

function AnnounceUpdateModal ({
    open, onClose, closeMenu, announcement
} : {
    open : boolean;
    onClose : () => void;
    closeMenu : () => void;
    announcement: Announcement;
}) {

    const { data: currentUser } = useCurrentUser(); // 현재 로그인 사용자
    const [title, setTitle] = useState<string>(announcement.title); // 공지 제목
    const [content, setContent] = useState<string>(announcement.content); // 공지 내용
    const queryClient = useQueryClient(); // QueryClient 가져옴

    // 공지 수정 (useMutation)
    const { mutate : editAnnouncement, isPending } = useMutation({
        mutationFn : () => updateAnnouncement(announcement.announcementId, title, content),
        onSuccess : async (message : string) => {
            toast.success(message);
            console.log(message);
            await queryClient.invalidateQueries({ queryKey: ["announcements"] });
            onClose(); // 모달창 닫힘
            closeMenu(); // 공지 메뉴 닫힘
        },
        onError : (error) => {
            toast.error(error.message);
        },
    })

    // 수정 버튼 클릭 시 실행
    const handleSubmit = () => {
        if (title.trim().length === 0) {
            toast.error("제목을 입력해주세요.");
            return;
        }
        if (content.trim().length === 0) {
            toast.error("내용을 입력해주세요.");
            return;
        }
        if (announcement.userId !== currentUser?.publicId) {
            toast.error("공지를 수정할 권한이 없습니다.");
            return;
        }
        editAnnouncement();   // 공지 수정 요청 실행
    };

    // 모달 닫힐 때 동작
    const closeModal = () => {
        onClose(); // 모달창 닫힘
        closeMenu(); // 공지 메뉴 닫힘
    };

    return (
        <Dialog
            open={open}   
            onClose={closeModal}
            fullWidth
            maxWidth="sm"
            slotProps={{
                paper: {
                sx: {  maxWidth: '30vw' }}
            }}
        >   
            {/* 헤더 */}
            <DialogTitle sx={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap : 1, p : 2 }}>
                공지 수정
                <IconButton sx={{ml : 'auto'}} onClick={closeModal}>
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
                    수정
                </Button>
            </DialogActions>
        </Dialog>
    )
}
export default AnnounceUpdateModal;