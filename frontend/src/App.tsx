import { Route, Routes } from "react-router-dom";
import DriverPage from "./pages/DriverPage.tsx";
import EditorPage from "./pages/EditorPage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import SignupPage from "./pages/SignupPage.tsx";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./routes/ProtectedRoute";

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
        <Route path='/' element={<DriverPage />} />
        <Route path="/editor/:documentId" element={<EditorPage />} />
      </Route>
    </Routes>
    </>
  )
}

export default App
