import { NavLink } from "react-router-dom";
import Box from '@mui/material/Box';
import ListItemButton from '@mui/material/ListItemButton';

// 사이드바 메뉴 목록
const navItems = [
    { to: "/drive/my-drive", label: "내 드라이브" },
    { to: "/drive/recent", label: "내 문서" },
    { to: "/drive/favorite", label: "즐겨찾기" },
    { to: "/drive/shared", label: "공유 문서" },
    { to: "/drive/trash", label: "휴지통" },
];

function DriverSideBar() {

    return (
        <Box
            component="aside"
            sx={{
                width: '17%', // 가로 240px
                boxSizing: 'border-box', // box-border
                bgcolor: '#F9F9FA',
                px: 2, // 가로 패딩 16px
                py: 1, // 세로 패딩 8px
            }}
        >
            <Box
                component="nav"
                sx={{
                    mt: 3, // mt-6 = 24px = MUI spacing 3
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
                            width: '100%', // w-full
                            borderRadius: '10px', // rounded-[10px]
                            px: 1.5, // px-3 = 12px = MUI spacing 1.5
                            py: 1.5, // py-3 = 12px = MUI spacing 1.5
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

export default DriverSideBar;
