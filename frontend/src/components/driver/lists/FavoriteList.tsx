import axios from "axios";
import toast from "react-hot-toast";
import fileIcon from "../../../assets/file.png";
import folderIcon from "../../../assets/folder.png";
import homeIcon from "../../../assets/home.png";
import backIcon from "../../../assets/back.png";
import noDriveImg from "../../../assets/empty-drive.png";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate, useParams, useOutletContext } from "react-router-dom";
import DriveItemMenuModal from "../../modal/DriveItemMenuModal"
import type {DriveItem} from "../../../types/driveitem";
import type { DirectoryOutletContext, MenuType} from "../Directory";

function FavoriteList() {
   // 상태(state)들
    const currentFolderId = useParams().folderId ?? null; // useParams()로 조회되는 파라미터가 없다면 null 처리

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
            navigate(`/drive/favorite/${driveItem.publicId}`);
        }
        else if (driveItem.type === "FILE") {
            navigate(`/editor/${driveItem.publicId}`);
        }
        else {
            toast.error("오류 : 해당 아이템의 타입을 알 수가 없습니다!")
        }
    }

    // 루트 디렉토리 이동 (홈버튼)
    const moveToRoot = (): void => {
        setSelectedDriveItem(null);
        navigate('/drive/favorite');
    };

    // 이전 디렉토리 이동 (뒤로가기 버튼)
    const moveToBack = () : void => {
        // 이전 디렉토리가 없다면 동작 X
        if (paths.length === 0) {
            return; 
        } 
        // paths 길이가 1이면 루트로 이동
        else if (paths.length === 1) 
            navigate('/drive/favorite');
        
        // paths 길이가 2이상일 때 이전 디렉토리로 이동
        else 
            navigate(`/drive/favorite/${paths[paths.length - 2].publicId}`); 

        setSelectedDriveItem(null); 
    };

  // 백엔드 api(즐겨찾기 디렉토리 조회)를 호출하는 비동기 함수
    const getFavorites = async () => {
        // 백엔드에 보낼 폴더 ID
        const DriveItemData = {
            parentPublicId: currentFolderId
        }

        // axios로 백엔드 api 호출
        const response = await axios.get(
            "http://localhost:8080/api/favorite",
            {   
                params: DriveItemData,
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );
        return response.data;
    };

    // 백엔드 api(현재 경로 조회)를 호출하는 비동기 함수
    const getDrivePath = async ()  => {
        const response = await axios.get(
            `http://localhost:8080/api/driveitem/path/${currentFolderId}`,
            {
                headers : {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        )
        console.log(response.data)
        return response.data;
    };

    // useQuery 실행 (첫 렌더링 시, queryKey가 변경될 시에 실행한다.)
    const {
        data: favorites = [], // 백엔드에서 받아온 데이터
        isLoading : isFavoritesLoading,    // 현재 요청 중인지 여부
        isError : isFavoritesError,        // 요청이 실패했는지 여부
        error : favoritesError,            // 실패했을 때 오류 정보
    } = useQuery({
        queryKey: ["driveItems", "favorite", currentFolderId], // 서버 데이터를 해당 이름으로 관리
        queryFn: getFavorites,   // getFavorites() 실행
    });

    // useQuery 실행 
    const {
        data: paths = [] , // 백엔드에서 받아온 데이터
        isLoading : isPathLoading,            // 현재 요청 중인지 여부
        isError : isPathError,              // 요청이 실패했는지 여부
        error : pathError,                // 실패했을 때 오류 정보
    } = useQuery({
        queryKey: ["driveItems","path", currentFolderId], // 서버 데이터를 해당 이름으로 관리
        queryFn: getDrivePath,   // getDrivePath() 실행
        enabled: currentFolderId !== null, // 루트 디렉터리에서는 경로 API를 실행하지 않음
    });
    

    // 로딩 처리
    if (isFavoritesLoading) {
        return (
        <>
            <h1 className="text-2xl font-medium">내 드라이브</h1>
            <p className="mt-10">문서를 불러오는 중입니다...</p>
        </>
        )
    }


    // 오류 처리
    if (isFavoritesError) {
        return (
        <>
            <h1 className="text-2xl font-medium ">즐겨찾기</h1>
            <p className="mt-10 text-red-500">문서를 불러오지 못했습니다: {favoritesError.message}</p>
        </>
        )
    }


    // 문서 리스트를 정상적으로 받아왔을 때
    return (
        <>
        <h1 className="text-2xl font-medium">즐겨찾기</h1>
        <div className="w-full h-full">
            <div className="flex mt-10">
                <button type="button" onClick={moveToRoot}
                    disabled={paths.length === 0}
                    className={`w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200
                        transition-colors
                        ${paths.length === 0
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-600 hover:bg-gray-100 cursor-pointer"
                        }`} title="홈">
                        <img src={homeIcon} alt="홈" className="w-8 h-8 rounded-xl"/>
                </button>
                <button type="button" onClick={moveToBack}
                    disabled={paths.length === 0}
                    className={`w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 mx-3
                        transition-colors
                        ${paths.length === 0
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-600 hover:bg-gray-100 cursor-pointer"
                        }`} title="뒤로가기">
                        <img src={backIcon} alt="뒤로가기" className="w-8 h-8 rounded-xl"/>
                </button>
                <div className="w-[50%] h-8 p-[6px] bg-[#F0F2FA] flex rounded-xl">
                    <span className="text-sm">
                        즐겨찾기 / {[...paths].map((path) => path.itemName).join(" / ")}
                    </span>
                
            </div>
            </div>
            {/* 폴더/파일이 0건일때 예외처리 */}    
            {[...favorites].filter((favorite) => favorite.isInTrash === false).length === 0 ? (
                <>
                    <img src={noDriveImg} className="w-[40%] h-[40%] mx-auto mt-10"></img>
                    <h1 className="mt-5 text-center text-2xl">
                        즐겨찾기에 등록한 항목이 없습니다!
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
                    {[...favorites].filter((favorite) => favorite.isInTrash === false)
                    .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()) // 생성 날짜 내림차순 정렬
                    .map((favorite) => (
                        <tr key={favorite.id}
                            onClick= {() => setSelectedDriveItem(favorite)}
                            onContextMenu= {(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSelectedDriveItem(favorite);
                                openDriveItemMenu(e); 
                                }
                            }
                            onDoubleClick = {(e) => {
                                e.stopPropagation();
                                elementDoubleClick(favorite);
                            }}
                            className={`border-b border-[#DBDBDB]
                                ${selectedDriveItem?.id === favorite.id ? "bg-blue-100" : "hover:bg-gray-100"}`}>
                            
                            <td className="py-3 px-2 text-sm font-medium">
                                {favorite.type === "FOLDER" ? 
                                    <img src={folderIcon} alt="" className="inline-block h-[15px] w-[15px] mr-[5px] mb-[3px]" />
                                    : <img src={fileIcon} alt="" className="inline-block h-[18px] w-[15px] mr-[5px] mb-[3px]" />}
                                {favorite.itemName}
                                {favorite.extension === "UC" || favorite.extension === null ? "" : `.${favorite.extension}`}</td>
                            <td className="py-3 text-sm font-light">{formatDate(favorite.createdDate)}</td>
                            <td className="py-3 text-sm font-light">
                                {favorite.size === null ?
                                "--" : `${favorite.size} Byte`}</td>
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
    </>
    );
}

export default FavoriteList;