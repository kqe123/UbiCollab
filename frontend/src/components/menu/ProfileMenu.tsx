import type {DriveItem} from "../../types/driveitem";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
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

    const queryClient = useQueryClient(); // QueryClient 가져옴
    const accessToken = localStorage.getItem("accessToken"); // accessToken (JWT) 불러오기
    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem("accessToken");
        navigate('/login');
    }
    return (
        <>
        <Menu                 
            open={open}
            onClose={onClose}
            anchorEl={anchor}
            slotProps={{
                paper: {
                    sx: { width: 150, borderRadius: 2 } // 기존 Paper의 width/borderRadius만 유지
                },
                list: {
                    sx: { py: 0.5 } // 기존 Paper의 py도 여기로
                }
            }} 
        >
            <MenuList>
                <MenuItem
                    sx={{width : '100%', justifyContent: 'flex-start', px : 2, color: 'black'}}
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