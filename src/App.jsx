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
import PrototypeHome from './prototype/home/index.jsx'

const PROTO_PATHS = ['/', '/services', '/contact']

export default function App() {
  const location = useLocation()
  const isPrototype = PROTO_PATHS.includes(location.pathname) || location.pathname.startsWith('/prototype')

  return (
    <>
      {!isPrototype && <Navbar />}
      <Routes>
        <Route path="/" element={<PrototypeHome />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/risk-management" element={<RiskManagementPage />} />
        <Route path="/management-consultancy" element={<ManagementConsultancyPage />} />
      </Routes>
      {!isPrototype && <Footer />}
      {!isPrototype && <WhatsAppButton />}
      {!isPrototype && <ScrollReminderPopup />}
    </>
  )
}
