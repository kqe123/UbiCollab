import axios from "axios";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Typography from '@mui/material/Typography';
import DeleteModal from '../../modal/DeleteModal';
import type {Comment} from "../../../types/comment.ts";

function CommentMenu ({
    open, onClose, anchor, comment
} : {
    open: boolean;
    onClose : () => void;
    anchor : HTMLButtonElement | null
    comment : Comment
}) {

    const queryClient = useQueryClient(); // QueryClient 가져옴
    const [deleteConfirm, setDeleteConfirm] = useState<boolean>(false); // delete 팝업창 열림/닫힘
    const accessToken = localStorage.getItem("accessToken"); // accessToken (JWT) 불러오기

    // 댓글 삭제 API 호출 함수
    const deleteComment = async () => {
        try {
            // 댓글 영구 삭제 Backend API 호출
            await axios.delete(`http://localhost:8080/api/comment/delete/${comment.commentId}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
            );
            toast.success("해당 댓글이 삭제되었습니다.");
            await queryClient.invalidateQueries({ queryKey: ["comments"]})  // 댓글 목록 실시간 업데이트
        } catch (error: unknown) {
            console.error("영구 삭제 실패... : ", error);
            // axios에서 발생한 오류인 경우
            if (axios.isAxiosError(error)) {
                console.error("백엔드 응답:", error.response?.data);
                toast.error(error.response?.data?.message ?? "댓글 삭제에 실패했습니다.");
            } 
            // 그 외의 오류인 경우
            else {
                console.error("알 수 없는 오류:", error);
                toast.error("알 수 없는 오류가 발생했습니다.");
            }
        } finally {
            setDeleteConfirm(false); // DeleteConfirm창 닫힘
            onClose();               // Comment 메뉴 닫힘
        }
    }

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
            <MenuList>
                <MenuItem
                    sx={{width : '100%', justifyContent: 'flex-start', px : 2, color: 'black'}}
                >
                    <ListItemIcon> <EditIcon fontSize="small" /></ListItemIcon>
                    <Typography variant="body2" sx={{color: 'black' }}>수정</Typography>
                </MenuItem>

                <Divider sx={{ borderBottomWidth: "0.5px"}}/>
                
                <MenuItem
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
            </MenuList>
        </Menu>

        <DeleteModal
            open={deleteConfirm}
            title="댓글 영구 삭제"
            message="해당 댓글을 영구 삭제하시겠습니까?"
            onConfirm={deleteComment}
            onClose={() => setDeleteConfirm(false)}
        />
        </>
    )
}
export default CommentMenu;