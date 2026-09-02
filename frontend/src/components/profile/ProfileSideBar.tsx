import { NavLink } from "react-router-dom";
import Box from '@mui/material/Box';
import ListItemButton from '@mui/material/ListItemButton';

// 사이드바 메뉴 목록
const navItems = [
    { to: "/profile/profile-edit", label: "프로필 수정" },
    { to: "/profile/password-edit", label: "비밀번호 수정" },
    { to: "/profile/user-delete", label: "회원 탈퇴" },
];

function ProfileSideBar() {

    return (
        <Box
            component="aside"
            sx={{
                width: '25%', // 가로 240px
                boxSizing: 'border-box', // box-border
                bgcolor: '#F9F9FA',
                px: 2, // 가로 패딩 16px
                py: 1, // 세로 패딩 8px
            }}
        >
            <Box
                component="nav"
                sx={{
                    mt: 3, 
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1, // gap-2 = 8px = MUI spacing 1
                }}
            >
                {navItems.map((item) => (
                    <ListItemButton
                        key={item.to}
                        component={NavLink}
                        to={item.to}
                        disableGutters
                        sx={{
                            width: '60%', 
                            borderRadius: '10px', 
                            px: 1.5, 
                            py: 1.5, 
                            fontWeight: 600, // font-semibold
                            bgcolor: 'transparent',
                            '&:hover': {
                                bgcolor: '#E6EFF5',
                            },
                            '&.active': {
                                bgcolor: '#C2E7FF',
                                color: '#104FCD',
                                '&:hover': {
                                    bgcolor: '#dfe8f5',
                                },
                            },
                        }}
                    >
                        {item.label}
                    </ListItemButton>
                ))}
            </Box>
        </Box>
    );
}

export default ProfileSideBar;