import logo from '../../assets/logo.jpg'
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import { useCurrentUser } from "../../hooks/use-current-user";
import { useState, useRef } from "react";
import ProfileMenu from '../menu/ProfileMenu';

function DriverHeader() {
    // 현재 로그인 유저 정보 (같은 queryKey["currentUser"]를 쓰는 다른 컴포넌트와 캐시 공유됨)
    const {
        data: currentUser, // 백엔드에서 받아온 데이터
        isLoading,    // 현재 요청 중인지 여부
        isError,        // 요청이 실패했는지 여부
        error,            // 실패했을 때 오류 정보
    } = useCurrentUser();

    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false); // 프로필 메뉴 열림/닫힘
    const anchorRef = useRef(null); // 프로필 버튼 참조
    return (
        <>
        <Box 
            component="header" 
            sx={{ width: '100%', height: '70px', bgcolor: '#104FCD', display: 'flex',
                alignItems: 'center', boxSizing: 'border-box', px: 2,}}
        >
            {/* Logo */}
            <Box 
                component="img"
                src={logo}
                sx={{ width: '15%', maxWidth: 200, height: '60%', mx: 'auto'}}
            />

            {/* Search */}
            <Box sx={{ flex: 1, height : '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <TextField 
                    sx={{
                        width: '60%',
                        bgcolor: 'white',
                        borderRadius: '9px',
                        '& .MuiInputBase-root': {
                            height: '48px', // 원하는 높이는 여기서 지정
                            borderRadius: '9px',
                        },
                    }}
                />
            </Box>

            {/* Buttons */}
            <Box sx={{ width : '20%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap : 2}}>
                {isLoading && (
                    <Box sx={{ alignItems: 'center', justifyContent: 'center'}}>
                        <Typography>로그인 사용자를 불러오는 중입니다...</Typography>
                    </Box>
                )}
                {isError && (
                    <Box sx={{ alignItems: 'center', justifyContent: 'center'}}>
                        <Typography variant="body2" sx={{ color: 'error.main' ,textAlign: 'center',}}>{error.message}</Typography>
                    </Box>
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

export default DriverHeader;