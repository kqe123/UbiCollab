import { useState } from "react";

function DocumentName({
    fileName,
    setFileName 
} : {
    fileName : string;
    setFileName : React.Dispatch<React.SetStateAction<string>>;
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

    return (
        <>
            {editing ? (
                <input
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    onBlur={finishEditing}
                    onKeyDown={handleKeyDown}
                    maxLength={maxNameLength}
                    autoFocus
                    style={{
                        width: `${Math.min(
                            Math.max(fileName.length + 4, 18),
                            maxNameLength
                        )}ch`,
                    }}
                    className="
                        max-w-[500px]
                        border border-gray-300
                        rounded
                        px-2 py-1
                        outline-none
                        focus:border-blue-500
                    "
                />
            ) : (
                <span
                    onClick={() => setEditing(true)}
                    className="
                        inline-block
                        min-w-[220px]
                        max-w-[500px]
                        truncate
                        cursor-text
                        text-lg
                        font-medium
                    "
                    title={fileName}
                >
                    {fileName}
                </span>
            )}
        </>
    );
}

export default DocumentName;