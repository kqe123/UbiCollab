import SaveIcon from '@mui/icons-material/Save';
import IconButton from  '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

function SaveButton({
    onSave,
    isSaving,
    canSave
} : {
    onSave : () => Promise<void>
    isSaving : boolean;
    canSave : boolean;
}) {
    return(
        <>  
            {/* Save Button */}
            <Tooltip 
                title="Save" 
                placement="top"
                slotProps={{
                    popper: {
                        modifiers: [{ name: 'offset', options: { offset: [0, 0] } }],
                    },
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
                    onClick={onSave}
                    disabled={isSaving || !canSave }
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
                    <SaveIcon sx={{ color: canSave ? '#007FFF' : 'gray.300'}}/>
                </IconButton>
            </Tooltip>
        </>
    )
}

export default SaveButton;