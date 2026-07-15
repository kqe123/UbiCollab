import { Route, Routes } from "react-router-dom";
import DriverPage from "./pages/DriverPage.jsx";
import DocumentPage from "./pages/DocumentPage.jsx";

function App() {
	return (
		<>
		<Routes>
			<Route path='/' element={<DriverPage />} />
            <Route path='/editor' element={<DocumentPage />} />
		</Routes>
		</>
	);
}

export default App;