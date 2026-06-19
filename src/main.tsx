import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Navbar } from './components/layout/Navbar'
import { HomePage } from './pages/HomePage'
import { DrugDetailPage } from './pages/DrugDetailPage'
import { QuizPage } from './pages/QuizPage'
import { CasesPage } from './pages/CasesPage'
import { ContributePage } from './pages/ContributePage'
import { AdminPage } from './pages/AdminPage'
import './styles/global.css'
import type { ReactNode } from 'react'

function AdminGuard({ children }: { children: ReactNode }) {
  const { role, loading } = useAuth()
  if (loading) return null
  if (role !== 'admin') return <Navigate to="/" replace />
  return <>{children}</>
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-surface">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/drug/:id" element={<DrugDetailPage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/cases" element={<CasesPage />} />
            <Route path="/contribute" element={<ContributePage />} />
            <Route path="/admin" element={<AdminGuard><AdminPage /></AdminGuard>} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
