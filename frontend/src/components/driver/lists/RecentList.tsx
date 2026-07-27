import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import fileIcon from "../../../assets/document.png";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DocumentMenuModal from "../../modal/DocumentMenuModal"
import ChangeNameMenu from "../../modal/ChangeNameMenu";
import type {DriveItem} from "../../../types/driveitem";

function RecentList() {
    // 상태(state)들
    const [selectedFile, setSelectedFile] = useState<DriveItem|null>(null); // 선택된 파일 자체
    const [fileMenu, setFileMenu] = useState({
        isOpen: false,
        x: 0,
        y: 0,
    }); 
    const [renameMenu, setRenameMenu] = useState<boolean>(false);
    const accessToken = localStorage.getItem("accessToken"); // accessToken (JWT) 불러오기
    
    // React Hook
    const navigate = useNavigate();

    // formatDate() : 날짜 가독성을 높여주는 함수
    const formatDate = (dateString : string) => {
        return new Date(dateString).toLocaleDateString("ko-KR");
    };

    // 우클릭 시 수행할 이벤트 함수
    const handleFileMenu = (e : React.MouseEvent) => {
        e.preventDefault();
        setFileMenu({
            isOpen: true,
            x: e.clientX,
            y: e.clientY,
        })
    }

    // 메뉴를 닫는 함수
    const closeFileMenu = () => {
        setFileMenu({...fileMenu, isOpen: false});
    }

    // 파일명 변경 메뉴 여는 함수
    const openRenameMenu = () => {
        setRenameMenu(true);
    }

    // 파일명 변경 메뉴 닫는 함수
    const closeRenameMenu = () => {
        setRenameMenu(false);
    }

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
            
        console.log("백엔드 응답:", response.data);

        return response.data;
    };

    // useQuery 실행
    const {
        data: files = [], // 백엔드에서 받아온 데이터
        isLoading,            // 현재 요청 중인지 여부
        isError,              // 요청이 실패했는지 여부
        error,                // 실패했을 때 오류 정보
    } = useQuery({
        queryKey: ["files"], // 서버 데이터를 해당 이름으로 관리
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

    // 문서가 0건일때 처리
    if (files.length === 0 ) {
        return <p className="mt-10">'+ 새 문서' 버튼을 사용하여 업로드하세요.</p>;
    }

    // 문서 리스트를 정상적으로 받아왔을 때
    return (
        <>
        <h1 className="text-2xl font-medium">최근 문서</h1>
        <table className="mt-10 w-full table-fixed text-left">
            <thead>
                <tr className="border-b border-[#DBDBDB]">
                    <td className="w-[50%] pb-3 text-sm ">이름</td>
                    <td className="w-[30%] pb-3 text-sm">생성 날짜</td>
                    <td className="w-[20%] pb-3 text-sm">파일 크기</td>
                </tr>
            </thead>

            <tbody>
                {[...files].sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()) // 생성 날짜 내림차순 정렬
                .map((file) => (
                    <tr key={file.id}
                        onClick= {() => setSelectedFile(file)}
                        onContextMenu= {(e) => {
                            setSelectedFile(file);
                            handleFileMenu(e); 
                            }
                        }
                        onDoubleClick = {() => navigate(`editor/${file.id}`)}
                        className={`border-b border-[#DBDBDB]
                            ${selectedFile?.id === file.id ? "bg-blue-100" : "hover:bg-gray-100"}`}>
                        
                        <td className="py-3 px-2 text-sm font-medium">
                            <img src={fileIcon} alt="" className="inline-block h-[18px] w-[15px] mr-[5px] mb-[3px]" />
                            {file.itemName}{file.extension && `.${file.extension}`}</td>
                        <td className="py-3 text-sm font-light">{formatDate(file.createdDate)}</td>
                        <td className="py-3 text-sm font-light">{file.size} B</td>
                    </tr>
                ))}
            </tbody>
        </table>

        {fileMenu.isOpen && selectedFile && (
            <DocumentMenuModal
            x={fileMenu.x}
            y={fileMenu.y}
            file={selectedFile}
            onClose={closeFileMenu}
            openRenameMenu={openRenameMenu}
        />
        )}

        {renameMenu && selectedFile && (
            <ChangeNameMenu 
            onClose={closeRenameMenu}
            file={selectedFile}
        />
        )}
    </>
    );
}

export default RecentList;