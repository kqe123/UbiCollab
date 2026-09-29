import LoadIcon from '@mui/icons-material/SystemUpdateAlt';
import IconButton from  '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

function LoadButton({onClick} : {onClick : () => void}) {
    return(
        <>
            {/* Load Button */}
            <Tooltip 
                title="Load" 
                placement="top"
                slotProps={{
                    popper: { modifiers: [{ name: 'offset', options: { offset: [0, 0] } }]},
                    tooltip: {
                        sx: {
                            backgroundColor: '#000',
                            color: '#fff',
                            borderRadius: '8px',
                            fontSize: 13,
                            padding: '6px 8px', // 위아래 padding을 늘리면 높이가 커짐
                            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)'
                        },
                    },
                }}
            >
                <IconButton
                    type="button"
                    onClick={onClick}
                    size="small"
                    sx={{ width: 16, height: 16, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', borderRadius: '10px', mx : 1,
                        '&:hover': {
                            bgcolor: '#d5e3fd',
                        },
                        '&.Mui-disabled': {
                            cursor: 'not-allowed',
                            pointerEvents: 'auto', // ← 이거 추가해야 cursor가 실제로 적용됨
                        },
                    }}
                >
                    <LoadIcon sx={{ color: '#007FFF'}} />
                </IconButton>
            </Tooltip>
        </>
    )
}

export default LoadButton;