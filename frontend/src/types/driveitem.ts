export type DriveItem = {
    publicId : string;
    itemName: string;
    type : "FILE" | "FOLDER";

    parentId : string | null;
    userId : string;

    content: string|null;
    extension: string|null;
    size: number|null;

    createdDate: string;
    isInTrash : boolean;
    isFavorite : boolean;
};

