import type { Announcement }  from '../types/announcement.ts';
import client from './client';


// [공지] 공지 목록 불러오는 API 호출
export const getAnnouncements = async (fileId: string): Promise<Announcement[]> => {
    const response = await client.get(`/announcement/${fileId}`)
    return response.data;
};

// [공지] 공지 추가 API 호출 
export const createAnnouncement = async (fileId : string, title : string, content : string) : Promise<string> => {
    // 공지 데이터
    const announcementData = {
        fileId : fileId,
        title : title,
        content : content,
    }

    const response = await client.post("/announcement/create",announcementData);
    return response.data;
};