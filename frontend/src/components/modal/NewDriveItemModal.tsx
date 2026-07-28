import axios from "axios";
import toast from "react-hot-toast";
import fileIcon from "../../assets/file.png";
import folderIcon from "../../assets/folder.png";

function NewDriveItemModal({
    x, y, onClose
} : {
    x : number;
    y : number;
    onClose : () => void;
}) {

    const accessToken = localStorage.getItem("accessToken"); // accessToken (JWT) 불러오기
    const throwTrash = async () => {
        try {
            // 폴더 생성
            const response = await axios.put(`http://localhost:8080/api/driveitem/driveitems}`,
            { isInTrash : true },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
            );
        
            console.log("문서를 휴지통으로 보내기 성공", response.data);
            toast.success("파일이 휴지통으로 이동되었습니다.");
        } catch (error: unknown) {
            console.error("문서를 휴지통으로 보내기 실패.. : ", error);

            // axios에서 발생한 오류인 경우
            if (axios.isAxiosError(error)) {
                console.error("백엔드 응답:", error.response?.data);
                toast.error(error.response?.data?.message ?? "문서를 휴지통으로 보내기에 실패했습니다.");
            } 
            // 일반 오류인 경우
            else if (error instanceof Error) {
                console.error("일반 오류:", error.message);
                toast.error(error.message);
            } 
            // 그 외의 오류인 경우
            else {
                console.error("알 수 없는 오류:", error);
                toast.error("알 수 없는 오류가 발생했습니다.");
            }
        } 
    }

    return (
        <>
            <div className="fixed inset-0 z-40" onClick={onClose}>
                <div className="fixed z-50 w-44 rounded-lg border border-gray-200 bg-white py-2 shadow-lg"
                    style={{ left: `${x}px`, top: `${y}px`,}}
                    onClick={(e) => e.stopPropagation()}>
                    <button type="button" className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 cursor-pointer"
                        onClick={() => {}}>
                        <img src={folderIcon} alt="" className="inline-block h-[15px] w-[15px] mr-[5px] mb-[3px]" />
                        새 폴더 
                    </button>
                    <button type="button" className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 cursor-pointer"
                        onClick={() => {}}>
                        <img src={fileIcon} alt="" className="inline-block h-[18px] w-[15px] mr-[5px] mb-[3px]" />
                        새 파일
                    </button>
                </div>
            </div>
        </>
    );
}

export default NewDriveItemModal;