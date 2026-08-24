import { NavLink } from "react-router-dom";
import Box from '@mui/material/Box';
function DriverSideBar() {

    const getButtonStyle = ({ isActive }: { isActive: boolean }) => {
        return `w-full cursor-pointer rounded-[10px] border-none px-3 py-3 
                text-left font-semibold hover:bg-[#dfe8f5]
                ${isActive
                ? "bg-[#C2E7FF] text-[#104FCD]"
                : "bg-transparent hover:bg-[#E6EFF5]"
                }`;
    };
    
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
                <NavLink to="/drive/my-drive" className={getButtonStyle}>내 드라이브</NavLink>
                <NavLink to="/drive/recent" className={getButtonStyle}>내 문서</NavLink>
                <NavLink to="/drive/favorite" className={getButtonStyle}>즐겨찾기</NavLink>
                <NavLink to="/drive/shared" className={getButtonStyle}>공유 문서</NavLink>
                <NavLink to="/drive/trash" className={getButtonStyle}>휴지통</NavLink>
            </Box>
        </Box>
    );
}

export default DriverSideBar;
