import '../prototype.css'
import ProtoNav from './components/ProtoNav'
import ProtoHero from './components/ProtoHero'
import ProtoTrustBar from './components/ProtoTrustBar'
import ProtoProblems from './components/ProtoProblems'
import ProtoIndustries from './components/ProtoIndustries'
import ProtoServices from './components/ProtoServices'
import ProtoClaimsHighlight from './components/ProtoClaimsHighlight'
import ProtoTestimonials from './components/ProtoTestimonials'
import ProtoFounder from './components/ProtoFounder'
import ProtoInsights from './components/ProtoInsights'
import ProtoContactCTA from './components/ProtoContactCTA'
import ProtoFooter from './components/ProtoFooter'

export default function PrototypeHome() {
  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: '#fff', color: '#111827' }}>
      <ProtoNav />
      <main>
        <ProtoHero />
        <ProtoTrustBar />
        <ProtoProblems />
        <ProtoIndustries />
        <ProtoServices />
        <ProtoClaimsHighlight />
        <ProtoTestimonials />
        <ProtoFounder />
        <ProtoInsights />
        <ProtoContactCTA />
      </main>
      <ProtoFooter />
    </div>
  )
}
