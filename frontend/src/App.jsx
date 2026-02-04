import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'

// Layout components
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

// Route guards
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import AdminRoute from '@/components/auth/AdminRoute'

// Public pages
import Landing from '@/pages/public/Landing'
import About from '@/pages/public/About'
import Contact from '@/pages/public/Contact'
import Legal from '@/pages/public/Legal'
import NotFound from '@/pages/public/NotFound'
import UserProfile from '@/pages/public/UserProfile'

// Auth pages
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import ForgotPassword from '@/pages/auth/ForgotPassword'
import ResetPassword from '@/pages/auth/ResetPassword'

// User pages
import Dashboard from '@/pages/user/Dashboard'
import Reports from '@/pages/user/Reports'
import ReportDetail from '@/pages/user/ReportDetail'
import CreateReport from '@/pages/user/CreateReport'
import EditReport from '@/pages/user/EditReport'
import MyReports from '@/pages/user/MyReports'
import MapExplorer from '@/pages/user/MapExplorer'
import UserMessages from '@/pages/user/Messages'
import Notifications from '@/pages/user/Notifications'

// Admin pages
import AdminDashboard from '@/pages/admin/AdminDashboard'
import ManageReports from '@/pages/admin/ManageReports'
import ResolvedReports from '@/pages/admin/ResolvedReports'
import Institutions from '@/pages/admin/Institutions'
import Categories from '@/pages/admin/Categories'
import Messages from '@/pages/admin/Messages'
import Analytics from '@/pages/admin/Analytics'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="civic-report-theme">
        <AuthProvider>
          <BrowserRouter>
            <div className="min-h-screen flex flex-col bg-background text-foreground">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Landing />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/legal" element={<Legal />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />

                  {/* Public but show all reports */}
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/reports/:id" element={<ReportDetail />} />
                  <Route path="/users/:id" element={<UserProfile />} />
                  <Route path="/map" element={<MapExplorer />} />

                  {/* Protected User Routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/my-reports" element={<MyReports />} />
                  <Route path="/create-report" element={<CreateReport />} />
                  <Route path="/reports/:id/edit" element={<EditReport />} />
                  <Route path="/messages" element={<UserMessages />} />
                  <Route path="/notifications" element={<Notifications />} />
                </Route>

                  {/* Admin Routes */}
                  <Route element={<AdminRoute />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/reports" element={<ManageReports />} />
                    <Route path="/admin/resolved" element={<ResolvedReports />} />
                  <Route path="/admin/institutions" element={<Institutions />} />
                  <Route path="/admin/categories" element={<Categories />} />
                  <Route path="/admin/messages" element={<Messages />} />
                  <Route path="/admin/analytics" element={<Analytics />} />
                </Route>

                  {/* 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
            <Toaster richColors position="top-right" />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
