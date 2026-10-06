import toast from "react-hot-toast";
import Box from '@mui/material/Box';
import IconButton from  '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import CloseIcon from '@mui/icons-material/Close';
import ForumIcon from '@mui/icons-material/Forum';
import SendIcon from '@mui/icons-material/Send';
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { useCurrentUser } from "../../../hooks/use-current-user";
import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Comment as CommentType } from "../../../types/comment.ts";
import CommentMenu from "../menu/CommentMenu";
import Badge from '@mui/material/Badge';
import { getComments, createComment, createReply, updateComment } from '../../../api/commentApi.ts';

function Comment ({
    fileId,
    setSidePanel,
    permission
} : { 
    fileId : string;
    setSidePanel : React.Dispatch<React.SetStateAction<"NONE" | "COMMENT" | "ANNOUNCEMENT">>;
    permission : "VIEWER" | "COMMENTOR" | "EDITOR" |"MANAGER" | null;
}) {
    // 현재 로그인된 User 정보 
    const {
        data: currentUser, // 백엔드에서 받아온 데이터
        isLoading,    // 현재 요청 중인지 여부
        isError,        // 요청이 실패했는지 여부
        error,            // 실패했을 때 오류 정보
    } = useCurrentUser();

    const [commentMenuOpen, setCommentMenuOpen] = useState<boolean>(false); // 댓글 메뉴 열림/닫힘 상태
    const [selectedComment, setSelectedComment] = useState<CommentType | null>(null); // 선택된 댓글
    const anchorRef = useRef<HTMLButtonElement | null>(null); // 댓글 메뉴(⋮) 버튼 Dom 요소 참조

    const [newContent, setNewContent] = useState<string>(""); // '작성' 중인 댓글 내용
    const [newReplyContents, setNewReplyContents] = useState<Record<string, string>>({}); // 댓글 Id별 '작성' 중인 답글 내용

    const [editCommentId, setEditCommentId] = useState<string | null>(null); // '수정' 중인 댓글/답글 Id
    const [editContent, setEditContent] = useState<string>(""); // '수정' 중인 댓글/답글 내용
    const [openReplies, setOpenReplies] = useState<Set<string>>(new Set()); // 답글이 열린 댓글 Id 리스트
    
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


    // 댓글 메뉴(⋮) 표시
    const openCommentMenu = (event : React.MouseEvent<HTMLButtonElement>, comment : CommentType) => {
        setCommentMenuOpen(true); // 댓글 메뉴 open
        setSelectedComment(comment); // 해당 댓글 선택
        anchorRef.current = event.currentTarget; // 
    }

    // 댓글 메뉴(⋮) 숨김
    const closeCommentMenu = () => {
        setCommentMenuOpen(false); // 댓글 메뉴 close
        setSelectedComment(null); // 해당 댓글 해제
    }

    // 댓글 수정 모드 진입
    const openEdit = (comment : CommentType) => {
        setEditCommentId(comment.commentId);
        setEditContent(comment.content);
        closeCommentMenu(); 
    }

    // 댓글 수정 모드 종료
    const closeEdit = () => {
        setEditCommentId(null);
        setEditContent("");
    }

    // 댓글 '수정' 내용 업데이트
    const updateEditContent = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEditContent(event.target.value);
    }

    // 답글이 열린 댓글을 Set에 추가/제거 
    const toggleReplies = (commentId : string) => {
        // Set형식의 State는 add/delete로는 변화를 감지 못하므로, 새 Set을 만들어서 넣어야 합니다.
        setOpenReplies((prev) => {
            const next = new Set(prev);
            next.has(commentId) ? next.delete(commentId) : next.add(commentId);
            return next;
        })
        
        // 해당 댓글의 ReplyContent를 초기화
        setNewReplyContents((prev) => {
            const next = { ...prev };
            commentId in newReplyContents && delete next[commentId];
            return next;
        })
    }

    // 댓글 '작성' 내용 업데이트
    const updateNewContent = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNewContent(event.target.value);
    }

    // 답글 '작성' 내용 업데이트
    const updateReplyContent = (parentId: string, value: string) => {
        setNewReplyContents((prev) => ({ ...prev, [parentId]: value }));
    };

    // 댓글 목록을 불러오는 API 호출 (useQuery)
    const {
        data : comments = [],       // 댓글 목록 데이터
        isLoading : isCommentLoading,  // 현재 요청 중인지 여부
        isError : isCommentError,      // 요청이 실패했는지 여부
        error : commentError          // 실패했을 때 오류 정보
    } = useQuery<CommentType[]>({
        queryKey : ["comments", fileId],
        queryFn : () => getComments(fileId),
        retry: false, // 재시도 없음 (기본값은 3번)
    }) 

    // 댓글 생성 (useMutation)
    const { mutate : addComment, isPending : isAddCommentPending } = useMutation({
        mutationFn : () => createComment(fileId, newContent),
        onSuccess : async (message : string) => {
            toast.success(message);
            console.log(message);
            setNewContent("");
            await queryClient.invalidateQueries({
                queryKey: ["comments"]
            })
        },
        onError : (error) => {
            toast.error(error.message);
        }
    })
    
    // 댓글 생성 버튼 클릭 시 실행
    const commentSubmit = (e : React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // 폼 기본 동작 방지
        
        // [예외처리] 작성 내용이 0자일때 
        if (newContent.trim().length === 0) {
            toast.error("댓글 내용을 작성해주세요.");
            return;
        }

        // [권한 제어] 댓글 창은 COMMENTOR 이상만 열 수 있지만, 우회 클릭을 대비해 한번 더 체크
        if (permission === "VIEWER" || permission == null) {
            toast.error("댓글을 생성할 권한이 없습니다.");
            return;
        }
        addComment();   // 댓글 생성 요청 실행
    };

    // 답글 생성 (useMutation)
    const { mutate : addReply, isPending : isAddReplyPending } = useMutation({
        mutationFn : ({ parentId, content } : { parentId : string; content : string }) =>
            createReply(parentId, fileId, content),
        onSuccess : async (message : string, { parentId }) => {
            toast.success(message);
            console.log(message);
            setNewReplyContents((prev) => ({ ...prev, [parentId] : "" }));
            await queryClient.invalidateQueries({
                queryKey: ["comments"]
            })
        },
        onError : (error) => {
            toast.error(error.message);
        }
    })
    
    // 답글 생성 버튼 클릭 시 실행
    const replySubmit = (e : React.FormEvent<HTMLFormElement>, parentId : string) => {
        e.preventDefault(); // 폼 기본 동작 방지
        const content = newReplyContents[parentId] ?? ""; 
        
        // [예외처리] 작성 내용이 0자일때 
        if (content.trim().length === 0) {
            toast.error("댓글 내용을 작성해주세요.");
            return;
        }

        // [권한 제어] 답글 창은 COMMENTOR 이상만 열 수 있지만, 우회 클릭을 대비해 한번 더 체크
        if (permission === "VIEWER" || permission == null) {
            toast.error("댓글을 생성할 권한이 없습니다.");
            return;
        }

        addReply({ parentId, content });  // 답글 생성 요청 실행
    };

    // 댓글/답글 수정 (useMutation)
    const { mutate : editComment, isPending : isUpdatePending } = useMutation({
        mutationFn : () => updateComment(editCommentId, editContent),
        onSuccess : async (message : string) => {
            toast.success(message);
            console.log(message);
            await queryClient.invalidateQueries({ queryKey: ["comments"] });
            closeEdit();
        },
        onError : (error) => {
            toast.error(error.message);
        }
    })
    
    // 댓글/답글 수정 버튼 클릭 시 실행
    const updateSubmit = (comment : CommentType) => {
        // [예외처리] 수정된 내용이 0자일때 
        if (editContent.trim().length === 0) {
            toast.error("댓글 내용을 작성해주세요.");
            return;
        }

        // [예외처리] 원래 내용과 수정된 내용이 똑같을때
        if (comment.content === editContent) {
            closeEdit();
            return;
        }

        editComment();  // 답글 생성 요청 실행
    };

    // 로딩 처리
    if (isCommentLoading) {
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
            
            {/* */}
            <Box 
                sx={{
                    width : "100%", 
                    height : "65%",
                    display : 'flex',
                    flexDirection: 'column', 
                    flexShrink: 0,
                    gap : 2,
                    overflowY: 'auto'
                }}
            >
                <Typography>댓글을 불러오는 중입니다...</Typography>     
            </Box>
            </>
        )
    }


    // 오류 처리
    if (isCommentError) {
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
            
            {/* */}
            <Box 
                sx={{
                    width : "100%", 
                    height : "65%",
                    display : 'flex',
                    flexDirection: 'column', 
                    flexShrink: 0,
                    gap : 2,
                    overflowY: 'auto'
                }}
            >
                <Typography variant="h5" sx={{ color: 'error.main' ,textAlign: 'center'}}>{commentError.message}</Typography>  
            </Box>
            </>
        )
    }

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
                    height : "65%",
                    display : 'flex',
                    flexDirection: 'column', 
                    flexShrink: 0,
                    gap : 2,
                    overflowY: 'auto'
                }}
            >
                {/* 댓글 목록들 */}
                {comments.filter((comment) => comment.parentId === null)
                .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()) // 댓글은 최신순
                .map((currentComment : CommentType) => (
                    <>
                    <Box 
                        key={currentComment.commentId}
                        sx={{
                            width : "100%",
                            minHeight : "15%",
                            borderRadius : 4,
                            p : 0.5,
                            flexShrink: 0, // 요소 크기가 줄어들지 않게함.
                            bgcolor : 'white',
                            border : '1px solid #E3ECF8',
                            boxShadow : '0 1px 2px rgba(30, 70, 140, 0.06)'
                        }}
                    >

                        {/* 댓글 작성자(프로필 사진, 닉네임), 답글 버튼, 더보기 버튼 */}
                        <Box sx={{ display : 'flex', flexDirection: 'row', alignItems : 'center', gap : 1 }}>
                            {/* 댓글 작성자(프로필 사진) */}
                            <Avatar
                                src={currentComment?.profileUrl ?? undefined}
                                alt="프로필사진"
                                sx={{ width: 30, height: 30, border : '1px solid #D6E6FA' }}
                            />

                            {/* 댓글 작성자(닉네임), 댓글 작성 날짜 */}
                            <Box sx={{ display : 'flex', flexDirection: 'column'}}>
                                <Typography variant="body2" sx={{fontWeight : 600}}>{currentComment.nickname}</Typography>
                                <Typography sx={{fontSize: '13px', color :'#8A94A6'}}>
                                    {formatDate(currentComment.createdDate)}
                                    {" "}{currentComment.isUpdated === true && "(수정됨)"}
                                </Typography>
                            </Box>
                            

                            <Box sx={{ml : 'auto'}}>
                                {/* 답글 버튼 */}
                                
                                <IconButton 
                                    size="small"    
                                    sx={{color : openReplies.has(currentComment.commentId) ? '#007FFF' : '#8A94A6' }}
                                    onClick={() => toggleReplies(currentComment.commentId)}
                                >   
                                    <Badge
                                        badgeContent={comments.filter((c) => c.parentId === currentComment.commentId).length}
                                        color="error"
                                        max={99}
                                        sx={{  '& .MuiBadge-badge': { fontSize: 10, height: 16, minWidth: 16, }}}
                                    >
                                        <ForumIcon />
                                    </Badge>
                                </IconButton>
                                
                                {/* 더보기 버튼 */}
                                <IconButton 
                                    size="small"    
                                    sx={{color : '#8A94A6'}}
                                    onClick={(e) => openCommentMenu(e, currentComment)}
                                >
                                    <MoreVertIcon />
                                </IconButton>
                            </Box>
                        </Box>

                        {/* 댓글 내용 or 댓글 수정칸 */}
                        {editCommentId === currentComment.commentId ? (
                            <>
                            <TextField
                                required
                                type="text"
                                size="small"
                                value={editContent}
                                onChange={updateEditContent}
                                multiline
                                slotProps={{ htmlInput: { maxLength: 500 } }}
                                sx={{
                                    width : '100%',
                                    mt : 1,
                                    '& .MuiInputBase-input': { fontSize: '14px'},
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#D6E6FA' },
                                    '&:hover .MuiOutlinedInput-root:not(.Mui-focused) .MuiOutlinedInput-notchedOutline': { borderColor: '#A9C8F0' },
                                }}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt : 1, gap : 0.5 }}>
                                <Button variant="outlined" size="small" onClick={closeEdit}>취소</Button>
                                <Button 
                                    disableElevation
                                    variant="contained"
                                    size="small"
                                    onClick={() => updateSubmit(currentComment)}
                                    disabled={isUpdatePending}
                                >
                                    수정
                                </Button>
                            </Box>
                            </>
                        ) : (
                            <Typography variant="body2" sx={{
                                    p : 1,
                                    whiteSpace : 'pre-wrap',
                                    wordBreak : 'break-word'
                                }}
                            >
                                {currentComment.content}
                            </Typography>
                        )}

                        {/* (선택사항) 답글 목록 */}
                        {openReplies.has(currentComment.commentId) && (
                            <>
                            <Divider sx={{ my : 1, borderColor : '#E3ECF8' }}  />
                            {comments.filter((reply : CommentType) => currentComment.commentId === reply.parentId)
                            .sort((a, b) => new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime()) // 답글은 오래된순
                            .map((reply : CommentType) => (
                                <Box 
                                    key={reply.commentId}
                                    sx={{
                                        width : "90%",
                                        ml : 'auto', // 답글을 오른쪽 정렬
                                        p : 0.5,
                                        flexShrink: 0, // 요소 크기가 줄어들지 않게함.
                                    }}
                                >
                                    <Box sx={{ display : 'flex', flexDirection: 'row', alignItems : 'center', gap : 1 }}>
                                        {/* 답글 작성자 (프로필 사진) */}
                                        <SubdirectoryArrowRightIcon sx={{ fontSize: 15, color : '#007FFF' }} />
                                        <Avatar
                                            src={reply?.profileUrl ?? undefined}
                                            alt="프로필사진"
                                            sx={{ width: 25, height: 25, border : '1px solid #D6E6FA' }}
                                        />

                                        {/* 답글 작성자 (닉네임), 답글 작성 날짜 */}
                                        <Box sx={{ display : 'flex', flexDirection: 'column'}}>
                                            <Typography sx={{fontSize: '13px', fontWeight : 600}}>{reply.nickname}</Typography>
                                            <Typography sx={{fontSize: '12px', color :'#8A94A6'}}>
                                                {formatDate(reply.createdDate)}
                                                {" "}{reply.isUpdated === true && "(수정됨)"}
                                            </Typography>
                                        </Box>
                                        
                                        {/* 더보기 버튼 */}
                                        <Box sx={{ml : 'auto'}}>
                                            <IconButton 
                                                size="small"    
                                                sx={{color : '#8A94A6'}}
                                                onClick={(e) => openCommentMenu(e, reply)}
                                            >
                                                <MoreVertIcon />
                                            </IconButton>
                                        </Box>

                                    </Box>
                                    
                                    {/* 답글 내용 or 답글 수정칸 */}
                                    {editCommentId === reply.commentId ? (
                                        <>
                                        <TextField
                                            required
                                            type="text"
                                            size="small"
                                            value={editContent}
                                            onChange={updateEditContent}
                                            multiline
                                            slotProps={{ htmlInput: { maxLength: 500 } }}
                                            sx={{
                                                width : '100%',
                                                mt : 1,
                                                pl : 4, // 왼쪽 margin 32px
                                                '& .MuiInputBase-input': { fontSize: '14px'},
                                                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#D6E6FA' },
                                                '&:hover .MuiOutlinedInput-root:not(.Mui-focused) .MuiOutlinedInput-notchedOutline': { borderColor: '#A9C8F0' },
                                            }}
                                        />
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt : 1, gap : 0.5 }}>
                                            <Button variant="outlined" size="small" onClick={closeEdit}>취소</Button>
                                            <Button 
                                                disableElevation
                                                variant="contained"
                                                size="small"
                                                onClick={() => updateSubmit(reply)}
                                                disabled={isUpdatePending}
                                            >
                                                수정
                                            </Button>
                                        </Box>
                                        </>
                                    ) : (
                                        <Typography 
                                            variant="body2" 
                                            sx={{
                                                p : 1,
                                                pl : 4, // 왼쪽 margin 32px
                                                whiteSpace : 'pre-wrap',
                                                wordBreak : 'break-word'
                                            }}
                                        >
                                        {reply.content}
                                        </Typography>
                                    )}
                                </Box>
                            ))}

                            {/* 답글 작성 영역 */}
                            <Box 
                                component="form"
                                onSubmit={(e) => replySubmit(e,currentComment.commentId)}
                                sx={{
                                    width : "90%", 
                                    ml : 'auto', // 답글을 오른쪽 정렬
                                    maxheight : '10%',
                                    p : 1,
                                }}
                            >   
                                {/* 프로필사진 */}
                                <Box sx={{ display : 'flex', flexDirection: 'row', alignItems: 'center', gap : 1, ml : '15px' }}>
                                    <Avatar
                                        src={currentUser?.profileUri ?? undefined}
                                        alt="프로필사진"
                                        sx={{ width: 25, height: 25, border : '1px solid #D6E6FA' }}
                                    />
                                    {/* 답글 내용 입력칸 */}
                                    <TextField
                                        required
                                        variant="standard"
                                        type="text"
                                        size="small"
                                        value={newReplyContents[currentComment.commentId] ?? ""}
                                        onChange={(e) => updateReplyContent(currentComment.commentId, e.target.value)}
                                        multiline
                                        maxRows={3}
                                        slotProps={{ 
                                            htmlInput: { maxLength: 500 }, // 최대 글자 수 500자
                                            input: {
                                            endAdornment: (
                                                // 답글 제출 버튼
                                                <InputAdornment position="end">
                                                <IconButton
                                                    edge="end"
                                                    size="small"
                                                    type="submit"
                                                    disabled={!(newReplyContents[currentComment.commentId] ?? '').trim() || isAddReplyPending}
                                                    sx={{color : (newReplyContents[currentComment.commentId] ?? '').trim() ? '#007FFF' : '#8A94A6' }}
                                                >
                                                    <SendIcon />
                                                </IconButton>
                                                </InputAdornment>
                                            ),
                                            },
                                        }} 
                                        placeholder="답글 추가... (1~500자)"
                                        sx={{
                                            width : '100%',
                                            '& .MuiInputBase-input': { fontSize: '14px'},
                                            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#D6E6FA' },
                                            '&:hover .MuiOutlinedInput-root:not(.Mui-focused) .MuiOutlinedInput-notchedOutline': 
                                                { borderColor: '#A9C8F0' },
                                        }}
                                    />
                                </Box>
                            </Box>
                            </>
                        )}

                    </Box>
                    </>
                ))}
            </Box>
            
            <Divider />

            {/* 댓글 작성 영역 */}
            <Box
                component="form"
                onSubmit={commentSubmit}
                sx={{
                    width : "100%",
                    maxheight : '10%',
                    px : 1,
                    pt : 0.5,
                    pb : 1,
                }}
            >   
                {/* 프로필사진, 닉네임 */}
                <Box sx={{ display : 'flex', flexDirection: 'row',gap : 1 }}>
                    <Avatar
                        src={currentUser?.profileUri ?? undefined}
                        alt="프로필사진"
                        sx={{ width: 30, height: 30, border : '1px solid #D6E6FA' }}
                    />
                    {/* 댓글 내용 입력칸 */}
                    <TextField
                        required
                        variant="standard"
                        type="text"
                        size="small"
                        value={newContent}
                        onChange={updateNewContent}
                        multiline
                        maxRows={3}
                        slotProps={{ 
                            htmlInput: { maxLength: 500 }, // 최대 글자 수 500자
                            input: {
                                 endAdornment: (
                                    // 댓글 제출 버튼
                                    <InputAdornment position="end">
                                        <IconButton edge="end"
                                            size="small"
                                            type="submit"
                                            disabled={!(newContent.trim()) || isAddCommentPending}
                                            sx={{color : (newContent.trim()) ? '#007FFF' : '#8A94A6' }}
                                        >
                                            <SendIcon />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            },
                        }} 
                        placeholder="댓글 추가... (1~500자)"
                        sx={{
                            width : '100%',
                            bgcolor : 'white',
                            '& .MuiInputBase-input': { fontSize: '14px'},
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#D6E6FA' },
                            '&:hover .MuiOutlinedInput-root:not(.Mui-focused) .MuiOutlinedInput-notchedOutline': 
                                { borderColor: '#A9C8F0' },
                        }}
                    />
                </Box>
            </Box>
            
            {/* 빈 공간 (댓글 작성 영역이 화면 밖으로 안 나가도록 하기 위한 장치) */}
            <Box sx={{ width : "100%", height : "10%"}}></Box>

            {/* 댓글 메뉴 */}
            {commentMenuOpen && selectedComment && (
                <CommentMenu 
                    open={commentMenuOpen}
                    onClose={closeCommentMenu}
                    anchor={anchorRef.current}
                    comment={selectedComment}
                    openEdit={openEdit}
                />
            )}

        </>
    );
}
export default Comment;