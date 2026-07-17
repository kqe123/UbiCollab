import fileIcon from "../../assets/document.png";
import DocumentName from "./DocumentName.jsx";
function EditorHeader({ fileName, setFileName }) {
return (
<>
    <header className="w-full h-[70px] bg-white flex items-center px-6 border-b border-[#E5E7EB]">
        <div className="flex items-center flex-1">
            {/* Logo */}
            <img src={fileIcon} alt="File Icon" className="w-[30px] h-[40px] mr-2 block" />
            <DocumentName 
                fileName={fileName}
                setFileName={setFileName}/>
        </div>


        
        {/* Buttons */}
        
        <div className="flex items-center gap-4 shrink-0">

            <button type="button" className="w-12 h-12 rounded-full bg-[#E5E7EB] text-[13px]
                                            font-semibold overflow-hidden cursor-pointer">
                프로필
            </button>
        </div>
        
    </header>
</>
)
}

export default EditorHeader;