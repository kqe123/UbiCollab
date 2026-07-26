import FilesList from "./FilesList"
function Directory() {
return (
    <>
        <div className="h-full min-h-[500px] rounded-[24px] bg-white p-6">
            <h1 className="text-2xl font-medium">내 문서</h1>   
            <FilesList />
        </div>
    </>
);
}

export default Directory;