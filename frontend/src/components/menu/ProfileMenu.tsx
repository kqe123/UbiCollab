import { useNavigate } from "react-router-dom";
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import SettingsIcon from '@mui/icons-material/Settings';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import type { User } from "../../types/user";
function ProfileMenu({
    open, onClose, currentUser, anchor
} : {
    open: boolean;
    onClose : () => void;
    currentUser : User | undefined
    anchor : HTMLButtonElement | null
}) {
    const S3_BASE_URL = "https://ubicollab-bucket.s3.ap-northeast-2.amazonaws.com"
    const accessToken = localStorage.getItem("accessToken"); // accessToken (JWT) 불러오기
    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem("accessToken");
        navigate('/login');
        console.log("로그아웃 완료");
    }
    return (
        <>
        <Menu                 
            open={open}
            onClose={onClose}
            anchorEl={anchor}
            slotProps={{
                paper: {
                    sx: { width: 300, borderRadius: 2 } // 기존 Paper의 width/borderRadius만 유지
                },
                list: {
                    sx: { py: 0.5 } // 기존 Paper의 py도 여기로
                }
            }} 
        >   
            <Box sx={{p : 1, display : 'flex'}}>
                {currentUser?.profileImageKey ? (
                        <Avatar 
                            src={`${S3_BASE_URL}/${currentUser.profileImageKey}`}
                            alt="프로필사진" sx={{ width: 50, height: 50}}
                        />
                    ) : (
                        <Avatar alt="프로필사진" sx={{ width: 50, height: 50}} />
                )}
                <Box sx={{display : 'flex', flexDirection : "column", ml : 2 }}>
                    <Typography variant="body2" sx={{ fontWeight : 500, flex : 1}}>{currentUser?.nickname}</Typography>
                    <Typography variant="body2" sx={{ color : 'gray', flex : 1}}>{currentUser?.username}</Typography>
                </Box>
            </Box>

            <Divider sx={{my : 0.5}}/>

            <MenuList>
                <MenuItem
                    sx={{width : '100%', justifyContent: 'flex-start', px : 2, color: 'black'}}
                    onClick={() => navigate('/profile')}
                >
                    <ListItemIcon> <SettingsIcon fontSize="small" /></ListItemIcon>
                    <Typography variant="body2" sx={{color: 'black' }}>개인 설정</Typography>
                </MenuItem>

                <Divider sx={{my : 0.5}}/>
                
                <MenuItem
                    sx={{
                        width : '100%',
                        justifyContent: 'flex-start',
                        px : 2,
                        color: 'red',
                        '&:hover': {
                            bgcolor: '#fdc2c2'
                        },
                    }}
                    onClick={logout}
                >
                    <ListItemIcon> <ExitToAppIcon fontSize="small" /></ListItemIcon>
                    <Typography variant="body2" sx={{fontWeight: 600 }}>로그아웃</Typography>
                </MenuItem>
            </MenuList>
        </Menu>
    </>
    );
}

export default ProfileMenu;