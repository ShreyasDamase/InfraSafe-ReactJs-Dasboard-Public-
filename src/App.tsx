import LoginPage from "@/pages/login";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Home from "./pages/home";
import { WSProvider } from "./service/WSProvider";
import SubadminHome from "./pages/subadmin";

const infraSafe = new QueryClient();
export default function App() {
  return (
    <QueryClientProvider client={infraSafe}>
      <WSProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/admin-home" element={<Home />} />
            <Route path="/subadmin-home" element={<SubadminHome />} />
          </Routes>
        </BrowserRouter>
      </WSProvider>
    </QueryClientProvider>
  );
}
