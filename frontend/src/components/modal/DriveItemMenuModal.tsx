import { useNavigate } from "react-router-dom";
import type {DriveItem} from "../../types/driveitem";
import axios from "axios";
import toast from "react-hot-toast";
import { useState } from "react";
import ChangeNameModal from "./ChangeNameModal"
import { useQueryClient } from "@tanstack/react-query";

function DriveItemMenuModal({
    x, y, driveItem, onClose
} : {
    x : number;
    y : number;
    driveItem : DriveItem;
    onClose : () => void;
}) {

    const queryClient = useQueryClient(); // QueryClient 가져옴
    // 메뉴 모드를 CONTEXT/RENAME으로 나눠서 CONTEXT일때는 CONTEXT 메뉴를,
    // RENAME일때는 CONTEXT 메뉴 대신 RENAME 메뉴를 출력한다.
    const [menuMode, setMenuMode] = useState<"CONTEXT" | "RENAME">("CONTEXT");
    const accessToken = localStorage.getItem("accessToken"); // accessToken (JWT) 불러오기

    // 파일명 변경 메뉴 여는 함수
    const openRenameMenu = () => {
        setMenuMode("RENAME");
    }

    // 파일명 변경 메뉴 닫는 함수
    const closeRenameMenu = () => {
        onClose();
    }


    // "휴지통으로 보내기" 함수
    const throwTrash = async () => {
        try {
            // Backend API 호출
            const response = await axios.patch(`http://localhost:8080/api/driveitem/trash/${driveItem.publicId}`,
            null,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
            );
        
            console.log("문서를 휴지통으로 보내기 성공", response.data);
            await queryClient.invalidateQueries({
                queryKey: ["driveItems"]
            });
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
        {/* menuMode = CONTEXT일때 */}
        {menuMode === "CONTEXT" && (
            <div className="fixed inset-0 z-40" onClick={onClose}>
                <div className="fixed z-50 w-44 rounded-lg border border-gray-200 bg-white py-2 shadow-lg"
                    style={{ left: `${x}px`, top: `${y}px`,}}
                    onClick={(e) => e.stopPropagation()}>
                    <button type="button" className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                            openRenameMenu();
                        }}>
                        이름 변경
                    </button>
                    <hr className="my-1 border-gray-200" />
                    <button type="button" className=" w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {  
                            throwTrash()
                            onClose();                    
                        }}>
                        휴지통으로 이동
                    </button>
                </div>
            </div>
        )}
        
        {/* menuMode = RENAME일때 */}
        {menuMode === "RENAME" && (
            <ChangeNameModal
                driveItem={driveItem}
                onClose={closeRenameMenu}
            />
        )}
        </>
    );

}

export default DriveItemMenuModal;