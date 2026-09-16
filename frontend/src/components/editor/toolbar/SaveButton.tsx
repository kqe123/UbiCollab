import SaveIcon from '@mui/icons-material/Save';
import IconButton from  '@mui/material/IconButton';
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
            <IconButton
                type="button"
                onClick={onSave}
                disabled={isSaving || !canSave }
                size="large"
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
                title={isSaving ? "저장 중..." : "저장"}
            >
                <SaveIcon sx={{ color: canSave ? '#007FFF' : 'gray.300'}}/>
            </IconButton>
        </>
    )
}

export default SaveButton;