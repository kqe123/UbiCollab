import axios from "axios";
import toast from "react-hot-toast";
import fileIcon from "../../../assets/file.png";
import folderIcon from "../../../assets/folder.png";
import noDriveImg from "../../../assets/empty-drive.png";
import noAuthorizedIcon from "../../../assets/noAuthorized.png";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate, useParams, useOutletContext, NavLink } from "react-router-dom";
import DriveItemMenuModal from "../../modal/DriveItemMenuModal"
import NewDriveItemModal from "../../modal/NewDriveItemModal"
import type {DriveItem} from "../../../types/driveitem";
import type { DirectoryOutletContext, MenuType} from "../Directory";
import Box from '@mui/material/Box';
import IconButton from  '@mui/material/IconButton';
import HomeIcon from '@mui/icons-material/Home';
import ReplyIcon from '@mui/icons-material/Reply';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Breadcrumbs from '@mui/material/Breadcrumbs';
function SharedList() {
    // 상태(state)들
    const currentFolderId = useParams().folderId ?? null; // useParams()로 조회되는 파라미터가 없다면 null 처리
    const [tableMenu, setTableMenu] = useState<MenuType>({
        isOpen: false,
        x: 0,
        y: 0,
    });

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
        if (driveItem.itemType === "FOLDER") {
            navigate(`/drive/shared/${driveItem.publicId}`);
        }
        else if (driveItem.itemType === "FILE") {
            navigate(`/editor/${driveItem.publicId}`);
        }
        else {
            toast.error("오류 : 해당 아이템의 타입을 알 수가 없습니다!")
        }
    }

    // 테이블 메뉴 열림 (테이블 우클릭 시)
    const tableRightClick = (e: React.MouseEvent): void => {
        e.preventDefault();
        setTableMenu({
            isOpen: true,
            x: e.clientX,
            y: e.clientY,
        })
    }

    // 테이블 메뉴 닫힘 
    const closeTableMenu = () => {
        setTableMenu({...tableMenu, isOpen: false});
    }
    
    // 루트 디렉토리 이동 (홈버튼)
    const moveToRoot = (): void => {
        setSelectedDriveItem(null);
        navigate('/drive/shared');
    };

    // 이전 디렉토리 이동 (뒤로가기 버튼)
    const moveToBack = () : void => {
        // 이전 디렉토리가 없다면 동작 X
        if (paths.length === 0) {
            return; 
        } 
        // paths 길이가 1이면 루트로 이동
        else if (paths.length === 1) 
            navigate('/drive/shared');
        
        // paths 길이가 2이상일 때 이전 디렉토리로 이동
        else 
            navigate(`/drive/shared/${paths[paths.length - 2].publicId}`); 

        setSelectedDriveItem(null); 
    };

    // 백엔드 api(디렉토리 조회)를 호출하는 비동기 함수
    const getSharedItems = async () => {
        try {
            // axios로 백엔드 api 호출
            const response = await axios.get(
                "http://localhost:8080/api/permission/sharedItems",
                {   
                    params: {
                        parentId: currentFolderId
                    },
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            );
            return response.data;
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message ?? "디렉토리 조회에 실패했습니다.";
                throw new Error(message); // 여기서 백엔드 메시지를 담은 새 Error로 교체
            }
            throw error;
        }
    };

    // 백엔드 api(현재 경로 조회)를 호출하는 비동기 함수
    const getDrivePath = async ()  => {
        try {
            const response = await axios.get(
                `http://localhost:8080/api/permission/path/${currentFolderId}`,
                {
                    headers : {
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            )
            console.log(response.data)
            return response.data;
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message ?? "경로 조회에 실패했습니다.";
                throw new Error(message); // 여기서 백엔드 메시지를 담은 새 Error로 교체
            }
            throw error;
        }
    };

    // useQuery 실행 (첫 렌더링 시, queryKey가 변경될 시에 실행한다.)
    const {
        data: sharedItems = [], // 백엔드에서 받아온 데이터
        isLoading : isSharedItemsLoading,    // 현재 요청 중인지 여부
        isError : isSharedItemsError,        // 요청이 실패했는지 여부
        error : sharedItemsError,            // 실패했을 때 오류 정보
    } = useQuery<DriveItem[]>({
        queryKey: ["driveItems", "shared" ,currentFolderId], // 서버 데이터를 해당 이름으로 관리
        queryFn: getSharedItems,   // getDriveItems() 실행
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
    if (isSharedItemsLoading) {
        return (
            <Box sx={{ minHeight: '100vh', alignItems: 'center', justifyContent: 'center'}}>
                <Typography>문서를 불러오는 중입니다...</Typography>
            </Box>
        )
    }


    // 오류 처리
    if (isSharedItemsError) {
        return (
            <Box sx={{ minHeight: '100vh', alignItems: 'center', justifyContent: 'center'}}>
                <Box component="img" src={noAuthorizedIcon} sx={{ width: '40%', height: '35%', mx: 'auto', mt: 5}}/>
                <Typography variant="h5" sx={{ color: 'error.main' ,textAlign: 'center',}}>{sharedItemsError.message}</Typography>
            </Box>
        )
    }


    // 문서 리스트를 정상적으로 받아왔을 때
    return (
        <>
        <Typography variant="h5" sx={{ fontWeight: 500, mt: 1}}>공유 문서</Typography>
        <Box
            sx={{ width : '100%', height : '100%'}}
            onContextMenu= {(e) => {tableRightClick(e);}}
        >
            <Box sx={{ display: 'flex', width: '70%', alignItems: 'center' , 
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
                        공유 문서
                    </Typography>
                    {[...paths].map((path) => (
                        <Box key={path.publicId}>
                            <Typography
                                variant="body2"
                                key={path.publicId}
                                component={NavLink}
                                to={`/drive/shared/${path.publicId}`}
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
            {[...sharedItems].filter((sharedItem) => sharedItem.isInTrash === false).length === 0 ? (
                <>
                    <Box component="img" src={noDriveImg} sx={{ width: '40%', height: '35%', mx: 'auto', mt: 5}}/>
                    <Typography variant="h5" sx={{ mt : 2.5, textAlign: 'center', }}>우클릭으로 폴더/파일을 생성해 보세요!</Typography>
                </>
            ) : (
            <TableContainer sx={{maxHeight: 'calc(100vh - 250px)', overflowY: 'auto'}}>
                <Table sx={{ mt: 2.5, width: '100%', tableLayout: 'fixed', textAlign: 'left', borderCollapse: 'separate', borderSpacing: 0}}>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ width : '50%', py: 1, position: 'sticky', top: 0, bgcolor: 'white', zIndex: 1, borderBottom: '1px solid #DBDBDB'}}>이름</TableCell>
                            <TableCell sx={{ width : '30%', py: 1, position: 'sticky', top: 0, bgcolor: 'white', zIndex: 1, borderBottom: '1px solid #DBDBDB'}}>생성 일자</TableCell>
                            <TableCell sx={{ width : '20%', py: 1, position: 'sticky', top: 0, bgcolor: 'white', zIndex: 1, borderBottom: '1px solid #DBDBDB'}}>파일 크기</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {[...sharedItems].filter((sharedItem) => sharedItem.isInTrash === false)
                        .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()) // 생성 날짜 내림차순 정렬
                        .map((sharedItem) => (
                            <TableRow key={sharedItem.publicId}
                                onClick= {() => setSelectedDriveItem(sharedItem)}
                                onContextMenu= {(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setSelectedDriveItem(sharedItem);
                                    openDriveItemMenu(e); 
                                    }
                                }
                                onDoubleClick = {(e) => {
                                    e.stopPropagation();
                                    elementDoubleClick(sharedItem);
                                }}
                                sx={{
                                    bgcolor: selectedDriveItem?.publicId === sharedItem.publicId ? '#e8f2fd' : 'transparent', // bg-blue-100
                                    '&:hover': {
                                        bgcolor: selectedDriveItem?.publicId === sharedItem.publicId ? '#e8f2fd' : '#f3f4f6', // hover:bg-gray-100
                                    },
                                }}
                            >

                                <TableCell sx={{ py: 1.5, px: 1, fontWeight: 500, borderBottom: '1px solid #DBDBDB' }}>
                                    <Box
                                        component="img"
                                        src={sharedItem.itemType === "FOLDER" ? folderIcon : fileIcon}
                                        sx={{ display: 'inline-block',
                                            height: sharedItem.itemType === "FOLDER" ? '15px' : '18px',
                                            width: '15px',
                                            mr: '5px',
                                            mb: '3px',
                                        }}
                                    />
                                    {sharedItem.itemName}
                                    {sharedItem.extension === "UC" || sharedItem.extension === null ? "" : `.${sharedItem.extension}`}
                                    {sharedItem.isFavorite === true && " ★"}</TableCell>
                                <TableCell sx={{ py: 1.5, fontSize: '14px', color: '#666666', borderBottom: '1px solid #DBDBDB' }}>{formatDate(sharedItem.createdDate)}</TableCell>
                                <TableCell sx={{ py: 1.5, fontSize: '14px', color: '#666666', borderBottom: '1px solid #DBDBDB' }}>
                                    {sharedItem.size === null ?
                                    "--" : `${sharedItem.size} Byte`}</TableCell>
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

        {tableMenu.isOpen && currentFolderId && (
            <NewDriveItemModal
            x={tableMenu.x}
            y={tableMenu.y}
            onClose={closeTableMenu}
            currentFolderId={currentFolderId}
            />
        )}
    </>
    );
}

export default SharedList;