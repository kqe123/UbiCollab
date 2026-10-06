import fileIcon from "../../../assets/file.png";
import folderIcon from "../../../assets/folder.png";
import noTrashImg from "../../../assets/empty-trash.png";
import { useQuery } from "@tanstack/react-query";
import { useParams, useOutletContext } from "react-router-dom";
import TrashMenu from "../../menu/TrashMenu"
import type { DirectoryOutletContext} from "../Directory";
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { getTrashs } from '../../../api/driveitemApi.ts';

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

    // 휴지통 목록을 불러오는 API 호출 (useQuery)
    const {
        data: driveItems = [], // 백엔드에서 받아온 데이터
        isLoading : isDriveItemsLoading,    // 현재 요청 중인지 여부
        isError : isDriveItemsError,        // 요청이 실패했는지 여부
        error : driveItemsError,            // 실패했을 때 오류 정보
    } = useQuery({
        queryKey: ["driveItems","trash" ,currentFolderId], // 서버 데이터를 해당 이름으로 관리
        queryFn: getTrashs  // getTrashs() 실행
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
                                    bgcolor: selectedDriveItem?.publicId === driveItem.publicId ? '#e8f2fd' : 'transparent', // bg-blue-100
                                    '&:hover': {
                                        bgcolor: selectedDriveItem?.publicId === driveItem.publicId ? '#e8f2fd' : '#f3f4f6', // hover:bg-gray-100
                                    },
                                }}
                            >

                                <TableCell sx={{ py: 1.5, px: 1, fontWeight: 500, borderBottom: '1px solid #DBDBDB' }}>
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
                                    {driveItem.extension === "UC" || driveItem.extension === null ? "" : `.${driveItem.extension}`}
                                    {driveItem.isFavorite === true && " ★"}</TableCell>
                                <TableCell sx={{ py: 1.5, fontSize: '14px', color: '#666666', borderBottom: '1px solid #DBDBDB' }}>{formatDate(driveItem.createdDate)}</TableCell>
                                <TableCell sx={{ py: 1.5, fontSize: '14px', color: '#666666', borderBottom: '1px solid #DBDBDB' }}>
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
            <TrashMenu
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

export default TrashList;