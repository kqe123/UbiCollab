import logo from '../../assets/logo2.png'
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import { useCurrentUser } from "../../hooks/use-current-user";
import { useState, useRef } from "react";
import ProfileMenu from '../menu/ProfileMenu';
import CloudOffIcon from '@mui/icons-material/CloudOff';

function ProfileHeader() {
    // 현재 로그인 유저 정보 (같은 queryKey["currentUser"]를 쓰는 다른 컴포넌트와 캐시 공유됨)
    const {
        data: currentUser, // 백엔드에서 받아온 데이터
        isError : isUserError,        // 요청이 실패했는지 여부
    } = useCurrentUser();

    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false); // 프로필 메뉴 열림/닫힘
    const anchorRef = useRef(null); // 프로필 버튼 참조
    return (
        <>
        <Box 
            component="header" 
            sx={{ width: '100%', height: '70px', bgcolor: '#9DDACD', display: 'flex', 
                alignItems: 'center', justifyContent: 'left', boxSizing: 'border-box', px: 2,}}
        >
            {/* Logo */}
            <Box 
                component="img"
                src={logo}
                sx={{ width: '15%', maxWidth: 200, height: '60%'}}
            />

            {/* Buttons */}
            <Box sx={{ width : '20%', display: 'flex', alignItems: 'center', justifyContent: 'right', ml: 'auto', gap : 2}}>
                {isUserError && (
                    <Typography sx={{ fontSize : "12px", fontWeight : 600, color: '#134E4A'}}>
                        <CloudOffIcon />{" "}오프라인 상태
                    </Typography>
                )}
                <Avatar
                    src={currentUser?.profileUri ?? undefined}
                    alt="프로필사진" sx={{ width: 50, height: 50, cursor : 'pointer'}}
                    ref={anchorRef}
                    onClick={() => setIsProfileMenuOpen(true)}
                />
            </Box>
        </Box>

        {/* 프로필 메뉴 */}
        <ProfileMenu 
            open={isProfileMenuOpen}
            onClose={() => setIsProfileMenuOpen(false)}
            currentUser={currentUser}
            anchor={anchorRef.current}
        />
        </>
    );
}

export default ProfileHeader;