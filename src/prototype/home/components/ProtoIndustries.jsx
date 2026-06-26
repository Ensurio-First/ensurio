import { motion } from 'framer-motion'
import { industries } from '../data/index.js'
import { useIsMobile } from '../hooks/useIsMobile.js'

import constructionImg from '../../../assets/industry-construction.jpg'
import manufacturingImg from '../../../assets/industry-manufacturing.jpg'
import logisticsImg from '../../../assets/industry-logistics.jpg'
import hospitalityImg from '../../../assets/industry-hospitality.jpg'
import aviationImg from '../../../assets/industry-aviation.jpg'
import engineeringImg from '../../../assets/industry-engineering.jpg'

const imageMap = {
  Construction: constructionImg,
  Manufacturing: manufacturingImg,
  Logistics: logisticsImg,
  Hospitality: hospitalityImg,
  Aviation: aviationImg,
  Engineering: engineeringImg,
}

export default function ProtoIndustries() {
  const isMobile = useIsMobile()

  return (
    <section style={{ background: 'var(--white)', padding: isMobile ? '3rem 0' : '5rem 0' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '0 0.75rem' : '0 4rem' }}>

        {/* Header */}
        <div style={{ marginBottom: isMobile ? '1.5rem' : '3rem' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--teal)', fontWeight: 700, fontFamily: 'var(--font-body)', marginBottom: '0.5rem' }}>
            Sectors
          </p>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '1.4rem' : 'clamp(1.6rem, 2.8vw, 2.2rem)', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.02em', margin: 0 }}>
              Industries We Serve
            </h2>
            {!isMobile && (
              <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)', maxWidth: '420px', fontSize: '14px', lineHeight: 1.7, margin: 0 }}>
                We understand the unique risk profiles of each sector and tailor coverage accordingly.
              </p>
            )}
          </div>
        </div>

        {/* Photo cards grid */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: '1px', background: 'var(--border)' }}>
          {industries.map((industry, i) => {
            const img = imageMap[industry.name]
            return (
              <motion.div
                key={industry.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.45 }}
                style={{ background: 'var(--white)', overflow: 'hidden', cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.querySelector('img').style.transform = 'scale(1.04)' }}
                onMouseLeave={e => { e.currentTarget.querySelector('img').style.transform = 'scale(1)' }}
              >
                {/* Photo */}
                <div style={{ overflow: 'hidden', height: isMobile ? '140px' : '200px' }}>
                  <img
                    src={img}
                    alt={industry.name}
                    style={{
                      width: '100%', height: '100%',
                      objectFit: 'cover', objectPosition: 'center',
                      display: 'block',
                      transition: 'transform 0.4s ease',
                    }}
                  />
                </div>

                {/* Text */}
                <div style={{ padding: isMobile ? '0.875rem 1rem' : '1.25rem 1.5rem', borderTop: '3px solid var(--teal)' }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '0.875rem' : '1rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.35rem' }}>
                    {industry.name}
                  </h3>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: isMobile ? '12px' : '13px', color: 'var(--text-muted)', lineHeight: 1.65, margin: 0, ...(isMobile ? { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } : {}) }}>
                    {industry.desc}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
