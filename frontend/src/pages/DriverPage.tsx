import DriverHeader from "../components/driver/DriverHeader.tsx";
import DriverSideBar from "../components/driver/DriverSideBar.tsx";
import Directory from "../components/driver/Directory.tsx";
import Box from '@mui/material/Box';

function DriverPage() {
	const accessToken = localStorage.getItem("accessToken");
	if (accessToken) {
		const payload = JSON.parse(atob(accessToken.split(".")[1]));
		console.log(new Date(payload.exp * 1000));
	}


	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
			<DriverHeader />
			<Box sx={{ display: 'flex', flex: 1, bgcolor: '#F9F9FA' }}>
				<DriverSideBar />
				<Directory />
			</Box>
		</Box>
	);
}

export default DriverPage;
