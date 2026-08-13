import axios from "axios";
import toast from "react-hot-toast";
import fileIcon from "../../../assets/file.png";
import folderIcon from "../../../assets/folder.png";
import homeIcon from "../../../assets/home.png";
import backIcon from "../../../assets/back.png";
import noFavoriteImg from "../../../assets/empty-favorite.png";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams, useOutletContext } from "react-router-dom";
import DriveItemMenuModal from "../../modal/DriveItemMenuModal"
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
    const accessToken = localStorage.getItem("accessToken"); // accessToken (JWT) 불러오기
    const navigate = useNavigate();

    // 요소 더블클릭 시 발생하는 이벤트 함수
    const elementDoubleClick = (driveItem: DriveItem): void => {
        if (driveItem.type === "FOLDER") {
            navigate(`/drive/favorite/${driveItem.publicId}`);
        }
        else if (driveItem.type === "FILE") {
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

  // 백엔드 api(즐겨찾기 디렉토리 조회)를 호출하는 비동기 함수
    const getFavorites = async () => {
        // 백엔드에 보낼 폴더 ID
        const DriveItemData = {
            parentPublicId: currentFolderId
        }

        // axios로 백엔드 api 호출
        const response = await axios.get(
            "http://localhost:8080/api/favorite",
            {   
                params: DriveItemData,
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );
        return response.data;
    };

    // 백엔드 api(현재 경로 조회)를 호출하는 비동기 함수
    const getDrivePath = async ()  => {
        const response = await axios.get(
            `http://localhost:8080/api/driveitem/path/${currentFolderId}`,
            {
                headers : {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        )
        console.log(response.data)
        return response.data;
    };

    // useQuery 실행 (첫 렌더링 시, queryKey가 변경될 시에 실행한다.)
    const {
        data: favorites = [], // 백엔드에서 받아온 데이터
        isLoading : isFavoritesLoading,    // 현재 요청 중인지 여부
        isError : isFavoritesError,        // 요청이 실패했는지 여부
        error : favoritesError,            // 실패했을 때 오류 정보
    } = useQuery({
        queryKey: ["driveItems", "favorite", currentFolderId], // 서버 데이터를 해당 이름으로 관리
        queryFn: getFavorites,   // getFavorites() 실행
    });

    // useQuery 실행 
    const {
        data: paths = [] , // 백엔드에서 받아온 데이터
        isLoading : isPathLoading,            // 현재 요청 중인지 여부
        isError : isPathError,              // 요청이 실패했는지 여부
        error : pathError,                // 실패했을 때 오류 정보
    } = useQuery({
        queryKey: ["driveItems","path", currentFolderId], // 서버 데이터를 해당 이름으로 관리
        queryFn: getDrivePath,   // getDrivePath() 실행
        enabled: currentFolderId !== null, // 루트 디렉터리에서는 경로 API를 실행하지 않음
    });
    

    // 로딩 처리
    if (isFavoritesLoading) {
        return (
            <Box sx={{ minHeight: '100vh', alignItems: 'center', justifyContent: 'center'}}>
                <Typography>문서를 불러오는 중입니다...</Typography>
            </Box>
        )
    }


    // 오류 처리
    if (isFavoritesError) {
        return (
        <>
            <Box sx={{ minHeight: '100vh', alignItems: 'center', justifyContent: 'center'}}>
                <Typography sx={{ color: 'error.main' }}>문서를 불러오지 못했습니다 : {favoritesError.message}</Typography>
            </Box>
        </>
        )
    }


    // 문서 리스트를 정상적으로 받아왔을 때
    return (
        <>
        <Typography variant="h5" sx={{ fontWeight: 500, mt: 1}}>즐겨찾기</Typography>
        <Box sx={{ width : '100%', height : '100%'}}>
            <Box sx={{ display: 'flex', width: '50%', alignItems: 'center' , 
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
                <Typography variant="body2" sx={{ fontWeight: 500}}>
                    즐겨찾기 / {[...paths].map((path) => path.itemName).join(" / ")}
                </Typography>
            </Box>
            {/* 폴더/파일이 0건일때 예외처리 */}    
            {[...favorites].filter((favorite) => favorite.isInTrash === false).length === 0 ? (
                <>
                    <Box component="img" src={noFavoriteImg} sx={{ width: '40%', height: '35%', mx: 'auto', mt: 5}}/>
                    <Typography variant="h5" sx={{ mt : 2.5, textAlign: 'center', }}>즐겨찾기에 등록한 항목이 없습니다!</Typography>
                </>
            ) : (
            <TableContainer>
                <Table sx={{ mt: 2.5, width: '100%', tableLayout: 'fixed', textAlign: 'left'}}>
                    <TableHead>
                        <TableRow sx={{ borderBottom: '1px solid #DBDBDB'}}>
                            <TableCell sx={{ width : '50%', py: 1}}>이름</TableCell>
                            <TableCell sx={{ width : '30%', py: 1}}>생성 일자</TableCell>
                            <TableCell sx={{ width : '20%', py: 1}}>파일 크기</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {[...favorites].filter((favorite) => favorite.isInTrash === false)
                        .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()) // 생성 날짜 내림차순 정렬
                        .map((favorite) => (
                            <TableRow key={favorite.id}
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
                                    borderBottom: '1px solid #DBDBDB',
                                    bgcolor: selectedDriveItem?.id === favorite.id ? '#e8f2fd' : 'transparent', // bg-blue-100
                                    '&:hover': {
                                        bgcolor: selectedDriveItem?.id === favorite.id ? '#e8f2fd' : '#f3f4f6', // hover:bg-gray-100
                                    },
                                }}
                            >
                                
                                <TableCell sx={{ py: 1.5, px: 1, fontWeight: 500 }}>
                                    <Box
                                        component="img"
                                        src={favorite.type === "FOLDER" ? folderIcon : fileIcon}
                                        sx={{ display: 'inline-block',
                                            height: favorite.type === "FOLDER" ? '15px' : '18px',
                                            width: '15px',
                                            mr: '5px',
                                            mb: '3px',
                                        }}
                                    />
                                    {favorite.itemName}
                                    {favorite.extension === "UC" || favorite.extension === null ? "" : `.${favorite.extension}`}
                                    {favorite.isFavorite === true && " ★"}</TableCell>
                                <TableCell sx={{ py: 1.5, fontSize: '14px', color: '#666666'}}>{formatDate(favorite.createdDate)}</TableCell>
                                <TableCell sx={{ py: 1.5, fontSize: '14px', color: '#666666'}}>
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
            <DriveItemMenuModal
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