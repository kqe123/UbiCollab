import Header from "../components/driver/DriverHeader.tsx";
import SideBar from "../components/driver/DriverSideBar.tsx";
import Directory from "../components/driver/Directory.tsx";

function DriverPage() {
	const accessToken = localStorage.getItem("accessToken");
	if (accessToken) {
		const payload = JSON.parse(atob(accessToken.split(".")[1]));
		console.log(new Date(payload.exp * 1000));
	}
	return (
		<>
			<div className="flex flex-col min-h-screen">
				<Header />
				<div className="flex flex-1 bg-[#F9F9FA]">
					<SideBar />
					<div className="min-w-0 flex-1 p-3">
						<Directory />
						
					</div>
				</div>
			</div>
		</>
	);
}

export default DriverPage;
