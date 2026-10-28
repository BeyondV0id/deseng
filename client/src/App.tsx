import { Route, Routes } from 'react-router-dom'
import { GuestOnly } from '@/components/auth/auth-provider'
import ForgotPasswordPage from '@/pages/auth/forgot-password'
import ResetPasswordPage from '@/pages/auth/reset-password'
import SignInPage from '@/pages/auth/sign-in'
import SignUpPage from '@/pages/auth/sign-up'
import Page from './pages/page'

/**
 * Browsing is public: the catalogue, its shelves and the search never ask for
 * an account. Only the auth pages sit outside the shell, and a visitor who
 * clicks a favourite, a moodboard or submit is asked to sign in from there.
 */
export default function App() {
  return <Routes>
    <Route path="/sign-in" element={<GuestOnly><SignInPage /></GuestOnly>} />
    <Route path="/sign-up" element={<GuestOnly><SignUpPage /></GuestOnly>} />
    <Route path="/forgot-password" element={<GuestOnly><ForgotPasswordPage /></GuestOnly>} />
    <Route path="/reset-password" element={<GuestOnly><ResetPasswordPage /></GuestOnly>} />
    <Route path="/*" element={<Page />} />
  </Routes>
}
