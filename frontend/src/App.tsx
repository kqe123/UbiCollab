import { Route, Routes } from "react-router-dom";
import DriverPage from "./pages/DriverPage.tsx";
import EditorPage from "./pages/EditorPage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
    <Toaster />
    <Routes>
      <Route path='/' element={<DriverPage />} />
      <Route path="/editor/:documentId" element={<EditorPage />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
    </>
  )
}

export default App