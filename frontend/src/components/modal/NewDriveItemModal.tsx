import axios from "axios";
import toast from "react-hot-toast";
import fileIcon from "../../assets/file.png";
import folderIcon from "../../assets/folder.png";
import { useNavigate  } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
function NewDriveItemModal({
    x, y, onClose, currentFolderId
} : {
    x : number;
    y : number;
    onClose : () => void;
    currentFolderId : string | null
}) {

    const accessToken = localStorage.getItem("accessToken"); // accessToken (JWT) 불러오기
    const navigate = useNavigate();
    const queryClient = useQueryClient(); // QueryClient 가져옴

    // 새 파일 생성 버튼 클릭 시 이벤트
    const createFile = async () => {
        const fileData = {
            itemName: "제목 없는 문서",
            type : "FILE",
            content: "",
            extension: "UC",
            parentPublicId : currentFolderId
        };
        
        // DB에 새 문서 생성 후 response 받음
        try {
            const response = await axios.post(
                "http://localhost:8080/api/driveitem/create",
                fileData,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            console.log("파일 생성 성공:", response.data);
            await queryClient.invalidateQueries({
                queryKey: ["driveItems"]
            });
            toast.success("새 파일을 생성하였습니다.")
            onClose();
        } catch (error : unknown) {
            // axios에서 발생한 오류인 경우
            if (axios.isAxiosError(error)) {
                console.error("백엔드 응답:", error.response?.data);
                toast.error(error.response?.data?.message ?? "파일 생성에 실패했습니다.");
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

    // 새 파일 생성 버튼 클릭 시 이벤트
    const createFolder = async () => {
        const folderData = {
            itemName: "새 폴더",
            type : "FOLDER",
            parentPublicId : currentFolderId
        };
        
        // DB에 새 문서 생성 후 response 받음
        try {
            const response = await axios.post(
                "http://localhost:8080/api/driveitem/create",
                folderData,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            console.log("폴더 생성 성공:", response.data);
            await queryClient.invalidateQueries({
                queryKey: ["driveItems"]
            });
            toast.success("새 폴더를 생성하였습니다.");
            onClose();
        } catch (error : unknown) {
            // axios에서 발생한 오류인 경우
            if (axios.isAxiosError(error)) {
                console.error("백엔드 응답:", error.response?.data);
                toast.error(error.response?.data?.message ?? "폴더 생성에 실패했습니다.");
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
                        onClick={() => {createFolder()}}>
                        <img src={folderIcon} alt="" className="inline-block h-[15px] w-[15px] mr-[5px] mb-[3px]" />
                        새 폴더 만들기
                    </button>
                    <button type="button" className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 cursor-pointer"
                        onClick={() => {createFile()}}>
                        <img src={fileIcon} alt="" className="inline-block h-[18px] w-[15px] mr-[5px] mb-[3px]" />
                        새 파일 만들기
                    </button>
                </div>
            </div>
        </>
    );
}

export default NewDriveItemModal;