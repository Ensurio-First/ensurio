import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import './styles/tokens.css'
import './styles/responsive.css'
import './styles/print.css'
import RiskManagementPage from './pages/RiskManagementPage'
import ManagementConsultancyPage from './pages/ManagementConsultancyPage'
import NotFoundPage from './pages/NotFoundPage'
import { seoFor } from './lib/seo'
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
import { trackPageView } from './lib/analytics'
import { trackSalesIQPage } from './lib/salesiq'
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

  // gtag fires page_view once on load. Every client-side navigation after that
  // is invisible to GA unless we report it, which would have made almost the
  // whole site look like it got no traffic.
  // SalesIQ has the same blind spot, for the same reason — an operator would
  // otherwise see whichever page the visitor first landed on.
  useEffect(() => {
    trackPageView(pathname + hash)
    trackSalesIQPage(pathname + hash)
  }, [pathname, hash])

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

/*
 * Keeps <title>, the meta description and the canonical link in step with the
 * current route during client-side navigation.
 *
 * The prerender build bakes these into each route's static HTML, so a crawler
 * or a cold page load already has them — this is only for navigation inside the
 * app, where no new document is fetched. Without it a route that sets no title
 * of its own inherits whatever the previous route left behind.
 *
 * Rendered above <Routes>, so its effect runs before a page's own effect and a
 * page that still sets its own title keeps the last word.
 */
function SeoHead() {
  const { pathname } = useLocation()

  useEffect(() => {
    const seo = seoFor(pathname)
    // No entry means an unrouted path; NotFoundPage sets its own head.
    if (!seo) return

    document.title = seo.title

    let desc = document.querySelector('meta[name="description"]')
    if (!desc) {
      desc = document.createElement('meta')
      desc.setAttribute('name', 'description')
      document.head.appendChild(desc)
    }
    desc.setAttribute('content', seo.description)

    let canon = document.querySelector('link[rel="canonical"]')
    if (!canon) {
      canon = document.createElement('link')
      canon.setAttribute('rel', 'canonical')
      document.head.appendChild(canon)
    }
    canon.setAttribute('href', seo.canonical)
  }, [pathname])

  return null
}

export default function App() {
  return (
    <LeadJourneyProvider>
      <ScrollToTop />
      <SeoHead />
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
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <QuoteModal />
    </LeadJourneyProvider>
  )
}
