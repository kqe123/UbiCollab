import toast from "react-hot-toast";
import { useState } from "react";
import { useQuery, skipToken, type UseQueryOptions } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import fileIcon from "@/assets/file.png";
import folderIcon from "@/assets/folder.png";
import HomeIcon from '@mui/icons-material/Home';
import ReplyIcon from '@mui/icons-material/Reply';
import noFilesImg from "../../assets/empty-files.png";
import noFavoriteImg from "../../assets/empty-favorite.png";
import noDriveImg from "../../assets/empty-drive.png";
import LoadIcon from '@mui/icons-material/SystemUpdateAlt';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import ListItemButton from '@mui/material/ListItemButton';
import IconButton from  '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import type {DriveItem} from "../../types/driveitem";
import { getDriveItems, getFiles, getFavorites, getSharedItems, getDrivePath, getFavoritePath, getSharedPath } from '../../api/driveitemApi.ts';
import CircularProgress from '@mui/material/CircularProgress';

type TabKey = "MYDRIVE" | "MYFILE" | "FAVORITE" | "SHARE"; // 탭 유니온 타입

function LoadDocumentModal({onClose} : {onClose : () => void}) {
    const [selectedItemId, setSelectedItemId] = useState<string|null>(null); // 현재 선택된 아이템 ID
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null); // 모달 내부 폴더 이동용
    const [selectedTab, setSelectedTab] = useState<TabKey>("MYDRIVE");
    const navigate = useNavigate(); // navigate 훅

    const tabs: { key: TabKey; label: string }[] = [
        { key:  "MYDRIVE", label: "내 드라이브" },
        { key:  "MYFILE", label: "내 문서" },
        { key:  "FAVORITE", label: "즐겨찾기" },
        { key:  "SHARE", label: "공유 문서" },
    ];

    const tabQueries = {
        MYDRIVE:  { queryKey: ["driveItems", "myDrive", currentFolderId],  queryFn: () => getDriveItems(currentFolderId) },
        MYFILE:   { queryKey: ["driveItems", "recent"],                    queryFn: getFiles },
        FAVORITE: { queryKey: ["driveItems", "favorite", currentFolderId], queryFn: () => getFavorites(currentFolderId) },
        SHARE:    { queryKey: ["driveItems", "shared", currentFolderId],   queryFn: () => getSharedItems(currentFolderId) },
    };
    
    const {
        data: driveItems = [], // 백엔드에서 받아온 데이터
        isLoading,            // 현재 요청 중인지 여부
        isError,              // 요청이 실패했는지 여부
        error,                // 실패했을 때 오류 정보
    } = useQuery(
        tabQueries[selectedTab]
    );


    const tabPaths: Record<TabKey, UseQueryOptions<DriveItem[]>> = {
        MYDRIVE: { 
            queryKey: ["driveItems","path", "myDrive", currentFolderId],
            queryFn: currentFolderId ? () => getDrivePath(currentFolderId) : skipToken 
        },
        MYFILE: {
            queryKey: ["driveItems", "path", "myFile"], // 없는 키
            queryFn : skipToken
        },
        FAVORITE: { 
            queryKey: ["driveItems", "path", "favorite", currentFolderId],
            queryFn: currentFolderId ? () => getFavoritePath(currentFolderId) : skipToken
        },
        SHARE: { 
            queryKey: ["driveItems","path", "shared", currentFolderId],
            queryFn: currentFolderId ? () => getSharedPath(currentFolderId) : skipToken
        },
    };

    const { data: paths = [] } = useQuery( tabPaths[selectedTab] );


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
            navigate(`/editor/${driveItem.publicId}`);
            onClose();
        }
        else {
            toast.error("오류 : 해당 아이템의 타입을 알 수가 없습니다!")
        }
    }

    // 불러온 파일/폴더가 없을때 활성화된 탭에 따라 사진 경로를 반환
    const getNoItemImage = (tab: TabKey) => {
        switch (tab) {
            case "MYDRIVE" :
            case "SHARE" :
                return noDriveImg;
            case "FAVORITE":
                return noFavoriteImg;
            case "MYFILE" : 
                return noFilesImg;
            default : 
                return undefined;
        }
    };

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

    // DialogContent 안의 내용
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

        if (driveItems.filter((driveItem) => driveItem.isInTrash === false).length === 0) {
            return (
                <>
                    <Box 
                        component="img"
                        src={getNoItemImage(selectedTab)}
                        sx={{ width: '40%', height: '25%', mx: 'auto', mt: 1}}
                    />
                    <Typography variant="h6" sx={{textAlign: 'center'}}>불러올 문서가 없습니다..</Typography>
                </>
            )
        }

        return (
            <>
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
                            onClick={() => setSelectedItemId(driveItem.publicId)}
                            onDoubleClick={() => elementDoubleClick(driveItem)}
                            sx={{
                                borderBottom: '1px solid #DBDBDB',
                                bgcolor: selectedItemId === driveItem.publicId ? '#e8f2fd' : 'transparent', // bg-blue-100
                                '&:hover': {
                                    bgcolor: selectedItemId === driveItem.publicId ? '#e8f2fd' : '#f3f4f6', // hover:bg-gray-100
                                },
                            }}
                        >
                            <TableCell sx={{ py: 1.5, px: 1, fontWeight: 500 }}>
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
                            <TableCell sx={{ py: 1.5, fontSize: '14px', color: '#666666'}}>{formatDate(driveItem.createdDate)}</TableCell>
                            <TableCell sx={{ py: 1.5, fontSize: '14px', color: '#666666'}}>
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
            slotProps={{ paper: { sx: { minHeight: '70%' } } }}
        >
            {/* 메뉴명 */}
            <DialogTitle sx={{ display : 'flex', flexDirection: 'row', alignItems : 'center' }}>
                <LoadIcon />
                <Typography variant="h6" component="span" sx={{ml : 1}}>문서 불러오기</Typography>
                <IconButton
                    size="small"    
                    sx={{ml : 'auto'}}
                    onClick={onClose}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                {/* 탭 */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        width: '100%', 
                        boxSizing: 'border-box', // box-border
                        bgcolor: '#F9F9FA',
                        mt : 1,
                        borderRadius : 4,
                        py: 0.5, // 세로 패딩 8px
                    }}
                >
                    {tabs.map((tab) => (
                        <ListItemButton
                            key={tab.key}
                            sx={{
                                width : "25%",
                                borderRadius : 4,
                                color : (selectedTab === tab.key) ? '#1565c0' : 'black',
                                bgcolor : (selectedTab === tab.key) ? '#E8F2FD' : '#F9F9FA',
                                fontWeight: 600, 
                                justifyContent: 'center',
                            }}
                            onClick={() => {
                                setSelectedTab(tab.key);
                                setCurrentFolderId(null);
                                setSelectedItemId(null);
                            }}
                        >
                            {tab.label}
                        </ListItemButton>
                    ))}
                </Box>
                
                {/* 경로 표시 ([내 문서] 탭 제외)*/}
                {selectedTab !== "MYFILE" && (
                    <Box sx={{ display: 'flex', width: '70%', alignItems: 'center' , 
                        gap : 0.5, mt : 1, bgcolor: '#eaeefc', borderRadius: '10px'}}
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
                )}
                

                {/* 로딩 / 에러 / 빈 목록 / 문서 테이블 중 하나 */}
                {renderContent()}
                
            </DialogContent>
        </Dialog>
    );
}

export default LoadDocumentModal;