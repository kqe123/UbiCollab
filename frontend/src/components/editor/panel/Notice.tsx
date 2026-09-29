import Box from '@mui/material/Box';
import IconButton from  '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Container from '@mui/material/Container';
function Notice ({
    sidePanel,
    setSidePanel,
    permission
} : { 
    sidePanel : "NONE" | "COMMENT" | "NOTICE";
    setSidePanel : React.Dispatch<React.SetStateAction<"NONE" | "COMMENT" | "NOTICE">>;
    permission : "VIEWER" | "COMMENTOR" | "EDITOR" |"MANAGER" | null;
}) {

    

    return (
        <Box>
            <Box sx={{display : 'flex', flexDirection: 'row'}}>
                <Typography variant="h6">공지사항</Typography>
                <IconButton
                    size="small"
                    sx={{ml : 'auto'}}
                    onClick={() => setSidePanel("NONE")}
                >
                    <CloseIcon />
                </IconButton>
            </Box>
            <Container sx={{width : '100%', height : '100%'}}>
                <Typography variant="body1">공지사항이 없습니다.</Typography>
            </Container>
        </Box>
    );
    
}
export default Notice;