import axios from "axios";
import toast from "react-hot-toast";
import fileIcon from "../../../assets/file.png";
import folderIcon from "../../../assets/folder.png";
import noTrashImg from "../../../assets/empty-trash.png";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams, useOutletContext } from "react-router-dom";
import TrashMenuModal from "../../modal/TrashMenuModal"
import type {DriveItem} from "../../../types/driveitem";
import type { DirectoryOutletContext} from "../Directory";

function TrashList() {
  // 상태(state)들
    const currentFolderId = useParams().folderId ?? null; // useParams()로 조회되는 파라미터가 없다면 null 처리
    const {
        selectedDriveItem, 
        setSelectedDriveItem,
        driveItemMenu,
        openDriveItemMenu,
        closeDriveItemMenu,
        formatDate
    } = useOutletContext<DirectoryOutletContext>();

    const accessToken = localStorage.getItem("accessToken"); // accessToken (JWT) 불러오기
    const navigate = useNavigate();

    // 요소 더블클릭 시 발생하는 이벤트 함수
    const elementDoubleClick = (driveItem: DriveItem): void => {
        if (driveItem.type === "FOLDER") {
            navigate(`/drive/my-drive/${driveItem.publicId}`);
        }
        else if (driveItem.type === "FILE") {
            navigate(`/editor/${driveItem.publicId}`);
        }
        else {
            toast.error("오류 : 해당 아이템의 타입을 알 수가 없습니다!")
        }
    }


    // 백엔드 api(휴지통 조회)를 호출하는 비동기 함수
    const getDriveItems = async () => {
        // 백엔드에 보낼 폴더 ID
        const DriveItemData = {
            parentPublicId: currentFolderId
        }

        // axios로 백엔드 api 호출
        const response = await axios.get(
            "http://localhost:8080/api/driveitem/trash",
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
        isLoading : isDriveItemsLoading,    // 현재 요청 중인지 여부
        isError : isDriveItemsError,        // 요청이 실패했는지 여부
        error : driveItemsError,            // 실패했을 때 오류 정보
    } = useQuery({
        queryKey: ["driveItems","trash" ,currentFolderId], // 서버 데이터를 해당 이름으로 관리
        queryFn: getDriveItems,   // getDriveItems() 실행
    });

    // 로딩 처리
    if (isDriveItemsLoading) {
        return (
        <>
            <h1 className="text-2xl font-medium">내 드라이브</h1>
            <p className="mt-10">문서를 불러오는 중입니다...</p>
        </>
        )
    }


    // 오류 처리
    if (isDriveItemsError) {
        return (
        <>
            <h1 className="text-2xl font-medium ">내 드라이브</h1>
            <p className="mt-10 text-red-500">문서를 불러오지 못했습니다: {driveItemsError.message}</p>
        </>
        )
    }


    // 문서 리스트를 정상적으로 받아왔을 때
    return (
        <>
        <h1 className="text-2xl font-medium">휴지통</h1>
        <div className="w-full h-full" >
            {/* 폴더/파일이 0건일때 예외처리 */}    
            {[...driveItems].filter((driveItem) => driveItem.isInTrash === true).length === 0 ? (
                <>
                    <img src={noTrashImg} className="w-[40%] h-[40%] mx-auto mt-10"></img>
                    <h1 className="mt-5 text-center text-2xl">
                        휴지통이 비어 있음
                    </h1>
                </>
            ) : (
            <table className="mt-10 w-full table-fixed text-left">
                <thead>
                    <tr className="border-b border-[#DBDBDB]">
                        <td className="w-[50%] pb-3 text-sm ">이름</td>
                        <td className="w-[30%] pb-3 text-sm">생성 일자</td>
                        <td className="w-[20%] pb-3 text-sm">파일 크기</td>
                    </tr>
                </thead>

                <tbody>
                    {[...driveItems].filter((driveItem) => driveItem.isInTrash === true)
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
                            }}
                            className={`border-b border-[#DBDBDB]
                                ${selectedDriveItem?.id === driveItem.id ? "bg-blue-100" : "hover:bg-gray-100"}`}>
                            
                            <td className="py-3 px-2 text-sm font-medium">
                                {driveItem.type === "FOLDER" ? 
                                    <img src={folderIcon} alt="" className="inline-block h-[15px] w-[15px] mr-[5px] mb-[3px]" />
                                    : <img src={fileIcon} alt="" className="inline-block h-[18px] w-[15px] mr-[5px] mb-[3px]" />}
                                {driveItem.itemName}
                                {driveItem.extension === "UC" || driveItem.extension === null ? "" : `.${driveItem.extension}`}
                                {driveItem.isFavorite === true && " ★"}</td>
                            <td className="py-3 text-sm font-light">{formatDate(driveItem.createdDate)}</td>
                            <td className="py-3 text-sm font-light">
                                {driveItem.size === null ?
                                "--" : `${driveItem.size} Byte`}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            )}
        </div>
        
        {driveItemMenu.isOpen && selectedDriveItem && (
            <TrashMenuModal
            x={driveItemMenu.x}
            y={driveItemMenu.y}
            driveItem={selectedDriveItem}
            onClose={closeDriveItemMenu}
            />
        )}
    </>
    );
}

export default TrashList;