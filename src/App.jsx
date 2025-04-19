import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "./components/ui/toaster"
import { AuthProvider } from "./context/AuthContext"
import { ChatbotProvider } from "./context/ChatbotContext"
import ProtectedRoute from "./components/ProtectedRoute"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import FormationDetails from "./pages/FormationDetails"
import ModuleContent from "./pages/ModuleContent"
import Quiz from "./pages/Quiz"
import Certificate from "./pages/Certificate"
import NotFound from "./pages/NotFound"
import ChatbotWidget from "./components/ChatbotWidget"

function App() {
  return (
    <Router>
      <AuthProvider>
        <ChatbotProvider>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/formation/:formationId" element={<FormationDetails />} />
                <Route path="/formation/:formationId/module/:moduleId" element={<ModuleContent />} />
                <Route path="/formation/:formationId/module/:moduleId/quiz" element={<Quiz />} />
                <Route path="/formation/:formationId/certificate" element={<Certificate />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>

            <ChatbotWidget />
            <Toaster />
          </div>
        </ChatbotProvider>
      </AuthProvider>
    </Router>
  )
}

export default App