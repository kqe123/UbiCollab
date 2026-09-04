import ProfileHeader from "../components/profile/ProfileHeader.tsx";
import ProfileSideBar from "../components/profile/ProfileSideBar.tsx";
import ProfileContent from "../components/profile/ProfileContent.tsx";
import Box from '@mui/material/Box';
function ProfilePage () {
    const accessToken = localStorage.getItem("accessToken");
	document.title = "프로필 - Ubicollab";
	if (accessToken) {
		const payload = JSON.parse(atob(accessToken.split(".")[1]));
		console.log(new Date(payload.exp * 1000));
	}


	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
			<ProfileHeader />
			<Box sx={{ display: 'flex', flex: 1, bgcolor: '#F9F9FA' }}>
                <ProfileSideBar />
				<ProfileContent  />
			</Box>
		</Box>
	);
}

export default ProfilePage;