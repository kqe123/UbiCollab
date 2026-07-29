import axios from "axios";
import toast from "react-hot-toast";
import fileIcon from "../../../assets/file.png";
import folderIcon from "../../../assets/folder.png";
import homeIcon from "../../../assets/home.png";
import noDriveImg from "../../../assets/empty-drive.png";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DriveItemMenuModal from "../../modal/DriveItemMenuModal"
import NewDriveItemModal from "../../modal/NewDriveItemModal"
import type {DriveItem} from "../../../types/driveitem";
import { useOutletContext } from "react-router-dom";
import type { DirectoryOutletContext, MenuType} from "../Directory";

function MyDriveList() {
    // 상태(state)들
    const [currentFolderId, setCurrentFolderId] = useState<number | null>(null); // 현재 부모 폴더
    const [folderPath, setFolderPath] = useState<DriveItem[]>([]); // 현재 경로
    const [tableMenu, setTableMenu] = useState<MenuType>({
        isOpen: false,
        x: 0,
        y: 0,
    });

    const {
        selectedDriveItem, 
        setSelectedDriveItem,
        driveItemMenu,
        openDriveItemMenu,
        closeDriveItemMenu
    } = useOutletContext<DirectoryOutletContext>();

    const accessToken = localStorage.getItem("accessToken"); // accessToken (JWT) 불러오기
    const navigate = useNavigate();

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

    // 요소 더블클릭 시 발생하는 이벤트 함수
    const elementDoubleClick = (driveItem: DriveItem): void => {
        if (driveItem.type === "FOLDER") {
            setCurrentFolderId(driveItem.id);
            setFolderPath((prev) => [
            ...prev,
            driveItem,
            ]);
        }
        else if (driveItem.type === "FILE") {
            navigate(`/editor/${driveItem.id}`);
        }
        else {
            toast.error("오류 : 해당 아이템의 타입을 알 수가 없습니다!")
        }
    }

    // 테이블 메뉴 열림 (테이블 우클릭 시)
    const tableRightClick = (e: React.MouseEvent): void => {
        e.preventDefault();
        setTableMenu({
            isOpen: true,
            x: e.clientX,
            y: e.clientY,
        })
    }

    // 테이블 메뉴 닫힘 
    const closeTableMenu = () => {
        setTableMenu({...tableMenu, isOpen: false});
    }
    
    // 루트 디렉토리 이동 (홈버튼)
    const moveToRoot = (): void => {
        setCurrentFolderId(null);
        setFolderPath([]);
        setSelectedDriveItem(null);
    };

    const moveToBack = () : void => {
        if (folderPath.length === 0) {
            return; 
        } 

        const previousPath = folderPath.slice(0, -1);
        setFolderPath(previousPath); // 이전 경로가 없다면 루트 디렉토리

        if (previousPath.length === 0) 
            setCurrentFolderId(null);
        
        else 
            setCurrentFolderId(previousPath[previousPath.length - 1].id); 
        
        setSelectedDriveItem(null); 
    };
    

    // 백엔드 api(디렉토리 조회)를 호출하는 비동기 함수
    const getDriveItems = async () => {
        // 백엔드에 보낼 폴더 ID
        const DriveItemData = {
            parentId: currentFolderId
        }

        // axios로 백엔드 api 호출
        const response = await axios.get(
            "http://localhost:8080/api/driveitem/driveitems",
            {   
                params: DriveItemData,
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );
        return response.data;
    };

    // useQuery 실행 (첫 렌더링 시, queryKey가 변경될 시에 실행한다.)
    const {
        data: driveItems = [], // 백엔드에서 받아온 데이터
        isLoading,            // 현재 요청 중인지 여부
        isError,              // 요청이 실패했는지 여부
        error,                // 실패했을 때 오류 정보
    } = useQuery({
        queryKey: ["driveItems", currentFolderId], // 서버 데이터를 해당 이름으로 관리
        queryFn: getDriveItems,   // getDriveItems() 실행
    });

    // 로딩 처리
    if (isLoading) {
        return (
        <>
            <h1 className="text-2xl font-medium">내 드라이브</h1>
            <p className="mt-10">문서를 불러오는 중입니다...</p>
        </>
        )
    }


    // 오류 처리
    if (isError) {
        return (
        <>
            <h1 className="text-2xl font-medium ">내 드라이브</h1>
            <p className="mt-10 text-red-500">문서를 불러오지 못했습니다: {error.message}</p>
        </>
        )
    }


    // 문서 리스트를 정상적으로 받아왔을 때
    return (
        <>
        <h1 className="text-2xl font-medium">내 드라이브</h1>
        <div className="w-full h-full" 
            onContextMenu= {(e) => {tableRightClick(e);}}>
            <div className="flex mt-10">
                <button type="button" onClick={moveToRoot}
                    disabled={folderPath.length === 0}
                    className={`w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200
                        transition-colors
                        ${folderPath.length === 0
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-600 hover:bg-gray-100 cursor-pointer"
                        }`} title="홈">
                        <img src={homeIcon} alt="홈" className="w-8 h-8 rounded-xl"/>
                </button>
                <div className="w-[50%] h-8 p-[6px] bg-[#F9F9FA] flex rounded-xl">
                    <span className="text-sm">
                        {`내 드라이브${
                            folderPath.length > 0
                            ? ` / ${folderPath.map((folder) => folder.itemName).join(" / ")}`
                            : ""
                        }`}
                    </span>
                
            </div>
            </div>
            {/* 폴더/파일이 0건일때 예외처리 */}    
            {driveItems.length === 0 ? (
                <>
                    <img src={noDriveImg} className="w-[40%] h-[40%] mx-auto mt-10"></img>
                    <h1 className="mt-5 text-center text-2xl">
                        우클릭으로 폴더/파일을 생성해 보세요!
                    </h1>
                </>
            ) : (
            <table className="mt-5 w-full table-fixed text-left">
                <thead>
                    <tr className="border-b border-[#DBDBDB]">
                        <td className="w-[50%] pb-3 text-sm ">이름</td>
                        <td className="w-[30%] pb-3 text-sm">생성 일자</td>
                        <td className="w-[20%] pb-3 text-sm">파일 크기</td>
                    </tr>
                </thead>

                <tbody>
                    {[...driveItems].filter((driveItem) => driveItem.isInTrash === false)
                    .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()) // 생성 날짜 내림차순 정렬
                    .map((driveItem) => (
                        <tr key={driveItem.id}
                            onClick= {() => setSelectedDriveItem(driveItem)}
                            onContextMenu= {(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSelectedDriveItem(driveItem);
                                openDriveItemMenu(e); 
                                }
                            }
                            onDoubleClick = {(e) => {
                                e.stopPropagation();
                                elementDoubleClick(driveItem);
                            }}
                            className={`border-b border-[#DBDBDB]
                                ${selectedDriveItem?.id === driveItem.id ? "bg-blue-100" : "hover:bg-gray-100"}`}>
                            
                            <td className="py-3 px-2 text-sm font-medium">
                                {driveItem.type === "FOLDER" ? 
                                    <img src={folderIcon} alt="" className="inline-block h-[15px] w-[15px] mr-[5px] mb-[3px]" />
                                    : <img src={fileIcon} alt="" className="inline-block h-[18px] w-[15px] mr-[5px] mb-[3px]" />}
                                {driveItem.itemName}
                                {driveItem.extension === "UC" || driveItem.extension === null ? "" : `.${driveItem.extension}`}</td>
                            <td className="py-3 text-sm font-light">{formatDate(driveItem.createdDate)}</td>
                            <td className="py-3 text-sm font-light">
                                {driveItem.size === null ?
                                "--" : `${driveItem.size} B`}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            )}
        </div>
        
        {driveItemMenu.isOpen && selectedDriveItem && (
            <DriveItemMenuModal
            x={driveItemMenu.x}
            y={driveItemMenu.y}
            driveItem={selectedDriveItem}
            onClose={closeDriveItemMenu}
            />
        )}

        {tableMenu.isOpen && (
            <NewDriveItemModal
            x={tableMenu.x}
            y={tableMenu.y}
            onClose={closeTableMenu}
            currentFolderId={currentFolderId}
            />
        )}
    </>
    );
}

export default MyDriveList;

