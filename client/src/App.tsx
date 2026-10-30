import { Route, Routes } from 'react-router-dom'
import { GuestOnly } from '@/components/auth/auth-provider'
import AuthPage from '@/pages/auth/auth-page'
import ForgotPasswordPage from '@/pages/auth/forgot-password'
import ResetPasswordPage from '@/pages/auth/reset-password'
import Page from './pages/page'

/**
 * Browsing is public: the catalogue, its shelves and the search never ask for
 * an account. Only the auth pages sit outside the shell, and a visitor who
 * clicks a favourite, a moodboard or submit is asked to sign in from there.
 *
 * Sign-in and sign-up are the same page with a different form. Both routes name
 * that one component, so switching between them updates the window in place and
 * it can settle into its new height instead of remounting at it.
 */
export default function App() {
  return <Routes>
    <Route path="/sign-in" element={<GuestOnly><AuthPage mode="sign-in" /></GuestOnly>} />
    <Route path="/sign-up" element={<GuestOnly><AuthPage mode="sign-up" /></GuestOnly>} />
    <Route path="/forgot-password" element={<GuestOnly><ForgotPasswordPage /></GuestOnly>} />
    <Route path="/reset-password" element={<GuestOnly><ResetPasswordPage /></GuestOnly>} />
    <Route path="/*" element={<Page />} />
  </Routes>
}
