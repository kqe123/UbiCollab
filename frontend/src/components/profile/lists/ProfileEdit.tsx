import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import IconButton from  '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import { useState, useRef, useEffect } from "react";
import { useCurrentUser } from "../../../hooks/use-current-user";
import { changeNickname, uploadProfileImage } from '../../../api/userApi.ts';

function ProfileEdit() {
    // 현재 로그인중인 유저 정보 
    const {
        data: currentUser, // 백엔드에서 받아온 데이터
        isLoading : isUserLoading,    // 현재 요청 중인지 여부
        isError : isUserError,        // 요청이 실패했는지 여부
        error : userError,            // 실패했을 때 오류 정보
    } = useCurrentUser();

    const [avatarSrc, setAvatarSrc] = useState<string | null>(null); // 미리보기용(BASE64 문자열)
    const [avatarFile, setAvatarFile] = useState<File | null>(null); // 실제 업로드용 이미지(File 객체)
    const [nickname, setNickname] = useState<string>(""); // 닉네임 State
    const queryClient = useQueryClient(); // QueryClient 가져옴
    const hasSynced = useRef(false); // 최초 1회만 동기화했는지 여부 (5분마다 currentUser가 자동 동기화되기 때문)

    // 입력된 이미지 파일을 미리보기(Base64 문자열)와 실제 업로드용 File 객체로 저장하는 메서드
    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
            if (file) {
                // Read the file as a data URL
                setAvatarFile(file);
                const reader = new FileReader();
                reader.onload = () => {
                    setAvatarSrc(reader.result as string);
                };
                reader.readAsDataURL(file);
        }
    };

    // nickname 상태 변경 메서드
    const handleNickname = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNickname(event.target.value)
    }

    // 닉네임 변경 (useMutation)
    const changeNicknameMutation = useMutation({
        mutationFn : () => changeNickname(nickname),
        onSuccess : () => {
            console.log("닉네임 변경 성공");
        },
        onError : (error) => {
            console.error("닉네임 변경 실패:", error);
            toast.error(error.message);
        }
    })

    // 프로필 사진 업데이트 (useMutation) — S3 버킷에 프로필 사진을 업로드
    const uploadProfileMutation = useMutation({
        mutationFn : (file : File) => uploadProfileImage(file),
        onSuccess : () => {
            setAvatarFile(null);
            console.log("프로필 사진 업데이트 성공");
        },
        onError : (error) => {
            console.error("프로필 사진 업데이트 실패:", error);
            toast.error(error.message);
        }
    })


    // 프로필 수정 메서드
    const changeProfile = async (e : React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        // 1. 닉네임 유효성 검사
        if (nickname.trim().length < 2) {
            toast.error("닉네임 : 2자 이상 입력해주세요.");
            return;
        }

        // 2. (예외처리) 현재 로그인중인 사용자 정보를 가져오지 못했을때 메시지
        if (!currentUser) {
            toast.error("오류 : 로그인 정보를 받아오지 못했습니다.")
            return;
        }

        // 3. (예외처리) 닉네임, 프로필 사진 모두 변경사항이 없다면 알림 메시지
        if (nickname === currentUser?.nickname && !avatarFile)  {
            toast("변경사항이 없습니다.");
            return;
        } 

        // 4. (선택사항) 현재 닉네임과 다르다면, 닉네임 변경 (실패 토스트는 onError에서 처리)
        if (nickname !== currentUser.nickname) {
            await changeNicknameMutation.mutateAsync().catch(() => {});
        }

        // 5. (선택사항) 업데이트될 프로필 사진이 있다면, 백엔드에게 해당 프로필 사진을 보낸다.
        if (avatarFile) {
            await uploadProfileMutation.mutateAsync(avatarFile).catch(() => {});
        }
        await queryClient.invalidateQueries({queryKey: ["currentUser"]});
        toast.success("프로필 수정 완료");
    } 


    // 현재 로그인된 유저의 nickname, 프로필사진으로 초기화 (최초 1회만)
    useEffect(() => {
        if (currentUser && !hasSynced.current) {
            setNickname(currentUser.nickname);
            setAvatarSrc(currentUser.profileUri);
            hasSynced.current = true; // 이후 refetch로 currentUser가 갱신돼도 다시 안 덮어씀
        }
    }, [currentUser]);

    // 로딩 처리 ()
    if (isUserLoading) {
        return (
            <Box sx={{ minHeight: '100vh', alignItems: 'center', justifyContent: 'center'}}>
                <Typography>사용자 정보를 불러오는 중입니다...</Typography>
            </Box>
        )
    }

    // 오류 처리
    if (isUserError) {
        return (
            <Box sx={{ minHeight: '100vh', alignItems: 'center', justifyContent: 'center'}}>
                <Typography variant="h5" sx={{ color: 'error.main' ,textAlign: 'center',}}>{userError.message}</Typography>
            </Box>
        )
    }

    return (
        <>
        <Typography variant="h5" sx={{ fontWeight: 800, mt: 1}}>프로필 수정</Typography>
        <Stack 
            component="form"
            onSubmit={changeProfile}
            spacing={4} sx={{mt : 6, justifyContent: 'center'}}>
            {/* Profile Image */}
            <Box sx={{display: 'flex', justifyContent: 'center'}}>
                <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                    <IconButton component="label" size="large">
                        <EditIcon sx={{ color: 'white', bgcolor: 'blue', borderRadius: '6px', width : 25, height : 25}} />
                        <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            hidden
                            onChange={handleAvatarChange}
                        />
                    </IconButton>
                    }
                >   
                    <Avatar alt="Upload new avatar" src={avatarSrc ?? undefined} sx={{ width: 100, height: 100 }} />
                </Badge>
            </Box>

            {/* 닉네임 입력칸 */}
            <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <Typography variant="body1" sx={{fontWeight: 600, width: '60%'}}>닉네임</Typography>
                <TextField
                    required
                    type="text"
                    size="small"
                    name="nickname"
                    value={nickname}
                    onChange={handleNickname}
                    placeholder="2자 이상 입력해주세요."
                    sx={{
                        width : '60%',
                        mt : 1,
                        '& .MuiInputBase-input::placeholder': {
                            color: 'gray', // placeholder의 색깔 조정
                            opacity: 0.5,  // placeholder의 투명도 조정
                            fontSize: '14px',   // placeholder의 폰트사이즈 조정
                        },
                    }}
                >
                </TextField>
            </Box>
        
            {/* 프로필 수정 */}
            <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <Button
                    disableElevation
                    type="submit"
                    variant="contained"
                    size="medium"
                    color="primary"
                    sx={{mt : 4, width : '60%'}}
                >
                    프로필 수정
                </Button>
            </Box>
        </Stack>
        </>
    );
}

export default ProfileEdit;