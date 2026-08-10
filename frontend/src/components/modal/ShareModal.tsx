import axios from "axios";
import toast from "react-hot-toast";
import type {DriveItem} from "../../types/driveitem";
import type {User} from "../../types/user";
import type {sharedUser} from "../../types/sharedUser";
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
    const [sharedUsers, setSharedUsers] = useState<sharedUser[]>([]); // 공유 대상에 추가한 유저들
    const [isUserListOpen, setIsUserListOpen] = useState(false); // 자동완성 열림/닫힘
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
                            publicId : driveItem.publicId
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
                    {/* 자동완성 사용자 목록 */}
                    {isUserListOpen && text !== "" &&  users.length > 0 && (
                        <div className="absolute left-0 top-full z-50 
                            w-full max-h-[180px] rounded-2xl bg-white shadow-xl overflow-y-auto">
                            {users.map((user) => (
                                <div key={user.id}
                                    className="h-15 hover:bg-gray-100 flex items-center text-sm p-4 cursor-pointer"
                                    onClick={() => {
                                        // 선택한 사용자가 이미 중복 선택된 경우 예외처리
                                        const isDuplicate = sharedUsers.some(
                                            (sharedUser) => sharedUser.id === user.id
                                        );

                                        if (isDuplicate) {
                                            toast.error("이미 공유할 사용자 목록에 추가된 사용자입니다.");
                                            return;
                                        }

                                        // 중복 선택이 아니면 sharedUsers에 추가
                                        setSharedUsers((prev) => [
                                            ...prev,
                                            {
                                                id: user.id,
                                                username: user.username,
                                                nickname: user.nickname,
                                                profileImageKey: user.profileImageKey,
                                                type: "VIEWER",
                                            }
                                        ])

                                        setIsUserListOpen(false);
                                        }
                                    }>
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
                
                {/* 추가된 공유 사용자들 목록 */}
                <div className="mt-4">
                    <h1 className="font-medium">추가된 공유 사용자</h1>
                    {sharedUsers.length > 0 && (
                        <div className="w-full max-h-[300px] bg-white overflow-y-auto mt-2">
                            {sharedUsers.map((sharedUser : sharedUser) => (
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
                                        <select value={sharedUser.type}
                                            className="rounded-lg border border-gray-300 bg-white px-1 py-1 text-sm
                                            outline-none transition
                                            hover:border-blue-400
                                            focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                            onChange={(e) => {
                                                setSharedUsers((prev) =>
                                                    prev.map((user) =>
                                                        user.id === sharedUser.id
                                                            ? {
                                                                ...user,
                                                                type: e.target.value,
                                                            }
                                                            : user
                                                    )
                                                );
                                            }}>
                                            <option value="VIEWER">뷰어</option>
                                            <option value="COMMENTOR">댓글 작성자</option>
                                            <option value="EDITOR">편집자</option>
                                            <option value="MANAGER">관리자</option>
                                        </select>
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