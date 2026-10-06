import type {DriveItem} from "../../types/driveitem";
import toast from "react-hot-toast";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import RestoreIcon from '@mui/icons-material/RestoreFromTrash';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import DeleteModal from "../modal/DeleteModal";
import { restoreTrash, deleteTrash } from '../../api/driveitemApi.ts';

function TrashMenu({
    open, x, y, driveItem, onClose
} : {
    open: boolean;
    x : number;
    y : number;
    driveItem : DriveItem;
    onClose : () => void;
}) {

    const queryClient = useQueryClient(); // QueryClient 가져옴
    const [deleteConfirm, setDeleteConfirm] = useState(false); // delete 팝업창 열림/닫힘

    // 폴더/파일 복원 (useMutation)
    const { mutate : recoverTrash } = useMutation({
        mutationFn : () => restoreTrash(driveItem.publicId),
        onSuccess : async () => {
            console.log("알림 : 폴더/파일 복원 완료");
            await queryClient.invalidateQueries({
                queryKey: ["driveItems"]
            });
            toast.success("파일/폴더 복원 완료");
            onClose();
        },
        onError : (error) => {
            toast.error(error.message);
        }
    })

    // 폴더/파일 영구 삭제 (useMutation)
    const { mutate : removeTrash } = useMutation({
        mutationFn : () => deleteTrash(driveItem.publicId),
        onSuccess : async () => {
            console.log("알림 : 영구 삭제 완료");
            await queryClient.invalidateQueries({
                queryKey: ["driveItems"]
            });
            toast.success("폴더/파일 영구 삭제 완료");
        },
        onError : (error) => {
            toast.error(error.message);
        },
        onSettled : () => {
            setDeleteConfirm(false);
            onClose();
        },
    })

    return (
        <>
        <Menu                 
            open={open}
            onClose={onClose}
            anchorReference="anchorPosition"
            anchorPosition={{ top: y, left: x }}
            slotProps={{
                paper: {
                    sx: { width: 176, borderRadius: 2 } // 기존 Paper의 width/borderRadius만 유지
                },
                list: {
                    sx: { py: 0.5 } // 기존 Paper의 py도 여기로
                }
            }} 
        >
            <MenuList>
                <MenuItem
                    onClick={() => recoverTrash()}
                    sx={{width : '100%', justifyContent: 'flex-start', px : 2, color: 'black'}}
                >
                    <ListItemIcon> <RestoreIcon fontSize="small" /></ListItemIcon>
                    <Typography variant="body2" sx={{color: 'black' }}>복원</Typography>
                </MenuItem>

                <Divider sx={{my : 0.5}}/>
                
                <MenuItem
                    onClick={() => setDeleteConfirm(true)}
                    sx={{
                        width : '100%',
                        justifyContent: 'flex-start',
                        px : 2,
                        color: 'red',
                        '&:hover': {
                            bgcolor: '#fdc2c2'
                        },
                    }}
                >
                    <ListItemIcon> <DeleteForeverIcon fontSize="small" /></ListItemIcon>
                    <Typography variant="body2" sx={{fontWeight: 600 }}>영구 삭제</Typography>
                </MenuItem>
            </MenuList>
        </Menu>
        
        {/* 삭제 팝업 */}
        <DeleteModal
            open={deleteConfirm}
            title="영구 삭제"
            message="이 항목을 영구 삭제하시겠습니까?"
            onConfirm={() => removeTrash()}
            onClose={() => setDeleteConfirm(false)}
        />
    </>
    );
}

export default TrashMenu;