import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, ProtectedRoute } from "@/hooks/useAuth";
import Index from "./pages/Index.tsx";
import Download from "./pages/Download.tsx";
import ThankYou from "./pages/ThankYou.tsx";
import NotFound from "./pages/NotFound.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import AdminSubscriptions from "./pages/AdminSubscriptions.tsx";
import SubscriptionRequired from "./pages/SubscriptionRequired.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Rotas Públicas */}
            <Route path="/" element={<Index />} />
            <Route path="/download" element={<Download />} />
            <Route path="/obrigado" element={<ThankYou />} />
            <Route path="/thank-you" element={<ThankYou />} />
            
            {/* Rotas de Autenticação */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/subscription-required" element={<SubscriptionRequired />} />
            
            {/* Rotas Protegidas - Requer Login + Assinatura Ativa */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Rota Admin - Gerenciar Assinaturas */}
            <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
            
            {/* Catch-all - 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
