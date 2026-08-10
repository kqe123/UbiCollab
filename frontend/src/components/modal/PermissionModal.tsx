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


function  PermissionModal ({
    driveItem,
    onClose
} : {
    driveItem : DriveItem,
    onClose : () => void;
}) { 

    const accessToken = localStorage.getItem("accessToken"); // accessToken (JWT) 불러오기
    const getSharedUser = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/permission/shared",
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
                onClick={(e) => {e.stopPropagation();}}>
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
                            권한 관리
                        </span>
                    </h1>
                </div>

                <div className="mt-8">
                    <h1 className="font-medium">현재 공유된 사용자</h1>
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
                                        {(sharedUser.type === "OWNER") ? (
                                            <p className="text-gray-400 mr-2">소유자</p>
                                        ) : (
                                            <p className="text-gray-400 mr-2">편집자</p>
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

export default PermissionModal;