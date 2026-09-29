import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import WarningIcon from '@mui/icons-material/Warning';
function DeleteModal ({
    open, title, message, onConfirm ,onClose
} : {
    open : boolean;
    title : string;
    message : string;
    onConfirm : () => void;
    onClose : () => void;
}) {
    return (
        <Dialog
            open={open}
            fullWidth
            maxWidth="xs"
            role="alertdialog"
        >
            {/* 제목 */}
            <DialogTitle sx={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap : 1 }}>
                <WarningIcon sx={{color : 'red'}}/>{title}
            </DialogTitle>

            {/* 내용 */}
            <DialogContent>
                <DialogContentText>
                    {message}
                </DialogContentText>
            </DialogContent>

            <DialogActions>
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
                    onClick={onConfirm}
                    color='primary'
                    sx={{ 
                        borderRadius: '8px',
                        fontWeight: 500,
                        bgcolor : '#F05650',
                        '&:hover': {
                            bgcolor: '#DF243B',
                        },
                    }}
                >
                    확인
                </Button>

            </DialogActions>
        </Dialog>
    )


}

export default DeleteModal;