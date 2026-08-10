import axios from "axios";
import fileIcon from "../../../assets/file.png";
import noFilesImg from "../../../assets/empty-files.png";
import DocumentMenuModal from "../../modal/DriveItemMenuModal"
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useOutletContext } from "react-router-dom";
import type { DirectoryOutletContext } from "../Directory";


function RecentList() {
    // 상태(state)들
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

    // 백엔드 api를 호출하는 함수
    const getFiles = async () => {
        // axios로 백엔드 api 호출
        const response = await axios.get(
            "http://localhost:8080/api/driveitem/files",
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );
        return response.data;
    };

    // useQuery 실행
    const {
        data: files = [], // 백엔드에서 받아온 데이터
        isLoading,            // 현재 요청 중인지 여부
        isError,              // 요청이 실패했는지 여부
        error,                // 실패했을 때 오류 정보
    } = useQuery({
        queryKey: ["driveItems", "recent"], // 서버 데이터를 해당 이름으로 관리
        queryFn: getFiles,   // getDocuments() 실행
    });



    // 로딩 처리
    if (isLoading) {
        return <p className="mt-10">문서를 불러오는 중입니다...</p>
    }

    // 오류 처리
    if (isError) {
        return (
            <p className="mt-10 text-red-500">
                문서를 불러오지 못했습니다: {error.message}
            </p>
        );
    }

    // 문서 리스트를 정상적으로 받아왔을 때
    return (
        <>
        <h1 className="text-2xl font-medium">최근 문서</h1>
        {[...files].filter((file) => file.isInTrash === false).length === 0 ? (
                <>
                    <img src={noFilesImg} className="w-[40%] h-[40%] mx-auto mt-10"></img>
                    <h1 className="mt-5 text-center text-2xl">
                        최근에 생성한 파일이 없습니다!
                    </h1>
                    <h2 className="mt-5 text-center">
                        내 드라이브에서 [우클릭] - [새 파일 만들기]를 누르거나 <br></br>
                        우측 상단의 [+ 새 파일] 버튼을 눌러주세요.
                    </h2>
                </>
        ) : (
        <div>
        <table className="mt-10 w-full table-fixed text-left">
            <thead>
                <tr className="border-b border-[#DBDBDB]">
                    <td className="w-[50%] pb-3 text-sm ">이름</td>
                    <td className="w-[30%] pb-3 text-sm">생성 시각</td>
                    <td className="w-[20%] pb-3 text-sm">파일 크기</td>
                </tr>
            </thead>

            <tbody>
                {[...files].filter((driveItem) => driveItem.isInTrash === false)
                .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()) // 생성 날짜 내림차순 정렬
                .map((file) => (
                    <tr key={file.id}
                        onClick= {() => setSelectedDriveItem(file)}
                        onContextMenu= {(e) => {
                            setSelectedDriveItem(file);
                            openDriveItemMenu(e); 
                            }
                        }
                        onDoubleClick = {() => navigate(`/editor/${file.publicId}`)}
                        className={`border-b border-[#DBDBDB]
                            ${selectedDriveItem?.id === file.id ? "bg-blue-100" : "hover:bg-gray-100"}`}>
                        
                        <td className="py-3 px-2 text-sm font-medium">
                            <img src={fileIcon} alt="" className="inline-block h-[18px] w-[15px] mr-[5px] mb-[3px]" />
                            {file.itemName}
                            {file.extension === "UC" || file.extension === null ? "" : `.${file.extension}`}
                            {file.isFavorite === true && " ★"}</td>
                        <td className="py-3 text-sm font-light">{formatDate(file.createdDate)}</td>
                        <td className="py-3 text-sm font-light">{file.size} B</td>
                    </tr>
                ))}
            </tbody>
        </table>
        </div>
    )}
        {driveItemMenu.isOpen && selectedDriveItem && (
            <DocumentMenuModal
            x={driveItemMenu.x}
            y={driveItemMenu.y}
            driveItem={selectedDriveItem}
            onClose={closeDriveItemMenu}
            />
        )}
    </>
    );
}

export default RecentList;