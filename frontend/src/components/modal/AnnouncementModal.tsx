import axios from "axios";
import toast from "react-hot-toast";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import IconButton from  '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

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
    const accessToken = localStorage.getItem("accessToken"); // accessToken (JWT) 불러오기
    const queryClient = useQueryClient(); // QueryClient 가져옴

    // 공지 추가 API 호출 메서드
    const addAnnouncement = async () => {
        // [예외 처리] 제목 또는 내용이 0자일때
        if (title.trim().length === 0) 
            toast.error("제목을 입력해주세요.")
        
        if (content.trim().length === 0) 
            toast.error("내용을 입력해주세요.")
        
        // [권한 제어] 공지 추가 모달은 MANAGER 이상만 열 수 있지만, 우회 클릭을 대비해 한번 더 체크
        if (!(permission === "MANAGER")) {
            toast.error("공지를 추가할 권한이 없습니다.");
            return;
        }
        
        // 공지 데이터
        const announcementData = {
            fileId : fileId,
            title : title,
            content : content,
        }

        try {
            // axios로 백엔드 api 호출
            const response = await axios.post(
                "http://localhost:8080/api/announcement/create",
                announcementData,
                {   
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            );
            toast.success(response.data);
            console.log(response.data);
            await queryClient.invalidateQueries({ queryKey : ["announcements"]});
            setTitle("");
            setContent("");
            onClose();
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message ?? "공지 생성에 실패했습니다.";
                toast.error(message) // 여기서 백엔드 메시지를 담은 새 Error로 교체
            }
            throw error;
        }
    }

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
                    onClick={addAnnouncement}
                >
                    추가
                </Button>
            </DialogActions>
        </Dialog>
    )
}
export default AnnouncementModal;