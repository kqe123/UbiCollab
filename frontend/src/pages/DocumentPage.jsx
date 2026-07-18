import EditorHeader from "../components/editor/header/EditorHeader.jsx";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor.jsx";
import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import axios from "axios";

function DocumentPage() {

	const { documentId } = useParams();
    const location = useLocation();
    const [fileName, setFileName] = useState(
        location.state?.document?.fileName ?? "제목 없는 문서"
    );

	return (
		<>
		{/* Header에 SimpleEditor에게 fileName 전달 */}
		<EditorHeader 
			fileName={fileName}
			setFileName={setFileName}/>
		<SimpleEditor 
			documentId={documentId}
            fileName={fileName}
            initialContent={location.state?.document?.content ?? ""}
		/>
		</>
	);
}

export default DocumentPage;
