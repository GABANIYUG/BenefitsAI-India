import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import MainLayout from "./layouts/MainLayout"
import DashboardLayout from "./layouts/DashboardLayout"
import LandingPage from "./pages/LandingPage"
import CopilotPage from "./pages/CopilotPage"
import SchemesPage from "./pages/SchemesPage"
import ProfilePage from "./pages/ProfilePage"
import SettingsPage from "./pages/SettingsPage"
import SavedSchemesPage from "./pages/SavedSchemesPage"
import ProtectedRoute from "./components/ProtectedRoute"

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/copilot" element={<CopilotPage />} />
            <Route path="/schemes" element={<SchemesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/schemes/saved" element={<SavedSchemesPage />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  )
}

export default App
