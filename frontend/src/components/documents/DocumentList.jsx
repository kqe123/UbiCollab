import axios from "axios";
import { useQuery } from "@tanstack/react-query";

function DocumentList() {
    const getDocuments = async () => {
        // axios로 백엔드 api 호출
        const response = await axios.get(
            "http://localhost:8080/api/documents"
        );
            
        console.log("백엔드 응답:", response.data);

        return response.data;
    };

    const {
        data: documents = [], // 백엔드에서 받아온 데이터
        isLoading,            // 현재 요청 중인지 여부
        isError,              // 요청이 실패했는지 여부
        error,                // 실패했을 때 오류 정보
    } = useQuery({
        queryKey: ["documents"], // 서버 데이터를 해당 이름으로 관리
        queryFn: getDocuments,   // getDocuments() 실행
    });

    // formatDate() : 날짜 가독성을 높여주는 함수
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("ko-KR");
    };

    // 로딩 처리
    if (isLoading) {
        return <p className="mt-10">문서를 불러오는 중입니다...</p>
    }

    // 오류 처리
    if (isError) {
        return (
            <p className="mt-10 text-red-500">
                문서를 불러오지 못했습니다: {error.message}
            </p>
        );
    }

    // 문서가 0건일때 처리
    if (documents.length === 0 ) {
        return <p className="mt-10">'+ 새 문서' 버튼을 사용하여 업로드하세요.</p>;
    }

    // 문서 리스트를 정상적으로 받아왔을 때
    return (
        <table className="mt-10 w-full table-fixed text-left">
            <thead>
                <tr className="border-b border-[#DBDBDB]">
                    <td className="w-[50%] pb-3 text-sm ">이름</td>
                    <td className="w-[30%] pb-3 text-sm">생성 날짜</td>
                    <td className="w-[20%] pb-3 text-sm">파일 크기</td>
                </tr>
            </thead>

            <tbody>
                {documents.map((document) => (
                    <tr key={document.id} className="border-b border-[#DBDBDB]">
                        <td className="py-3 text-sm font-medium">📄 {document.fileName}.{document.extension}</td>
                        <td className="py-3 text-sm font-light">{formatDate(document.createdDate)}</td>
                        <td className="py-3 text-sm font-light">{document.fileSize} B</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export default DocumentList;