import toast from "react-hot-toast";
import fileIcon from "../../assets/file.png";
import folderIcon from "../../assets/folder.png";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { createFile, createFolder } from '../../api/driveitemApi.ts';

function NewDriveItemMenu({
    open, x, y, onClose, currentFolderId, disabled = false
} : {
    open : boolean;
    x : number;
    y : number;
    onClose : () => void;
    currentFolderId : string | null;
    disabled? : boolean; // true면 이 위치에 생성할 권한이 없다는 뜻 (OWNER | MANAGER만 생성 가능)
}) {

    const queryClient = useQueryClient(); // QueryClient 가져옴

    // 새 파일 생성 (useMutation)
    const { mutate : addFile} = useMutation({
        // 실제로 수행할 함수
        mutationFn : () => createFile(currentFolderId),
        // 성공 시 수행할 명령들
        onSuccess : async () => {
            console.log("알림 : 파일 생성 성공");
            await queryClient.invalidateQueries({
                queryKey: ["driveItems"]
            });
            toast.success("새 파일 생성 완료")
            onClose();
        },
        // 오류 시 수행할 명령들
        onError : (error) => {
            toast.error(error.message);
        }
    })
        
    // 새 파일 생성 버튼 클릭 시 실행
    const handleNewFile = () => {
        // [권한 제어] 방어적으로 한 번 더 체크 (버튼은 disabled로 막혀있지만, 우회 클릭 대비)
        if (disabled) {
            toast.error("해당 위치에 생성할 권한이 없습니다.");
            return;
        }

        addFile();   // 새 파일 생성 요청 실행
    };

    // 새 폴더 생성 (useMutation)
    const { mutate : addFolder} = useMutation({
        // 실제로 수행할 함수
        mutationFn : () => createFolder(currentFolderId),
        // 성공 시 수행할 명령들
        onSuccess : async () => {
            console.log("알림 : 폴더 생성 성공 : ");
            await queryClient.invalidateQueries({
                queryKey: ["driveItems"]
            });
            toast.success("새 폴더 생성 완료")
            onClose();
        },
        // 오류 시 수행할 명령들
        onError : (error) => {
            toast.error(error.message);
        }
    })
        
    // 새 폴더 생성 버튼 클릭 시 실행
    const handleNewFolder = () => {
        // [권한 제어] 방어적으로 한 번 더 체크 (버튼은 disabled로 막혀있지만, 우회 클릭 대비)
        if (disabled) {
            toast.error("해당 위치에 생성할 권한이 없습니다.");
            return;
        }

        addFolder();   // 새 폴더 생성 요청 실행
    };

    return (
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
                    onClick={handleNewFolder}
                    disabled={disabled}
                    sx={{width : '100%', justifyContent: 'flex-start', px : 2}}
                >
                    <Box
                        component="img"
                        src={folderIcon}
                        sx={{ width: '15px', height: '15px', mr : '5px', mb : '3px'}}
                    />
                    <Typography variant="body2" sx={{color: disabled ? 'text.disabled' : 'black' }}>새 폴더 만들기</Typography>
                </MenuItem>
                <MenuItem
                    onClick={handleNewFile}
                    disabled={disabled}
                    sx={{width : '100%', justifyContent: 'flex-start', px : 2}}
                >
                    <Box
                        component="img"
                        src={fileIcon}
                        sx={{ width: '15px', height: '18px', mr : '5px', mb : '3px'}}
                    />
                    <Typography variant="body2" sx={{color: disabled ? 'text.disabled' : 'black' }}>새 파일 만들기</Typography>
                </MenuItem>
            </MenuList>
        </Menu>
    );
}

export default NewDriveItemMenu;