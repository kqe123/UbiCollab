import SaveIcon from '@mui/icons-material/Save';
import IconButton from  '@mui/material/IconButton';
function SaveButton({
    onSave,
    isSaving
} : {
    onSave : () => Promise<void>
    isSaving : boolean;
}) {
    return(
        <>  
            {/* Save Button */}
            <IconButton
                type="button"
                onClick={onSave}
                disabled={isSaving}
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
                title={isSaving ? "저장 중..." : "저장"}
            >
                <SaveIcon sx={{ color: 'grey.600'}}/>
            </IconButton>
        </>
    )
}

export default SaveButton;