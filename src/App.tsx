
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import BoardMeetings from "./pages/BoardMeetings";
import BoardMeetingDetail from "./pages/BoardMeetingDetail";
import BoardMeetingCreate from "./pages/BoardMeetingCreate";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
          <Route path="/board-meetings" element={<BoardMeetings />} />
          <Route path="/board-meetings/:id" element={<BoardMeetingDetail />} />
          <Route path="/board-meetings/create" element={<BoardMeetingCreate />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
