import fileIcon from "../../../assets/file.png";
import DocumentName from "./DocumentName";
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';

function EditorHeader({
    fileName,
    setFileName,
    permission,
} : {
    fileName : string;
    setFileName : React.Dispatch<React.SetStateAction<string>>;
    permission : "VIEWER" | "COMMENTOR" | "EDITOR" |"MANAGER" | "OWNER" | null;
}) {
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
            <Avatar alt="프로필사진" sx={{ width: 50, height: 50, cursor : 'pointer'}} />
        </Box>
    </Box>
</>
)
}

export default EditorHeader;