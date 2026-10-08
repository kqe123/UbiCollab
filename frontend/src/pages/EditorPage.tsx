import EditorHeader from "../components/editor/header/EditorHeader.tsx";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useIsMutating, skipToken } from "@tanstack/react-query";
import noAuthorizedIcon from "../assets/noAuthorized.png";
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type {DriveItem} from "../types/driveitem";
import { getFile } from '..//api/driveitemApi.ts';
import CircularProgress from '@mui/material/CircularProgress';

function EditorPage() {
    // URL이 /editor/zhamslwl.....이라면 documentId에는 "zhamslwl....."이 들어옴 -> string | undefined
    const { fileId } = useParams();

    // content은 Tiptap에서 자동으로 관리되므로 State 필요 X
    // fileName은 여기서 관리
    const [fileName, setFileName] = useState<string>("");
    
    // saveStatus는 저장 상태, savedAt은 저장 시각을 나타냄.
    const [saveStatus, setSaveStatus] = useState<"저장 중" | "저장 완료" | "저장 실패" | null>(null);
    const [savedAt, setSavedAt] = useState<Date | null>(null);
    const [initializedFileId, setInitializedFileId] = useState<string | null>(null); // 제목을 초기화한 문서 ID
    document.title = `${fileName} - Ubicollab`;

    // 사이드 바 열림/닫힘 상태
    // 공지 버튼을 클릭했을때 ANNOUNCEMENT, 댓글 버튼을 클릭했을때 COMMENT, 열린 사이드 바가 없을때는 NONE
    const [sidePanel, setSidePanel] = useState<"NONE" | "ANNOUNCEMENT" | "COMMENT" >("NONE");
    
    // 이 문서의 저장 요청이 진행 중인 개수 (0이면 진행 중인 저장 없음)
    const pendingSaveCount = useIsMutating({ mutationKey: ["saveFile", fileId] });
    
    // useQuery 실행
    const {
        data: file,   //  데이터
        isPending,    // 데이터가 없으면 무조건 true
        isError,      // 요청이 실패했는지 여부
        error,        // 실패했을 때 오류 정보
    } = useQuery<DriveItem>({
        queryKey: ["driveItems", "editor" , fileId], // 서버 데이터를 해당 이름으로 관리
        queryFn: fileId ? () => getFile(fileId) : skipToken,   // getFile() 실행
        enabled: pendingSaveCount === 0, // ✅ 저장 중이면 조회를 미룸 → 저장 끝난 뒤 최신 내용 조회
        gcTime: 0,                       // ✅ 편집기를 나가면 캐시 즉시 삭제 → 다시 들어오면 항상 새로 조회
    });

    // 문서 데이터를 처음 받았을 때(또는 다른 문서로 바뀌었을 때) 한 번만 제목을 채움
    if (file && initializedFileId !== fileId) {
        setInitializedFileId(fileId ?? null);
        setFileName(file.itemName);
    }

    // fileId가 없는 잘못된 경로 대비
    if (!fileId) {
        return (
            <Box sx={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
                <Typography>잘못된 접근입니다.</Typography>
            </Box>
        );
    }

    // 문서를 받아오기 전에 편집기를 렌더링하지 않음
    if (isPending) {
        return (
            <Box 
                sx={{ 
                    display: 'flex',  
                    flexDirection: 'column', 
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap : 1,
                    height : '100%',
                }}
            >
                <CircularProgress size={50} thickness={5} color="primary" ></CircularProgress>
                <Typography variant="h5" >문서를 불러오는 중입니다...</Typography>
            </Box>
        );
    }

    // 문서 조회에 실패했을 때
    if (isError) {
        return (
            <Box 
                sx={{ 
                    display: 'flex',  
                    flexDirection: 'column', 
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap : 1,
                    height : '100%',
                }}
            >
                <Box component="img" src={noAuthorizedIcon} sx={{ width: '40%', height: '35%', mx: 'auto'}}/>
                <Typography variant="h5" sx={{ color: 'error.main' ,textAlign: 'center',}}>{error.message}</Typography>
            </Box>
        );
    }

	return (
		<>
		{/* Header에 SimpleEditor에게 fileName 전달 */}
        <Box sx={{display: 'flex', flexDirection: 'column'}}>
            <EditorHeader 
                fileId={fileId}
                fileName={fileName}
                setFileName={setFileName}
                permission={file?.permissionType ?? null}
                setSidePanel={setSidePanel}
                saveStatus={saveStatus}
                setSaveStatus={setSaveStatus}
                savedAt={savedAt}
                setSavedAt={setSavedAt}
            />
            <SimpleEditor 
                fileId={fileId}
                initialContent={file?.content ?? ""}
                permission={file?.permissionType ?? null}
                sidePanel={sidePanel}
                setSidePanel={setSidePanel}
                setSaveStatus={setSaveStatus}
                setSavedAt={setSavedAt}
            />
        </Box>
		</>
	);
}

export default EditorPage;
