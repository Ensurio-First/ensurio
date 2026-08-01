import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import './styles/tokens.css'
import './styles/responsive.css'
import RiskManagementPage from './pages/RiskManagementPage'
import ManagementConsultancyPage from './pages/ManagementConsultancyPage'
import ServicesPage from './pages/ServicesPage'
import ContactPage from './pages/ContactPage'
import BlogPage from './pages/BlogPage'
import BlogPostPage from './pages/BlogPostPage'
import ServicePage from './pages/ServicePage'
import CategoryHubPage from './pages/CategoryHubPage'
import SolutionPage from './pages/SolutionPage'
import AudiencePage from './pages/AudiencePage'
import IndustryPage from './pages/IndustryPage'
import AboutPage from './pages/AboutPage'
import PolicyReviewPage from './pages/PolicyReviewPage'
import QuoteModal from './components/QuoteModal'
import { LeadJourneyProvider } from './context/LeadJourneyContext'
import PrototypeHome from './prototype/home/index.jsx'

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
  return (
    <LeadJourneyProvider>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<PrototypeHome />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/insurance/:slug" element={<ServicePage />} />
        <Route path="/insurance-services/:category" element={<CategoryHubPage />} />
        <Route path="/solutions/:slug" element={<SolutionPage />} />
        <Route path="/who-we-help/:slug" element={<AudiencePage />} />
        <Route path="/industries/:slug" element={<IndustryPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/policy-review" element={<PolicyReviewPage />} />
        <Route path="/risk-management" element={<RiskManagementPage />} />
        <Route path="/management-consultancy" element={<ManagementConsultancyPage />} />
      </Routes>
      <QuoteModal />
    </LeadJourneyProvider>
  )
}
