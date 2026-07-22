export type Document = {
    id: number;
    fileName: string;
    content: string;
    extension: string;
    createdDate: string;
    fileSize: number;
    isInTrash : boolean;
};