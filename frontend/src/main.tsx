import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from "./App.tsx";
import { BrowserRouter} from 'react-router-dom';
import { QueryClient, QueryClientProvider} from '@tanstack/react-query'
import "./index.css";
import { AuthProvider } from "./auth/AuthContext";

// queryClient : 서버 데이터 관리자
const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
