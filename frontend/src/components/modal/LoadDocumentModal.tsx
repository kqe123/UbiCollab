import axios from "axios";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import fileIcon from "@/assets/file.png";

function LoadDocumentModal({onClose} : {onClose : () => void}) {
    const [selectedFileId, setSelectedFileId] = useState<string|null>(null); // 현재 선택된 문서 ID
    const navigate = useNavigate(); // navigate 훅
    const accessToken = localStorage.getItem("accessToken"); // accessToken (JWT) 불러오기

    const getFiles = async () => {
        // 문서 목록 가져오는 백엔드 api 호출
        const response = await axios.get(
            "http://localhost:8080/api/driveitem/files",
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );
            
        console.log("백엔드 응답:", response.data);

        return response.data;
    };

    const {
        data: files = [], // 백엔드에서 받아온 데이터
        isLoading,            // 현재 요청 중인지 여부
        isError,              // 요청이 실패했는지 여부
        error,                // 실패했을 때 오류 정보
    } = useQuery({
        queryKey: ["driveItems", "recent"], // 서버 데이터를 해당 이름으로 관리
        queryFn: getFiles,   // getDocuments() 실행
    });

    // formatDate() : 날짜 가독성을 높여주는 함수
    const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
};

    const loadDocument = async () => {
        navigate(`/editor/${selectedFileId}`); // editor에게 FileId만 전달
        onClose();
    }

    return (
        // 오버레이 (배경)
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={onClose}>
            {/* 모달창 */}
            <div className=" w-[600px] min-h-[400px] rounded-2xl bg-white p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">문서 불러오기</h2>
                    <button type="button" onClick={onClose} className="text-2xl">×</button>
                </div>

                {/* 로딩 처리 */}
                {isLoading && (
                    <p className="mt-10">
                        문서를 불러오는 중입니다...
                    </p>
                )}

                {/* 오류 처리 */}
                {isError && (
                    <p className="mt-10 text-red-500">
                        문서를 불러오지 못했습니다: {error?.message}
                    </p>
                )}

                {/* 문서가 0건일 때 */}
                {!isLoading && !isError && files.length === 0 && (
                    <p className="mt-10">
                        불러올 문서가 없습니다..
                    </p>
                )}

                {/* 문서 테이블 */}
                <table className="mt-10 w-full table-fixed text-left">
                    <thead>
                        <tr className="border-b border-[#DBDBDB]">
                            <td className="w-[50%] pb-3 text-sm ">이름</td>
                            <td className="w-[30%] pb-3 text-sm">생성 날짜</td>
                            <td className="w-[20%] pb-3 text-sm">파일 크기</td>
                        </tr>
                    </thead>
                
                    <tbody>
                        {[...files].sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()) // 생성 날짜 내림차순 정렬
                            .map((file) => (
                                <tr key={file.id} 
                                    onClick={() => setSelectedFileId(file.publicId)}
                                    onDoubleClick={loadDocument}
                                    className={
                                        `cursor-pointer
                                        ${ selectedFileId === file.publicId
                                            ? "bg-blue-100"
                                            : "hover:bg-gray-100"
                                        }`}>
                                    <td className="py-3 text-sm font-medium">
                                        <img src={fileIcon} alt="" className="inline-block h-[18px] w-[15px] mr-[5px] mb-[3px]" />
                                        {file.itemName}
                                        {file.extension === "UC" || file.extension === null ? "" : `.${file.extension}`}</td>
                                    <td className="py-3 text-sm font-light">{formatDate(file.createdDate)}</td>
                                    <td className="py-3 text-sm font-light">{file.size} B</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default LoadDocumentModal;