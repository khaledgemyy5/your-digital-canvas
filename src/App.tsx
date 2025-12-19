import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";

// Public pages
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";

// Admin pages
import Login from "@/pages/admin/Login";
import ForgotPassword from "@/pages/admin/ForgotPassword";
import ResetPassword from "@/pages/admin/ResetPassword";
import Dashboard from "@/pages/admin/Dashboard";
import Sections from "@/pages/admin/Sections";
import SectionEditor from "@/pages/admin/SectionEditor";
import Projects from "@/pages/admin/Projects";
import ProjectEditor from "@/pages/admin/ProjectEditor";
import Settings from "@/pages/admin/Settings";
import Appearance from "@/pages/admin/Appearance";

// Preview pages
import PreviewSite from "@/pages/preview/PreviewSite";
import PreviewProject from "@/pages/preview/PreviewProject";

// Layouts
import AdminLayout from "@/components/layout/AdminLayout";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />

              {/* Preview routes */}
              <Route path="/preview" element={<PreviewSite />} />
              <Route path="/preview/project/:id" element={<PreviewProject />} />

              {/* Admin routes */}
              <Route path="/admin/login" element={<Login />} />
              <Route path="/admin/forgot-password" element={<ForgotPassword />} />
              <Route path="/admin/reset-password" element={<ResetPassword />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="sections" element={<Sections />} />
                <Route path="sections/:id" element={<SectionEditor />} />
                <Route path="projects" element={<Projects />} />
                <Route path="projects/:id" element={<ProjectEditor />} />
                <Route path="appearance" element={<Appearance />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
