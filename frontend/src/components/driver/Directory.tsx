import { Outlet } from "react-router-dom";
import { useState } from "react";
import type {DriveItem} from "../../types/driveitem";
import Box from '@mui/material/Box';

export type MenuType = {
    isOpen : boolean;
    x : number;
    y : number;
}

// Outlet Context 타입 정의
export type DirectoryOutletContext = {
    selectedDriveItem : DriveItem | null; // 선택된 파일/폴더
    setSelectedDriveItem : (driveItem : DriveItem | null) => void; // 파일/폴더 선택을 바꾸는 함수
    driveItemMenu : MenuType // 아이템 메뉴 상태
    openDriveItemMenu : (e : React.MouseEvent) => void; // 아이템 메뉴 열기 함수 (우클릭)
    closeDriveItemMenu : () => void; //아이템 메뉴 닫기 함수
    formatDate : (dateString: string) => string; // 날짜 포맷 변경 함수
}

function Directory() {
    const [selectedDriveItem, setSelectedDriveItem] = useState<DriveItem|null>(null); // 선택된 파일/폴더
    const [driveItemMenu, setDriveItemMenu] = useState({
        isOpen: false,
        x: 0,
        y: 0,
    });

    // 아이템 메뉴를 Open하는 이벤트 함수 (우클릭)
    const openDriveItemMenu = (e : React.MouseEvent) => {
        e.preventDefault();
        setDriveItemMenu({
            isOpen: true,
            x: e.clientX,
            y: e.clientY,
        })
    }

    // 아이템 메뉴를 Close하는 이벤트 함수 
    const closeDriveItemMenu = () => {
        setDriveItemMenu((prev) => ({
        ...prev,
        isOpen: false,
        }));
    }

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

    const outletContext : DirectoryOutletContext = {
        selectedDriveItem,
        setSelectedDriveItem,
        driveItemMenu,
        openDriveItemMenu,
        closeDriveItemMenu,
        formatDate
    };

    return (
        <>
        <Box sx={{ flex: 1, p: 3 }}>
            <Box
                sx={{
                    height : "100%",
                    borderRadius: '24px', // rounded-[24px]
                    bgcolor: 'white', // bg-white
                    p: 3, // p-6 = 24px = MUI spacing 3 (spacing 1 = 8px)
                }}
            >
                <Outlet context={outletContext}/>
            </Box>
        </Box>
        </>
    );
}

export default Directory;