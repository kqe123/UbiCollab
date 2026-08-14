import LoadIcon from '@mui/icons-material/SystemUpdateAlt';
import IconButton from  '@mui/material/IconButton';
function LoadButton({onClick} : {onClick : () => void}) {
    return(
        <>
            {/* Load Button */}
            <IconButton
                type="button"
                onClick={onClick}
                size="large"
                sx={{ width: 16, height: 16, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', borderRadius: '10px',
                    '&:hover': {
                        bgcolor: '#d5e3fd',
                    },
                    '&.Mui-disabled': {
                        cursor: 'not-allowed',
                        pointerEvents: 'auto', // ← 이거 추가해야 cursor가 실제로 적용됨
                    },
                }}
                title="불러오기"
            >
                <LoadIcon sx={{ color: 'grey.600'}} />
            </IconButton>
        </>
    )
}

export default LoadButton;