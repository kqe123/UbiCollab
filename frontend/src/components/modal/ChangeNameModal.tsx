import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import type {DriveItem} from "../../types/driveitem";
import { useQueryClient } from "@tanstack/react-query";
function ChangeNameModal ({
    onClose,
    driveItem
} : {
    onClose : () => void;
    driveItem : DriveItem;
}) {
    const [driveItemName, setDriveItemName] = useState(driveItem.itemName); // 현재 DriveItem 이름
    const accessToken = localStorage.getItem("accessToken"); // accessToken (JWT) 불러오기
    const queryClient = useQueryClient(); // QueryClient 가져옴
    const changeName = async () => {

        // 문서명 앞뒤 공백 제거
        const trimmedFileName = driveItemName.trim();

        // backend api에 보낼 body
        const driveItemData = {
            itemName:
                trimmedFileName === ""
                ? "제목 없는 문서"
                : trimmedFileName,
            };

        try {
            // 문서 변경 Backend API 호출  
            const response = await axios.patch(
                `http://localhost:8080/api/driveitem/${driveItem.publicId}`,
                driveItemData,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            );
        
            console.log("파일명 변경 성공", response.data);
            await queryClient.invalidateQueries({
                queryKey: ["driveItems"]
            });
            toast.success("파일명 변경이 완료되었습니다.");     
            onClose();       
        } catch (error : unknown) {
            // axios에서 발생한 오류인 경우
            if (axios.isAxiosError(error)) {
                console.error("백엔드 응답:", error.response?.data);
                toast.error(error.response?.data?.message ?? "문서 저장에 실패했습니다.");
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
                {/* 입력창 */}
                <input type="text" value={driveItemName}
                    onChange={(e) => setDriveItemName(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            changeName();
                        }
                    }}
                    className="mt-8 h-14 w-full rounded-xl
                    border border-gray-300 px-4 text-lg
                    outline-none transition focus:border-blue-500
                    focus:ring-4 focus:ring-blue-100"/>
            {/* 버튼 */}
            <div className="mt-8 flex justify-end gap-3">
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg px-5 py-2.5
                        text-base font-medium text-gray-700
                        transition hover:bg-gray-100">
                    취소
                </button>

                <button
                    type="button" onClick={changeName}
                    className="rounded-lg bg-blue-600 px-5
                    py-2.5 text-base font-medium text-white
                    transition hover:bg-blue-700 active:scale-95">
                    확인
                </button>
            </div>
        </div>
    </div>
    </>
    )
}

export default ChangeNameModal;