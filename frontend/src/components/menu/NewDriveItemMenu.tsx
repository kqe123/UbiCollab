import axios from "axios";
import toast from "react-hot-toast";
import fileIcon from "../../assets/file.png";
import folderIcon from "../../assets/folder.png";
import { useQueryClient } from "@tanstack/react-query";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
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

    const accessToken = localStorage.getItem("accessToken"); // accessToken (JWT) 불러오기
    const queryClient = useQueryClient(); // QueryClient 가져옴

    // 새 파일 생성 버튼 클릭 시 이벤트
    const createFile = async () => {
        // [권한 제어] 방어적으로 한 번 더 체크 (버튼은 disabled로 막혀있지만, 우회 클릭 대비)
        if (disabled) {
            toast.error("해당 위치에 생성할 권한이 없습니다.");
            return;
        }

        const fileData = {
            itemName: "제목 없는 문서",
            type : "FILE",
            content: "",
            extension: "UC",
            parentPublicId : currentFolderId
        };
        // DB에 새 문서 생성 후 response 받음
        try {
            const response = await axios.post(
                "http://localhost:8080/api/driveitem/create",
                fileData,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            console.log("알림 : 파일 생성 성공 : ", response.data);
            await queryClient.invalidateQueries({
                queryKey: ["driveItems"]
            });
            toast.success("새 파일을 생성하였습니다.")
            onClose();
        } catch (error : unknown) {
            // axios에서 발생한 오류인 경우
            if (axios.isAxiosError(error)) {
                console.error("백엔드 응답:", error.response?.data);
                toast.error(error.response?.data?.message ?? "파일 생성에 실패했습니다.");
            } 
            // 그 외의 오류인 경우
            else {
                console.error("알 수 없는 오류:", error);
                toast.error("알 수 없는 오류가 발생했습니다.");
            }
        }
    }

    // 새 폴더 생성 버튼 클릭 시 이벤트
    const createFolder = async () => {
        // [권한 제어] 방어적으로 한 번 더 체크 (버튼은 disabled로 막혀있지만, 우회 클릭 대비)
        if (disabled) {
            toast.error("해당 위치에 생성할 권한이 없습니다.");
            return;
        }

        const folderData = {
            itemName: "새 폴더",
            type : "FOLDER",
            parentPublicId : currentFolderId
        };
        
        // DB에 새 문서 생성 후 response 받음
        try {
            const response = await axios.post(
                "http://localhost:8080/api/driveitem/create",
                folderData,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            console.log("알림 : 폴더 생성 성공 : ", response.data);
            await queryClient.invalidateQueries({
                queryKey: ["driveItems"]
            });
            toast.success("새 폴더를 생성하였습니다.");
            onClose();
        } catch (error : unknown) {
            // axios에서 발생한 오류인 경우
            if (axios.isAxiosError(error)) {
                console.error("백엔드 응답:", error.response?.data);
                toast.error(error.response?.data?.message ?? "폴더 생성에 실패했습니다.");
            } 
            // 그 외의 오류인 경우
            else {
                console.error("알 수 없는 오류:", error);
                toast.error("알 수 없는 오류가 발생했습니다.");
            }
        }
    }

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
                    onClick={() => {createFolder()}}
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
                    onClick={() => {createFile()}}
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