import type { Comment }  from '../types/comment.ts';
import client from './client';


// [댓글] 댓글 목록 불러오기 API 호출 
export const getComments = async (fileId: string): Promise<Comment[]> => {
    const response = await client.get(`/comment/${fileId}`);
    return response.data;
};

// [댓글] 댓글 생성 API 호출 
export const createComment = async (fileId : string, newContent : string) => {
    // 댓글 데이터
    const commentData = {
        parentId : null, 
        anchorType : null,
        fileId : fileId,
        content : newContent,
    }

    const response = await client.post("/comment/create",commentData);
    return response.data;        
};

// [댓글] 답글 생성 API 호출
export const createReply = async (parentId : string, fileId : string, content : string) => {
    // 답글 데이터
    const replyData = {
        parentId : parentId, 
        anchorType : null,
        fileId : fileId,
        content : content,
    }

    const response = await client.post("/comment/create", replyData);
    return response.data;
};

// [댓글] 댓글/답글 수정 API 호출
export const updateComment = async (editCommentId : string | null, editContent : string) => {
    const response =  await client.patch(`/comment/update/${editCommentId}`,{ content : editContent });
    return response.data;
};

// [댓글] 댓글/답글 삭제 API 호출 
export const deleteComment = async (commentId : string) => {
    const response = await client.delete(`/comment/delete/${commentId}`);
    return response.data;
};