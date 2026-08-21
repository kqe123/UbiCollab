import { useState } from "react";
import InputBase from '@mui/material/InputBase';
import Typography from '@mui/material/Typography';
function DocumentName({
    fileName,
    setFileName,
    permission
} : {
    fileName : string;
    setFileName : React.Dispatch<React.SetStateAction<string>>;
    permission : "VIEWER" | "COMMENTOR" | "EDITOR" |"MANAGER" | "OWNER" | null;
}) {

    const defaultName = "제목 없는 문서"; // 기본 파일명
    const maxNameLength = 150; // 글자 수 제한
    const [editing, setEditing] = useState(false); // 편집 상태

    // 포커스가 해제됬을때 할 동작들
    const finishEditing = () => {
        const trimmedName = fileName.trim();

        // 파일명이 비었다면 "제목 없는 문서"로 설정
        if (trimmedName === "") {
            setFileName(defaultName);
        } else {
            setFileName(trimmedName);
        }

        // Editing 상태를 false로 설정
        setEditing(false);
    };

    // Enter 키를 누르면 포커스 해제
    const handleKeyDown = (e : React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.blur();
        }
    };

    // 권한이 OWNER | MANAGER | EDITOR이면 True
    const canRename = permission === "OWNER" || permission === "MANAGER" || permission === "EDITOR";

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
                            Math.max(fileName.length + 4, 18),
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
                    onClick={canRename ? () => setEditing(true) : undefined}
                    title={fileName}
                    sx={{
                        display: 'inline-block',
                        minWidth: '220px',
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