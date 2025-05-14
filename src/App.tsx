
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import NoticeBoard from "./pages/NoticeBoard";
import NoticeDetail from "./pages/NoticeDetail";
import NoticeCreate from "./pages/NoticeCreate";
import NoticeEdit from "./pages/NoticeEdit";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Documents from "./pages/Documents";
import Calendar from "./pages/Calendar";
import Members from "./pages/Members";
import Surveys from "./pages/Surveys";
import SurveyDetail from "./pages/SurveyDetail";
import FreeBoards from "./pages/FreeBoards";
import FreeBoardDetail from "./pages/FreeBoardDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/notices" element={<NoticeBoard />} />
        <Route path="/notices/:id" element={<NoticeDetail />} />
        <Route path="/notices/create" element={<NoticeCreate />} />
        <Route path="/notices/edit/:id" element={<NoticeEdit />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/tasks" element={<Index />} />
        <Route path="/members" element={<Members />} />
        <Route path="/surveys" element={<Surveys />} />
        <Route path="/surveys/:id" element={<SurveyDetail />} />
        <Route path="/freeboards" element={<FreeBoards />} />
        <Route path="/freeboards/:id" element={<FreeBoardDetail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
