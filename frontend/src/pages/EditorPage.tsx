import EditorHeader from "../components/editor/header/EditorHeader.tsx";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type {DriveItem} from "../types/driveitem";

function EditorPage() {
    // URL이 /editor/zhamslwl.....이라면 documentId에는 "zhamslwl....."이 들어옴 -> string | undefined
    const { fileId } = useParams();

    // content은 Tiptap에서 자동으로 관리되므로 State 필요 X
    // fileName은 EditorHeader에서 관리해야되므로 여기서 State 초기화
    const [fileName, setFileName] = useState<string>("");
    const accessToken = localStorage.getItem("accessToken"); // accessToken (JWT) 불러오기


    // 백엔드 api(파일 하나 가져오기)를 호출하는 비동기 함수
    const getFile = async () => {
        try {
            // axios로 백엔드 api 호출
            const response = await axios.get(
                `http://localhost:8080/api/driveitem/files/${fileId}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            );

            console.log("문서 불러오기 성공");
            return response.data;
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message ?? "디렉토리 조회에 실패했습니다.";
                throw new Error(message); // 여기서 백엔드 메시지를 담은 새 Error로 교체
            }
            throw error;
        }
    };

    // useQuery 실행 (첫 렌더링 시, queryKey가 변경될 시에 실행한다.)
    const {
        data: file, // 백엔드에서 받아온 데이터
        isLoading,    // 현재 요청 중인지 여부
        isError,        // 요청이 실패했는지 여부
        error,            // 실패했을 때 오류 정보
    } = useQuery<DriveItem>({
        queryKey: ["driveItems", "editor" , fileId], // 서버 데이터를 해당 이름으로 관리
        queryFn: getFile,   // getDriveItems() 실행
    });


    // file이 도착한 시점에 외부 데이터로 로컬 State 초기화
    useEffect(() => {
        if (file) {
            setFileName(file.itemName);
        }
    }, [file]);

    // 문서를 받아오기 전에 편집기를 렌더링하지 않음
    if (isLoading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    minHeight: '100vh',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Typography>문서를 불러오는 중입니다...</Typography>
            </Box>
        );
    }

    // 문서 조회에 실패했을 때
    if (isError) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    minHeight: '100vh',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Typography variant="h5" sx={{ color: 'error.main' ,textAlign: 'center',}}>{error.message}</Typography>
            </Box>
        );
    }

	return (
		<>
		{/* Header에 SimpleEditor에게 fileName 전달 */}
		<EditorHeader 
			fileName={fileName}
			setFileName={setFileName}
            permission={file?.permissionType ?? null}/>
		<SimpleEditor 
			fileId={fileId}
            fileName={fileName}
            initialContent={file?.content ?? ""}
            permission={file?.permissionType ?? null}
		/>
		</>
	);
}

export default EditorPage;
