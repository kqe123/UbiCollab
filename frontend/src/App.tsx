import { Route, Routes } from "react-router-dom";
import DriverPage from "./pages/DriverPage.tsx";
import EditorPage from "./pages/EditorPage.tsx";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
    <Toaster />
    <Routes>
      <Route path='/' element={<DriverPage />} />
      <Route path="/editor/:documentId" element={<EditorPage />} />
    </Routes>
    </>
  )
}

export default App