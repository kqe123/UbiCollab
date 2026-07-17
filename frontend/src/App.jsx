import { Route, Routes } from "react-router-dom";
import DriverPage from "./pages/DriverPage.jsx";
import DocumentPage from "./pages/DocumentPage.jsx";
import { Toaster } from "react-hot-toast";

function App() {
	return (
		<>
		<Toaster />
		<Routes>
			<Route path='/' element={<DriverPage />} />
            <Route path="/editor/:documentId" element={<DocumentPage />} />
		</Routes>
		</>
	);
}

export default App;