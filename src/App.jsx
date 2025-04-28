// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "./components/ui/toaster"
import { AuthProvider, useAuth } from "./context/AuthContext"
import { ChatbotProvider } from "./context/ChatbotContext"
import { SidebarProvider } from "./context/SidebarContext"
import ProtectedRoute from "./components/ProtectedRoute"
import AdminRoute from "./components/AdminRoute"
import UserRoute from "./components/UserRoute"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import AdminDashboard from "./pages/AdminDashboard"
import CollaborateursManagement from "./pages/CollaborateursManagement"
import CollaborateurEdit from "./pages/CollaborateurEdit"
import FormationsManagement from "./pages/FormationsManagement"
import FormationEdit from "./pages/FormationEdit"
import ModulesManagement from "./pages/ModulesManagement"
import ModuleEdit from "./pages/ModuleEdit"
import ContenusManagement from "./pages/ContenusManagement"
import ContenuEdit from "./pages/ContenuEdit"
import FormationDetails from "./pages/FormationDetails"
import ModuleContent from "./pages/ModuleContent"
import Quiz from "./pages/Quiz"
import Certificate from "./pages/Certificate"
import NotFound from "./pages/NotFound"
import ChatbotWidget from "./components/ChatbotWidget"
import Layout from "./components/Layout"

function App() {
  return (
    <Router>
      <AuthProvider>
        <ChatbotProvider>
          <SidebarProvider>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                {/* Public routes without sidebar */}
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* Protected routes with Layout (including sidebar) */}
                <Route element={<ProtectedRoute />}>
                  {/* User routes */}
                  <Route element={<UserRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/formation/:formationId" element={<FormationDetails />} />
                    <Route path="/formation/:formationId/module/:moduleId" element={<ModuleContent />} />
                    <Route path="/formation/:formationId/module/:moduleId/quiz" element={<Quiz />} />
                    <Route path="/formation/:formationId/certificate" element={<Certificate />} />
                  </Route>

                  {/* Admin routes */}
                  <Route element={<AdminRoute />}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    
                    {/* Collaborateurs management */}
                    <Route path="/admin/collaborateurs" element={<CollaborateursManagement />} />
                    <Route path="/admin/collaborateurs/:id" element={<CollaborateurEdit />} />
                    <Route path="/admin/collaborateurs/new" element={<CollaborateurEdit />} />
                    
                    {/* Formations management */}
                    <Route path="/admin/formations" element={<FormationsManagement />} />
                    <Route path="/admin/formations/new" element={<FormationEdit />} />
                    <Route path="/admin/formations/:id" element={<FormationEdit />} />
                    
                    {/* Modules management */}
                    <Route path="/admin/modules" element={<ModulesManagement />} />
                    <Route path="/admin/modules/new" element={<ModuleEdit />} />
                    <Route path="/admin/modules/:id" element={<ModuleEdit />} />
                    
                    {/* Contenus management */}
                    <Route path="/admin/contenus" element={<ContenusManagement />} />
                    <Route path="/admin/contenus/new" element={<ContenuEdit />} />
                    <Route path="/admin/contenus/:id" element={<ContenuEdit />} />
                  </Route>
                </Route>

                {/* 404 page without sidebar */}
                <Route path="*" element={<NotFound />} />
              </Routes>

              <ChatbotWidget />
              <Toaster />
            </div>
          </SidebarProvider>
        </ChatbotProvider>
      </AuthProvider>
    </Router>
  )
}

export default App