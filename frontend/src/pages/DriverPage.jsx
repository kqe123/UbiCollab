import Header from "../components/common/Header.jsx";
import SideBar from "../components/common/SideBar.jsx";
function DriverPage() {
	return (
		<>
			<div className="flex flex-col min-h-screen">
				<Header />
				<div className="flex flex-1">
					<SideBar />
				</div>
			</div>
		</>
	);
}

export default DriverPage;
