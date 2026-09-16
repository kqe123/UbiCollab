import fileIcon from "../../../assets/file.png";
import DocumentName from "./DocumentName";
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import { useCurrentUser } from "../../../hooks/use-current-user";
function EditorHeader({
    fileName,
    setFileName,
    permission,
} : {
    fileName : string;
    setFileName : React.Dispatch<React.SetStateAction<string>>;
    permission : "VIEWER" | "COMMENTOR" | "EDITOR" | "MANAGER" | null;
}) {

    // 현재 로그인된 User 정보 
    const {
        data: currentUser, // 백엔드에서 받아온 데이터
        isLoading,    // 현재 요청 중인지 여부
        isError,        // 요청이 실패했는지 여부
        error,            // 실패했을 때 오류 정보
    } = useCurrentUser();

return (
<>
    <Box 
        component="header" 
        sx={{ width: '100%', height: '70px', bgcolor: 'white', display: 'flex',
            alignItems: 'center', px: 2, borderBottom: '1px solid #DBDBDB'}}
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
                fileName={fileName}
                setFileName={setFileName}
                permission={permission}/>
        </Box>


        
        {/* Buttons */}
        <Box sx={{ width : '20%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap : 2}}>
            {currentUser?.profileUri ? (
                <Avatar src={currentUser.profileUri} alt="프로필사진" sx={{ width: 50, height: 50, cursor : 'pointer'}} />
            ) : (
                <Avatar alt="프로필사진" sx={{ width: 50, height: 50, cursor : 'pointer'}} />
            )}
        </Box>
    </Box>
</>
)
}

export default EditorHeader;