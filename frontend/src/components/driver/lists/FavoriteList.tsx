import toast from "react-hot-toast";
import fileIcon from "../../../assets/file.png";
import folderIcon from "../../../assets/folder.png";
import noFavoriteImg from "../../../assets/empty-favorite.png";
import noAuthorizedIcon from "../../../assets/noAuthorized.png";
import { useQuery, skipToken } from "@tanstack/react-query";
import { useNavigate, useParams, useOutletContext, NavLink } from "react-router-dom";
import DriveItemMenu from "../../menu/DriveItemMenu"
import type {DriveItem} from "../../../types/driveitem";
import type { DirectoryOutletContext} from "../Directory";
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from  '@mui/material/IconButton';
import HomeIcon from '@mui/icons-material/Home';
import ReplyIcon from '@mui/icons-material/Reply';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { getFavorites, getFavoritePath } from '../../../api/driveitemApi.ts';
import CircularProgress from '@mui/material/CircularProgress';

function FavoriteList() {
   // 상태(state)들
    const currentFolderId = useParams().folderId ?? null; // useParams()로 조회되는 파라미터가 없다면 null 처리

    const {
        selectedDriveItem, 
        setSelectedDriveItem,
        driveItemMenu,
        openDriveItemMenu,
        closeDriveItemMenu,
        formatDate
    } = useOutletContext<DirectoryOutletContext>();
    const navigate = useNavigate();

    // 요소 더블클릭 시 발생하는 이벤트 함수
    const elementDoubleClick = (driveItem: DriveItem): void => {
        if (driveItem.itemType === "FOLDER") {
            navigate(`/drive/favorite/${driveItem.publicId}`);
        }
        else if (driveItem.itemType === "FILE") {
            navigate(`/editor/${driveItem.publicId}`);
        }
        else {
            toast.error("오류 : 해당 아이템의 타입을 알 수가 없습니다!")
        }
    }

    // 루트 디렉토리 이동 (홈버튼)
    const moveToRoot = (): void => {
        setSelectedDriveItem(null);
        navigate('/drive/favorite');
    };

    // 이전 디렉토리 이동 (뒤로가기 버튼)
    const moveToBack = () : void => {
        // 이전 디렉토리가 없다면 동작 X
        if (paths.length === 0) {
            return; 
        } 
        // paths 길이가 1이면 루트로 이동
        else if (paths.length === 1) 
            navigate('/drive/favorite');
        
        // paths 길이가 2이상일 때 이전 디렉토리로 이동
        else 
            navigate(`/drive/favorite/${paths[paths.length - 2].publicId}`); 

        setSelectedDriveItem(null); 
    };

    // 즐겨찾기 목록을 불러오는 API 호출 (useQuery)
    const {
        data: favorites = [], // 데이터
        isPending,    // 성공한 데이터가 없는지 여부 (retry 포함)
        isError,       // 요청이 실패했는지 여부
        error : favoritesError,            // 실패했을 때 오류 정보
    } = useQuery({
        queryKey: ["driveItems", "favorite", currentFolderId], // 서버 데이터를 해당 이름으로 관리
        queryFn: () => getFavorites(currentFolderId),   // getFavorites() 실행
    });

    // 현재 즐겨찾기 경로를 불러오는 API 호출 (useQuery) 
    const { data: paths = [] } = useQuery({
        queryKey: ["driveItems", "path", "favorite", currentFolderId], // 서버 데이터를 해당 이름으로 관리
        queryFn: currentFolderId ? () => getFavoritePath(currentFolderId) : skipToken   // getFavoritePath() 실행
    });
    

    // 로딩 처리
    if (isPending) {
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
                <Typography variant="h6" >문서를 불러오는 중입니다...</Typography>
            </Box>
        )
    }


    // 오류 처리
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
                <Box component="img" src={noAuthorizedIcon} sx={{ width: '40%', height: '35%', mx: 'auto'}}/>
                <Typography variant="h5" sx={{ color: 'error.main' }}>{favoritesError.message}</Typography>
            </Box>
        )
    }


    // 문서 리스트를 정상적으로 받아왔을 때
    return (
        <>
        <Typography variant="h5" sx={{ fontWeight: 500, mt: 1}}>즐겨찾기</Typography>
        <Box sx={{ width : '100%', height : '100%'}}>
            <Box sx={{ display: 'flex', width: '70%', alignItems: 'center',
                gap : 0.5, mt : 4, bgcolor: '#eaeefc', borderRadius: '10px'}}>

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
                        즐겨찾기
                    </Typography>
                    {[...paths].map((path) => (
                        <Box key={path.publicId}>
                            <Typography
                                variant="body2"
                                key={path.publicId}
                                component={NavLink}
                                to={`/drive/favorite/${path.publicId}`}
                                sx={{color : 'blue',
                                    flexWrap: "nowrap"
                                }}    
                            >
                                {path.itemName}
                            </Typography>
                        </Box>
                    ))}
                </Breadcrumbs>
            </Box>
            {/* 폴더/파일이 0건일때 예외처리 */}    
            {[...favorites].filter((favorite) => favorite.isInTrash === false).length === 0 ? (
                <>
                    <Box component="img" src={noFavoriteImg} sx={{ width: '40%', height: '35%', mx: 'auto', mt: 5}}/>
                    <Typography variant="h5" sx={{ mt : 2.5, textAlign: 'center', }}>즐겨찾기에 등록한 항목이 없습니다!</Typography>
                </>
            ) : (
            <TableContainer sx={{maxHeight: 'calc(100vh - 250px)', overflowY: 'auto'}}>
                <Table stickyHeader sx={{ mt: 2.5, width: '100%', tableLayout: 'fixed', textAlign: 'left'}}>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ width : '50%', py: 1}}>이름</TableCell>
                            <TableCell sx={{ width : '30%', py: 1}}>생성 일자</TableCell>
                            <TableCell sx={{ width : '20%', py: 1}}>파일 크기</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {[...favorites].filter((favorite) => favorite.isInTrash === false)
                        .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()) // 생성 날짜 내림차순 정렬
                        .map((favorite) => (
                        <TableRow key={favorite.publicId}
                            onClick= {() => setSelectedDriveItem(favorite)}
                            onContextMenu= {(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSelectedDriveItem(favorite);
                                openDriveItemMenu(e); 
                                }
                            }
                            onDoubleClick = {(e) => {
                                e.stopPropagation();
                                elementDoubleClick(favorite);
                            }}
                            sx={{
                                bgcolor: selectedDriveItem?.publicId === favorite.publicId ? '#e8f2fd' : 'transparent', // bg-blue-100
                                '&:hover': {
                                    bgcolor: selectedDriveItem?.publicId === favorite.publicId ? '#e8f2fd' : '#f3f4f6', // hover:bg-gray-100
                                },
                            }}
                        >

                            <TableCell sx={{ py: 1.5, px: 1, fontWeight: 500, borderBottom: '1px solid #DBDBDB' }}>
                                <Box
                                    component="img"
                                    src={favorite.itemType === "FOLDER" ? folderIcon : fileIcon}
                                    sx={{ display: 'inline-block',
                                        height: favorite.itemType === "FOLDER" ? '15px' : '18px',
                                        width: '15px',
                                        mr: '5px',
                                        mb: '3px',
                                    }}
                                />
                                {favorite.itemName}
                                {favorite.extension === "UC" || favorite.extension === null ? "" : `.${favorite.extension}`}
                                {favorite.isFavorite === true && " ★"}</TableCell>
                            <TableCell sx={{ py: 1.5, fontSize: '14px', color: '#666666', borderBottom: '1px solid #DBDBDB' }}>{formatDate(favorite.createdDate)}</TableCell>
                            <TableCell sx={{ py: 1.5, fontSize: '14px', color: '#666666', borderBottom: '1px solid #DBDBDB' }}>
                                {favorite.size === null ?
                                "--" : `${favorite.size} Byte`}</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </TableContainer>
            )}
        </Box>
        
        {driveItemMenu.isOpen && selectedDriveItem && (
            <DriveItemMenu
            open={driveItemMenu.isOpen}
            x={driveItemMenu.x}
            y={driveItemMenu.y}
            driveItem={selectedDriveItem}
            onClose={closeDriveItemMenu}
            />
        )}
    </>
    );
}

export default FavoriteList;