import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const TABS = [
  { id: 'dashboard', label: 'Dashboard', path: '/j1' },
  { id: 'expenses',  label: 'Expenses',  path: '/j2' },
  { id: 'documents', label: 'Documents', path: '/j3' },
  { id: 'coach',     label: 'AI Coach',  path: '/j4' },
  { id: 'directory', label: 'Directory', path: '/j5' },
  { id: 'essentials',label: 'Essentials',path: '/j6' },
  { id: 'help',      label: 'Help',      path: '/a2' },
]

const FILTERS = ['All', 'Attorneys', 'RCICs', 'CPAs', 'Financial Advisors', 'Real Estate', 'MLO / Mortgage', 'Healthcare', 'Vehicle Import', 'Business Brokers']

const PROFESSIONALS = [
  {
    id: 1,
    name: 'Mena Maimone',
    title: 'Immigration Attorney',
    firm: 'Maimone Legal',
    location: 'Fort Lauderdale, FL',
    address: '550 W Cypress Creek Rd, Suite 370\nFort Lauderdale, FL 33309',
    phones: [
      { label: 'Florida', number: '(888) 863-3207' },
      { label: 'Texas',   number: '(888) 370-6695' },
    ],
    hours: 'Monday – Friday, 9am – 5pm',
    specialties: ['EB-5', 'E-2', 'L-1', 'TN'],
    languages: ['English', 'French'],
    canadian: 'Extensive experience',
    bio: 'Canadian-born immigration attorney. Founder of the Canadians Moving to Florida and USA community (80,000+ members). Has personally navigated the same journey her clients are on.',
    note: null,
    badge: 'Founding Partner',
    category: 'Attorneys',
    stars: 5,
    reviews: null,
    expanded: true,
    primaryAction: 'Request Introduction',
  },
  {
    id: 2,
    name: 'Attorney B',
    title: 'Immigration Attorney',
    firm: null,
    location: 'Orlando, FL',
    address: null,
    phones: [],
    hours: null,
    specialties: ['E-2', 'TN'],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Attorneys',
    stars: 4,
    reviews: 23,
    expanded: false,
    primaryAction: 'Request Introduction',
  },
  {
    id: 3,
    name: 'CPA Name',
    title: 'Cross-Border Tax Specialist',
    firm: null,
    location: null,
    address: null,
    phones: [],
    hours: null,
    specialties: ['CRA departure', 'US filing', 'FBAR'],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'CPAs',
    stars: 5,
    reviews: 18,
    expanded: false,
    primaryAction: 'Request Introduction',
  },
  {
    id: 4,
    name: 'RE Agent Name',
    title: 'Real Estate Specialist',
    firm: 'LQ Commercial',
    location: 'Sarasota & Punta Gorda, FL',
    address: null,
    phones: [],
    hours: null,
    specialties: ['Canadian buyers', 'E-2 businesses'],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Real Estate',
    stars: 4,
    reviews: 31,
    expanded: false,
    primaryAction: 'Request Introduction',
  },
  {
    id: 5,
    name: 'Broker Name',
    title: 'Business Broker',
    firm: null,
    location: 'Southwest Florida',
    address: null,
    phones: [],
    hours: null,
    specialties: ['E-2 qualifying businesses'],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Business Brokers',
    stars: 4,
    reviews: 14,
    expanded: false,
    primaryAction: 'Request Introduction',
  },
  {
    id: 6,
    name: 'RCIC Name',
    title: 'Regulated Canadian Immigration Consultant',
    firm: 'Firm Name — City, Canada',
    location: 'Canada',
    address: null,
    phones: [],
    hours: null,
    specialties: ['Pre-departure planning', 'US visa referrals', 'Canadian exit strategy'],
    languages: null,
    canadian: null,
    bio: null,
    note: 'RCICs are regulated by CICC and can advise on Canadian immigration matters. For US visa applications, they work alongside US-licensed attorneys.',
    badge: null,
    category: 'RCICs',
    stars: 4,
    reviews: 12,
    expanded: false,
    primaryAction: 'Request Introduction',
  },
  {
    id: 7,
    name: 'Advisor Name',
    title: 'Cross-Border Financial Advisor',
    firm: 'Firm Name — City, FL',
    location: null,
    address: null,
    phones: [],
    hours: null,
    specialties: ['RRSP/TFSA wind-down', 'US portfolio setup', 'Cross-border tax planning', 'Retirement accounts'],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Financial Advisors',
    stars: 5,
    reviews: 9,
    expanded: false,
    primaryAction: 'Request Introduction',
  },
  {
    id: 8,
    name: 'MLO Name',
    title: 'Mortgage Loan Originator',
    firm: 'Firm Name — Southwest Florida',
    location: null,
    address: null,
    phones: [],
    hours: null,
    specialties: ['DSCR loans', 'Foreign national lending', 'Canadian investor financing', 'No SSN required options'],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'MLO / Mortgage',
    stars: 4,
    reviews: 17,
    expanded: false,
    primaryAction: 'Request Introduction',
  },
  {
    id: 9,
    name: 'Doctor Name, MD',
    title: 'Primary Care Physician',
    firm: 'Practice Name — Tampa, FL',
    location: null,
    address: null,
    phones: [],
    hours: null,
    specialties: ['New arrivals', 'Foreign medical records', 'Insurance transitions'],
    languages: null,
    canadian: null,
    bio: null,
    note: 'Experienced with new arrivals — understands foreign medical records and insurance transitions',
    accepting: true,
    badge: null,
    category: 'Healthcare',
    stars: 5,
    reviews: 24,
    expanded: false,
    primaryAction: 'Book appointment',
  },
  {
    id: 10,
    name: 'Dentist Name, DDS',
    title: 'General Dentist',
    firm: 'Practice Name — Tampa, FL',
    location: null,
    address: null,
    phones: [],
    hours: null,
    specialties: ['General dentistry', 'New patients welcome'],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    accepting: true,
    badge: null,
    category: 'Healthcare',
    stars: 4,
    reviews: 19,
    expanded: false,
    primaryAction: 'Book appointment',
  },
  {
    id: 11,
    name: 'Company Name',
    title: 'Vehicle Import Specialist',
    firm: 'City, FL',
    location: null,
    address: null,
    phones: [],
    hours: null,
    specialties: ['Canadian vehicle imports', 'RIV registration', 'US compliance modifications', 'Customs'],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Vehicle Import',
    stars: 4,
    reviews: 14,
    expanded: false,
    primaryAction: 'Request Introduction',
  },
]

function TabBar({ active }) {
  const navigate = useNavigate()
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 flex overflow-x-auto"
      style={{ backgroundColor: '#0D2B4E', borderTop: '1px solid rgba(255,255,255,0.1)', scrollbarWidth: 'none' }}
    >
      {TABS.map((tab) => {
        const isActive = tab.id === active
        return (
          <button key={tab.id} onClick={() => navigate(tab.path)}
            className="flex-shrink-0 flex flex-col items-center justify-center px-3 py-2.5 gap-0.5"
            style={{ minWidth: 64 }}
          >
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

function Stars({ count }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24"
          fill={i <= count ? '#F0A500' : '#E2E8F0'} stroke="none">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  )
}

function SpecialtyPill({ label }) {
  return (
    <span
      className="text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ backgroundColor: '#EBF4FB', color: '#1B5FA8' }}
    >
      {label}
    </span>
  )
}

function ProfessionalCard({ pro, initialOpen }) {
  const [open, setOpen] = useState(initialOpen)
  const [requested, setRequested] = useState(false)

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-sm"
      style={{
        backgroundColor: '#FFFFFF',
        border: pro.badge ? '2px solid #1B5FA8' : '1px solid #E2E8F0',
      }}
    >
      {/* Card header — always visible */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-5 py-4 transition-opacity active:opacity-70"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl font-bold"
              style={{ backgroundColor: pro.badge ? '#0D2B4E' : '#EBF4FB', color: pro.badge ? '#F0A500' : '#1B5FA8' }}
            >
              {pro.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-base font-extrabold leading-tight" style={{ color: '#0D2B4E' }}>
                  {pro.name}
                </p>
                {pro.badge && (
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: '#F0A500', color: '#0D2B4E' }}
                  >
                    {pro.badge}
                  </span>
                )}
              </div>
              <p className="text-xs mt-0.5" style={{ color: '#4A5568' }}>
                {pro.title}{pro.firm ? ` · ${pro.firm}` : ''}
              </p>
              {pro.location && (
                <p className="text-xs mt-0.5" style={{ color: '#4A9FD4' }}>
                  📍 {pro.location}
                </p>
              )}
              {pro.reviews && (
                <div className="flex items-center gap-1.5 mt-1">
                  <Stars count={pro.stars} />
                  <span className="text-xs" style={{ color: '#4A5568' }}>
                    {pro.reviews} verified reviews
                  </span>
                </div>
              )}
              {!pro.reviews && (
                <div className="mt-1"><Stars count={pro.stars} /></div>
              )}
            </div>
          </div>
          <svg
            width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="#A0AEC0" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0 mt-1"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>

        {/* Specialty pills — always visible */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {pro.specialties.map((s) => <SpecialtyPill key={s} label={s} />)}
        </div>
      </button>

      {/* Expanded detail */}
      {open && (
        <div className="px-5 pb-5 flex flex-col gap-4" style={{ borderTop: '1px solid #F1F5F9' }}>

          {/* Bio */}
          {pro.bio && (
            <p className="text-sm leading-relaxed pt-3 italic" style={{ color: '#4A5568' }}>
              "{pro.bio}"
            </p>
          )}

          {/* Note */}
          {pro.note && (
            <div className="rounded-xl px-3 py-2.5" style={{ backgroundColor: '#FFFBEB', border: '1px solid #FCD34D' }}>
              <p className="text-xs leading-relaxed" style={{ color: '#78350F' }}>{pro.note}</p>
            </div>
          )}

          {/* Accepting new patients */}
          {pro.accepting && (
            <p className="text-xs font-semibold" style={{ color: '#1A7A4A' }}>✓ Accepting new patients</p>
          )}

          {/* Details grid */}
          <div className="flex flex-col gap-2">
            {pro.address && (
              <div className="flex gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider w-20 flex-shrink-0 pt-0.5" style={{ color: '#4A5568' }}>Address</span>
                <p className="text-sm whitespace-pre-line" style={{ color: '#0D2B4E' }}>{pro.address}</p>
              </div>
            )}
            {pro.phones.length > 0 && (
              <div className="flex gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider w-20 flex-shrink-0 pt-0.5" style={{ color: '#4A5568' }}>Phone</span>
                <div className="flex flex-col gap-0.5">
                  {pro.phones.map((p) => (
                    <a key={p.label} href={`tel:${p.number.replace(/\D/g,'')}`}
                      className="text-sm font-semibold" style={{ color: '#1B5FA8' }}>
                      {p.label}: {p.number}
                    </a>
                  ))}
                </div>
              </div>
            )}
            {pro.hours && (
              <div className="flex gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider w-20 flex-shrink-0 pt-0.5" style={{ color: '#4A5568' }}>Hours</span>
                <p className="text-sm" style={{ color: '#0D2B4E' }}>{pro.hours}</p>
              </div>
            )}
            {pro.languages && (
              <div className="flex gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider w-20 flex-shrink-0 pt-0.5" style={{ color: '#4A5568' }}>Languages</span>
                <p className="text-sm" style={{ color: '#0D2B4E' }}>{pro.languages.join(', ')}</p>
              </div>
            )}
            {pro.canadian && (
              <div className="flex gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider w-20 flex-shrink-0 pt-0.5" style={{ color: '#4A5568' }}>Canadian</span>
                <p className="text-sm" style={{ color: '#1A7A4A' }}>🍁 {pro.canadian}</p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2 pt-1">
            {/* Row 1: View Profile + Call Now (if phone available) */}
            <div className="flex gap-2">
              <button
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95"
                style={{ backgroundColor: '#EBF4FB', color: '#1B5FA8' }}
              >
                View Profile
              </button>
              {pro.phones.length > 0 && (
                <a
                  href={`tel:${pro.phones[0].number.replace(/\D/g,'')}`}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-center transition-all active:scale-95"
                  style={{ backgroundColor: '#1A7A4A', color: '#FFFFFF' }}
                >
                  📞 Call Now
                </a>
              )}
            </div>
            {/* Primary action */}
            <button
              onClick={() => setRequested(true)}
              className="w-full py-3 rounded-xl text-sm font-bold transition-all active:scale-95"
              style={{
                backgroundColor: requested ? '#D1FAE5' : '#F0A500',
                color: requested ? '#1A7A4A' : '#0D2B4E',
              }}
            >
              {requested ? `✓ ${pro.primaryAction || 'Request Introduction'} confirmed` : `${pro.primaryAction || 'Request Introduction'} →`}
            </button>
          </div>
        </div>
      )}

      {/* Collapsed action strip */}
      {!open && (
        <div className="flex gap-2 px-5 pb-4">
          <button
            className="flex-1 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
            style={{ backgroundColor: '#EBF4FB', color: '#1B5FA8' }}
          >
            View Profile
          </button>
          <button
            onClick={() => setRequested(true)}
            className="flex-1 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
            style={{
              backgroundColor: requested ? '#D1FAE5' : '#F0A500',
              color: requested ? '#1A7A4A' : '#0D2B4E',
            }}
          >
            {requested ? '✓ Done' : (pro.primaryAction || 'Request Intro') + ' →'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function J5Directory() {
  const { state } = useLocation()
  const filterMap = { attorneys: 'Attorneys', cpas: 'CPAs', 'financial-advisors': 'Financial Advisors', healthcare: 'Healthcare', 'vehicle-import': 'Vehicle Import' }
  const initialFilter = filterMap[state?.filter] ?? 'All'
  const [activeFilter, setActiveFilter] = useState(initialFilter)

  const filtered = activeFilter === 'All'
    ? PROFESSIONALS
    : PROFESSIONALS.filter((p) => p.category === activeFilter)

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F9FC' }}>

      {/* Header */}
      <div className="px-5 pt-5 pb-4" style={{ backgroundColor: '#0D2B4E' }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#4A9FD4' }}>
          Professional Directory
        </p>
        <h1 className="text-2xl font-extrabold" style={{ color: '#FFFFFF' }}>
          Find the Right Professional
        </h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
          Vetted specialists who understand the Canadian to US journey
        </p>
      </div>

      {/* Filter bar */}
      <div
        className="flex gap-2 px-4 py-3 overflow-x-auto sticky top-0 z-30"
        style={{ backgroundColor: '#F7F9FC', borderBottom: '1px solid #E2E8F0', scrollbarWidth: 'none' }}
      >
        {FILTERS.map((f) => {
          const isActive = f === activeFilter
          return (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className="flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all active:scale-95"
              style={{
                backgroundColor: isActive ? '#0D2B4E' : '#FFFFFF',
                color: isActive ? '#F0A500' : '#4A5568',
                border: isActive ? '2px solid #0D2B4E' : '2px solid #E2E8F0',
              }}
            >
              {f}
            </button>
          )
        })}
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-4 px-4 pt-4 pb-40">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-base font-semibold" style={{ color: '#4A5568' }}>
              No listings in this category yet
            </p>
            <p className="text-sm mt-1" style={{ color: '#A0AEC0' }}>
              Check back soon — we're adding specialists weekly
            </p>
          </div>
        ) : (
          filtered.map((pro) => (
            <ProfessionalCard key={pro.id} pro={pro} initialOpen={pro.expanded} />
          ))
        )}

        {/* Footer note */}
        <div
          className="rounded-2xl px-4 py-4 text-center"
          style={{ backgroundColor: '#EBF4FB', border: '1px solid #4A9FD4' }}
        >
          <p className="text-xs leading-relaxed" style={{ color: '#0D2B4E' }}>
            All professionals listed have been reviewed by the MigraTrak team. MigraTrak may receive a referral fee. This does not affect the quality or independence of our recommendations.
          </p>
        </div>
      </div>

      <TabBar active="directory" />
    </div>
  )
}
