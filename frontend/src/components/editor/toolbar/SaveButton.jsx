import saveIcon from "../../../assets/save.png"
function SaveButton( { onSave, isSaving}) {
return(
<>
    <button type="button"
            onClick={onSave}
            disabled={isSaving} 
            className="mx-2 disabled:opacity-50"
            title={isSaving ? "저장 중..." : "저장"}>
        <img src={saveIcon} alt="저장" className="h-4 w-4" />
    </button>
</>
)
}

export default SaveButton;