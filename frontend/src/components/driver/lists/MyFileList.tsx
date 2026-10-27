import fileIcon from "../../../assets/file.png";
import noFilesImg from "../../../assets/empty-files.png";
import noAuthorizedIcon from "../../../assets/noAuthorized.png";
import DriveItemMenu from "../../menu/DriveItemMenu.tsx"
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useOutletContext } from "react-router-dom";
import type { DirectoryOutletContext } from "../Directory.tsx";
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { getFiles } from '../../../api/driveitemApi.ts';
import CircularProgress from '@mui/material/CircularProgress';

function MyFileList() {
    // 상태(state)들
    const {
        selectedDriveItem, 
        setSelectedDriveItem,
        driveItemMenu,
        openDriveItemMenu,
        closeDriveItemMenu,
        formatDate
    } = useOutletContext<DirectoryOutletContext>();

    const navigate = useNavigate();

    // 내 파일 목록을 불러오는 API 호출 (useQuery)
    const {
        data: files = [],     // 데이터
        isPending,            // 성공한 데이터가 없는지 여부 (retry 포함)
        isError,              // 요청이 실패했는지 여부
        error,                // 실패했을 때 오류 정보
    } = useQuery({
        queryKey: ["driveItems", "recent"], // 서버 데이터를 해당 이름으로 관리
        queryFn: getFiles,   // getFiles() 실행
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
                <Typography variant="h6">문서를 불러오는 중입니다...</Typography>
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
                <Typography variant="h5" sx={{ color: 'error.main' }}>{error.message}</Typography>
            </Box>
        );
    }

    // 문서 리스트를 정상적으로 받아왔을 때
    return (
        <>
        <Typography variant="h5" sx={{ fontWeight: 500, mt: 1}}>내 문서</Typography>
        {[...files].filter((file) => file.isInTrash === false).length === 0 ? (
            <>  
                <Box component="img" src={noFilesImg} sx={{ width: '40%', height: '35%', mx: 'auto', mt: 5}}/>
                <Typography variant="h5" sx={{ mt : 2.5, textAlign: 'center'}}>최근에 생성한 파일이 없습니다!</Typography>
                <Typography variant="body1" sx={{ mt : 2.5, textAlign: 'center'}}>
                    내 드라이브에서 [우클릭] - [새 파일 만들기]를 누르거나 <br></br>
                    우측 상단의 [+ 새 파일] 버튼을 눌러주세요.
                </Typography>
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
                    {[...files].filter((driveItem) => driveItem.isInTrash === false)
                    .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()) // 생성 날짜 내림차순 정렬
                    .map((file) => (
                    <TableRow key={file.publicId}
                        onClick= {() => setSelectedDriveItem(file)}
                        onContextMenu= {(e) => {
                            setSelectedDriveItem(file);
                            openDriveItemMenu(e); 
                            }
                        }
                        onDoubleClick = {() => navigate(`/editor/${file.publicId}`)}
                        sx={{
                            bgcolor: selectedDriveItem?.publicId === file.publicId ? '#e8f2fd' : 'transparent', // bg-blue-100
                            '&:hover': {
                                bgcolor: selectedDriveItem?.publicId === file.publicId ? '#e8f2fd' : '#f3f4f6', // hover:bg-gray-100
                            },
                        }}
                    >
                        <TableCell sx={{ py: 1.5, px: 1, fontWeight: 500, borderBottom: '1px solid #DBDBDB' }}>
                            <Box
                                component="img"
                                src={fileIcon}
                                sx={{ display: 'inline-block', height: '18px', width: '15px', mr: '5px', mb: '3px'}}
                            />
                            {file.itemName}
                            {file.extension === "UC" || file.extension === null ? "" : `.${file.extension}`}
                            {file.isFavorite === true && " ★"}</TableCell>
                        <TableCell sx={{ py: 1.5, fontSize: '14px', color: '#666666', borderBottom: '1px solid #DBDBDB' }}>{formatDate(file.createdDate)}</TableCell>
                        <TableCell sx={{ py: 1.5, fontSize: '14px', color: '#666666', borderBottom: '1px solid #DBDBDB' }}>{file.size} Byte</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )}
        {driveItemMenu.isOpen && selectedDriveItem && (
            <DriveItemMenu
            open={driveItemMenu.isOpen}
            x={driveItemMenu.x}
            y={driveItemMenu.y}
            driveItem={selectedDriveItem}
            onClose={closeDriveItemMenu}
            tab={"MYFILE"}
            />
        )}
    </>
    );
}

export default MyFileList;