import axios from "axios";
import toast from "react-hot-toast";
import type {DriveItem} from "../../types/driveitem";
import type {User} from "../../types/user";
import type {sharedUser} from "../../types/sharedUser";
import { useState, useEffect } from "react";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import ShareIcon from '@mui/icons-material/Share';
import Avatar from '@mui/material/Avatar';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from  '@mui/material/IconButton';

function  ShareModal ({
    driveItem,
    onClose
} : {
    driveItem : DriveItem,
    onClose : () => void;
}) { 

    const [text, setText] = useState<string>(""); // 입력값
    const [users, setUsers] = useState<User[]>([]); // 검색 결과 유저들
    const [sharedUsers, setSharedUsers] = useState<sharedUser[]>([]); // 공유 대상에 추가한 유저들
    const [isUserListOpen, setIsUserListOpen] = useState(false); // 자동완성 열림/닫힘
    const accessToken = localStorage.getItem("accessToken"); // accessToken (JWT) 불러오기

    useEffect(() => {
        const keyword = text.trim();

        if (keyword.length === 0) {
            setUsers([]);
            return;
        }

        // setTimeout() : window 객체 메서드 (0.3초 뒤에 1회 실행)
        const timer = setTimeout(async () => {
            try {
                const response = await axios.get<User[]>(
                    `http://localhost:8080/api/user/search`,
                    {
                        params: {
                            keyword: keyword,
                            publicId : driveItem.publicId
                        },
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    }
                );

                setUsers(response.data);
            } catch (error) {
                console.error("사용자 검색 실패:", error);
                setUsers([]);
            }
        }, 300);

        // cleanup 함수
        return () => clearTimeout(timer);
    }, [text]);


    // 공유 추가 메서드
    const shareDriveItem = async () => {
        try {
            if (sharedUsers.length === 0) {
                toast.error("공유할 사용자를 먼저 추가해주세요.");
                return;
            }

            const response = await axios.post(
                "http://localhost:8080/api/permission/create",
                {
                    driveItemId: driveItem.publicId,
                    userList: sharedUsers.map((user) => ({
                        userId: user.publicId,
                        type: user.type,
                    })),
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            
            console.log(`알림 : ${response.data}명 공유 성공!`);
            toast.success("공유 성공하였습니다!");
            onClose();
        } catch (error: unknown) {
            console.error("공유 실패... : ", error);

            // axios에서 발생한 오류인 경우
            if (axios.isAxiosError(error)) {
                console.error("백엔드 응답:", error.response?.data);
                toast.error(error.response?.data?.message ?? "공유 실패했습니다.");
            } 
            // 일반 오류인 경우
            else if (error instanceof Error) {
                console.error("일반 오류:", error.message);
                toast.error(error.message);
            } 
            // 그 외의 오류인 경우
            else {
                console.error("알 수 없는 오류:", error);
                toast.error("알 수 없는 오류가 발생했습니다.");
            }
        }
    }

    return ( 
    <>  
        <Box 
            sx={{
                position: 'fixed', // fixed
                inset: 0, // inset-0
                zIndex: 50, // z-50
                display: 'flex',
                bgcolor: 'rgba(0, 0, 0, 0.4)', // bg-black/40
                alignItems: 'center',
                justifyContent: 'center',
            }}
            onClick={onClose}
        >
            {/* 모달창 */}
            <Box 
                sx={{
                    width : '40%',
                    height : '60%',
                    bgcolor: 'white',
                    p : 3,
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    setIsUserListOpen(false);
                }}
            >   
                {/* 메뉴명 */}
                <Box sx={{display : 'flex' }}>
                    <Typography variant="h6" sx={{ fontWeight: 500, mt: 1, flex : 1}}>
                        <ShareIcon sx={{mb : '3px'}}/> "{driveItem.itemName}" 공유 추가</Typography>
                    <Button type="button" onClick={onClose}><CloseIcon sx={{color: 'black'}}/></Button>
                </Box>

                <Box sx={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                    {/* 입력창 */}
                    <TextField 
                        type="text" 
                        size="small"
                        label="공유 대상"
                        onChange = {(e) => {
                            setText(e.target.value);
                            setIsUserListOpen(true);}}
                        onFocus={() => {
                            setIsUserListOpen(true);}}
                        sx={{
                            width : '100%',
                            mt: 3,
                        }}
                    />
                    {/* 자동완성 사용자 목록 */}
                    {isUserListOpen && text !== "" &&  users.length > 0 && (
                        <Box
                            sx={{
                                position: 'absolute', // fixed
                                left: 0,
                                top: '100%',
                                zIndex: 50,
                                width: '100%',
                                maxHeight: 'min(240px, 35vh)',
                                borderRadius: '16px', // rounded-2xl
                                bgcolor: 'white',
                                boxShadow: 6, // shadow-xl 근사치
                                overflowY: 'auto',
                            }} 
                        >
                            {users.map((user) => (
                                <Box key={user.publicId}
                                    sx={{
                                        height : 'min(60px, 7vh)',
                                        display: 'flex',
                                        cursor :'pointer',
                                        '&:hover': {
                                            bgcolor: '#e8f2fd'
                                        },
                                        alignItems : 'center',
                                        mx : 2
                                    }}
                                    onClick={() => {
                                        // 선택한 사용자가 이미 중복 선택된 경우 예외처리
                                        const isDuplicate = sharedUsers.some(
                                            (sharedUser) => sharedUser.publicId === user.publicId
                                        );

                                        if (isDuplicate) {
                                            toast.error("이미 공유할 사용자 목록에 추가된 사용자입니다.");
                                            return;
                                        }

                                        // 중복 선택이 아니면 sharedUsers에 추가
                                        setSharedUsers((prev) => [
                                            ...prev,
                                            {
                                                publicId : user.publicId,
                                                username: user.username,
                                                nickname: user.nickname,
                                                profileImageKey: user.profileImageKey,
                                                type: "VIEWER",
                                            }
                                        ])
                                        setIsUserListOpen(false);
                                        }
                                    }
                                >
                                    {user.profileImageKey === null ? 
                                    (<Avatar alt="기본프로필사진" sx={{ width: 32, height: 32}} />)
                                    : (<Avatar src={user.profileImageKey} alt="프로필사진" sx={{ width: 32, height: 32}} />)
                                    }
                                    
                                    <Box sx={{display : 'flex', flexDirection : "column", ml : 2 }}>
                                        <Typography variant="body2" sx={{ fontWeight : 500, flex : 1}}>{user.nickname}</Typography>
                                        <Typography variant="body2" sx={{ color : 'gray', flex : 1}}>{user.username}</Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    )}
                </Box>
                
                {/* 추가된 공유 사용자들 목록 */}
                <Box sx={{mt : 2, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column'}}>
                    <Typography variant="body1" sx={{ fontWeight: 500, mt: 1, flexShrink: 0}}>추가된 공유 사용자</Typography>
                    {sharedUsers.length > 0 && (
                        <Box sx={{width: '100%', flex: 1, minHeight: 0, overflowY: 'auto'}}>
                            {sharedUsers.map((sharedUser : sharedUser) => (
                                <Box
                                    key={sharedUser.publicId}
                                    sx={{
                                        display : 'flex',
                                        height : 'min(60px, 7vh)',
                                        flexShrink: 0,
                                        '&:hover': {
                                            bgcolor: '#e8f2fd'
                                        },
                                        alignItems : 'center',
                                        my : 1
                                    }}
                                >
                                    {sharedUser.profileImageKey === null ? 
                                    (<Avatar alt="기본프로필사진" sx={{ width: 32, height: 32}} />)
                                    : (<Avatar src={sharedUser.profileImageKey} alt="프로필사진" sx={{ width: 32, height: 32}} />)
                                    }
                                    <Box sx={{ display : 'flex', flexDirection : "column", ml : 2 }}>
                                        <Typography variant="body2" sx={{ fontWeight : 500, flex : 1}}>{sharedUser.nickname}</Typography>
                                        <Typography variant="body2" sx={{ color : 'gray', flex : 1}}>{sharedUser.username}</Typography>
                                    </Box>
                                    <Box sx={{ ml: 'auto' }}>
                                        <Select
                                            value={sharedUser.type}
                                            size="small"
                                            onChange={(e) => {
                                            setSharedUsers((prev) =>
                                                prev.map((user) =>
                                                user.publicId === sharedUser.publicId
                                                    ? { ...user, type: e.target.value }
                                                    : user
                                                )
                                                );
                                            }}
                                            sx={{
                                                fontSize: '13px', // text-sm
                                                bgcolor: 'white',
                                                borderRadius: 2, // rounded-lg
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: 'grey.300',
                                                },
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: 'primary.light', // hover:border-blue-400
                                                },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: 'primary.main', // focus:border-blue-500
                                                    borderWidth: 2,
                                                },
                                            }}
                                        >
                                            <MenuItem value="VIEWER">뷰어</MenuItem>
                                            <MenuItem value="COMMENTOR">댓글 작성자</MenuItem>
                                            <MenuItem value="EDITOR">편집자</MenuItem>
                                            <MenuItem value="MANAGER">관리자</MenuItem>
                                        </Select>
                                    </Box>
                                    <IconButton 
                                        size="small"
                                        onClick={() => {
                                            setSharedUsers((prev) =>
                                                prev.filter((user) => user.publicId !== sharedUser.publicId)
                                            );
                                        }}
                                    >   <CloseIcon color="error" fontSize="small"/>
                                    </IconButton>
                                </Box>
                            ))}
                        </Box>
                    )}
                </Box>

                {/* 버튼 */}
                <Box sx={{ mt : 4, display : 'flex', gap : 1.5, justifyContent : "flex-end"}}>
                    <Button
                        disableElevation
                        type="button"
                        size="large"
                        variant="contained"                 
                        color='primary'
                        onClick={shareDriveItem}
                        sx={{ borderRadius: '8px', fontWeight: 500}}
                    >
                        완료
                    </Button>
                </Box>
            </Box>
        </Box>
    </>
    )
}

export default ShareModal;