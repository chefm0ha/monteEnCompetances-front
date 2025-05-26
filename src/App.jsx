// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "./components/ui/toaster"
import { AuthProvider } from "./context/AuthContext"
import { ChatbotProvider } from "./context/ChatbotContext"
import { SidebarProvider } from "./context/SidebarContext"
import { NotificationProvider } from "./context/NotificationContext"
import ProtectedRoute from "./components/shared/ProtectedRoute"
import AdminRoute from "./components/Admin/AdminRoute"
import UserRoute from "./components/shared/UserRoute"
import Login from "./pages/shared/Login"
import Dashboard from "./pages/shared/Dashboard"
import Profile from "./pages/shared/Profile"
import AdminDashboard from "./pages/Admin/AdminDashboard"
import CollaborateursManagement from "./pages/Admin/CollaborateursManagement"
import CollaborateurEdit from "./pages/Admin/CollaborateurEdit"
import FormationsManagement from "./pages/Admin/FormationsManagement"
import FormationEdit from "./pages/Admin/FormationEdit"
import ModulesManagement from "./pages/Admin/ModulesManagement"
import ModuleEdit from "./pages/Admin/ModuleEdit"
import AffectationsManagement from "./pages/Admin/AffectationsManagement"
import FormationDetails from "./pages/Collaborateur/FormationDetails"
import ModuleContent from "./pages/Collaborateur/ModuleContent"
import Quiz from "./pages/Collaborateur/Quiz"
import Certificate from "./pages/Collaborateur/Certificate"
import NotificationsPage from "./pages/Admin/NotificationsPage"
import NotFound from "./pages/shared/NotFound"
import ChatbotWidget from "./components/shared/ChatbotWidget"

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <ChatbotProvider>
            <SidebarProvider>
              <div className="min-h-screen bg-gray-50">
                <Routes>
                  {/* Public routes without sidebar */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />

                  {/* Protected routes with Layout (including sidebar) */}
                  <Route element={<ProtectedRoute />}>
                    {/* Shared routes for both admin and users */}
                    <Route path="/profile" element={<Profile />} />
                    
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
                      
                      {/* Notifications */}
                      <Route path="/admin/notifications" element={<NotificationsPage />} />
                      
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

                      {/* Affectations management */}
                      <Route path="/admin/affectations" element={<AffectationsManagement />} />
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
        </NotificationProvider>
      </AuthProvider>
    </Router>
  )
}

export default App