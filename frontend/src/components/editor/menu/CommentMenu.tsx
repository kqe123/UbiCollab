import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ReportIcon from '@mui/icons-material/Report';
import Typography from '@mui/material/Typography';
import DeleteModal from '../../modal/DeleteModal';
import type {Comment} from "../../../types/comment.ts";
import { useCurrentUser } from "../../../hooks/use-current-user";
import { deleteComment } from '../../../api/commentApi.ts';

function CommentMenu ({
    open, onClose, anchor, comment, openEdit
} : {
    open: boolean;
    onClose : () => void;
    anchor : HTMLButtonElement | null
    comment : Comment
    openEdit : (comment : Comment) => void;
}) {

    const [deleteConfirm, setDeleteConfirm] = useState<boolean>(false); // delete 팝업창 열림/닫힘
    const queryClient = useQueryClient(); // QueryClient 가져옴

    // 현재 로그인된 User 정보 
    const {
        data: currentUser, // 백엔드에서 받아온 데이터
    } = useCurrentUser();


    // 댓글/답글 삭제 (useMutation)
    const { mutate } = useMutation({
        // 실제로 수행할 함수 (mutate에 넘긴 값을 변수로 받음)
        mutationFn : () => deleteComment(comment.commentId),
        // 성공 시 수행할 명령들 
        onSuccess : async () => {
            toast.success("해당 댓글/답글이 삭제되었습니다.");
            await queryClient.invalidateQueries({ queryKey: ["comments"]})
        },
        // 오류 시 수행할 명령들
        onError : (error) => {
            toast.error(error.message);
        },
        // 성공/오류 관계없이 무조건 수행할 명령들
        onSettled: () => {                 
            setDeleteConfirm(false); // DeleteConfirm창 닫힘
            onClose();               // Comment 메뉴 닫힘
        },
    })

    return (
        <>
        <Menu
            open={open}
            onClose={onClose}
            anchorEl={anchor}
            
            slotProps={{
                paper: {
                    sx: { 
                        width: 100,
                        borderRadius: 2,
                    }
                },
                list: {
                    sx: { py: 0.5 } // 기존 Paper의 py도 여기로
                }
            }} 
        >
            {/* 수정 버튼 (댓글 작성자가 아니면 표시 X)*/}
            {comment.userId === currentUser?.publicId && (
                <MenuItem 
                    dense
                    sx={{
                        width : '100%',
                        justifyContent: 'flex-start',
                        px : 2,
                        color: 'black'
                    }}
                    onClick={() => openEdit(comment)}
                >
                    <ListItemIcon> <EditIcon fontSize="small" /></ListItemIcon>
                    <Typography variant="body2" sx={{color: 'black' }}>수정</Typography>
                </MenuItem>
            )}

            {/* 신고 버튼 (댓글 작성자가 아니면 표시 O)*/}
            {comment.userId !== currentUser?.publicId && (
                <MenuItem 
                    dense
                    sx={{
                        width : '100%',
                        justifyContent: 'flex-start',
                        px : 2,
                        color: 'black'
                    }}
                >
                    <ListItemIcon> <ReportIcon fontSize="small" /></ListItemIcon>
                    <Typography variant="body2" sx={{color: 'black' }}>신고</Typography>
                </MenuItem>
            )}
            
            {/* 삭제 버튼 (댓글 작성자가 아니면 표시 X)*/}
            {comment.userId === currentUser?.publicId && (
                <MenuItem
                    dense
                    sx={{
                        width : '100%',
                        justifyContent: 'flex-start',
                        px : 2,
                        color: 'red',
                        '&:hover': {
                            bgcolor: '#fdc2c2'
                        },
                    }}
                    onClick={() => setDeleteConfirm(true)}
                >
                    <ListItemIcon> <DeleteIcon fontSize="small" /></ListItemIcon>
                    <Typography variant="body2" sx={{fontWeight: 600 }}>삭제</Typography>
                </MenuItem>
            )}
        </Menu>

        <DeleteModal
            open={deleteConfirm}
            title="댓글 영구 삭제"
            message="해당 댓글을 영구 삭제하시겠습니까?"
            onConfirm={mutate}
            onClose={() => setDeleteConfirm(false)}
        />
        </>
    )
}
export default CommentMenu;