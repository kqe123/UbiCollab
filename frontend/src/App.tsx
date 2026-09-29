import { Route, Routes, Navigate } from "react-router-dom";
import DriverPage from "./pages/DriverPage.tsx";
import EditorPage from "./pages/EditorPage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import SignupPage from "./pages/SignupPage.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./routes/ProtectedRoute";
import RecentList from "./components/driver/lists/RecentList";
import MyDriveList from "./components/driver/lists/MyDriveList";
import FavoriteList from "./components/driver/lists/FavoriteList";
import SharedList from "./components/driver/lists/SharedList";
import TrashList from "./components/driver/lists/TrashList";
import ProfileEdit from "./components/profile/lists/ProfileEdit";
import PasswordEdit from "./components/profile/lists/PasswordEdit";
import UserDelete from "./components/profile/lists/UserDelete";
function App() {
  return (
    <>
    <Toaster />
    <Routes>
      {/* 공개 페이지 */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup/" element={<SignupPage />} />




      {/* 로그인 필요 */}
      <Route element={<ProtectedRoute />}>
        {/* 최초 접속 시 내 드라이브로 이동 */}
        <Route path="/" element={<Navigate to="/drive/my-drive" replace />}/>

        {/* Driver 화면 */}
        <Route path="/drive" element={<DriverPage />}>
          {/* /drive 접속 시 /drive/my-drive로 이동 */}
          <Route index element={<Navigate to="my-drive" replace />}/>
          <Route path="my-drive" element={<MyDriveList />} />  {/* folderId : null */}
          <Route path="my-drive/:folderId" element={<MyDriveList />} /> {/* folderId : string */}
          <Route path="recent" element={<RecentList />} />
          <Route path="favorite" element={<FavoriteList />} />  {/* folderId : null */}
          <Route path="favorite/:folderId" element={<FavoriteList />} /> {/* folderId : string */}
          <Route path="shared" element={<SharedList />} />            {/* folderId : null */}
          <Route path="shared/:folderId" element={<SharedList />} />  {/* folderId : string */}
          <Route path="trash" element={<TrashList />} /> 
        </Route>

        {/* Profile 화면 */}
        <Route path="/profile" element={<ProfilePage />} >
           {/* /profile 접속 시 /profile/profile-edit로 이동 */}
          <Route index element={<Navigate to="profile-edit" replace />}/>
          <Route path="profile-edit" element={<ProfileEdit />} />  
          <Route path="password-edit" element={<PasswordEdit />} />
          <Route path="user-delete" element={<UserDelete />} /> 
        </Route>

        {/* 에디터 화면 */}
        <Route path="/editor/:fileId" element={<EditorPage />} />
      </Route>
    </Routes>
    </>
  )
}

export default App
