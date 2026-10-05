import axios from "axios";
import toast from "react-hot-toast";
import Box from '@mui/material/Box';
import IconButton from  '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import AnnouncementModal from "../../modal/AnnouncementModal"
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Announcement as AnnouncementType } from "../../../types/announcement.ts";

function Announcement ({
    fileId,
    setSidePanel,
    permission
} : { 
    fileId : string;
    setSidePanel : React.Dispatch<React.SetStateAction<"NONE" | "COMMENT" | "ANNOUNCEMENT">>;
    permission : "VIEWER" | "COMMENTOR" | "EDITOR" |"MANAGER" | null;
}) {

    const [openModal, setOpenModal] = useState<boolean>(false); // 공지 추가 모달창 열림/닫힘 상태
    const accessToken = localStorage.getItem("accessToken"); // accessToken (JWT) 불러오기

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

    // 공지 목록 불러오는 메서드
    const getAnnouncements = async () => {
        try {
            const response = await axios.get(
                `http://localhost:8080/api/announcement/${fileId}`,
                {   
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            )
            return response.data;
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message ?? "공지 목록 불러오기에 실패했습니다.";
                toast.error(message) 
            }
            throw error;
        }
    };
    
    const { 
        data : announcements = [],
        isFetching : isAnnouncementFetching, // 현재 요청 중인지 여부 (retry 포함)
        isError : isAnnouncementError,      // 요청이 실패했는지 여부
        error : AnnouncementError          // 실패했을 때 오류 정보
    } = useQuery<AnnouncementType[]>({
        queryKey : ["announcements", fileId],
        queryFn : getAnnouncements
    })


    return (
        <>
        {/* 헤더 */}
        <Box sx={{display : 'flex', flexDirection: 'row'}}>
            <Typography variant="h6">공지사항
                <Typography component="span" variant="h6" color="primary" >
                    {" "}{announcements.length}
                </Typography>
            </Typography>
            <IconButton
                size="small"
                sx={{ml : 'auto'}}
                onClick={() => setSidePanel("NONE")}
            >
                <CloseIcon />
            </IconButton>
        </Box>
            
        {/* 공지사항 목록 영역 */}
        <Box sx={{
            width : "100%",
            height : "70%",
            display : 'flex',
            flexDirection: 'column',
            overflowY : 'auto',
            gap : 2
        }}>
            {/* 공지 추가 버튼 (본인 권한이 MANAGER일 때만 표시)*/}
            {permission === "MANAGER" && (
                <Button
                disableElevation
                variant="contained"
                size="small"
                color="primary"
                onClick={() => setOpenModal(true)}
                sx={{ mt : 2, mx : "auto" }}
                >
                    공지 추가
                </Button>
            )}

            {announcements.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()) // 최신순 정렬
            .map((announcement) => (
                <Box 
                    key={announcement.announcementId}
                    sx={{
                        width : "100%",
                        minHeight : "15%",
                        borderRadius : 4,
                        p : 1,
                        flexShrink: 0, // 요소 크기가 줄어들지 않게함.
                        bgcolor : 'white',
                        border : '1px solid #E3ECF8',
                        boxShadow : '0 1px 2px rgba(30, 70, 140, 0.06)'
                    }}
                >  
                    {/* 제목 */}
                    <Typography variant="h6" sx={{fontWeight : 600}}>{announcement.title}</Typography> 

                    <Box sx={{ display : 'flex', flexDirection: 'row', alignItems : 'center', gap : 1, mt : 1 }}>
                        {/* 댓글 작성자(프로필 사진) */}
                        <Avatar
                            src={announcement?.profileUrl ?? undefined}
                            alt="프로필사진"
                            sx={{ width: 30, height: 30, border : '1px solid #D6E6FA' }}
                        />
                    
                        {/* 댓글 작성자(닉네임), 댓글 작성 날짜 */}
                        <Box sx={{ display : 'flex', flexDirection: 'column'}}>
                            <Typography variant="body2" sx={{fontWeight : 600}}>{announcement.nickname}</Typography>
                            <Typography sx={{fontSize: '13px', color :'#8A94A6'}}>
                                {formatDate(announcement.createdDate)}
                                {" "}{announcement.isUpdated === true && "(수정됨)"}
                            </Typography>
                        </Box>
                                                

                        {/* 더보기 버튼 */}
                        <Box sx={{ml : 'auto'}}>                    
                            <IconButton 
                                size="small"    
                                sx={{color : '#8A94A6'}}
                            >
                                <MoreVertIcon />
                            </IconButton>
                        </Box>
                    </Box>
                    
                    <Divider sx={{my : 1}}/>

                    {/* 내용 */}
                    <Box sx={{mt : 3}}>
                        <Typography 
                            variant="body1"
                            sx={{
                                whiteSpace : 'pre-wrap',
                                wordBreak : 'break-word'
                            }}
                        >
                            {announcement.content}
                        </Typography>
                    </Box>
                </Box>
                ))
            }
            
        </Box>

        {/* 공지 추가 모달창 */}
        <AnnouncementModal 
            open={openModal}
            onClose={() => setOpenModal(false)}
            fileId={fileId}
            permission={permission}
        />
        </>
    );
    
}
export default Announcement;