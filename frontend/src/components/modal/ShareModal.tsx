import toast from "react-hot-toast";
import type {DriveItem} from "../../types/driveitem";
import type {permission} from "../../types/permission";
import { useState, useEffect } from "react";
import { useMutation, useQuery, skipToken, keepPreviousData } from "@tanstack/react-query";
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
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import { shareDriveItem } from '../../api/permissionApi.ts';
import { searchUsers } from '../../api/userApi.ts';
function  ShareModal ({
    driveItem,
    onClose
} : {
    driveItem : DriveItem,
    onClose : () => void;
}) { 
    const [text, setText] = useState<string>(""); // 입력값
    const [keyword, setKeyword] = useState<string>(""); // 디바운스된 검색어
    const [sharedUsers, setSharedUsers] = useState<permission[]>([]); // 공유 대상에 추가한 유저들
    const [isUserListOpen, setIsUserListOpen] = useState(false); // 자동완성 열림/닫힘

    // 입력값을 0.3초 디바운스해서 검색어(keyword)로 반영
    useEffect(() => {
        const timer = setTimeout(() => setKeyword(text.trim()), 300);
        return () => clearTimeout(timer); // cleanup 함수
    }, [text]);

    // 공유할 사용자 검색 (useQuery) — 검색어가 비어있으면 요청하지 않음
    const { data: searchedUsers = [] } = useQuery({
        queryKey: ["userSearch", driveItem.publicId, keyword],
        queryFn: keyword ? () => searchUsers(keyword, driveItem.publicId) : skipToken,
        placeholderData: keepPreviousData, // 새 검색 결과가 오기 전까지 이전 결과 유지
        retry: false,
    });
    const users = text.trim() ? searchedUsers : []; // 입력값이 비어있으면 검색 결과 없음

    // 공유 추가 (useMutation)
    const shareMutation = useMutation({
        mutationFn : () => shareDriveItem(driveItem.publicId, sharedUsers),
        onSuccess : async () => {
            console.log("알림 : 공유 성공!");
            toast.success("공유 완료");
            onClose();
        },
        onError : (error) => {
            toast.error(error.message);
        }
    })
            
    // 공유 추가 버튼 클릭 시 실행
    const shareSubmit = () => {
        // [예외 처리] 공유할 사용자가 없을때 예외 처리
        if (sharedUsers.length === 0) {
            toast.error("공유할 사용자를 먼저 추가해주세요.");
            return;
        }
    
        shareMutation.mutate();   // 공유 추가 요청 실행
    };



    return ( 
    <>  
        <Dialog
            open={true}
            onClose={onClose}
            fullWidth
            maxWidth="xs"
            slotProps={{
                paper: {
                    sx: { minHeight: '60%', maxHeight: '80%' } // 원하는 높이로 조절
                }
            }}
        >
            {/* 메뉴명 */}
            <DialogTitle sx={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap : 1 }}>
                <ShareIcon /> "{driveItem.itemName}" 공유 추가
            </DialogTitle>

            <DialogContent>
                <ClickAwayListener onClickAway={() => setIsUserListOpen(false)}>
                <Box sx={{ position: 'relative', mt : 2 }}>
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
                        sx={{ width : '100%'}}
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
                                            (sharedUser) => sharedUser.userId === user.publicId
                                        );

                                        if (isDuplicate) {
                                            toast.error("이미 공유할 사용자 목록에 추가된 사용자입니다.");
                                            return;
                                        }

                                        // 중복 선택이 아니면 sharedUsers에 추가
                                        setSharedUsers((prev) => [
                                            ...prev,
                                            {
                                                userId : user.publicId,
                                                username: user.username,
                                                nickname: user.nickname,
                                                profileUri: user.profileUri,
                                                driveItemId : driveItem.publicId,
                                                type: "VIEWER",
                                                isOwner: false,
                                            }
                                        ])
                                        setIsUserListOpen(false);
                                        }
                                    }
                                >
                                    {user.profileUri === null ? 
                                    (<Avatar alt="기본프로필사진" sx={{ width: 32, height: 32}} />)
                                    : (<Avatar src={user.profileUri} alt="프로필사진" sx={{ width: 32, height: 32}} />)
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
                </ClickAwayListener>
                
                {/* 추가된 공유 사용자들 목록 */}
                <Box sx={{mt : 2, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column'}}>
                    <Typography variant="body1" sx={{ fontWeight: 500, mt: 1, flexShrink: 0}}>추가된 공유 사용자</Typography>
                    {sharedUsers.length > 0 && (
                        <Box sx={{width: '100%', flex: 1, minHeight: 0, overflowY: 'auto'}}>
                            {sharedUsers.map((sharedUser : permission) => (
                                <Box
                                    key={sharedUser.userId}
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
                                    {sharedUser.profileUri === null ? 
                                    (<Avatar alt="기본프로필사진" sx={{ width: 32, height: 32}} />)
                                    : (<Avatar src={sharedUser.profileUri} alt="프로필사진" sx={{ width: 32, height: 32}} />)
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
                                                user.userId === sharedUser.userId
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
                                                prev.filter((user) => user.userId !== sharedUser.userId)
                                            );
                                        }}
                                    >   <CloseIcon color="error" fontSize="small"/>
                                    </IconButton>
                                </Box>
                            ))}
                        </Box>
                    )}
                </Box>
                </DialogContent>

                {/* 버튼 */}
                <DialogActions>
                    <Button
                        disableElevation
                        type="button"
                        size="large"
                        variant="contained"                 
                        color='primary'
                        onClick={shareSubmit}
                        sx={{ borderRadius: '8px', fontWeight: 500}}
                    >
                        완료
                    </Button>
                </DialogActions>
        </Dialog>
    </>
    )
}

export default ShareModal;