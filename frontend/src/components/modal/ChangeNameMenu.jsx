import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

function ChangeNameMenu ({onClose, document}){
    const [fileName, setFileName] = useState(document.fileName);
    const changeName = async () => {

        // 문서명 앞뒤 공백 제거
        const trimmedFileName = fileName.trim();

        // backend api에 보낼 body
        const documentData = {
        fileName:
            trimmedFileName === ""
            ? "제목 없는 문서"
            : trimmedFileName,
        };

        try {
            // Backend API 호출
            const response = await axios.put(
                    `http://localhost:8080/api/documents/${document.id}`,
                    documentData
            );
        
            console.log("파일명 변경 성공");
            toast.success("파일명 변경이 완료되었습니다.");
            
        } catch (error) {
            console.error("파일명 변경 실패:", error);  

            if (error.response) {
                console.error(
                "백엔드 응답:",
                error.response.data
                );
            }
        }
    };

return ( 
<>  
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        onClick={onClose}>
        {/* 모달창 */}
        <div className=" w-[400px] min-h-[250px] rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">파일명 변경</h1>
            </div>
            <input value={fileName} onChange={(e) => setFileName(e.target.value)} 
            className="w-[300px] h-15
                        border border-gray-300
                        rounded
                        px-2 py-1 mt-6
                        outline-none
                        focus:border-blue-500"/>
            <div className="flex items-center justify-between mt-6">
                <button type="button" onClick={onClose} className="text-2xl">취소</button>
                <button type="button" onClick={changeName} className="text-2xl">확인</button>
            </div>
        </div>
    </div>
</>
)
}

export default ChangeNameMenu;