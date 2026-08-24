import axios from "axios";
import toast from "react-hot-toast";
import type {DriveItem} from "../../types/driveitem";
import type {permission} from "../../types/permission";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useRef, useEffect, useMemo } from "react";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import PermissionIcon from '@mui/icons-material/CoPresent';
import Avatar from '@mui/material/Avatar';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useCurrentUser } from "../../hooks/use-current-user";
import IconButton from  '@mui/material/IconButton';
function  PermissionModal ({
    driveItem,
    onClose
} : {
    driveItem : DriveItem,
    onClose : () => void;
}) {

    const queryClient = useQueryClient(); // QueryClient 가져옴
    const accessToken = localStorage.getItem("accessToken"); // accessToken (JWT) 불러오기
    const { data: currentUser } = useCurrentUser(); // 현재 로그인 유저 정보 (DriverHeader와 캐시 공유됨)
    const initialPermissions = useRef<permission[]>([]); // 공유된 사용자들의 권한 초기 상태 스냅샷
    const [editedPermissions, setEditedPermissions] = useState<permission[]>([]);
    const hasSnapshot = useRef(false);   // Snapshot을 찍었는지 안찍었는지 여부

    // 화면 표시용 정렬: 소유자(OWNER)를 맨 위로, 나머지는 닉네임 가나다/ABC 순 (editedPermissions 원본 순서/상태는 그대로 둠)
    const sortedPermissions = useMemo(
        () => [...editedPermissions].sort((a, b) => {
            if (a.type === "OWNER" && b.type !== "OWNER") return -1;
            if (a.type !== "OWNER" && b.type === "OWNER") return 1;
            return a.nickname.localeCompare(b.nickname, "ko");
        }),
        [editedPermissions]
    );

    // 현재 공유된 사용자 목록 불러오는 함수
    const getPermissions = async () => {
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
        data : permissions = [],
        isLoading,            // 이 쿼리를 한 번도 받아온 적 없는지 여부 (캐시가 있으면 바로 false)
        isFetching,           // 지금 실제로 네트워크 요청 중인지 여부 (캐시가 있어도 백그라운드 재조회면 true)
        isError,            // 요청이 실패했는지 여부
        error                // 실패했을 때 오류 정보
    } = useQuery({
        queryKey : ["permissions", driveItem.publicId],
        queryFn : getPermissions,
    })

    // 권한이 업데이트된 사용자들을 뽑아내는 함수
    const updateUser = () => {
        // 1단계: initialUsers를 publicId 기준으로 즉시 조회 가능한 Map으로 변환
        const initialPermissionMap = new Map(
            initialPermissions.current.map((permission) => [permission.userId, permission])
        );

        // 2단계: editedPermissions를 한 번만 순회하면서, 타입이 바뀐 사람만 필터링해서 반환
        const changedPermissions = editedPermissions
            .filter((permission : permission) => {
                const initialPermission = initialPermissionMap.get(permission.userId); // 키 조회(없으면 undefined)
                return initialPermission && initialPermission.type !== permission.type;
        })

        return changedPermissions;
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
                    currentItemId: driveItem.publicId,
                    permissionList: updateUsers.map((permission : permission) => ({
                        driveItemId : permission.driveItemId,
                        userId: permission.userId,
                        type: permission.type,
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
            await queryClient.invalidateQueries({
                queryKey: ["permissions"]
            });
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

    // 해당 권한을 삭제하는 함수
    const deletePermission = async (userId : string, driveItemId : string) => {
        try {
            const response = await axios.delete(
                `http://localhost:8080/api/permission/delete/${userId}/${driveItemId}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            )
            console.log("권한 삭제에 성공했습니다.");
            toast.success("해당 권한이 삭제되었습니다.");
            return response.data;
        } catch (error: unknown) {
            console.error("권한 삭제 실패 : ", error);
            // axios에서 발생한 오류인 경우
            if (axios.isAxiosError(error)) {
                console.error("백엔드 응답:", error.response?.data);
                toast.error(error.response?.data?.message ?? "권한 삭제에 실패했습니다.");
            }
            else {
                console.error("알 수 없는 오류:", error);
                toast.error("알 수 없는 오류가 발생했습니다.");
            }
        }
    }

    // Confirm창으로 간략하게 물어보고 삭제
    const handlePermanentDelete = async (userId : string, driveItemId : string) => {
        const confirmed = window.confirm(
            "해당 권한을 영구 삭제하시겠습니까?\n[완료] 버튼과 관계없이 바로 삭제됩니다."
        );

        if (!confirmed) 
            return;
        

        await deletePermission(userId,driveItemId);
        await queryClient.invalidateQueries({
            queryKey: ["permissions", driveItem.publicId]
        });

        // EditedPermissions(State)를 최신 상태로 업데이트
        setEditedPermissions(prev =>
            prev.filter(p => !(p.userId === userId && p.driveItemId === driveItemId))
        );

        // initialPermission(초기 스냅샷) 또한 최신 상태로 업데이트
        initialPermissions.current = initialPermissions.current.filter(
            p => !(p.userId === userId && p.driveItemId === driveItemId)
        );
    };

    // 초기 스냅샷 찍음.
    useEffect(() => {
        {/* 로딩중도 아니고, 백그라운드 재조회도 끝났고(=진짜 최신 데이터), 스냅샷을 안찍은 상태일때*/}
        if (!hasSnapshot.current && !isLoading && !isFetching) {
            initialPermissions.current = permissions; // 초기 스냅샷
            setEditedPermissions(permissions);   // 화면 표시/수정은 이 state로
            hasSnapshot.current = true;

        }
    }, [isLoading, isFetching, permissions]);

    // 로딩 처리 (최초 로딩 + 스냅샷 찍기 전 캐시 재조회 중일 때 모두 대기)
    if (isLoading || (isFetching && !hasSnapshot.current)) {
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

                {/* 현재 공유된 사용자 목록 */}
                <Box sx={{mt : 4}}>
                    <Typography variant="body1" sx={{ fontWeight: 500}}>현재 공유된 사용자</Typography>
                    {sortedPermissions.length > 0 && (
                        <Box sx={{width: '100%', maxHeight : 'min(300px, 35vh)', overflowY: 'auto', mt : 1 }}>
                            {sortedPermissions.map((permission : permission) => (
                                <Box
                                    key={permission.userId}
                                    sx={{
                                        display : 'flex',
                                        height : 'min(60px, 7vh)',
                                        '&:hover': {
                                            bgcolor: '#e8f2fd'
                                        },
                                        alignItems : 'center',
                                    }}
                                >
                                    {permission.profileImageKey === null ?
                                    (<Avatar alt="기본프로필사진" sx={{ width: 32, height: 32}} />)
                                    : (<Avatar src={permission.profileImageKey} alt="프로필사진" sx={{ width: 32, height: 32}} />)
                                    }
                                    <Box sx={{ display : 'flex', flexDirection : "column", ml : 2 }}>
                                        <Typography variant="body2" sx={{ fontWeight : 500, flex : 1}}>
                                            {permission.nickname}
                                            {currentUser?.username === permission.username && (
                                                <Typography component="span" variant="body2" sx={{ color : 'primary.main', ml : 0.5}}>(나)</Typography>
                                            )}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color : 'gray', flex : 1}}>{permission.username}</Typography>
                                    </Box>
                                    {(permission.type === "OWNER" || permission.username === currentUser?.username) ? (
                                        <Typography variant="body2" sx={{ color : 'gray', m : 2, ml: 'auto'}}>
                                            {permission.type === "OWNER" && ("소유자")}
                                            {permission.type === "MANAGER" && ("관리자")}
                                            {permission.type === "EDITOR" && ("편집자")}
                                            {permission.type === "COMMENTOR" && ("댓글 작성자")}
                                            {permission.type === "VIEWER" && ("뷰어")}
                                        </Typography>
                                    ) : (
                                        <Box sx={{ml: 'auto'}}>
                                        <Select
                                            value={permission.type}
                                            size="small"
                                            onChange={(e: SelectChangeEvent) => {
                                                setEditedPermissions(prev =>
                                                    prev.map(u => u.userId === permission.userId ? { ...u, type: e.target.value } : u)
                                                );}
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
                                        <IconButton
                                            size="small"
                                            onClick={() => {
                                                handlePermanentDelete(permission.userId,permission.driveItemId);
                                            }}
                                        >
                                            <CloseIcon color="error" fontSize="small"/>
                                        </IconButton>
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
