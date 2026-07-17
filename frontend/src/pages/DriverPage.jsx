import Header from "../components/driver/DriverHeader.jsx";
import SideBar from "../components/driver/DriverSideBar.jsx";
import Directory from "../components/driver/Directory.jsx";
import DocumentList from "../components/driver/DocumentList.jsx"

function DriverPage() {
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
