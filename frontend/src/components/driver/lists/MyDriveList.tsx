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
import Link from '@mui/material/Link';

function MyDriveList() {
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
        if (driveItem.type === "FOLDER") {
            navigate(`/drive/my-drive/${driveItem.publicId}`);
        }
        else if (driveItem.type === "FILE") {
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
        navigate('/drive/my-drive');
    };

    // 이전 디렉토리 이동 (뒤로가기 버튼)
    const moveToBack = () : void => {
        // 이전 디렉토리가 없다면 동작 X
        if (paths.length === 0) {
            return; 
        } 
        // paths 길이가 1이면 루트로 이동
        else if (paths.length === 1) 
            navigate('/drive/my-drive');
        
        // paths 길이가 2이상일 때 이전 디렉토리로 이동
        else 
            navigate(`/drive/my-drive/${paths[paths.length - 2].publicId}`); 

        setSelectedDriveItem(null); 
    };

    // 백엔드 api(디렉토리 조회)를 호출하는 비동기 함수
    const getDriveItems = async () => {
        try {
            // axios로 백엔드 api 호출
            const response = await axios.get(
                "http://localhost:8080/api/driveitem/driveitems",
                {   
                    params: {
                        parentPublicId: currentFolderId
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
                `http://localhost:8080/api/driveitem/path/${currentFolderId}`,
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
        data: driveItems = [], // 백엔드에서 받아온 데이터
        isLoading : isDriveItemsLoading,    // 현재 요청 중인지 여부
        isError : isDriveItemsError,        // 요청이 실패했는지 여부
        error : driveItemsError,            // 실패했을 때 오류 정보
    } = useQuery({
        queryKey: ["driveItems", currentFolderId], // 서버 데이터를 해당 이름으로 관리
        queryFn: getDriveItems,   // getDriveItems() 실행
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
    if (isDriveItemsLoading) {
        return (
            <Box sx={{ minHeight: '100vh', alignItems: 'center', justifyContent: 'center'}}>
                <Typography>문서를 불러오는 중입니다...</Typography>
            </Box>
        )
    }


    // 오류 처리
    if (isDriveItemsError) {
        return (
            <Box sx={{ minHeight: '100vh', alignItems: 'center', justifyContent: 'center'}}>
                <Box component="img" src={noAuthorizedIcon} sx={{ width: '40%', height: '35%', mx: 'auto', mt: 5}}/>
                <Typography variant="h5" sx={{ color: 'error.main' ,textAlign: 'center',}}>{driveItemsError.message}</Typography>
            </Box>
        )
    }


    // 문서 리스트를 정상적으로 받아왔을 때
    return (
        <>
        <Typography variant="h5" sx={{ fontWeight: 500, mt: 1}}>내 드라이브</Typography>
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
                        overflow: "hidden",
                        "& .MuiBreadcrumbs-ol": { flexWrap: "nowrap" },
                    }}
                >
                    <Typography variant="body2" sx={{ fontWeight: 500}}>
                        내 드라이브
                    </Typography>
                    {[...paths].map((path) => (
                        <Box key={path.publicId}>
                            <Link 
                                key={path.publicId}
                                component={NavLink}
                                to={`/drive/my-drive/${path.publicId}`}
                                sx={{color : 'blue'}}    
                            >
                                {path.itemName}
                            </Link>
                        </Box>
                    ))}
                </Breadcrumbs>
            </Box>
            {/* 폴더/파일이 0건일때 예외처리 */}    
            {[...driveItems].filter((driveItem) => driveItem.isInTrash === false).length === 0 ? (
                <>
                    <Box component="img" src={noDriveImg} sx={{ width: '40%', height: '35%', mx: 'auto', mt: 5}}/>
                    <Typography variant="h5" sx={{ mt : 2.5, textAlign: 'center', }}>우클릭으로 폴더/파일을 생성해 보세요!</Typography>
                </>
            ) : (
            <TableContainer>
                <Table sx={{ mt: 2.5, width: '100%', tableLayout: 'fixed', textAlign: 'left', }}>
                    <TableHead>
                        <TableRow sx={{ borderBottom: '1px solid #DBDBDB'}}>
                            <TableCell sx={{ width : '50%', py: 1}}>이름</TableCell>
                            <TableCell sx={{ width : '30%', py: 1}}>생성 일자</TableCell>
                            <TableCell sx={{ width : '20%', py: 1}}>파일 크기</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {[...driveItems].filter((driveItem) => driveItem.isInTrash === false)
                        .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()) // 생성 날짜 내림차순 정렬
                        .map((driveItem) => (
                            <TableRow key={driveItem.publicId}
                                onClick= {() => setSelectedDriveItem(driveItem)}
                                onContextMenu= {(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setSelectedDriveItem(driveItem);
                                    openDriveItemMenu(e); 
                                    }
                                }
                                onDoubleClick = {(e) => {
                                    e.stopPropagation();
                                    elementDoubleClick(driveItem);
                                }}
                                sx={{
                                    borderBottom: '1px solid #DBDBDB',
                                    bgcolor: selectedDriveItem?.publicId === driveItem.publicId ? '#e8f2fd' : 'transparent', // bg-blue-100
                                    '&:hover': {
                                        bgcolor: selectedDriveItem?.publicId === driveItem.publicId ? '#e8f2fd' : '#f3f4f6', // hover:bg-gray-100
                                    },
                                }}
                            >
                                
                                <TableCell sx={{ py: 1.5, px: 1, fontWeight: 500 }}>
                                    <Box
                                        component="img"
                                        src={driveItem.type === "FOLDER" ? folderIcon : fileIcon}
                                        sx={{ display: 'inline-block',
                                            height: driveItem.type === "FOLDER" ? '15px' : '18px',
                                            width: '15px',
                                            mr: '5px',
                                            mb: '3px',
                                        }}
                                    />
                                    {driveItem.itemName}
                                    {driveItem.extension === "UC" || driveItem.extension === null ? "" : `.${driveItem.extension}`}
                                    {driveItem.isFavorite === true && " ★"}</TableCell>
                                <TableCell sx={{ py: 1.5, fontSize: '14px', color: '#666666'}}>{formatDate(driveItem.createdDate)}</TableCell>
                                <TableCell sx={{ py: 1.5, fontSize: '14px', color: '#666666'}}>
                                    {driveItem.size === null ?
                                    "--" : `${driveItem.size} Byte`}</TableCell>
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

        {tableMenu.isOpen && (
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

export default MyDriveList;

