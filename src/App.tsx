

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
          <Route path="/calendar" element={<Index />} />
          <Route path="/tasks" element={<Index />} />
          <Route path="/documents" element={<Index />} />
          <Route path="/members" element={<Index />} />
          <Route path="/help" element={<Index />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
