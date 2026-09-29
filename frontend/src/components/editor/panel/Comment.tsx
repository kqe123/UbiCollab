import axios from "axios";
import toast from "react-hot-toast";
import Box from '@mui/material/Box';
import IconButton from  '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import TextField from '@mui/material/TextField';
import { useCurrentUser } from "../../../hooks/use-current-user";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type {Comment} from "../../../types/comment.ts";

function Comment ({
    fileId,
    setSidePanel,
    permission
} : { 
    fileId : string;
    setSidePanel : React.Dispatch<React.SetStateAction<"NONE" | "COMMENT" | "NOTICE">>;
    permission : "VIEWER" | "COMMENTOR" | "EDITOR" |"MANAGER" | null;
}) {
    // 현재 로그인된 User 정보 
    const {
        data: currentUser, // 백엔드에서 받아온 데이터
        isLoading,    // 현재 요청 중인지 여부
        isError,        // 요청이 실패했는지 여부
        error,            // 실패했을 때 오류 정보
    } = useCurrentUser();

    const [content, setContent] = useState<string>(""); // 댓글 내용
    const accessToken = localStorage.getItem("accessToken"); // accessToken (JWT) 불러오기
    const queryClient = useQueryClient(); // QueryClient 가져옴

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

    // 댓글 내용 업데이트 함수
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setContent(event.target.value);
    }

    // 댓글 목록 불러오기 메서드
    const getComments = async () => {
        try {
            // axios로 백엔드 api 호출
            const response = await axios.get(
                `http://localhost:8080/api/comment/${fileId}`,
                {   
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            );
            
            console.log(response.data);
            return response.data;
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message ?? "댓글 목록 불러오기에 실패했습니다.";
                toast.error(message) 
            }
            throw error;
        }
    };

    const {
        data : comments = [],       // 댓글 목록 데이터
        isLoading : isCommentLoading,  // 현재 요청 중인지 여부
        isError : isCommentError,      // 요청이 실패했는지 여부
        error : commentError          // 실패했을 때 오류 정보
    } = useQuery<Comment[]>({
        queryKey : ["comments", fileId],
        queryFn : getComments
    }) 


    // 댓글 생성 메서드
    const createComment = async (e : React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // 폼 기본 동작 방지
        
        if (content.length === 0) {
            toast.error("댓글 내용을 작성해주세요.");
            return;
        }

        // [권한 제어] 댓글 창은 COMMENTOR 이상만 열 수 있지만, 우회 클릭을 대비해 한번 더 체크
        if (permission === "VIEWER" || permission == null) {
            toast.error("댓글을 생성할 권한이 없습니다.");
            return;
        }
        
        // 댓글 데이터
        const commentData = {
            parentId : null, 
            anchorType : null,
            fileId : fileId,
            content : content,
        }

        try {
            // axios로 백엔드 api 호출
            const response = await axios.post(
                "http://localhost:8080/api/comment/create",
                commentData,
                {   
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            );
            
            toast.success(response.data);
            console.log(response.data);
            setContent("");
            await queryClient.invalidateQueries({
                queryKey: ["comments"]
            })
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message ?? "댓글 생성에 실패했습니다.";
                toast.error(message) // 여기서 백엔드 메시지를 담은 새 Error로 교체
            }
            throw error;
        }
    };

    return (
        <>
            {/* 헤더 */}
            <Box sx={{display : 'flex', flexDirection: 'row'}}>
                <Typography variant="h6">댓글 
                    <Typography component="span" variant="h6" color="primary" >
                        {" "}{comments.length}
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
            
            {/* 댓글 목록 영역 */}
            <Box 
                sx={{
                    width : "100%", 
                    display : 'flex',
                    flexDirection: 'column', 
                    flex : 1,
                    gap : 2,
                    overflowY: 'auto'
                }}
            >
                {[...comments].map((comment : Comment) => (
                    <Box 
                        key={comment.commentId}
                        sx={{
                            width : "100%",
                            border : '0.5px solid #81c0ff',
                            height : "20%",
                            borderRadius : 4,
                            p : 0.5,
                            flexShrink: 0 // 요소 크기가 줄어들지 않게함.
                            }}>
                        <Box sx={{ display : 'flex', flexDirection: 'row', alignItems : 'center', gap : 0.5 }}>
                            {comment?.profileUrl ? (
                                <Avatar 
                                    src={comment.profileUrl}
                                    alt="프로필사진"
                                    sx={{ width: 30, height: 30, border : '0.5px solid #fdbdbdcd' }}
                                />
                            ) : (
                                <Avatar 
                                    alt="프로필사진"
                                    sx={{ width: 30, height: 30 }}
                                />
                            )}
                            <Box sx={{ display : 'flex', flexDirection: 'column'}}>
                                <Typography variant="body2" sx={{fontWeight : 600}}>{comment.nickname}</Typography>
                                <Typography sx={{fontSize: '13px', color :'gray'}}>{formatDate(comment.createdDate)}</Typography>
                            </Box>
                        </Box>
                        <Typography variant="body2" sx={{p : 1}}>{comment.content}</Typography>
                    </Box>
                ))}
            </Box>
            
            {/* 댓글 작성 영역 */}
            <Box 
                component="form"
                onSubmit={createComment}
                sx={{
                    width : "100%", 
                    height : "21%",
                    border: '1px solid #e0e0e0',
                    borderRadius : 4,
                    p : 1,
                }}
            >   
                {/* 프로필사진, 닉네임 */}
                <Box sx={{ display : 'flex', flexDirection: 'row', alignItems: 'center', gap : 1 }}>
                    {currentUser?.profileUri ? (
                        <Avatar 
                            src={currentUser.profileUri}
                            alt="프로필사진"
                            sx={{ width: 30, height: 30, border : '0.5px solid #fdbdbdcd' }}
                        />
                    ) : (
                        <Avatar 
                            alt="프로필사진"
                            sx={{ width: 30, height: 30, border : '0.5px solid #fdbdbdcd' }}
                        />
                    )}
                    <Typography variant="body2">{currentUser?.nickname}</Typography>
                </Box>
                
                {/* 댓글 내용 입력칸 */}
                <TextField
                    required
                    type="text"
                    size="small"
                    name="content"
                    value={content}
                    onChange={handleChange}
                    multiline
                    rows={2}
                    sx={{
                        width : '100%',
                        mt : 1,
                        '& .MuiInputBase-input': { fontSize: '14px'} }}
                />
                
                {/* 댓글 제출 */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt : 1 }}>
                    <Button 
                        disableElevation
                        variant="outlined"
                        type="submit"
                    >
                        댓글 달기
                    </Button>
                </Box>
            </Box>
            
            {/* 빈 공간 (댓글 작성 영역이 화면 밖으로 안 나가도록 하기 위한 장치) */}
            <Box sx={{ width : "100%", height : "13%"}}></Box>
        </>
    );
}
export default Comment;