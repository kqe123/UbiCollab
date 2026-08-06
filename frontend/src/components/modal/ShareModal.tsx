import axios from "axios";
import toast from "react-hot-toast";
import type {DriveItem} from "../../types/driveitem";
import type {User} from "../../types/user";
import fileIcon from "../../assets/file.png";
import folderIcon from "../../assets/folder.png";
import defaultProfileIcon from "../../assets/profile-default.png";
import {useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

function  ShareModal ({
    driveItem,
    onClose
} : {
    driveItem : DriveItem,
    onClose : () => void;
}) { 

    const [text, setText] = useState<string>(""); // 입력값
    const [users, setUsers] = useState<User[]>([]); // 검색 결과 유저들
    const [isUserListOpen, setIsUserListOpen] = useState(false);
    const accessToken = localStorage.getItem("accessToken"); // accessToken (JWT) 불러오기

    useEffect(() => {
        const keyword = text.trim();

        if (keyword.length === 0) {
            setUsers([]);
            return;
        }

        // setTimeout() : window 객체 메서드 (0.3초 뒤에 1회 실행)
        const timer = setTimeout(async () => {
            try {
                const response = await axios.get<User[]>(
                    `http://localhost:8080/api/user/search`,
                    {
                        params: {
                            keyword: keyword,
                        },
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    }
                );

                setUsers(response.data);
            } catch (error) {
                console.error("사용자 검색 실패:", error);
                setUsers([]);
            }
        }, 300);

        // cleanup 함수
        return () => clearTimeout(timer);
    }, [text]);
    
    const getSharedUser = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/user/shared",
                {   
                    params: {
                        publicId: driveItem.publicId
                    },
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            )
            console.log("공유 사용자 불러오기 성공");
            return response.data;
        } catch (error: unknown) {
            console.error("공유 사용자 불러오기 실패 : ", error);
            // axios에서 발생한 오류인 경우
            if (axios.isAxiosError(error)) {
                console.error("백엔드 응답:", error.response?.data);
                toast.error(error.response?.data?.message ?? "공유 사용자 불러오기에 실패했습니다.");
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

    const {
        data : sharedUsers = [],
        isLoading : isLoading,            // 현재 요청 중인지 여부
        isError : isError,              // 요청이 실패했는지 여부
        error : Error,                // 실패했을 때 오류 정보
    } = useQuery({
        queryKey : ["users"],
        queryFn : getSharedUser,
    })
    
    return ( 
    <>  
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={onClose}>
            {/* 모달창 */}
            <div className=" w-[500px] min-h-[500px] rounded-2xl bg-white p-6 shadow-xl"
                onClick={(e) => {
                    e.stopPropagation();
                    setIsUserListOpen(false);
                }}>
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-medium">
                        {driveItem.type === "FOLDER" ? 
                        <img src={folderIcon} alt="" className="inline-block h-[15px] w-[15px] mr-[5px] mb-[3px]" />
                        : <img src={fileIcon} alt="" className="inline-block h-[18px] w-[15px] mr-[5px] mb-[3px]" />}
                        <span>
                            {driveItem.itemName}
                            {driveItem.extension === "UC" || driveItem.extension === null ? "" : `.${driveItem.extension}`}
                        </span>
                        <span className="ml-1">
                            공유
                        </span>
                    </h1>
                </div>
                <div className="relative"
                    onClick={(e) => e.stopPropagation()}>
                    <label className="block mt-6 text-purple-600 text-xs text-">공유 대상</label>
                    {/* 입력창 */}
                    <input type="text" 
                        onChange = {(e) => {
                            setText(e.target.value);
                            setIsUserListOpen(true);}}
                        onFocus={() => {
                            setIsUserListOpen(true);}}
                        className="h-11 w-full mt-1 rounded-xl
                        border-[1.5px] border-sky-400 px-4 text-lg
                        outline-none transition focus:border-blue-500" />
                    {/* 사용자 목록 */}
                    {isUserListOpen && text !== "" &&  users.length > 0 && (
                        <div className="absolute left-0 top-full z-50 
                            w-full max-h-[180px] rounded-2xl bg-white shadow-xl overflow-y-auto">
                            {users.map((user) => (
                                <div key={user.id}
                                    className="h-15 hover:bg-gray-100 flex items-center text-sm p-4 cursor-pointer">
                                    {user.profileImageKey === null ? 
                                    (<img src={defaultProfileIcon} className="w-8 h-8 rounded-full bg-[#ffffff] overflow-hidden"></img>)
                                    : (<img src={user.profileImageKey} className="w-8 h-8 rounded-full bg-[#ffffff] overflow-hidden"></img>)
                                    }
                                    <div className="flex-col ml-4">
                                        <p className="font-medium">{user.nickname}</p>
                                        <p className="text-gray-500">{user.username}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-4">
                    <h1 className="font-medium">현재 공유된 사용자</h1>
                    {sharedUsers.length > 0 && (
                        <div className="w-full max-h-[180px] bg-white overflow-y-auto mt-2">
                            {sharedUsers.map((sharedUser : User) => (
                                <div key={sharedUser.id}
                                    className="h-12 hover:bg-gray-100 flex items-center text-sm">
                                    {sharedUser.profileImageKey === null ? 
                                    (<img src={defaultProfileIcon} className="w-8 h-8 rounded-full ml-2"></img>)
                                    : (<img src={sharedUser.profileImageKey} className="w-8 h-8 rounded-full ml-2"></img>)
                                    }
                                    <div className="flex-col ml-4">
                                        <p className="font-medium">{sharedUser.nickname}</p>
                                        <p className="text-gray-500">{sharedUser.username}</p>
                                    </div>
                                    <div className="ml-auto">
                                        {(sharedUser.id === driveItem.userId) ? (
                                            <p className="text-gray-400 mr-2">소유자</p>
                                        ) : (
                                            <p className="text-gray-400 mr-2">소유자</p>
                                        )
                                        }
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>



                {/* 버튼 */}
                <div className="mt-8 flex justify-end gap-3">
                    <button
                        type="button"
                        className="rounded-lg bg-blue-600 px-5
                        py-2.5 text-base font-medium text-white
                        transition hover:bg-blue-700 active:scale-95">
                        완료
                    </button>
                </div>
            </div>
        </div>
    </>
    )
}

export default ShareModal;