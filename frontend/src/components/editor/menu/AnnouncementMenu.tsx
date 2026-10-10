import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Typography from '@mui/material/Typography';
import DeleteModal from '../../modal/DeleteModal';
import type {Announcement} from "../../../types/announcement.ts";
import { useCurrentUser } from "../../../hooks/use-current-user";
import { deleteAnnouncement } from '../../../api/announcementApi.ts';

function AnnouncementMenu ({
    open, onClose, anchor, announcement
} : {
    open: boolean;
    onClose : () => void;
    anchor : HTMLButtonElement | null
    announcement : Announcement
}) {

    const [deleteConfirm, setDeleteConfirm] = useState<boolean>(false); // delete 팝업창 열림/닫힘
    const queryClient = useQueryClient(); // QueryClient 가져옴

    // 현재 로그인된 User 정보 
    const {
        data: currentUser, // 백엔드에서 받아온 데이터
    } = useCurrentUser();


    // 댓글/답글 삭제 (useMutation)
    const { mutate } = useMutation({
        mutationFn : () => deleteAnnouncement(announcement.announcementId),
        onSuccess : async () => {
            toast.success("해당 공지가 삭제되었습니다.");
            await queryClient.invalidateQueries({ queryKey: ["announcements"]})
        },
        onError : (error) => {
            toast.error(error.message);
        },
        onSettled: () => {                 
            setDeleteConfirm(false); // DeleteConfirm창 닫힘
            onClose();               // Announcement 메뉴 닫힘
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
            {announcement.userId === currentUser?.publicId && (
                <MenuItem 
                    dense
                    sx={{
                        width : '100%',
                        justifyContent: 'flex-start',
                        px : 2,
                        color: 'black'
                    }}
                >
                    <ListItemIcon> <EditIcon fontSize="small" /></ListItemIcon>
                    <Typography variant="body2" sx={{color: 'black' }}>수정</Typography>
                </MenuItem>
            )}
            
            {/* 삭제 버튼 (댓글 작성자가 아니면 표시 X)*/}
            {announcement.userId === currentUser?.publicId && (
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
            title="공지 영구 삭제"
            message="해당 공지를 영구 삭제하시겠습니까?"
            onConfirm={mutate}
            onClose={() => setDeleteConfirm(false)}
        />
        </>
    )
}
export default AnnouncementMenu;