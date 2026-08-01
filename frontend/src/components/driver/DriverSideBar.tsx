import { NavLink } from "react-router-dom";
function DriverSideBar() {

    const getButtonStyle = ({ isActive }: { isActive: boolean }) => {
        return `w-full cursor-pointer rounded-[10px] border-none px-3 py-3 
                text-left font-semibold hover:bg-[#dfe8f5]
                ${isActive
                ? "bg-[#C2E7FF] text-[#104FCD]"
                : "bg-transparent hover:bg-[#E6EFF5]"
                }`;
    };
return ( 
    <aside className="w-60 shrink-0 box-border bg-[#F9F9FA] px-4 py-5 ">
        <nav className="mt-6 flex flex-col gap-2"> 
            <NavLink to="/drive/my-drive" className={getButtonStyle}>내 드라이브</NavLink>
            <NavLink to="/drive/recent" className={getButtonStyle}>최근 문서</NavLink>
            <NavLink to="/drive/favorite" className={getButtonStyle}>즐겨찾기</NavLink>
            <NavLink to="/drive/shared" className={getButtonStyle}>공유 문서</NavLink>
            <NavLink to="/drive/trash" className={getButtonStyle}>휴지통</NavLink>
        </nav>
    </aside>
);
}

export default DriverSideBar;
