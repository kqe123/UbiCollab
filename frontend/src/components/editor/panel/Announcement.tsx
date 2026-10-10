import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from  '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloseIcon from '@mui/icons-material/Close';
import AnnounceCreateModal from "../../modal/AnnounceCreateModal.tsx"
import AnnouncementMenu from "../menu/AnnouncementMenu";
import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "../../../hooks/use-current-user";
import type { Announcement as AnnouncementType } from "../../../types/announcement.ts";
import { getAnnouncements } from '../../../api/announcementApi.ts';
import CircularProgress from '@mui/material/CircularProgress';

function Announcement ({
    fileId,
    setSidePanel,
    permission
} : { 
    fileId : string;
    setSidePanel : React.Dispatch<React.SetStateAction<"NONE" | "COMMENT" | "ANNOUNCEMENT">>;
    permission : "VIEWER" | "COMMENTOR" | "EDITOR" |"MANAGER" | null;
}) {
    // 현재 로그인된 User 정보 
    const { data: currentUser } = useCurrentUser();

    const [openModal, setOpenModal] = useState<boolean>(false); // 공지 추가 모달창 열림/닫힘 상태
    const [announcementMenuOpen, setAnnouncementMenuOpen] = useState<boolean>(false); // 공지 메뉴 열림/닫힘 상태
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementType | null>(null); // 선택된 공지
    const anchorRef = useRef<HTMLButtonElement | null>(null); // 공지 메뉴(⋮) 버튼 Dom 요소 참조
    
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

    // 공지 메뉴(⋮) 표시
    const openMenu = (event : React.MouseEvent<HTMLButtonElement>, announcement : AnnouncementType) => {
        setAnnouncementMenuOpen(true); // 공지 메뉴 open
        setSelectedAnnouncement(announcement); // 해당 공지 선택
        anchorRef.current = event.currentTarget; // 해당 공지의 메뉴(⋮)를 anchorRef로 가리킴.
    }

    // 공지 메뉴(⋮) 숨김
    const closeMenu = () => {
        setAnnouncementMenuOpen(false); // 공지 메뉴 close
        setSelectedAnnouncement(null); // 해당 공지 해제
    }
    
    // 공지 목록을 불러오는 API 호출 (useQuery)
    const { 
        data : announcements = [],
        isPending : isAnnouncementPending, // 성공한 데이터가 아직 없는지 여부 (retry 포함)
        isError : isAnnouncementError,      // 요청이 실패했는지 여부
        error : AnnouncementError          // 실패했을 때 오류 정보
    } = useQuery<AnnouncementType[]>({
        queryKey : ["announcements", fileId],
        queryFn : () => getAnnouncements(fileId)
    })

    // 로딩 처리
    if (isAnnouncementPending) {
        return (
            <>
            {/* 헤더 */}
            <Box sx={{display : 'flex', flexDirection: 'row'}}>
                <Typography variant="h6">공지사항</Typography>
                <IconButton
                    size="small"    
                    sx={{ml : 'auto'}}
                    onClick={() => setSidePanel("NONE")}
                >
                    <CloseIcon />
                </IconButton>
            </Box>
            
            {/* 로딩창 */}
            <Box 
                sx={{
                    width : "100%", 
                    height : "65%",
                    display : 'flex',
                    flexDirection: 'column', 
                    flexShrink: 0,
                    gap : 2,
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflowY: 'auto'
                }}
            >
                <CircularProgress size={40} thickness={5} color="primary" ></CircularProgress>
                <Typography variant="h5">공지사항을 불러오는 중입니다...</Typography>     
            </Box>
            </>
        )
    }

    // 오류 처리
    if (isAnnouncementError) {
        return (
            <>
            {/* 헤더 */}
            <Box sx={{display : 'flex', flexDirection: 'row'}}>
                <Typography variant="h6">공지사항</Typography>
                <IconButton
                    size="small"    
                    sx={{ml : 'auto'}}
                    onClick={() => setSidePanel("NONE")}
                >
                    <CloseIcon />
                </IconButton>
            </Box>
                
            {/* */}
            <Box 
                sx={{
                    width : "100%", 
                    height : "65%",
                    display : 'flex',
                    flexDirection: 'column', 
                    flexShrink: 0,
                    gap : 2,
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflowY: 'auto'
                }}
            >
                <Typography variant="h5" sx={{ color: 'error.main' ,textAlign: 'center'}}>{AnnouncementError.message}</Typography>  
            </Box>
            </>
        )
    }

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
            height : "80%",
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
                        {announcement.userId === currentUser?.publicId && (
                            <Box sx={{ml : 'auto'}}>                    
                                <IconButton 
                                    size="small"    
                                    sx={{color : '#8A94A6'}}
                                    onClick={(e) => openMenu(e, announcement)}
                                >
                                    <MoreVertIcon />
                                </IconButton>
                            </Box>
                        )}
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
        <AnnounceCreateModal
            open={openModal}
            onClose={() => setOpenModal(false)}
            fileId={fileId}
            permission={permission}
        />

        {/* 댓글 메뉴 */}
        {announcementMenuOpen && selectedAnnouncement && (
            <AnnouncementMenu
                open={announcementMenuOpen}
                onClose={closeMenu}
                anchor={anchorRef.current}
                announcement={selectedAnnouncement}
            />
        )}

        </>
    );
    
}
export default Announcement;