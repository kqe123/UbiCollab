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

function AnnouncementModal ({
    open, onClose
} : {
    open : boolean;
    onClose : () => void;
}) {

    const [title, setTitle] = useState<string>(""); // 공지 제목
    const [content, setContent] = useState<string>(""); // 공지 내용
    const accessToken = localStorage.getItem("accessToken"); // accessToken (JWT) 불러오기

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

            <DialogActions>
                <Button
                    disableElevation
                    variant="contained"
                >
                    추가
                </Button>
            </DialogActions>
        </Dialog>
    )
}
export default AnnouncementModal;