import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from "./App.tsx";
import { BrowserRouter} from 'react-router-dom';
import { QueryClient, QueryClientProvider} from '@tanstack/react-query'
import "pretendard/dist/web/variable/pretendardvariable.css";
import "./index.css";
import { ApiError } from './api/client';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// MUI 전역
const theme = createTheme({
    typography: {
        fontFamily: '"Pretendard Variable", "Pretendard", sans-serif',
    },
});


// queryClient : 서버 데이터 관리자
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: (failureCount, error) => {
                // 4xx면 재시도 안 함
                if (error instanceof ApiError && error.status && error.status < 500) {
                    return false;
                }
                // 5xx, 네트워크 에러는 최대 2번까지 재시도
                return failureCount < 2;
            },
        },
    },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
)
