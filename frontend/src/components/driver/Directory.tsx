import { Outlet } from "react-router-dom";
import { useState } from "react";
import type {DriveItem} from "../../types/driveitem";


export type MenuType = {
    isOpen : boolean;
    x : number;
    y : number;
}

// Outlet Context 타입 정의
export type DirectoryOutletContext = {
    selectedDriveItem: DriveItem | null; // 선택된 파일/폴더
    setSelectedDriveItem : (driveItem : DriveItem) => void; // 파일/폴더 선택을 바꾸는 함수
    driveItemMenu : MenuType // 아이템 메뉴 상태
    openDriveItemMenu : (e : React.MouseEvent) => void; // 아이템 메뉴 열기 함수 (우클릭)
    closeDriveItemMenu : () => void; //아이템 메뉴 닫기 함수
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
        setDriveItemMenu({...driveItemMenu, isOpen: false});
    }

    const outletContext : DirectoryOutletContext = {
        selectedDriveItem,
        setSelectedDriveItem,
        driveItemMenu,
        openDriveItemMenu,
        closeDriveItemMenu
    };

    return (
        <div className="h-full min-h-[500px] rounded-[24px] bg-white p-6">
            <Outlet context={outletContext}/>
        </div>
    );
}

export default Directory;