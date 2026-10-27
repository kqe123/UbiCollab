import fileIcon from "../../../assets/file.png";
import DocumentName from "./DocumentName";
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import CommentIcon from '@mui/icons-material/Comment';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useCurrentUser } from "../../../hooks/use-current-user";
import { useState, useRef } from "react";
import ProfileMenu from '../../menu/ProfileMenu';
import Typography from '@mui/material/Typography';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import CloudOffIcon from '@mui/icons-material/CloudOff';

function EditorHeader({
    fileId,
    fileName,
    setFileName,
    permission,
    setSidePanel,
    saveStatus,
    setSaveStatus,
    savedAt,
    setSavedAt
} : {
    fileId : string;
    fileName : string;
    setFileName : React.Dispatch<React.SetStateAction<string>>;
    permission : "VIEWER" | "COMMENTOR" | "EDITOR" | "MANAGER" | null;
    setSidePanel : React.Dispatch<React.SetStateAction<"NONE" | "COMMENT">>;
    saveStatus : "저장 중" | "저장 완료" | "저장 실패" | null;
    setSaveStatus : React.Dispatch<React.SetStateAction<"저장 중" | "저장 완료" | "저장 실패" | null>>;    
    savedAt : Date | null;
    setSavedAt : (date : Date) => void;
}) {
    // 현재 로그인된 User 정보 
    const {
        data: currentUser,      // 백엔드에서 받아온 데이터
    } = useCurrentUser();

    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false); // 프로필 메뉴 열림/닫힘
    const anchorRef = useRef(null); // 프로필 버튼 참조


    return (
        <>
        <Box 
            component="header" 
            sx={{ position: "fixed", top: 0, left: 0, width: '100%', height: '70px',
                bgcolor: 'white', display: 'flex', alignItems: 'center', px: 2, 
                borderBottom: '0.5px solid #81c0ff'}}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, }}>
                {/* FileIcon */}
                <Box
                    component="img"
                    src={fileIcon}
                    sx={{ display: 'inline-block',
                        height: '40px',
                        width: '30px',
                        mr: '8px'
                    }}
                />
                {/* FileName */}
                <DocumentName 
                    fileId={fileId}
                    fileName={fileName}
                    setFileName={setFileName}
                    permission={permission}
                    setSaveStatus={setSaveStatus}
                    setSavedAt={setSavedAt}
                />

                {saveStatus === "저장 완료" && savedAt && (
                    <Typography sx={{ml : 1, color : 'gray', fontSize : '12px'}}>
                        <CloudDoneIcon />{" "}
                        {savedAt.toLocaleTimeString("ko-KR", { hour: "numeric", minute: "2-digit" })}에 저장됨
                    </Typography>
                )}
                {saveStatus === "저장 중" && (
                    <Typography sx={{ml : 1, color : 'gray', fontSize : '12px'}}>
                        저장 중...
                    </Typography>
                )}
                {saveStatus === "저장 실패" && (
                    <Typography sx={{ml : 1, color : 'gray', fontSize : '12px'}}>
                        <CloudOffIcon />{" "}저장 실패
                    </Typography>
                )}

            </Box>
        
            {/* Buttons */}
            <Box sx={{ width : '20%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap : 1}}>
                {/* 댓글 버튼 */}
                <Tooltip 
                    title="All Comment"
                    arrow
                    placement="bottom"
                    slotProps={{
                    popper: {
                        modifiers: [{ name: 'offset', options: { offset: [0, 0] } }],
                        },
                        tooltip: {
                        sx: {
                            backgroundColor: '#000',
                            color: '#fff',
                            borderRadius: '8px',
                            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)'
                            },
                        },
                        }}
                    >
                    <IconButton 
                        size="large"
                        onClick={() => setSidePanel("COMMENT")}
                        disabled={permission === "VIEWER" || !permission }
                    >
                        <CommentIcon sx={{ color: permission === "VIEWER" || !permission
                                            ? 'text.disabled' :  '#007FFF'}}/>
                    </IconButton>
                </Tooltip>
                <Avatar
                    src={currentUser?.profileUri ?? undefined}
                    onClick={() => setIsProfileMenuOpen(true)}
                    alt="프로필사진"
                    ref={anchorRef}
                    sx={{ width: 50, height: 50, cursor : 'pointer', boxShadow: '0 0 0 0.5px #007FFF'}}
                />
            </Box>
        </Box>
        {/* 프로필 메뉴 */}
        <ProfileMenu 
            open={isProfileMenuOpen}
            onClose={() => setIsProfileMenuOpen(false)}
            currentUser={currentUser}
            anchor={anchorRef.current}
        />
        </>
    )
}

export default EditorHeader;