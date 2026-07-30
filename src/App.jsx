import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import './styles/tokens.css'
import './styles/responsive.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import WhatsAppButton from './components/WhatsAppButton'
import ScrollReminderPopup from './components/ScrollReminderPopup'
import RiskManagementPage from './pages/RiskManagementPage'
import ManagementConsultancyPage from './pages/ManagementConsultancyPage'
import ServicesPage from './pages/ServicesPage'
import ContactPage from './pages/ContactPage'
import BlogPage from './pages/BlogPage'
import BlogPostPage from './pages/BlogPostPage'
import ServicePage from './pages/ServicePage'
import CategoryHubPage from './pages/CategoryHubPage'
import PrototypeHome from './prototype/home/index.jsx'

const PROTO_PATHS = ['/', '/services', '/contact', '/blog', '/risk-management', '/management-consultancy']

// Reset scroll to the top on route change, but leave in-page anchor
// navigation (e.g. /services#solutions) to scroll to its target.
function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

export default function App() {
  const location = useLocation()
  const isPrototype =
    PROTO_PATHS.includes(location.pathname) ||
    location.pathname.startsWith('/prototype') ||
    location.pathname.startsWith('/blog') ||
    location.pathname.startsWith('/insurance')

  return (
    <>
      <ScrollToTop />
      {!isPrototype && <Navbar />}
      <Routes>
        <Route path="/" element={<PrototypeHome />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/insurance/:slug" element={<ServicePage />} />
        <Route path="/insurance-services/:category" element={<CategoryHubPage />} />
        <Route path="/risk-management" element={<RiskManagementPage />} />
        <Route path="/management-consultancy" element={<ManagementConsultancyPage />} />
      </Routes>
      {!isPrototype && <Footer />}
      {!isPrototype && <WhatsAppButton />}
      {!isPrototype && <ScrollReminderPopup />}
    </>
  )
}
