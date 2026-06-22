import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import MainLayout from "./layouts/MainLayout"
import DashboardLayout from "./layouts/DashboardLayout"
import LandingPage from "./pages/LandingPage"
import CopilotPage from "./pages/CopilotPage"

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
        </Route>
        <Route element={<DashboardLayout />}>
          <Route path="/copilot" element={<CopilotPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
