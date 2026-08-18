import axios from "axios";
import toast from "react-hot-toast";
import type {DriveItem} from "../../types/driveitem";
import type {sharedUser} from "../../types/sharedUser";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useEffect } from "react";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import PermissionIcon from '@mui/icons-material/CoPresent';
import Avatar from '@mui/material/Avatar';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

function  PermissionModal ({
    driveItem,
    onClose
} : {
    driveItem : DriveItem,
    onClose : () => void;
}) { 

    const queryClient = useQueryClient(); // QueryClient 가져옴
    const accessToken = localStorage.getItem("accessToken"); // accessToken (JWT) 불러오기
    const initialUsers = useRef<sharedUser[]>([]); // 공유된 사용자들의 권한 초기 상태 스냅샷
    const hasSnapshot = useRef(false);   // Snapshot을 찍었는지 안찍었는지 여부

    // 현재 공유된 사용자 목록 불러오는 함수
    const getSharedUser = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/permission/sharedUser",
                {   
                    params: {
                        publicId: driveItem.publicId
                    },
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            )
            console.log("알림 : 공유 사용자 불러오기 성공");
            return response.data;
        } catch (error: unknown) {
            console.error("공유 사용자 불러오기 실패 : ", error);
            // axios에서 발생한 오류인 경우
            if (axios.isAxiosError(error)) {
                console.error("백엔드 응답:", error.response?.data);
                toast.error(error.response?.data?.message ?? "공유 사용자 불러오기에 실패했습니다.");
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

    // useQuery로 DriveItem이 바뀔때마다 새로운 공유 사용자를 불러옴.
    const {
        data : sharedUsers = [],
        isLoading,            // 현재 요청 중인지 여부
        isError,            // 요청이 실패했는지 여부
        error                // 실패했을 때 오류 정보
    } = useQuery({
        queryKey : ["users", driveItem.publicId],
        queryFn : getSharedUser,
    })
    
    // 권한이 업데이트된 사용자들을 뽑아내는 함수
    const updateUser = () => {
        // 1단계: initialUsers를 publicId 기준으로 즉시 조회 가능한 Map으로 변환
        const initialUserMap = new Map(
            initialUsers.current.map((user) => [user.publicId, user])
        );

        // 2단계: sharedUsers를 한 번만 순회하면서, 타입이 바뀐 사람만 필터링해서 반환
        const changedUsers = sharedUsers
            .filter((sharedUser : sharedUser) => {
                const initialUser = initialUserMap.get(sharedUser.publicId); // 키 조회(없으면 undefined)
                return initialUser && initialUser.type !== sharedUser.type;
            })

        return changedUsers;
    }

    // 권한 업데이트 함수
    const updatePermission = async () => {
        const updateUsers = updateUser();

        if (updateUsers.length === 0) {
            toast("변경사항이 없습니다.");  
            return;
        }
        try {

            const response = await axios.patch(
                "http://localhost:8080/api/permission/update",
                {
                    driveItemId: driveItem.publicId,
                    userList: updateUsers.map((user : sharedUser) => ({
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
                
            console.log(`알림 : ${response.data}명 권한 업데이트 성공`);
            toast.success("권한 업데이트에 성공하였습니다!");
            onClose();
        } catch (error: unknown) {
            console.error("권한 업데이트 실패... : ", error);
    
            // axios에서 발생한 오류인 경우
            if (axios.isAxiosError(error)) {
                console.error("백엔드 응답:", error.response?.data);
                toast.error(error.response?.data?.message ?? "권한 업데이트에 실패했습니다.");
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

    // 초기 스냅샷 찍음.
    useEffect(() => {
        {/* 현재 로딩중이 아니고, 스냅샷을 안찍은 상태일때*/}
        if (!hasSnapshot.current &&!isLoading) {
            initialUsers.current = sharedUsers;
            hasSnapshot.current = true;
            console.log(initialUsers);
        }
    }, [isLoading, sharedUsers]);

    // 로딩 처리
    if (isLoading) {
        return (
            <Box sx={{ minHeight: '100vh', alignItems: 'center', justifyContent: 'center'}}>
                <Typography>권한 정보를 불러오는 중입니다...</Typography>
            </Box>
        )
    }


    // 오류 처리
    if (isError) {
        return (
            <Box sx={{ minHeight: '100vh', alignItems: 'center', justifyContent: 'center'}}>
                <Typography sx={{ color: 'error.main' }}>권한 정보를 불러오지 못했습니다 : {error.message}</Typography>
            </Box>
        )
    }

    return ( 
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
                    height : '65%',
                    bgcolor: 'white',
                    p : 3,
                    borderRadius: '8px',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
                onClick={(e) => e.stopPropagation()}
            >   
                {/* 메뉴명 */}
                <Box sx={{display : 'flex' }}>
                    <Typography variant="h6" sx={{ fontWeight: 500, mt: 1, flex : 1}}>
                        <PermissionIcon sx={{mb : '3px'}}/> "{driveItem.itemName}" 권한 관리</Typography>
                    <Button type="button" onClick={onClose}><CloseIcon sx={{color: 'black'}}/></Button>
                </Box>
                
                <Box sx={{mt : 4}}>
                    <Typography variant="body1" sx={{ fontWeight: 500}}>현재 공유된 사용자</Typography>
                    {sharedUsers.length > 0 && (
                        <Box sx={{width: '100%', maxHeight : 'min(300px, 35vh)', overflowY: 'auto', mt : 1 }}>
                            {sharedUsers.map((sharedUser : sharedUser) => (
                                <Box 
                                    key={sharedUser.publicId}
                                    sx={{
                                        display : 'flex',
                                        height : 'min(60px, 7vh)',
                                        '&:hover': {
                                            bgcolor: '#e8f2fd'
                                        },
                                        alignItems : 'center',
                                        
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
                                    {sharedUser.type === "OWNER" ? (
                                        <Typography variant="body2" sx={{ color : 'gray', m : 2, ml: 'auto'}}>소유자</Typography>
                                    ) : (
                                        <Box sx={{ml: 'auto'}}>
                                        <Select
                                            value={sharedUser.type}
                                            size="small"
                                            onChange={(e: SelectChangeEvent) => {
                                                queryClient.setQueryData<sharedUser[]>(["users", driveItem.publicId], (prev) =>
                                                    (prev ?? []).map((user) =>
                                                        user.publicId === sharedUser.publicId
                                                            ? { ...user, type: e.target.value }
                                                            : user
                                                    )
                                                );
                                                }
                                            }
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
                                    )}
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
                        onClick={updatePermission}
                        sx={{ borderRadius: '8px', fontWeight: 500}}
                    >
                        완료
                    </Button>
                </Box>
            </Box>
        </Box>
    )
}

export default PermissionModal;