import { Route, Routes, Navigate } from "react-router-dom";
import DriverPage from "./pages/DriverPage.tsx";
import EditorPage from "./pages/EditorPage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import SignupPage from "./pages/SignupPage.tsx";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./routes/ProtectedRoute";
import RecentList from "./components/driver/lists/RecentList";
import MyDriveList from "./components/driver/lists/MyDriveList";
import FavoriteList from "./components/driver/lists/FavoriteList";
import SharedList from "./components/driver/lists/SharedList";
import TrashList from "./components/driver/lists/TrashList";

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

        {/* 공통 Driver 화면 */}
        <Route path="/drive" element={<DriverPage />}>
          {/* /drive 접속 시 /drive/my-drive로 이동 */}
          <Route index element={<Navigate to="my-drive" replace />}/>
          <Route path="my-drive" element={<MyDriveList />} />  {/* folderId : null */}
          <Route path="my-drive/:folderId" element={<MyDriveList />} /> {/* folderId : number */}
          <Route path="recent" element={<RecentList />} />
          <Route path="favorite" element={<FavoriteList />} /> 
          <Route path="shared" element={<SharedList />} /> 
          <Route path="trash" element={<TrashList />} /> 
        </Route>
        <Route path="/editor/:fileId" element={<EditorPage />} />
      </Route>
    </Routes>
    </>
  )
}

export default App
