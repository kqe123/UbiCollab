export type DriveItem = {
    publicId : string;
    itemName: string;
    itemType : "FILE" | "FOLDER";

    parentId : string | null;
    userId : string;

    content: string|null;
    extension: string|null;
    size: number|null;

    createdDate: string;
    isInTrash : boolean;
    isFavorite : boolean;
    permissionType : "VIEWER" | "COMMENTOR" | "EDITOR" | "MANAGER" | null;
    isOwner: boolean;
};

