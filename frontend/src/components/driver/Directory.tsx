import { Outlet } from "react-router-dom";

function Directory() {
    return (
        <div className="h-full min-h-[500px] rounded-[24px] bg-white p-6">
            <Outlet />
        </div>
    );
}

export default Directory;