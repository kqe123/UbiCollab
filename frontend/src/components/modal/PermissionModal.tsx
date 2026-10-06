import toast from "react-hot-toast";
import type {DriveItem} from "../../types/driveitem";
import type {permission} from "../../types/permission";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DeleteModal from './DeleteModal';
import { getPermissions, updatePermission, deletePermission } from "../../api/permissionApi.ts";

function  PermissionModal ({
    driveItem,
    onClose
} : {
    driveItem : DriveItem,
    onClose : () => void;
}) {
    const queryClient = useQueryClient(); // QueryClient 가져옴
    const { data: currentUser } = useCurrentUser(); // 현재 로그인 유저 정보 (DriverHeader와 캐시 공유됨)
    const initialPermissions = useRef<permission[]>([]); // 공유된 사용자들의 권한 초기 상태 스냅샷
    const [editedPermissions, setEditedPermissions] = useState<permission[]>([]);
    const hasSnapshot = useRef(false);   // Snapshot을 찍었는지 안찍었는지 여부
    const [deleteTarget, setDeleteTarget] = useState<{ userId: string; driveItemId: string } | null>(null); // 권한 삭제 대상 (x버튼 클릭 시)

    // 화면 표시용 정렬: 소유자를 맨 위로, 나머지는 닉네임 가나다/ABC 순 (editedPermissions 원본 순서/상태는 그대로 둠)
    const sortedPermissions = useMemo(
        () => [...editedPermissions].sort((a, b) => {
            if (a.isOwner && !b.isOwner) return -1;
            if (!a.isOwner && b.isOwner) return 1;
            return a.nickname.localeCompare(b.nickname, "ko");
        }),
        [editedPermissions]
    );

    // 현재 공유된 사용자 목록 불러오기 (useQuery)
    const {
        data : permissions = [],
        isLoading,          // 이 쿼리를 한 번도 받아온 적 없는지 여부 
        isFetching,         // 지금 실제로 네트워크 요청 중인지 여부 
        isError,            // 요청이 실패했는지 여부
        error               // 실패했을 때 오류 정보
    } = useQuery({
        queryKey : ["permissions", driveItem.publicId],
        queryFn : () => getPermissions(driveItem.publicId),
        refetchInterval: 5 * 60 * 1000, // 5분마다 백그라운드에서 자동 재요청 
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

    // 권한 업데이트 (useMutation)
    const { mutate : savePermissions, isPending : isUpdatePending } = useMutation({
        // 실제로 수행할 함수 (mutate에 넘긴 값을 변수로 받음)
        mutationFn : (updateUsers : permission[]) => updatePermission(driveItem.publicId, updateUsers),
        // 성공 시 수행할 명령들
        onSuccess : async () => {
            console.log(`알림 : 권한 업데이트 성공`);
            toast.success("권한 업데이트 완료");
            await queryClient.invalidateQueries({
                queryKey: ["permissions"]
            });
            onClose();
        },
        // 오류 시 수행할 명령들
        onError : (error) => {
            toast.error(error.message);
        }
    })

    // 완료 버튼 클릭 시 실행
    const doUpdate = () => {
        const updateUsers = updateUser();
        if (updateUsers.length === 0) {
            toast("변경사항이 없습니다.");
            return;
        }
        savePermissions(updateUsers);
    }

    // 권한 삭제 (useMutation)
    const { mutate : removePermission } = useMutation({
        mutationFn : ({ userId, driveItemId } : { userId : string; driveItemId : string }) =>
            deletePermission(userId, driveItemId),
        onSuccess : async (_, { userId, driveItemId }) => {
            console.log("알림 : 권한 삭제 성공");
            toast.success("해당 권한 삭제됨");
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
        },
        onError : (error) => {
            toast.error(error.message);
        },
        onSettled : () => {
            setDeleteTarget(null); // 삭제 팝업 닫힘
        }
    })

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
        <>
        <Dialog
            open={true}
            onClose={onClose}
            fullWidth
            maxWidth="xs"
        >
            {/* 메뉴명 */}
            <DialogTitle sx={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap : 1 }}>
                <PermissionIcon /> 권한 관리
            </DialogTitle>
            
            {/* 현재 공유된 사용자 목록 */}
            <DialogContent>
                <Typography variant="body1" sx={{mt : 1, fontWeight: 500}}>현재 공유된 사용자</Typography>
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
                                <Avatar src={permission.profileUri ?? undefined} alt="프로필사진" sx={{ width: 32, height: 32}} />
                                <Box sx={{ display : 'flex', flexDirection : "column", ml : 2 }}>
                                    <Typography variant="body2" sx={{ fontWeight : 500, flex : 1}}>
                                        {permission.nickname}
                                        {currentUser?.username === permission.username && (
                                            <Typography component="span" variant="body2" sx={{ color : 'primary.main', ml : 0.5}}>(나)</Typography>
                                        )}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color : 'gray', flex : 1}}>{permission.username}</Typography>
                                </Box>
                                {(permission.isOwner || permission.username === currentUser?.username) ? (
                                        <Typography variant="body2" sx={{ color : 'gray', m : 2, ml: 'auto'}}>
                                            {permission.isOwner ? "소유자" :
                                            permission.type === "MANAGER" ? "관리자" :
                                            permission.type === "EDITOR" ? "편집자" :
                                            permission.type === "COMMENTOR" ? "댓글 작성자" :
                                            "뷰어"}
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
                                            setDeleteTarget({ userId: permission.userId, driveItemId: permission.driveItemId });
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
                </DialogContent>

                {/* 버튼 */}
                <DialogActions>
                    <Button
                        disableElevation
                        type="button"
                        size="large"
                        variant="contained"
                        color='primary'
                        disabled={isUpdatePending}
                        onClick={doUpdate}
                        sx={{ borderRadius: '8px', fontWeight: 500}}
                    >
                        완료
                    </Button>
                </DialogActions>
        </Dialog>

        {/* 삭제 팝업 */}
        <DeleteModal
            open={deleteTarget !== null}
            title="권한 삭제"
            message="해당 권한을 삭제하시겠습니까?"
            onConfirm={() => {
                if (deleteTarget) {
                    removePermission(deleteTarget);
                }
            }}
            onClose={() => setDeleteTarget(null)}
        />
        </>
    )
}

export default PermissionModal;
