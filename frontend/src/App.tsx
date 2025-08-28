import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import Index from "./pages/Index";
import About from "./pages/About";
import Chatbot from "./pages/Chatbot";
import ChatbotSettings from "./pages/ChatbotSettings";
import LegalAISettings from "./pages/LegalAISettings";
import LawSimplify from "./pages/LawSimplify";
import DocumentQA from "./pages/DocumentQA";
import FindLawyer from "./pages/FindLawyer";
import PublicLawyerProfile from "./pages/PublicLawyerProfile";
import AppointmentBooking from "./pages/AppointmentBooking";
import ChatWithLawyer from "./pages/ChatWithLawyer";
import VideoCall from "./pages/VideoCall";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import LawyerDashboard from "./pages/LawyerDashboard";
import LawyerAppointments from "./pages/LawyerAppointments";
import LawyerAllAppointments from "./pages/LawyerAllAppointments";
import LawyerClients from "./pages/LawyerClients";
import LawyerMessages from "./pages/LawyerMessages";
import LawyerVideoCalls from "./pages/LawyerVideoCalls";
import LawyerDocuments from "./pages/LawyerDocuments";
import LawyerProfile from "./pages/LawyerProfile";
import LawyerPayments from "./pages/LawyerPayments";
import LawyerReviews from "./pages/LawyerReviews";
import LawyerSettings from "./pages/LawyerSettings";
import LawyerFeedbackManagement from "./pages/LawyerFeedbackManagement";
import OtpVerification from "./pages/OtpVerification";
import AdminDashboard from "./pages/AdminDashboard";

const queryClient = new QueryClient();

// Component to handle scroll to top on route changes
const ScrollToTop = () => {
  const location = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <div className="min-h-screen flex flex-col bg-background">
            <Routes>
              {/* Public Routes with Navbar */}
              <Route path="/" element={
                <>
                  <Navbar />
                  <main className="flex-1">
                    <Index />
                  </main>
                  <Footer />
                </>
              } />
              <Route path="/about" element={
                <>
                  <Navbar />
                  <main className="flex-1">
                    <About />
                  </main>
                  <Footer />
                </>
              } />
              {/* Chatbot Route without Footer */}
              <Route path="/chatbot" element={<Chatbot />} />
              {/* Chatbot Settings Route without Navbar/Footer */}
              <Route path="/chatbot-settings" element={<ChatbotSettings />} />
              {/* Legal AI Settings Route without Navbar/Footer */}
              <Route path="/legal-ai-settings" element={<LegalAISettings />} />
              <Route path="/lawsimplify" element={
                <>
                  <Navbar />
                  <main className="flex-1">
                    <LawSimplify />
                  </main>
                  <Footer />
                </>
              } />
              <Route path="/document-qa" element={
                <>
                  <Navbar />
                  <main className="flex-1">
                    <DocumentQA />
                  </main>
                  <Footer />
                </>
              } />
              <Route path="/find-lawyer" element={
                <>
                  <Navbar />
                  <main className="flex-1">
                    <FindLawyer />
                  </main>
                  <Footer />
                </>
              } />
              <Route path="/lawyer/:id" element={
                <>
                  <Navbar />
                  <main className="flex-1">
                    <PublicLawyerProfile />
                  </main>
                  <Footer />
                </>
              } />
              <Route path="/booking/:lawyerId" element={
                <>
                  <Navbar />
                  <main className="flex-1">
                    <AppointmentBooking />
                  </main>
                  <Footer />
                </>
              } />
              <Route path="/chat/:lawyerId" element={
                <>
                  <Navbar />
                  <main className="flex-1">
                    <ChatWithLawyer />
                  </main>
                  <Footer />
                </>
              } />
              <Route path="/video-call/:sessionId" element={
                <>
                  <Navbar />
                  <main className="flex-1">
                    <VideoCall />
                  </main>
                  <Footer />
                </>
              } />
              <Route path="/contact" element={
                <>
                  <Navbar />
                  <main className="flex-1">
                    <Contact />
                  </main>
                  <Footer />
                </>
              } />
              <Route path="/login" element={
                <>
                  <Navbar />
                  <main className="flex-1">
                    <Login />
                  </main>
                </>
              } />
              <Route path="/signup" element={
                <>
                  <Navbar />
                  <main className="flex-1">
                    <Signup />
                  </main>
                </>
              } />
              <Route path="/otp-verification" element={
                <>
                  <main className="flex-1">
                    <OtpVerification />
                  </main>
                </>
              } />
              
              {/* Lawyer Panel Routes (Protected) */}
              <Route path="/lawyer-dashboard" element={
                <ProtectedRoute requiredRole="lawyer">
                  <LawyerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/lawyer-appointments" element={
                <ProtectedRoute requiredRole="lawyer">
                  <LawyerAppointments />
                </ProtectedRoute>
              } />
              <Route path="/lawyer-all-appointments" element={
                <ProtectedRoute requiredRole="lawyer">
                  <LawyerAllAppointments />
                </ProtectedRoute>
              } />
              <Route path="/lawyer-clients" element={
                <ProtectedRoute requiredRole="lawyer">
                  <LawyerClients />
                </ProtectedRoute>
              } />
              <Route path="/lawyer-messages" element={
                <ProtectedRoute requiredRole="lawyer">
                  <LawyerMessages />
                </ProtectedRoute>
              } />
              <Route path="/lawyer-video-calls" element={
                <ProtectedRoute requiredRole="lawyer">
                  <LawyerVideoCalls />
                </ProtectedRoute>
              } />
              <Route path="/lawyer-documents" element={
                <ProtectedRoute requiredRole="lawyer">
                  <LawyerDocuments />
                </ProtectedRoute>
              } />
              <Route path="/lawyer-profile" element={
                <ProtectedRoute requiredRole="lawyer">
                  <LawyerProfile />
                </ProtectedRoute>
              } />
              <Route path="/lawyer-payments" element={
                <ProtectedRoute requiredRole="lawyer">
                  <LawyerPayments />
                </ProtectedRoute>
              } />
              <Route path="/lawyer-reviews" element={
                <ProtectedRoute requiredRole="lawyer">
                  <LawyerReviews />
                </ProtectedRoute>
              } />
              <Route path="/lawyer-feedback" element={
                <ProtectedRoute requiredRole="lawyer">
                  <LawyerFeedbackManagement />
                </ProtectedRoute>
              } />
              <Route path="/lawyer-settings" element={
                <ProtectedRoute requiredRole="lawyer">
                  <LawyerSettings />
                </ProtectedRoute>
              } />
              
              {/* Admin Panel Route (Protected) */}
              <Route path="/admin-dashboard" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              
              {/* 404 Route */}
              <Route path="*" element={
                <>
                  <Navbar />
                  <main className="flex-1">
                    <NotFound />
                  </main>
                  <Footer />
                </>
              } />
            </Routes>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
