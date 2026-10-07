import { useRef, useState } from "react";
import InputBase from '@mui/material/InputBase';
import Typography from '@mui/material/Typography';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { changeName } from '../../../api/driveitemApi.ts';

function DocumentName({
    fileId,
    fileName,
    setFileName,
    permission,
    setSaveStatus,
    setSavedAt
} : {
    fileId : string;
    fileName : string;
    setFileName : React.Dispatch<React.SetStateAction<string>>;
    permission : "VIEWER" | "COMMENTOR" | "EDITOR" |"MANAGER" | null;
    setSaveStatus : React.Dispatch<React.SetStateAction<"저장 중" | "저장 완료" | "저장 실패" | null>>;
    setSavedAt : (date : Date) => void;
}) {

    const originalNameRef = useRef(fileName);  // 초기 fileName 스냅샷 (= 마지막 저장된 이름)
    const defaultName = "제목 없는 문서"; // 기본 파일명
    const maxNameLength = 150; // 글자 수 제한
    const [editing, setEditing] = useState(false); // 편집 상태
    const queryClient = useQueryClient();

    // 편집 시작됬을때 동작들
    const startEditing = () => {
        originalNameRef.current = fileName;
        setEditing(true);
    };

    // 포커스가 해제됬을때(편집 끝났을때) 동작들 
    const finishEditing = () => {
        const trimmedName = (fileName.trim().length === 0) ? defaultName : fileName.trim()
        setEditing(false);
        setFileName(trimmedName);

        // ✅ 변경 없으면 저장 안 함
        if (trimmedName === originalNameRef.current) 
            return;

        setSaveStatus("저장 중");
        saveFileName({ trimmedName });
    };

    // Enter 키를 누르면 포커스 해제
    const handleKeyDown = (e : React.KeyboardEvent<HTMLInputElement>) => {
        if (e.nativeEvent.isComposing) return;
        if (e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.blur();
        }
    };

    // 권한이 MANAGER이면 True
    const canRename = permission === "MANAGER";

    // 파일명 자동 저장 (useMutation)
    const { mutate : saveFileName } = useMutation({
        mutationFn : ({ trimmedName } : { trimmedName : string; }) =>
            changeName(trimmedName,fileId),
        onSuccess : async () => {
            console.log("알림 : 문서 저장 성공");
            // "저장 중..."이 너무 빨리 지나가지 않도록 1초 뒤 완료 표시
            setTimeout(() => {
                setSaveStatus("저장 완료");
                setSavedAt(new Date());
            }, 1000);
            await queryClient.invalidateQueries({ queryKey: ["driveItems"] });
        },
        onError : () => {
            setFileName(originalNameRef.current); // 원래 이름으로 복구
            // "저장 중..."이 너무 빨리 지나가지 않도록 1초 뒤 실패 표시
            setTimeout(() => {
                setSaveStatus("저장 실패");
            }, 1000);
        }
    })

    return (
        <>  
            {canRename && editing ? (
                <InputBase
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    onBlur={finishEditing}
                    onKeyDown={handleKeyDown}
                    inputProps={{ maxLength: maxNameLength }}
                    autoFocus
                    sx={{
                        width: `${Math.min(
                            Math.max(fileName.length + 4, 14),
                            maxNameLength
                        )}ch`,
                        maxWidth: '500px',
                        border: '1px solid',
                        borderColor: 'grey.300',
                        borderRadius: '4px',
                        px: 1,
                        py: 0.5,
                        '&.Mui-focused': {
                            borderColor: 'primary.main',
                        },
                    }}
                />
            ) : (
                <Typography
                    onClick={canRename ? startEditing : undefined}
                    title={fileName}
                    sx={{
                        display: 'inline-block',
                        maxWidth: '500px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        cursor: 'text',
                        fontSize: '1.125rem', // text-lg
                        fontWeight: 500, // font-medium
                    }}
                >
                    {fileName}
                </Typography>
            )}
        </>
    );
}

export default DocumentName;