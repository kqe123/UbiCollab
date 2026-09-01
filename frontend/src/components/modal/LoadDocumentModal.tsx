import axios from "axios";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import fileIcon from "@/assets/file.png";
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

function LoadDocumentModal({onClose} : {onClose : () => void}) {
    const [selectedFileId, setSelectedFileId] = useState<string|null>(null); // 현재 선택된 문서 ID
    const navigate = useNavigate(); // navigate 훅
    const accessToken = localStorage.getItem("accessToken"); // accessToken (JWT) 불러오기

    const getFiles = async () => {
        // 문서 목록 가져오는 백엔드 api 호출
        const response = await axios.get(
            "http://localhost:8080/api/driveitem/files",
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );
        return response.data;
    };

    const {
        data: files = [], // 백엔드에서 받아온 데이터
        isLoading,            // 현재 요청 중인지 여부
        isError,              // 요청이 실패했는지 여부
        error,                // 실패했을 때 오류 정보
    } = useQuery({
        queryKey: ["driveItems", "recent"], // 서버 데이터를 해당 이름으로 관리
        queryFn: getFiles,   // getDocuments() 실행
    });

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

    const loadDocument = async () => {
        navigate(`/editor/${selectedFileId}`); // editor에게 FileId만 전달
        onClose();
    }

    // 로딩 처리
    if (isLoading) {
        return (
            <Box sx={{ minHeight: '100vh', alignItems: 'center', justifyContent: 'center'}}>
                <Typography>문서를 불러오는 중입니다...</Typography>
            </Box>
        )
    }


    // 오류 처리
    if (isError) {
        return (
            <Box sx={{ minHeight: '100vh', alignItems: 'center', justifyContent: 'center'}}>
                <Typography sx={{ color: 'error.main' }}>문서를 불러오지 못했습니다 : {error.message}</Typography>
            </Box>
        )
    }

    return (
        <Dialog
            open={true}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
        >
            {/* 메뉴명 */}
            <DialogTitle sx={{ fontWeight: 500, alignItems: 'center' }}>
                문서 불러오기
            </DialogTitle>

            <DialogContent>
                {/* 문서가 0건일 때 */}
                {!isLoading && !isError && files.length === 0 && (
                    <Typography variant="h5" sx={{ mt: 2}}>불러올 문서가 없습니다..</Typography>
                )}

                {/* 문서 테이블 */}
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
                        {[...files].sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()) // 생성 날짜 내림차순 정렬
                            .map((file) => (
                                <TableRow key={file.publicId} 
                                    onClick={() => setSelectedFileId(file.publicId)}
                                    onDoubleClick={loadDocument}
                                    sx={{
                                    borderBottom: '1px solid #DBDBDB',
                                    bgcolor: selectedFileId === file.publicId ? '#e8f2fd' : 'transparent', // bg-blue-100
                                    '&:hover': {
                                        bgcolor: selectedFileId === file.publicId ? '#e8f2fd' : '#f3f4f6', // hover:bg-gray-100
                                    },
                                    }}
                                >
                                    <TableCell sx={{ py: 1.5, px: 1, fontWeight: 500 }}>
                                        <Box
                                            component="img"
                                            src={fileIcon}
                                            sx={{ display: 'inline-block',
                                                height: '18px',
                                                width: '15px',
                                                mr: '5px',
                                                mb: '3px',
                                            }}
                                        />
                                        {file.itemName}
                                        {file.extension === "UC" || file.extension === null ? "" : `.${file.extension}`}</TableCell>
                                    <TableCell sx={{ py: 1.5, fontSize: '14px', color: '#666666'}}>{formatDate(file.createdDate)}</TableCell>
                                    <TableCell sx={{ py: 1.5, fontSize: '14px', color: '#666666'}}>{file.size} B</TableCell>
                                </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
                </TableContainer>
            </DialogContent>
        </Dialog>
    );
}

export default LoadDocumentModal;