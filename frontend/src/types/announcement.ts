export type Announcement = {
    announcementId : string; 
    fileId : string;
    userId : string;
    nickname : string;
    profileUrl : string | null;
    title : string;
    content: string;
    createdDate: string;
    isUpdated : boolean;
};