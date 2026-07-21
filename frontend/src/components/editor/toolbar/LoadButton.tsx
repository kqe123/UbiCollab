import loadIcon from "../../../assets/load.png"
function LoadButton({onClick} : {onClick : () => void}) {
return(
<>
    <button type="button"
            className="mx-2"
            onClick={onClick}
            title="불러오기">
        <img src={loadIcon} alt="불러오기" className="h-4 w-4" />
    </button>
</>
)
}

export default LoadButton;