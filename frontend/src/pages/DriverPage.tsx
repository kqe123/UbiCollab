import Header from "../components/driver/DriverHeader.tsx";
import SideBar from "../components/driver/DriverSideBar.tsx";
import Directory from "../components/driver/Directory.tsx";
import { useAuth } from "../auth/AuthContext";

function DriverPage() {
	// 토큰을 메모리에 제대로 저장했는지 확인
	const { accessToken } = useAuth();
	console.log(accessToken);
	
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
