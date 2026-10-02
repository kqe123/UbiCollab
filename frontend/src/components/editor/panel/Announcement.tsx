import Box from '@mui/material/Box';
import IconButton from  '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import AnnouncementModal from "../../modal/AnnouncementModal"
import { useState, useRef } from "react";

function Announcement ({
    sidePanel,
    setSidePanel,
    permission
} : { 
    sidePanel : "NONE" | "COMMENT" | "ANNOUNCEMENT";
    setSidePanel : React.Dispatch<React.SetStateAction<"NONE" | "COMMENT" | "ANNOUNCEMENT">>;
    permission : "VIEWER" | "COMMENTOR" | "EDITOR" |"MANAGER" | null;
}) {

    const [openModal, setOpenModal] = useState<boolean>(false); // 공지 추가 모달창 열림/닫힘 상태


    return (
        <>
            {/* 헤더 */}
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
            
            {/* 공지사항 목록 */}
            <Box sx={{
                width : "100%",
                height : "70%",
                display : 'flex',
                flexDirection: 'column',
                overflowY : 'auto',
            }}>
                <Button
                    disableElevation
                    variant="contained"
                    size="small"
                    color="error"
                    onClick={() => setOpenModal(true)}
                    sx={{ mt : 2, mx : "auto" }}
                >
                    공지 추가
                </Button>
            </Box>

            {/* 공지 추가 모달창 */}
            
            <AnnouncementModal 
                open={openModal}
                onClose={() => setOpenModal(false)}
            />
        </>
    );
    
}
export default Announcement;