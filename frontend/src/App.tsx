import { Route, Routes } from "react-router-dom";
import DriverPage from "./pages/DriverPage.tsx";
import EditorPage from "./pages/EditorPage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import SignupPage from "./pages/SignupPage.tsx";
import { Toaster } from "react-hot-toast";


function App() {
  return (
    <>
    <Toaster />
    <Routes>
      <Route path='/' element={<DriverPage />} />
      <Route path="/editor/:documentId" element={<EditorPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup/" element={<SignupPage />} />
    </Routes>
    </>
  )
}

export default App