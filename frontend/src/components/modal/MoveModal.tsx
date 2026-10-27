import { useState } from "react";
import toast from "react-hot-toast";
import type {DriveItem} from "../../types/driveitem";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import fileIcon from "@/assets/file.png";
import folderIcon from "@/assets/folder.png";
import HomeIcon from '@mui/icons-material/Home';
import ReplyIcon from '@mui/icons-material/Reply';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove';
import IconButton from  '@mui/material/IconButton';
import { useQuery, skipToken, type UseQueryOptions } from "@tanstack/react-query";
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { getDriveItems, getSharedItems, getDrivePath, getSharedPath, moveDriveItem } from '../../api/driveitemApi.ts';

type TabKey = "MYDRIVE" | "SHARE"; // 탭 유니온 타입

function MoveModal ({
    source,
    onClose,
    tab
} : {
    source : DriveItem;
    onClose : () => void;
    tab : "MYDRIVE" | "SHARE";
}) {
    
    const [selectedItemId, setSelectedItemId] = useState<string|null>(null); // 현재 선택된 아이템 ID
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null); // 모달 내부 폴더 이동용
    const queryClient = useQueryClient(); // QueryClient 가져옴


    // 탭에 따른 디렉토리 불러오기
    const tabQueries = {
        MYDRIVE:  { queryKey: ["driveItems", "myDrive", currentFolderId],  queryFn: () => getDriveItems(currentFolderId) },
        SHARE:    { queryKey: ["driveItems", "shared", currentFolderId],   queryFn: () => getSharedItems(currentFolderId) },
    };
    
    const {
        data: driveItems = [], // 데이터
        isLoading,            // 현재 요청 중인지 여부
        isError,              // 요청이 실패했는지 여부
        error,                // 실패했을 때 오류 정보
    } = useQuery(
        tabQueries[tab]
    );

    // 탭에 따른 경로 불러오기
    const tabPaths: Record<TabKey, UseQueryOptions<DriveItem[]>> = {
        MYDRIVE: { 
            queryKey: ["driveItems","path", "myDrive", currentFolderId],
            queryFn: currentFolderId ? () => getDrivePath(currentFolderId) : skipToken 
        },
        SHARE: { 
            queryKey: ["driveItems","path", "shared", currentFolderId],
            queryFn: currentFolderId ? () => getSharedPath(currentFolderId) : skipToken
        },
    };
    
    const { data: paths = [] } = useQuery( tabPaths[tab] );

    // formatDate() : 날짜 가독성을 높여주는 함수
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
    };

    // 요소 더블클릭 시 발생하는 이벤트 함수
    const elementDoubleClick = (driveItem: DriveItem): void => {
        if (driveItem.itemType === "FOLDER") {
            setCurrentFolderId(driveItem.publicId);
        }
        else if (driveItem.itemType === "FILE") {
            toast.error("파일은 이동 위치가 될 수 없습니다.")
        }
        else {
            toast.error("오류 : 해당 아이템의 타입을 알 수가 없습니다!")
        }
    }

    // 최상단 경로로 이동
    const moveToRoot = () => {
        setCurrentFolderId(null); // 루트로 이동
        setSelectedItemId(null); // 선택된 아이템 제거
    }

    // 이전 경로로 이동
    const moveToBack = () => {
        // 이전 디렉토리가 없다면 동작 X
        if (paths.length === 0) {
            return; 
        } 
        // paths 길이가 1이면 루트로 이동
        else if (paths.length === 1) 
            setCurrentFolderId(null);
        
        // paths 길이가 2이상일 때 이전 디렉토리로 이동
        else 
            setCurrentFolderId(paths[paths.length - 2].publicId);

        setSelectedItemId(null); // 선택된 아이템 제거
    }


    // 폴더/파일 이동 (useMutation)
    const { mutate } = useMutation({
        mutationFn : ({ parentId, driveItemId } : { parentId : string | null; driveItemId : string; }) =>
            moveDriveItem( parentId, driveItemId),
        onSuccess : async () => {
            console.log("알림 : 폴더/파일 이동 성공");
            await queryClient.invalidateQueries({
                queryKey: ["driveItems"]
            });
            toast.success("폴더/파일 이동 완료");     
            onClose();       
        },
        // 오류 시 수행할 명령들
        onError : (error) => {
            toast.error(error.message);
        }
    })
        
    // 폴더/파일 이동 버튼 클릭 시 실행
    const handleSubmit = () => {
        mutate({ parentId : currentFolderId, driveItemId : source.publicId});
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <Box 
                    sx={{ 
                        display: 'flex',  
                        flexDirection: 'column', 
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap : 1,
                        height : '100%',
                    }}
                >
                    <CircularProgress size={50} thickness={5} color="primary" ></CircularProgress>
                    <Typography variant="h6">문서를 불러오는 중입니다...</Typography>
                </Box>
            )
        }
    
        if (isError) {
            return (
                <Box 
                    sx={{ 
                        display: 'flex',  
                        flexDirection: 'column', 
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap : 1,
                        height : '100%',
                    }}
                >
                    <Typography variant="h5" sx={{ color: 'error.main' ,textAlign: 'center',}}>{error.message}</Typography>
                </Box>    
            )
        }

        return (
            <>
            <Box 
                sx={{ 
                    display: 'flex',
                    width: '70%',
                    alignItems: 'center' , 
                    gap : 0.5,
                    mt : 1,
                    bgcolor: '#eaeefc',
                    borderRadius: '10px'
                }}
            >
                {/* Home Button */}
                <IconButton
                    type="button"
                    onClick={moveToRoot}
                    disabled={paths.length === 0}
                    size="large"
                    sx={{ width: 30, height: 30, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', borderRadius: '10px',
                        '&:hover': {
                            bgcolor: '#b2c9f8',
                        },
                        '&.Mui-disabled': {
                            cursor: 'not-allowed',
                            pointerEvents: 'auto', // ← 이거 추가해야 cursor가 실제로 적용됨
                        },
                    }}
                >
                    <HomeIcon color="primary" />
                </IconButton>
                    
                {/* Back Button */}
                <IconButton
                    type="button"
                    onClick={moveToBack}
                    disabled={paths.length === 0}
                    size="large"
                    sx={{ width: 30, height: 30, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', borderRadius: '10px',
                        '&:hover': {
                            bgcolor: '#b2c9f8',
                        },
                        '&.Mui-disabled': {
                            cursor: 'not-allowed',
                            pointerEvents: 'auto', // ← 이거 추가해야 cursor가 실제로 적용됨
                        },
                    }}
                >
                    <ReplyIcon color="primary" />
                </IconButton>
                    
                {/* Path */}
                <Breadcrumbs
                    separator="/"
                    maxItems={4}
                    sx={{
                        fontWeight: 500,
                        fontSize: "14px",
                        flexWrap: "nowrap",   // 줄바꿈 방지
                        overflowX: 'auto',
                    }}
                >
                    <Typography variant="body2" sx={{ fontWeight: 500}}>
                        {tab === "MYDRIVE" ? "내 드라이브" : "공유 문서"}
                    </Typography>
                    {[...paths].map((path) => (
                        <Box key={path.publicId}>
                            <Typography
                                variant="body2"
                                onClick={() => setCurrentFolderId(path.publicId)}
                                sx={{color : 'blue',
                                    flexWrap: "nowrap",
                                    cursor : 'pointer'
                                }}    
                            >
                                {path.itemName}
                            </Typography>
                        </Box>
                    ))}
                </Breadcrumbs>
            </Box>

            <TableContainer>
            <Table sx={{ mt: 2, width: '100%', tableLayout: 'fixed', textAlign: 'left' }}>
                <TableHead>
                    <TableRow sx={{ borderBottom: '1px solid #DBDBDB'}}>
                        <TableCell sx={{ width : '50%', py: 1}}>이름</TableCell>
                        <TableCell sx={{ width : '30%', py: 1}}>생성 날짜</TableCell>
                        <TableCell sx={{ width : '20%', py: 1}}>파일 크기</TableCell>
                    </TableRow>
                </TableHead>
                                    
                <TableBody>       
                {[...driveItems].filter((driveItem) => driveItem.isInTrash === false)
                    .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()) // 생성 날짜 내림차순 정렬
                    .map((driveItem) => (
                        <TableRow 
                            key={driveItem.publicId} 
                            onClick={(driveItem.itemType === "FILE" || source.publicId === driveItem.publicId) 
                                ? undefined
                                : () => setSelectedItemId(driveItem.publicId)
                            }
                            onDoubleClick={(driveItem.itemType === "FILE" || source.publicId === driveItem.publicId) 
                                ? undefined
                                : () => elementDoubleClick(driveItem)
                            }
                            sx={{
                                borderBottom: '1px solid #DBDBDB',
                                bgcolor: selectedItemId === driveItem.publicId ? '#e8f2fd' : 'transparent', // bg-blue-100
                                '&:hover': {
                                    bgcolor: selectedItemId === driveItem.publicId ? '#e8f2fd' : '#f3f4f6', // hover:bg-gray-100
                                },
                            }}
                        >
                            <TableCell 
                                sx={{ 
                                    py: 1.5,
                                    px: 1,
                                    fontWeight: 500,
                                    opacity: (driveItem.itemType === "FILE" || source.publicId === driveItem.publicId) ? 0.35 : 1
                                }}
                            >
                                <Box
                                    component="img"
                                    src={driveItem.itemType === "FOLDER" ? folderIcon : fileIcon}
                                    sx={{ display: 'inline-block',
                                        height: driveItem.itemType === "FOLDER" ? '15px' : '18px',
                                        width: '15px',
                                        mr: '5px',
                                        mb: '3px',
                                    }}
                                />
                                {driveItem.itemName}
                                {driveItem.isFavorite === true && " ★"}
                            </TableCell>
                            <TableCell 
                                sx={{
                                    py: 1.5,
                                    fontSize: '14px',
                                    opacity: (driveItem.itemType === "FILE" || source.publicId === driveItem.publicId) ? 0.35 : 1,
                                    color : "#666666"
                                }}
                            >
                                {formatDate(driveItem.createdDate)}
                            </TableCell>
                            <TableCell 
                                sx={{ 
                                    py: 1.5,
                                    fontSize: '14px',
                                    opacity: (driveItem.itemType === "FILE" || source.publicId === driveItem.publicId) ? 0.35 : 1,
                                    }}
                                >
                                {driveItem.size === null ?
                                "--" : `${driveItem.size} Byte`}
                            </TableCell>
                        </TableRow>
                    ))
                }
                </TableBody>
            </Table>
            </TableContainer>
            </>
        )
    }

    return ( 
        <Dialog
            open={true}
            onClose={onClose}
            fullWidth
            maxWidth="md"
            slotProps={{ paper: { sx: { minHeight: '60%' } } }}
        >
            {/* 헤더 */}
            <DialogTitle sx={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap : 1 }}>
                <DriveFileMoveIcon /> {'"'}{source.itemName}{'" '} 이동
            </DialogTitle>

            {/* 입력창 */}
            <DialogContent>
                {renderContent()}
            </DialogContent>

            <DialogActions sx={{bgcolor : '#f4efef', px : 2,  py : 2}}>
                <Box sx={{ display : 'flex', flexDirection : 'row', mr: 'auto', gap : 1, alignItems : 'center' }}>
                    <Typography variant="body1" sx={{ color: 'text.secondary', flexShrink: 0 }}>이동할 위치 : </Typography>
                    <Chip
                        icon={<Box component="img" src={folderIcon} sx={{ height: '15px', width: '15px' }} />}
                        label={paths.length === 0 ? (tab === "MYDRIVE" ? "내 드라이브" : "공유 문서") : paths[paths.length - 1].itemName}
                        size="medium"
                        sx={{
                            bgcolor: 'primary.50', // 테마에 없으면 '#e8f0fe' 같은 값으로
                            color: 'primary.main',
                            fontWeight: 600,
                            fontSize : 15,
                            maxWidth: 240,
                            '& .MuiChip-icon': { color: 'primary.main' },
                        }}
                    />
                </Box>

                {/* 버튼 */}
                <Button type="button" onClick={onClose} size="large">
                    취소
                </Button>

                <Button 
                    disableElevation 
                    type="button" 
                    size="large"
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={source.parentId === currentFolderId || 
                            (tab === "SHARE" && currentFolderId === null)}
                    color='primary'
                >
                    이동
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default MoveModal;