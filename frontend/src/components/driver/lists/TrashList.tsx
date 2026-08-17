import axios from "axios";
import fileIcon from "../../../assets/file.png";
import folderIcon from "../../../assets/folder.png";
import noTrashImg from "../../../assets/empty-trash.png";
import { useQuery } from "@tanstack/react-query";
import { useParams, useOutletContext } from "react-router-dom";
import TrashMenuModal from "../../modal/TrashMenuModal"
import type { DirectoryOutletContext} from "../Directory";
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

function TrashList() {
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

    // 백엔드 api(휴지통 조회)를 호출하는 비동기 함수
    const getDriveItems = async () => {
        // 백엔드에 보낼 폴더 ID
        const DriveItemData = {
            parentPublicId: currentFolderId
        }

        // axios로 백엔드 api 호출
        const response = await axios.get(
            "http://localhost:8080/api/driveitem/trash",
            {   
                params: DriveItemData,
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );
        return response.data;
    };

    // useQuery 실행 (첫 렌더링 시, queryKey가 변경될 시에 실행한다.)
    const {
        data: driveItems = [], // 백엔드에서 받아온 데이터
        isLoading : isDriveItemsLoading,    // 현재 요청 중인지 여부
        isError : isDriveItemsError,        // 요청이 실패했는지 여부
        error : driveItemsError,            // 실패했을 때 오류 정보
    } = useQuery({
        queryKey: ["driveItems","trash" ,currentFolderId], // 서버 데이터를 해당 이름으로 관리
        queryFn: getDriveItems,   // getDriveItems() 실행
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
                <Typography sx={{ color: 'error.main' }}>문서를 불러오지 못했습니다 : {driveItemsError.message}</Typography>
            </Box>
        )
    }


    // 문서 리스트를 정상적으로 받아왔을 때
    return (
        <>
        <Typography variant="h5" sx={{ fontWeight: 500, mt: 1}}>휴지통</Typography>
        <Box sx={{ width : '100%', height : '100%'}}>
            {/* 폴더/파일이 0건일때 예외처리 */}    
            {[...driveItems].filter((driveItem) => driveItem.isInTrash === true).length === 0 ? (
                <>
                    <Box component="img" src={noTrashImg} sx={{ width: '40%', height: '35%', mx: 'auto', mt: 5}}/>
                    <Typography variant="h5" sx={{ mt : 2.5, textAlign: 'center', }}>휴지통이 비어 있음</Typography>
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
                        {[...driveItems].filter((driveItem) => driveItem.isInTrash === true)
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
            <TrashMenuModal
            x={driveItemMenu.x}
            y={driveItemMenu.y}
            driveItem={selectedDriveItem}
            onClose={closeDriveItemMenu}
            />
        )}
        </>
    );
}

export default TrashList;