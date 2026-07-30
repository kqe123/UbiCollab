export type DriveItem = {
    id: number;
    publicId : string;
    itemName: string;
    type : "FILE" | "FOLDER";

    parentId : number | null;
    userId : number ;

    content: string|null;
    extension: string|null;
    size: number|null;

    createdDate: string;
    isInTrash : boolean;
};