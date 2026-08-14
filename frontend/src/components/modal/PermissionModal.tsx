import axios from "axios";
import toast from "react-hot-toast";
import type {DriveItem} from "../../types/driveitem";
import type {sharedUser} from "../../types/sharedUser";
import { useQuery } from "@tanstack/react-query";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import PermissionIcon from '@mui/icons-material/CoPresent';
import Avatar from '@mui/material/Avatar';


function  PermissionModal ({
    driveItem,
    onClose
} : {
    driveItem : DriveItem,
    onClose : () => void;
}) { 

    const accessToken = localStorage.getItem("accessToken"); // accessToken (JWT) 불러오기
    const getSharedUser = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/permission/shared",
                {   
                    params: {
                        publicId: driveItem.publicId
                    },
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            )
            console.log("공유 사용자 불러오기 성공");
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

    const {
        data : sharedUsers = [],
        isLoading,            // 현재 요청 중인지 여부
        isError,            // 요청이 실패했는지 여부
        error                // 실패했을 때 오류 정보
    } = useQuery({
        queryKey : ["users"],
        queryFn : getSharedUser,
    })
    
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
                    height : '60%',
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
                                    key={sharedUser.id}
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
                                    <Box sx={{ml: 'auto'}}>
                                        {(sharedUser.type === "OWNER") ? (
                                            <Typography variant="body2" sx={{ color : 'gray', m : 2, flex : 1}}>소유자</Typography>
                                        ) : (
                                            <Typography variant="body2" sx={{ color : 'gray', m : 2, flex : 1}}>편집자</Typography>
                                        )
                                        }
                                    </Box>
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