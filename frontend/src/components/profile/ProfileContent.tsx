import { Outlet } from "react-router-dom";
import Box from '@mui/material/Box';


function ProfileContent() {
    return (
        <>
        <Box sx={{ flex: 1, p: 3 }}>
            <Box
                sx={{
                    height : "100%",
                    width : "70%",
                    mx: 'auto',
                    borderRadius: '24px', 
                    bgcolor: 'white', 
                    p: 3,
                    display : 'flex',
                    flexDirection: 'column'
                }}
            >
                <Outlet />
            </Box>
        </Box>
        </>
    );
}

export default ProfileContent;