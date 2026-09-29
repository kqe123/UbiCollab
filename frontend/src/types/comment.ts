export type Comment = {
    commentId : string;
    parentId : string | null;
    anchorType: "TEXT" | "IMAGE" | null;
    fileId : string;
    nickname : string;
    profileUrl : string | null;
    content: string;
    createdDate: string;
};