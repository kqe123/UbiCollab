import type { permission } from '../types/permission.ts';
import client from './client';

// [권한 관리] 현재 공유된 사용자 목록 불러오는 API 호출
export const getPermissions = async (driveItemId : string) => {
    const response = await client.get("/permission/sharedUser",{params: {publicId: driveItemId}})
    return response.data;
}

// [권한 관리] 변경된 사용자들의 권한 업데이트 API 호출 (업데이트된 인원 수 반환)
export const updatePermission = async (currentItemId : string, updateUsers : permission[]) : Promise<number> => {
    const response = await client.patch("/permission/update",
        {
            currentItemId: currentItemId,
            permissionList: updateUsers.map((permission : permission) => ({
                driveItemId : permission.driveItemId,
                userId: permission.userId,
                type: permission.type,
            })),
        }
    );
    return response.data;
}

// [권한 관리] 해당 사용자의 권한 삭제 API 호출
export const deletePermission = async (userId : string, driveItemId : string) => {
    const response = await client.delete(`/permission/delete/${userId}/${driveItemId}`);
    return response.data;
}

// [공유 추가] 공유 추가 API 호출
export const shareDriveItem = async (driveItemId : string, sharedUsers : permission[]) => {
    const response = await client.post("/permission/create",
        {
            driveItemId: driveItemId,
            userList: sharedUsers.map((user) => ({
                userId: user.userId,
                type: user.type,
            })),
        },
    );
    return response.data;
}
