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

/*
 * Reset scroll on route change — and actually honour the hash when there is one.
 *
 * The browser only jumps to an #anchor on a full page load. On a client-side
 * route change it does nothing, so links like /services#solutions were landing
 * at whatever scroll position the previous page happened to be at. This bailed
 * out of scrolling when a hash was present and left the rest to the browser,
 * which meant nobody did it.
 *
 * The target may not be mounted on the same tick the route changes, so retry on
 * the next frame before giving up and going to the top.
 */
function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0)
      return
    }

    let frame
    const jump = (attemptsLeft) => {
      const el = document.getElementById(hash.slice(1))
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else if (attemptsLeft > 0) {
        frame = requestAnimationFrame(() => jump(attemptsLeft - 1))
      } else {
        window.scrollTo(0, 0)
      }
    }
    jump(10)

    return () => cancelAnimationFrame(frame)
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
