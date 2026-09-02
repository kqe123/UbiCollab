import logo from '../../assets/logo2.png'
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import { useCurrentUser } from "../../hooks/use-current-user";
import { useState, useRef } from "react";
import ProfileMenu from '../menu/ProfileMenu';

function ProfileHeader() {
    const S3_BASE_URL = "https://ubicollab-bucket.s3.ap-northeast-2.amazonaws.com"
    // 현재 로그인 유저 정보 (같은 queryKey["currentUser"]를 쓰는 다른 컴포넌트와 캐시 공유됨)
    const {
        data: currentUser, // 백엔드에서 받아온 데이터
        isLoading : isUserLoading,    // 현재 요청 중인지 여부
        isError : isUserError,        // 요청이 실패했는지 여부
        error,            // 실패했을 때 오류 정보
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
            <Box sx={{ width : '20%', display: 'flex', justifyContent: 'right', ml: 'auto', gap : 2}}>
                {isUserLoading && (
                    <Box sx={{ alignItems: 'center', justifyContent: 'center'}}>
                        <Typography>로그인 사용자를 불러오는 중입니다...</Typography>
                    </Box>
                )}
                {isUserError && (
                    <Box sx={{ alignItems: 'center', justifyContent: 'center'}}>
                        <Typography variant="body2" sx={{ color: 'error.main' ,textAlign: 'center'}}>{error.message}</Typography>
                    </Box>
                )}
                {currentUser?.profileImageKey ? (
                    <Avatar 
                        src={`${S3_BASE_URL}/${currentUser.profileImageKey}`}
                        alt="프로필사진" sx={{ width: 50, height: 50, cursor : 'pointer'}}
                        ref={anchorRef}
                        onClick={() => setIsProfileMenuOpen(true)}
                     />
                ) : (
                    <Avatar 
                        alt="프로필사진" sx={{ width: 50, height: 50, cursor : 'pointer'}}
                        ref={anchorRef}
                        onClick={() => setIsProfileMenuOpen(true)}
                    />
                )}
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