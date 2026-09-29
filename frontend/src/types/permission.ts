export type permission = {
    userId : string;
    username: string;
    nickname : string;
    profileUri: string | null;
    driveItemId : string;
    type : string;
    isOwner: boolean;
};