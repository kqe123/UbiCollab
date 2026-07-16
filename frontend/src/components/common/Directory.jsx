
function Directory() {
return (
    <>
        <div className="h-full min-h-[500px] rounded-[24px] bg-white p-6">
            <h1 className="text-2xl font-medium">내 문서</h1>   
            <table className="w-full mt-10 text-left">
                <tr className="border-b border-[#DBDBDB] font-medium">
                    <td className="w-6/10 pb-3 text-sm">이름</td>
                    <td className="w-1/5 pb-3 text-sm">수정 날짜</td>
                    <td className="w-1/5 pb-3 text-sm">파일 크기</td>
                    <td></td>
                </tr>
            </table>
        </div>
    </>
);
}

export default Directory;