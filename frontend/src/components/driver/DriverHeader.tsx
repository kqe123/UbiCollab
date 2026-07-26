import logo from '../../assets/logo.jpg'
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function Header() {

    const navigate = useNavigate(); // navigate 훅
    const accessToken = localStorage.getItem("accessToken"); // accessToken (JWT) 불러오기

    // [+ 새 문서] 버튼 클릭 시 이벤트
    const createFile = async () => {
        const fileData = {
            itemName: "제목 없는 문서",
            type : "FILE",
            content: "",
            extension: "UC",
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

            console.log("문서 생성 성공:", response.data);
            navigate(`/editor/${response.data.id}`); // editor에게 documentId만 전달
        } catch (error : unknown) {
            // axios에서 발생한 오류인 경우
            if (axios.isAxiosError(error)) {
                console.error("백엔드 응답:", error.response?.data);
                toast.error(error.response?.data?.message ?? "문서 저장에 실패했습니다.");
            } 
            // 일반 오류인 경우
            else if (error instanceof Error) {
                console.error("일반 오류:", error.message);
                toast.error(error.message);
            } 
            // 그 외의 오류인 경우
            else {
                console.error("알 수 없는 오류:", error);
                toast.error("알 수 없는 오류가 발생했습니다.");
            }
        }
    }

    return (
        <header className="w-full h-[70px] bg-[#104FCD] flex items-center box-border px-6">
            {/* Logo */}
            <div className="flex items-center shrink-0">
                <img src={logo} alt="UbiCollab Logo" className="w-[170px] h-[40px] block" />
            </div>

            {/* Search */}
            <div className="flex-1 flex justify-center px-8">
                <input type="text" placeholder="문서 검색" className="w-full max-w-[600px] h-[42px]
                                                            px-4 border border-gray-300 rounded-lg
                                                            text-[15px] outline-none focus:border-indigo-500
                                                            focus:ring-4 focus:ring-indigo-200 bg-[#ffffff]"/>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-4 shrink-0">
                <button type="button" 
                        onClick={createFile}
                        className="h-10 px-[18px] rounded-lg bg-[#ffffff]
                                text-black text-sm font-semibold hover:bg-[#F6F6F6] cursor-pointer">
                    + 새 문서
                </button>

                <button type="button" className="w-12 h-12 rounded-full bg-[#ffffff] text-[13px]
                                                font-semibold overflow-hidden cursor-pointer">
                    프로필
                </button>
            </div>
        </header>
    );
}

export default Header;