import { useNavigate } from 'react-router-dom'

const TABS = [
  { id: 'dashboard',  label: 'Dashboard',  path: '/j1' },
  { id: 'expenses',   label: 'Expenses',   path: '/j2' },
  { id: 'documents',  label: 'Documents',  path: '/j3' },
  { id: 'coach',      label: 'AI Coach',   path: '/j4' },
  { id: 'directory',  label: 'Directory',  path: '/j5' },
  { id: 'essentials', label: 'Essentials', path: '/j6' },
  { id: 'resources',  label: 'Resources',  path: '/resources' },
]

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

function TabBar({ active }) {
  const navigate = useNavigate()
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex overflow-x-auto"
      style={{ backgroundColor: '#0D2B4E', borderTop: '1px solid rgba(255,255,255,0.1)', scrollbarWidth: 'none' }}>
      {TABS.map(tab => {
        const isActive = tab.id === active
        return (
          <button key={tab.id} onClick={() => navigate(tab.path)}
            className="flex-shrink-0 flex flex-col items-center justify-center px-3 py-2.5 gap-0.5 transition-opacity active:opacity-60"
            style={{ minWidth: 64 }}>
            <span className="text-xs font-semibold whitespace-nowrap"
              style={{ color: isActive ? '#F0A500' : 'rgba(255,255,255,0.5)' }}>
              {tab.label}
            </span>
            {isActive && <div className="w-4 h-0.5 rounded-full" style={{ backgroundColor: '#F0A500' }} />}
          </button>
        )
      })}
    </div>
  )
}

export default function JResourcesScreen() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F9FC' }}>

      <div className="px-5 pt-5 pb-5" style={{ backgroundColor: '#0D2B4E' }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#4A9FD4' }}>
          CLIENT PORTAL
        </p>
        <h1 className="text-2xl font-extrabold" style={{ color: '#FFFFFF' }}>Resources</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
          Official links and reference material
        </p>
      </div>

      <div className="flex flex-col gap-5 px-4 pt-5 pb-40">
        {LINKS.map(group => (
          <div key={group.section}>
            <p className="text-xs font-extrabold uppercase tracking-widest mb-2" style={{ color: '#4A5568' }}>
              {group.section}
            </p>
            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
              {group.items.map((item, i) => (
                <a
                  key={i}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start justify-between gap-3 px-4 py-3 transition-opacity active:opacity-60"
                  style={{ borderBottom: i < group.items.length - 1 ? '1px solid #F1F5F9' : 'none', textDecoration: 'none' }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: '#1B5FA8' }}>{item.label}</p>
                    {item.note && <p className="text-xs mt-0.5" style={{ color: '#4A5568' }}>{item.note}</p>}
                  </div>
                  <svg className="flex-shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4A9FD4" strokeWidth="2.5">
                    <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4" />
                    <path d="M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        ))}

        <p className="text-xs text-center" style={{ color: '#A0AEC0' }}>
          All links open official government or industry sites.{'\n'}MigraTrak is not affiliated with any of these organizations.
        </p>
      </div>

      <TabBar active="resources" />
    </div>
  )
}
