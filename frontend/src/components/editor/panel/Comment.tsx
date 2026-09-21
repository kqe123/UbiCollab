function Comment ({
    sidePanel,
    setSidePanel,
} : { 
    sidePanel : "NONE" | "COMMENT" | "NOTICE";
    setSidePanel : React.Dispatch<React.SetStateAction<"NONE" | "COMMENT" | "NOTICE">>;
}) {

    return (
        <>
        {sidePanel}
        </>
    );
}
export default Comment;