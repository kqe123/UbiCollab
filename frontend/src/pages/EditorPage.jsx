import EditorHeader from "../components/editor/header/EditorHeader.jsx";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor.jsx";
import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import axios from "axios";

function EditorPage() {
    // URL이 /editor/3이라면 documentId에는 "3"이 들어옴
    const { documentId } = useParams();

    // 백엔드에서 받아온 파일명과 문서 내용을 저장
    const [fileName, setFileName] = useState("");
    const [content, setContent] = useState("");

    // GET 요청이 끝나기 전 편집기가 빈 내용으로 먼저 생성되는 것을 방지
    const [isLoading, setIsLoading] = useState(true);

    // 문서 조회 실패 여부
    const [error, setError] = useState(null);

    useEffect(() => {
        const getDocument = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // documentId에 해당하는 문서 한 개 조회
                const response = await axios.get(
                    `http://localhost:8080/api/documents/${documentId}`
                );

                console.log("문서 불러오기 성공:", response.data);

                // 백엔드에서 받은 데이터로 state 변경
                setFileName(response.data.fileName);
                setContent(response.data.content);
            } catch (error) {
                console.error("문서 불러오기 실패:", error);
                setError(error);
            } finally {
                // 성공하든 실패하든 요청이 끝나면 false
                setIsLoading(false);
            }
        };

        getDocument();
    }, [documentId]);

    // 문서를 받아오기 전에 편집기를 렌더링하지 않음
    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p>문서를 불러오는 중입니다...</p>
            </div>
        );
    }

    // 문서 조회에 실패했을 때
    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-red-500">
                    문서를 불러오지 못했습니다.
                </p>
            </div>
        );
    }

	return (
		<>
		{/* Header에 SimpleEditor에게 fileName 전달 */}
		<EditorHeader 
			fileName={fileName}
			setFileName={setFileName}/>
		<SimpleEditor 
			documentId={documentId}
            fileName={fileName}
            initialContent={content}
		/>
		</>
	);
}

export default EditorPage;
