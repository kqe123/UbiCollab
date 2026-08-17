export type DriveItem = {
    publicId : string;
    itemName: string;
    type : "FILE" | "FOLDER";

    parentId : number | null;
    userId : number;

    content: string|null;
    extension: string|null;
    size: number|null;

    createdDate: string;
    isInTrash : boolean;
    isFavorite : boolean;
};

