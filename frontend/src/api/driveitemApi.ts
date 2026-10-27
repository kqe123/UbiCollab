import type { DriveItem }  from '../types/driveitem.ts';
import client from './client';

// [내 드라이브] 내 드라이브 목록을 가져오는 API 호출
export const getDriveItems = async (currentFolderId: string | null): Promise<DriveItem[]> => {
    const response = await client.get<DriveItem[]>("/driveitem/driveitems",
        { params: { parentPublicId: currentFolderId }}
    );
    return response.data;
} 


// [내 드라이브] 현재 내 드라이브 경로를 가져오는 API 호출
export const getDrivePath = async (currentFolderId: string): Promise<DriveItem[]> => {
    const response = await client.get(`/driveitem/path/${currentFolderId}`)
    return response.data;
};


// [내 문서] 내 문서 목록을 가져오는 API 호출
export const getFiles = async () : Promise<DriveItem[]> => {
    const response = await client.get("/driveitem/files");
    return response.data;
};

// [즐겨찾기] 즐겨찾기 목록을 가져오는 API 호출
export const getFavorites = async (currentFolderId : string | null): Promise<DriveItem[]> => {
    const response = await client.get("/favorite", { params: {foldId: currentFolderId} });
    return response.data;
};

// [즐겨찾기] 현재 즐겨찾기 경로를 가져오는 API 호출
export const getFavoritePath = async (currentFolderId : string | null): Promise<DriveItem[]>  => {
    const response = await client.get(`/favorite/path/${currentFolderId}`)
    return response.data;
};

// [공유 문서] 공유 문서 목록을 가져오는 API 호출
export const getSharedItems = async (currentFolderId : string | null): Promise<DriveItem[]> => {
    const response = await client.get("/permission/sharedItems",{ params: { parentId: currentFolderId }});
    return response.data;
}

// [공유 문서] 현재 공유 문서 경로를 가져오는 API 호출
export const getSharedPath = async (currentFolderId : string | null): Promise<DriveItem[]> => {
    const response = await client.get(`/permission/path/${currentFolderId}`)
    return response.data;    
};

// [휴지통] 휴지통 목록을 가져오는 API 호출
export const getTrashs = async (): Promise<DriveItem[]> => {
    const response = await client.get("/driveitem/trash");
    return response.data;
};

// [편집기] 편집화면에 로드할 파일 하나 가져오는 API 호출
export const getFile = async (fileId : string | null) => {
    const response = await client.get(`/driveitem/files/${fileId}`);
    return response.data;
};

// [테이블 메뉴] 새 파일 생성 API 호출
export const createFile = async (currentFolderId : string | null) => {
    const fileData = {
        itemName: "제목 없는 문서",
        type : "FILE",
        content: "",
        extension: "UC",
        parentPublicId : currentFolderId
    };
    const response = await client.post("/driveitem/create",fileData);
    return response.data;
}

// [테이블 메뉴] 새 폴더 생성 API 호출
export const createFolder = async (currentFolderId : string | null) => {
    const folderData = {
        itemName: "새 폴더",
        type : "FOLDER",
        parentPublicId : currentFolderId
    };
        
    const response = await client.post("/driveitem/create",folderData);
    return response.data;
}

// [아이템 메뉴] 폴더/파일명 변경 API 호출
export const changeName = async (trimmedItemName : string, driveItemId : string) => {
    const driveItemData = {
        itemName: trimmedItemName 
    };
    const response = await client.patch(`/driveitem/name-change/${driveItemId}`,driveItemData);
    return response.data;
};

// [아이템 메뉴] 폴더/파일 이동 API 호출
export const moveDriveItem = async ( parentId : string|null , driveItemId : string) => {
    const driveItemData = {
        parentId: parentId 
    };
    const response = await client.patch(`/driveitem/move/${driveItemId}`, driveItemData);
    return response.data;
};

// [아이템 메뉴] 즐겨찾기 추가 API 호출
export const createFavorite = async (driveItemId : string) => {
    const response = await client.post(`/favorite/create/${driveItemId}`,null);
    return response.data;   
}

// [아이템 메뉴] 즐겨찾기 해제 API 호출
export const deleteFavorite = async (driveItemId : string) => {
    const response = await client.delete(`/favorite/delete/${driveItemId}`);
    return response.data;
}

// [아이템 메뉴] 휴지통으로 보내기 API 호출 
export const throwTrash = async (driveItemId : string) => {
    const response = await client.patch(`/driveitem/trash/${driveItemId}`, null);
    return response.data;
}

// [휴지통] 폴더/파일 복원 API 호출 
export const restoreTrash = async (driveItemId : string) => {
    const response = await client.patch(`/driveitem/restore/${driveItemId}`,null);
    return response.data;
}

// "영구 삭제" 함수
export const deleteTrash = async (driveItemId : string) => {
    const response = await client.delete(`/driveitem/delete/${driveItemId}`);
    return response.data;
}

// [편집기] 문서 저장 API 호출 (변경된 항목만 body에 담아서 보냄)
export const saveFile = async (fileId : string, contentData : { content : string }) => {
    const response = await client.patch(`/driveitem/save/${fileId}`, contentData);
    return response.data;
}

