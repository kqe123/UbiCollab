import type {DriveItem} from "../../types/driveitem";
import toast from "react-hot-toast";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ChangeNameModal from "../modal/ChangeNameModal"
import ShareModal from "../modal/ShareModal"
import PermissionModal from "../modal/PermissionModal"
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import EditIcon from '@mui/icons-material/Edit';
import StarIcon from '@mui/icons-material/StarBorder';
import ShareIcon from '@mui/icons-material/Share';
import PermissionIcon from '@mui/icons-material/CoPresent';
import DeleteIcon from '@mui/icons-material/Delete';
import { createFavorite, deleteFavorite, throwTrash } from '../../api/driveitemApi.ts';

function DriveItemMenu({
    open, x, y, driveItem, onClose
} : {
    open: boolean;
    x : number;
    y : number;
    driveItem : DriveItem;
    onClose : () => void;
}) {

    const queryClient = useQueryClient(); // QueryClient 가져옴
    // 메뉴 모드를 CONTEXT/RENAME으로 나눠서 CONTEXT일때는 CONTEXT 메뉴를,
    // RENAME일때는 CONTEXT 메뉴 대신 RENAME 메뉴를 출력한다.
    const [menuMode, setMenuMode] = useState<"CONTEXT" | "RENAME" | "SHARE" | "PERMISSION">("CONTEXT");

    // 메뉴 닫는 함수
    const closeMenu = () => {
        onClose();
    }

    // 즐겨찾기 추가 (useMutation)
    const { mutate : addFavorite } = useMutation({
        mutationFn : () => createFavorite(driveItem.publicId),
        onSuccess : async () => {
            console.log("알림 : 즐겨찾기 추가 성공");
            await queryClient.invalidateQueries({
                queryKey: ["driveItems"]
            });
            toast.success("즐겨찾기 등록 완료");
            onClose();
        },
        onError : (error) => {
            toast.error(error.message);
        }
    })

    // 즐겨찾기 해제 (useMutation)
    const { mutate : removeFavorite } = useMutation({
        mutationFn : () => deleteFavorite(driveItem.publicId),
        onSuccess : async () => {
            console.log("알림 : 즐겨찾기 해제 성공");
            await queryClient.invalidateQueries({
                queryKey: ["driveItems"]
            });
            toast.success("즐겨찾기 해제 완료");
            onClose();
        },
        onError : (error) => {
            toast.error(error.message);
        }
    })

    // 휴지통 보내기 (useMutation)
    const { mutate : moveToTrash } = useMutation({
        mutationFn : () => throwTrash(driveItem.publicId),
        onSuccess : async () => {
            console.log("알림 : 휴지통 보내기 완료");
            await queryClient.invalidateQueries({
                queryKey: ["driveItems"]
            });
            toast.success("휴지통 보내기 완료");
            onClose();
        },
        onError : (error) => {
            toast.error(error.message);
        }
    })

    return (
        <>
        {/* menuMode = CONTEXT일때 */}
        {menuMode === "CONTEXT" && (
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
                        onClick={() => {setMenuMode("RENAME")}}
                        disabled={!(driveItem.permissionType === "MANAGER")}
                        >
                            <ListItemIcon>
                                <EditIcon fontSize="small" />
                            </ListItemIcon>
                            <Typography variant="body2">
                                이름 변경
                            </Typography>
                    </MenuItem>

                    {driveItem.isFavorite === true ? (
                        <MenuItem
                            onClick={() => removeFavorite()}
                            disabled={driveItem.permissionType === null}
                        >
                            <ListItemIcon> <StarIcon fontSize="small" /> </ListItemIcon>
                            <Typography variant="body2">
                                즐겨찾기 해제
                            </Typography>
                        </MenuItem>
                    ) : 
                        <MenuItem
                            onClick={() => addFavorite()}
                            disabled={driveItem.permissionType === null}
                        >   
                            <ListItemIcon> <StarIcon fontSize="small" /> </ListItemIcon>
                            <Typography variant="body2">
                                즐겨찾기 추가
                            </Typography>
                        </MenuItem>
                    }

                    <MenuItem
                        onClick={() => {setMenuMode("SHARE")}}
                        disabled={!(driveItem.permissionType === "MANAGER")}
                    >
                        <ListItemIcon> <ShareIcon fontSize="small" /> </ListItemIcon>
                        <Typography variant="body2">
                            공유 추가
                        </Typography>
                    </MenuItem>

                    <MenuItem
                        onClick={() => {setMenuMode("PERMISSION")}}
                        disabled={!(driveItem.permissionType === "MANAGER")}
                    >
                        <ListItemIcon> <PermissionIcon fontSize="small" /> </ListItemIcon>
                        <Typography variant="body2">
                            권한 관리
                        </Typography>
                    </MenuItem>

                    <Divider sx={{my : 0.5}}/>

                    <MenuItem
                        onClick={() => moveToTrash()}
                        sx={{
                            color : 'red',
                            '&:hover': {
                                bgcolor: '#fdc2c2'
                            },
                        }}
                        disabled={!(driveItem.permissionType === "MANAGER")}
                    >
                        <ListItemIcon> <DeleteIcon fontSize="small" /> </ListItemIcon>
                        <Typography variant="body2" sx={{fontWeight: 600}}>
                            휴지통으로 이동
                        </Typography>
                    </MenuItem>
                </MenuList>
            </Menu>
        )}
        {/* menuMode = RENAME일때 */}
        {menuMode === "RENAME" && (
            <ChangeNameModal
                driveItem={driveItem}
                onClose={closeMenu}
            />
        )}

        {/* menuMode = SHARE일때 */}
        {menuMode === "SHARE" && (
            <ShareModal
                driveItem={driveItem}
                onClose={closeMenu}
            />
        )}

        {/* menuMode = PERMISSION일때 */}
        {menuMode === "PERMISSION" && (
            <PermissionModal
                driveItem={driveItem}
                onClose={closeMenu}
            />
        )}
        </>
    );

}

export default DriveItemMenu;