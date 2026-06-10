import { useNavigate } from 'react-router-dom'

export default function JResourcesScreen() {
  const navigate = useNavigate()

  const LINKS = [
    {
      section: 'USCIS & Government',
      items: [
        { label: 'USCIS Case Status Check', url: 'https://egov.uscis.gov/casestatus/landing.do', note: 'Track your pending petition or application' },
        { label: 'USCIS Processing Times', url: 'https://egov.uscis.gov/processing-times/', note: 'Official current processing time estimates' },
        { label: 'CBP I-94 Record', url: 'https://i94.cbp.dhs.gov/', note: 'Verify and correct your arrival/departure record' },
        { label: 'SSA — Apply for SSN', url: 'https://www.ssa.gov/number-card/request-number-first-time', note: 'Social Security Administration — first-time applicants' },
      ],
    },
    {
      section: 'EB-5 Resources',
      items: [
        { label: 'USCIS EB-5 Investor Program', url: 'https://www.uscis.gov/working-in-the-united-states/permanent-workers/eb-5-immigrant-investor-program', note: 'Official program overview and requirements' },
        { label: 'IIUSA — Industry Association', url: 'https://iiusa.org/', note: 'EB-5 regional center industry association' },
      ],
    },
    {
      section: 'E-2 & Other Visas',
      items: [
        { label: 'DOS E-2 Treaty Countries', url: 'https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/fees/treaty.html', note: 'Check if your country qualifies for E-2' },
        { label: 'USCIS TN Visa Guide', url: 'https://www.uscis.gov/working-in-the-united-states/temporary-workers/tn-nafta-professionals', note: 'TN visa for Canadian and Mexican professionals' },
      ],
    },
    {
      section: 'Florida — Local Resources',
      items: [
        { label: 'Florida DMV — Driver Licence', url: 'https://www.flhsmv.gov/driver-licenses-id-cards/', note: 'Required within 30 days of establishing FL residency' },
        { label: 'Florida Department of Revenue', url: 'https://floridarevenue.com/', note: 'State tax information for new residents' },
      ],
    },
  ]

  const TABS = [
    { id: 'dashboard', label: 'Dashboard', path: '/j1' },
    { id: 'expenses', label: 'Expenses', path: '/j2' },
    { id: 'documents', label: 'Documents', path: '/j3' },
    { id: 'coach', label: 'AI Coach', path: '/j4' },
    { id: 'directory', label: 'Directory', path: '/j5' },
    { id: 'essentials', label: 'Essentials', path: '/j6' },
    { id: 'resources', label: 'Resources', path: '/resources' },
  ]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F7F9FC', paddingBottom: 80 }}>
      <div style={{ backgroundColor: '#0D2B4E', padding: '20px 16px' }}>
        <p style={{ color: '#4A9FD4', fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>
          CLIENT PORTAL
        </p>
        <h1 style={{ color: '#FFFFFF', fontSize: 24, fontWeight: 800, margin: 0 }}>Resources</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginTop: 4 }}>
          Official links and reference material
        </p>
      </div>

      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {LINKS.map(group => (
          <div key={group.section}>
            <p style={{ color: '#4A5568', fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
              {group.section}
            </p>
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
              {group.items.map((item, i) => (
                <a
                  key={i}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 12,
                    padding: '12px 16px',
                    borderBottom: i < group.items.length - 1 ? '1px solid #F1F5F9' : 'none',
                    textDecoration: 'none',
                  }}
                >
                  <div>
                    <p style={{ color: '#1B5FA8', fontSize: 14, fontWeight: 600, margin: 0 }}>{item.label}</p>
                    {item.note && <p style={{ color: '#4A5568', fontSize: 12, margin: '2px 0 0 0' }}>{item.note}</p>}
                  </div>
                  <span style={{ color: '#4A9FD4', fontSize: 16, flexShrink: 0 }}>↗</span>
                </a>
              ))}
            </div>
          </div>
        ))}

        <p style={{ color: '#A0AEC0', fontSize: 12, textAlign: 'center' }}>
          All links open official government or industry sites. MigraTrak is not affiliated with any of these organizations.
        </p>
      </div>

      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        backgroundColor: '#0D2B4E',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', overflowX: 'auto',
      }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            style={{
              flex: '0 0 auto',
              minWidth: 64,
              padding: '10px 12px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <span style={{
              fontSize: 12,
              fontWeight: 600,
              color: tab.id === 'resources' ? '#F0A500' : 'rgba(255,255,255,0.5)',
              whiteSpace: 'nowrap',
            }}>
              {tab.label}
            </span>
            {tab.id === 'resources' && (
              <div style={{ width: 16, height: 2, borderRadius: 1, backgroundColor: '#F0A500' }} />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
