import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NavFooter from '../components/NavFooter'

const TABS = [
  { id: 'dashboard',  label: 'Dashboard',  path: '/j1' },
  { id: 'expenses',   label: 'Expenses',   path: '/j2' },
  { id: 'documents',  label: 'Documents',  path: '/j3' },
  { id: 'coach',      label: 'AI Coach',   path: '/j4' },
  { id: 'directory',  label: 'Directory',  path: '/j5' },
  { id: 'essentials', label: 'Essentials', path: '/j6' },
  { id: 'resources',  label: 'Resources',  path: '/a1' },
  { id: 'help',       label: 'Help',       path: '/a2' },
]

// Status icon helpers
const STATUS_ICON = {
  complete: '✅',
  urgent:   '⚠️',
  critical: '🔴',
  progress: '🔄',
  empty:    '⬜',
}

// ─── DATA ────────────────────────────────────────────────────────────────────

function buildSections(isCanada) {
  return [
    {
      id: 'financial',
      title: 'Financial & Legal',
      badge: 'Do in first 30 days',
      badgeColor: '#1B5FA8',
      badgeBg: '#EBF4FB',
      defaultOpen: true,
      items: [
        {
          id: 'bank',
          status: 'empty',
          title: 'Open US bank account',
          sub: 'Some US banks open accounts for new arrivals without an SSN. Bring your passport and visa approval documentation. Call ahead to confirm requirements.',
          canadianNote: isCanada ? 'TD Bank and RBC both offer cross-border accounts specifically for Canadians — no SSN required to open.' : null,
          actions: [{ label: 'Find a bank →', category: 'banking' }],
        },
        {
          id: 'cpa',
          status: 'empty',
          title: 'Engage cross-border accountant',
          sub: 'Engage a tax professional who understands both your home country and US tax obligations before you establish US residency. Tax decisions made after arrival can be costly and sometimes irreversible.',
          canadianNote: isCanada ? 'Must be engaged BEFORE your Canadian departure date to handle your CRA departure return, RRSP/TFSA decisions, and FBAR filing. Missing this window has real tax consequences.' : null,
          actions: [{ label: 'Find a cross-border CPA →', route: '/j5', routeState: { filter: 'cpas' } }],
        },
        {
          id: 'advisor',
          status: 'empty',
          title: 'Engage financial advisor',
          sub: 'Investment restructuring, tax-advantaged account wind-down strategy, and US portfolio setup. Ideally the same week as your accountant.',
          canadianNote: null,
          actions: [{ label: 'Find a financial advisor →', route: '/j5' }],
        },
        {
          id: 'departure-return',
          status: 'empty',
          title: 'File home country departure return',
          sub: 'Most countries require a final tax return or departure notification when you establish residency elsewhere. Confirm requirements with your cross-border accountant.',
          canadianNote: isCanada ? 'File your CRA departure return for the year you leave Canada. Your cross-border accountant handles this but you need to initiate it before your departure date.' : null,
          actions: [{ label: 'Learn more →' }],
        },
        {
          id: 'registered-accounts',
          status: 'empty',
          title: 'Wind down home country registered accounts',
          sub: 'Review all tax-advantaged accounts in your home country with your financial advisor. Treatment of foreign registered accounts under US tax law varies significantly and requires professional guidance.',
          canadianNote: isCanada ? 'RRSP and TFSA accounts require specific decisions around your departure date. TFSA loses its tax-free status once you become a US resident. Get advice before you leave — not after.' : null,
          actions: [{ label: 'Learn more →' }],
        },
        {
          id: 'credit',
          status: 'empty',
          title: 'Build US credit history',
          sub: 'You arrive in the US with zero credit history. Every month you delay costs you later — higher deposits, worse rates. Use Nova Credit to transfer your home country credit score or open a secured credit card immediately.',
          canadianNote: null,
          actions: [{ label: 'Learn how →' }],
        },
      ],
    },
    {
      id: 'healthcare',
      title: 'Healthcare',
      badge: 'Do in first 30 days',
      badgeColor: '#1B5FA8',
      badgeBg: '#EBF4FB',
      defaultOpen: false,
      items: [
        {
          id: 'health-insurance',
          status: 'critical',
          title: 'Enroll in US health insurance',
          sub: 'Confirm exactly when your home country health coverage ends after you establish US residency. There is often a gap between losing home country coverage and obtaining US coverage. Do not leave this unplanned.',
          canadianNote: isCanada ? 'Provincial health coverage typically ends within 3 months of establishing residency in another country — sometimes sooner. Check your province\'s specific rules and arrange US coverage before that date.' : null,
          actions: [{ label: 'Find health insurance options →' }],
        },
        {
          id: 'pcp',
          status: 'empty',
          title: 'Find a primary care physician',
          sub: 'Most practices have waitlists. Start this process before you need a doctor urgently.',
          canadianNote: null,
          actions: [{ label: 'Find a doctor →' }],
        },
        {
          id: 'dentist',
          status: 'empty',
          title: 'Find a dentist',
          sub: 'Home country dental coverage does not transfer. Confirm your US insurance includes dental or arrange separately.',
          canadianNote: null,
          actions: [{ label: 'Find a dentist →' }],
        },
        {
          id: 'rx',
          status: 'empty',
          title: 'Transfer prescription records',
          sub: 'Contact your home country pharmacy and request full prescription history. US doctors will ask for this.',
          canadianNote: null,
          actions: [{ label: 'Learn how →' }],
        },
        {
          id: 'medical-records',
          status: 'empty',
          title: 'Obtain medical records from home country doctors',
          sub: 'Request copies of all medical records before leaving — much harder to obtain after departure.',
          canadianNote: null,
          actions: [{ label: 'Learn how →' }],
        },
      ],
    },
    {
      id: 'vehicle',
      title: 'Vehicle & Transportation',
      badge: 'Critical — time sensitive',
      badgeColor: '#991B1B',
      badgeBg: '#FEE2E2',
      defaultOpen: true,
      items: [
        {
          id: 'auto-insurance',
          status: 'critical',
          title: 'Arrange US auto insurance',
          sub: 'Foreign auto insurance may void after a period of continuous US residence. You may be driving uninsured without knowing it. Confirm your coverage status now.',
          canadianNote: isCanada ? 'Canadian auto insurance typically voids at 6 months on Canadian-registered vehicles in the US. You may be driving uninsured without knowing it.' : null,
          actions: [{ label: 'Find insurance →', category: 'auto-insurance' }],
        },
        {
          id: 'plates',
          status: 'critical',
          title: 'Check home country vehicle registration status',
          sub: 'Confirm whether your home country vehicle registration remains valid while you are abroad and for how long. Driving on an expired foreign registration in the US creates legal exposure.',
          canadianNote: isCanada ? 'Most Canadian provinces void vehicle registration after 6 months abroad. Check your province\'s specific rules before that window closes.' : null,
          actions: [{ label: 'Check your province rules →' }],
        },
        {
          id: 'import',
          status: 'empty',
          title: 'Contact vehicle import company',
          sub: 'If importing your vehicle permanently, the compliance and registration process can take 6–8 weeks. Start early.',
          canadianNote: null,
          actions: [{ label: 'Find an import specialist →' }],
        },
        {
          id: 'fl-licence',
          status: 'empty',
          title: "Get Florida driver's licence",
          sub: "Florida requires you to obtain a state driver's licence within 30 days of establishing residency. Your foreign licence is not sufficient long-term.",
          canadianNote: null,
          actions: [{ label: 'Learn more →' }],
        },
        {
          id: 'us-reg',
          status: 'empty',
          title: 'Understand US vehicle registration',
          sub: "If purchasing a US vehicle, you'll need proof of insurance before registration. Do insurance first.",
          canadianNote: null,
          actions: [{ label: 'Learn more →' }],
        },
      ],
    },
    {
      id: 'government',
      title: 'Government & Identity',
      badge: 'Do in first 60 days',
      badgeColor: '#4A5568',
      badgeBg: '#F1F5F9',
      defaultOpen: false,
      items: [
        {
          id: 'ssn-apply',
          status: 'empty',
          title: 'Apply for SSN',
          sub: 'Eligibility depends on your visa type and status. Apply as early as you are eligible — processing can take weeks and errors go undetected.',
          canadianNote: null,
          actions: [{ label: "Check when you're eligible →" }],
        },
        {
          id: 'ssn-followup',
          status: 'urgent',
          title: 'Follow up on SSN application',
          sub: 'Call 3 weeks after applying to confirm no documentation issues. Errors are common and can affect healthcare, employment, and banking.',
          canadianNote: null,
          actions: [{ label: 'Mark as done', dismiss: true }, { label: 'Call SSA now →' }],
        },
        {
          id: 'i94',
          status: 'empty',
          title: 'Check I-94 for errors',
          sub: 'I-94 errors affect your legal status, healthcare eligibility, and employment authorization. Check yours at i94.cbp.dhs.gov immediately after entry.',
          canadianNote: null,
          actions: [{ label: 'Check your I-94 →' }],
        },
        {
          id: 'fl-id',
          status: 'empty',
          title: "Apply for Florida ID or driver's licence",
          sub: 'Required within 30 days of establishing Florida residency.',
          canadianNote: null,
          actions: [{ label: 'Learn more →' }],
        },
        {
          id: 'school',
          status: 'empty',
          title: 'Register children in school',
          sub: 'Requires proof of address plus immunization records. Florida has specific immunization requirements that may differ from your home country.',
          canadianNote: null,
          actions: [{ label: 'Learn more →' }],
        },
      ],
    },
    {
      id: 'comms',
      title: 'Communications & Utilities',
      badge: 'Do in first 2 weeks',
      badgeColor: '#1A7A4A',
      badgeBg: '#D1FAE5',
      defaultOpen: false,
      items: [
        {
          id: 'cell',
          status: 'empty',
          title: 'Set up US cell phone plan',
          sub: 'Foreign roaming charges accumulate fast. Switch to a US plan immediately — T-Mobile and AT&T offer plans with no SSN required.',
          canadianNote: null,
          actions: [{ label: 'Find options →' }],
        },
        {
          id: 'utilities',
          status: 'empty',
          title: 'Set up utilities',
          sub: 'Electric, internet, and water accounts typically require a deposit without a US credit history. Factor this into your first-month budget.',
          canadianNote: null,
          actions: [{ label: 'Learn more →' }],
        },
        {
          id: 'home-address',
          status: 'empty',
          title: 'Update home country address and accounts',
          sub: 'Notify your home country tax authority, banks, and pension or retirement providers of your departure and new address. Some institutions restrict accounts for non-residents — confirm with each.',
          canadianNote: isCanada ? 'Notify CRA, all Canadian banks, and any pension providers of your departure. Some Canadian banks restrict non-resident accounts — confirm your status with each institution.' : null,
          actions: [{ label: 'Learn how →' }],
        },
      ],
    },
    {
      id: 'immigration',
      title: 'Immigration Milestones',
      badge: 'Ongoing — never miss these',
      badgeColor: '#92400E',
      badgeBg: '#FEF3C7',
      defaultOpen: false,
      items: [
        {
          id: 'i485-track',
          status: 'progress',
          title: 'Track I-485 processing timeline',
          sub: 'Current processing: 13 months. Normal range for your service center: 12–24 months.',
          canadianNote: null,
          actions: [{ label: 'Check USCIS processing times →' }],
        },
        {
          id: 'service-request',
          status: 'empty',
          title: 'File USCIS Service Request if delays exceed normal range',
          sub: 'Free. Takes 10 minutes at uscis.gov. Worth doing once you exceed published processing times.',
          canadianNote: null,
          actions: [{ label: 'Learn how →' }],
        },
        {
          id: 'congressional',
          status: 'empty',
          title: 'Contact congressional office if delays persist',
          sub: 'Free, takes 15 minutes, and can significantly accelerate processing. Most applicants never know this exists.',
          canadianNote: null,
          actions: [{ label: 'Learn how →' }, { label: 'Ask AI Coach →', route: '/j4' }],
        },
        {
          id: 'gc-interview',
          status: 'empty',
          title: 'Calendar conditional green card interview',
          sub: 'Will be scheduled after I-485 approval. Prepare documentation in advance.',
          canadianNote: null,
          actions: [{ label: 'Learn more →' }],
        },
        {
          id: 'i829',
          status: 'empty',
          title: 'Calendar I-829 filing window',
          sub: 'Remove conditions on green card. Must be filed in the 90-day window before your 2-year conditional green card expires. Missing this window is serious.',
          canadianNote: null,
          actions: [{ label: 'Set reminder →' }],
        },
      ],
    },
  ]
}

// ─── AUTO INSURANCE CATEGORY ──────────────────────────────────────────────────

const AUTO_PROVIDERS = [
  {
    id: 'p1',
    badge: '🍁 CANADIAN SPECIALIST',
    name: 'Insurance Company A',
    tagline: 'Accepts Canadian driving records and Canadian-registered vehicles',
    stars: 5,
    reviewCount: 28,
    quote: 'Covered my Ontario plates with no hassle. Got set up same day.',
    reviewer: 'EB-5 applicant, Tampa, Jan 2026',
  },
  {
    id: 'p2',
    badge: null,
    name: 'Insurance Company B',
    tagline: "Foreign driver's licence accepted",
    stars: 4,
    reviewCount: 19,
    quote: null,
    reviewer: null,
  },
  {
    id: 'p3',
    badge: null,
    name: 'Insurance Company C',
    tagline: 'Standard option for comparison',
    stars: 4,
    reviewCount: 12,
    quote: null,
    reviewer: null,
  },
]

const BANKS = [
  {
    id: 'b1',
    name: 'TD Bank — Cross-Border Banking',
    detail: 'Clearwater Branch — Tampa Bay, FL',
    stars: 4,
    reviewCount: 31,
    quote: 'Opened my account with Canadian passport and EB-5 approval notice — no SSN required. Took 45 minutes.',
    reviewer: 'EB-5 applicant, Tampa, Oct 2025',
    actions: ['Get directions', 'Book appointment'],
  },
  {
    id: 'b2',
    name: 'RBC Cross-Border Banking',
    detail: null,
    stars: 5,
    reviewCount: 18,
    quote: 'Best option for RRSP questions and Canadian dollar conversion.',
    reviewer: null,
    actions: ['Get directions', 'Book appointment'],
  },
  {
    id: 'b3',
    name: 'Wise (formerly TransferWise)',
    detail: 'Best CAD/USD exchange rates. No branch needed — fully online.',
    stars: 4,
    reviewCount: 44,
    quote: null,
    reviewer: null,
    actions: ['Visit website'],
  },
]

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

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
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className="flex-shrink-0 flex flex-col items-center justify-center px-3 py-2.5 gap-0.5 transition-opacity active:opacity-60"
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
    <span className="text-xs" style={{ color: '#F0A500' }}>
      {'★'.repeat(count)}{'☆'.repeat(5 - count)}
    </span>
  )
}

function ActionButton({ action, onAction, isSecondary }) {
  return (
    <button
      onClick={() => onAction(action)}
      className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 flex-shrink-0"
      style={{
        backgroundColor: isSecondary ? 'rgba(0,0,0,0.05)' : '#EBF4FB',
        color: isSecondary ? '#4A5568' : '#1B5FA8',
        border: isSecondary ? '1px solid #E2E8F0' : '1px solid #4A9FD4',
      }}
    >
      {action.label}
    </button>
  )
}

function ChecklistItem({ item, onAction, onToggle }) {
  const icon = STATUS_ICON[item.status] || '⬜'
  const isCritical = item.status === 'critical'
  const isUrgent   = item.status === 'urgent'

  return (
    <div
      className="py-3 flex flex-col gap-2"
      style={{ borderBottom: '1px solid #F1F5F9' }}
    >
      <div className="flex items-start gap-2">
        <button
          onClick={() => onToggle(item.id)}
          className="flex-shrink-0 mt-0.5 text-base leading-none"
        >
          {icon}
        </button>
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-semibold leading-snug"
            style={{ color: isCritical ? '#991B1B' : isUrgent ? '#92400E' : '#0D2B4E' }}
          >
            {item.title}
          </p>
          {item.sub && (
            <p className="text-xs mt-1 leading-relaxed" style={{ color: '#4A5568' }}>
              {item.sub}
            </p>
          )}
          {item.canadianNote && (
            <div className="mt-1.5 rounded-lg px-2.5 py-2 flex items-start gap-1.5"
              style={{ backgroundColor: '#FFF8E7', border: '1px solid #FCD34D' }}>
              <span className="text-xs flex-shrink-0">🍁</span>
              <p className="text-xs leading-relaxed font-medium" style={{ color: '#92400E' }}>
                {item.canadianNote}
              </p>
            </div>
          )}
        </div>
      </div>
      {item.actions?.length > 0 && (
        <div className="flex flex-wrap gap-2 pl-7">
          {item.actions.map((action, i) => (
            <ActionButton key={i} action={action} onAction={onAction} isSecondary={i > 0} />
          ))}
        </div>
      )}
    </div>
  )
}

function SectionBlock({ section, onAction, onToggle }) {
  const [open, setOpen] = useState(section.defaultOpen)

  const criticalCount = section.items.filter((i) => i.status === 'critical').length
  const urgentCount   = section.items.filter((i) => i.status === 'urgent').length
  const doneCount     = section.items.filter((i) => i.status === 'complete').length
  const hasAlert      = criticalCount > 0 || urgentCount > 0

  return (
    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 gap-3 transition-opacity active:opacity-70"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0 text-left">
          <span className="text-sm font-extrabold leading-tight" style={{ color: '#0D2B4E' }}>
            {section.title}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: section.badgeBg, color: section.badgeColor }}
          >
            {section.badge}
          </span>
          {hasAlert && (
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}
            >
              {criticalCount + urgentCount} urgent
            </span>
          )}
          <span className="text-xs font-semibold" style={{ color: '#A0AEC0' }}>
            {doneCount}/{section.items.length}
          </span>
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="#A0AEC0" strokeWidth="2.5" strokeLinecap="round"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </button>
      {open && (
        <div className="px-4" style={{ borderTop: '1px solid #F1F5F9' }}>
          {section.items.map((item) => (
            <ChecklistItem key={item.id} item={item} onAction={onAction} onToggle={onToggle} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── CATEGORY SCREENS ─────────────────────────────────────────────────────────

function ProviderCard({ provider }) {
  return (
    <div className="rounded-2xl px-4 py-4 flex flex-col gap-3"
      style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
      {provider.badge && (
        <span className="self-start text-xs font-bold px-2 py-1 rounded-full"
          style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
          {provider.badge}
        </span>
      )}
      <div>
        <p className="text-sm font-extrabold" style={{ color: '#0D2B4E' }}>{provider.name}</p>
        <p className="text-xs mt-0.5" style={{ color: '#4A5568' }}>{provider.tagline}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <Stars count={provider.stars} />
          <span className="text-xs" style={{ color: '#4A5568' }}>{provider.reviewCount} verified reviews</span>
        </div>
      </div>
      {provider.quote && (
        <div className="rounded-xl px-3 py-2" style={{ backgroundColor: '#F7F9FC' }}>
          <p className="text-xs italic leading-relaxed" style={{ color: '#4A5568' }}>"{provider.quote}"</p>
          {provider.reviewer && (
            <p className="text-xs mt-1 font-semibold" style={{ color: '#A0AEC0' }}>— {provider.reviewer}</p>
          )}
        </div>
      )}
      <div className="flex gap-2">
        <button className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95"
          style={{ backgroundColor: '#1B5FA8', color: '#FFFFFF' }}>
          Get a quote
        </button>
        <button className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95"
          style={{ backgroundColor: '#EBF4FB', color: '#1B5FA8', border: '1px solid #4A9FD4' }}>
          Call now
        </button>
      </div>
    </div>
  )
}

function BankCard({ bank }) {
  return (
    <div className="rounded-2xl px-4 py-4 flex flex-col gap-3"
      style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
      <div>
        <p className="text-sm font-extrabold" style={{ color: '#0D2B4E' }}>{bank.name}</p>
        {bank.detail && <p className="text-xs mt-0.5" style={{ color: '#4A5568' }}>{bank.detail}</p>}
        <div className="flex items-center gap-1.5 mt-1">
          <Stars count={bank.stars} />
          <span className="text-xs" style={{ color: '#4A5568' }}>{bank.reviewCount} verified reviews</span>
        </div>
      </div>
      {bank.quote && (
        <div className="rounded-xl px-3 py-2" style={{ backgroundColor: '#F7F9FC' }}>
          <p className="text-xs italic leading-relaxed" style={{ color: '#4A5568' }}>"{bank.quote}"</p>
          {bank.reviewer && (
            <p className="text-xs mt-1 font-semibold" style={{ color: '#A0AEC0' }}>— {bank.reviewer}</p>
          )}
        </div>
      )}
      <div className="flex gap-2">
        {bank.actions.map((label, i) => (
          <button key={i}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95"
            style={{
              backgroundColor: i === 0 ? '#1B5FA8' : '#EBF4FB',
              color: i === 0 ? '#FFFFFF' : '#1B5FA8',
              border: i === 0 ? 'none' : '1px solid #4A9FD4',
            }}>
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

function AutoInsuranceScreen({ onBack }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F9FC' }}>
      <div className="px-5 pt-5 pb-5" style={{ backgroundColor: '#0D2B4E' }}>
        <button onClick={onBack} className="flex items-center gap-1 mb-3 transition-opacity active:opacity-70">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>Back to Essentials</span>
        </button>
        <h1 className="text-xl font-extrabold" style={{ color: '#FFFFFF' }}>Auto Insurance — Tampa, FL</h1>
        <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
          Specialists who accept Canadian driving records and Canadian-registered vehicles
        </p>
      </div>
      <div className="flex flex-col gap-4 px-4 pt-4 pb-40">
        {AUTO_PROVIDERS.map((p) => <ProviderCard key={p.id} provider={p} />)}
      </div>
      <TabBar active="essentials" />
    </div>
  )
}

function BankingScreen({ onBack }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F9FC' }}>
      <div className="px-5 pt-5 pb-5" style={{ backgroundColor: '#0D2B4E' }}>
        <button onClick={onBack} className="flex items-center gap-1 mb-3 transition-opacity active:opacity-70">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>Back to Essentials</span>
        </button>
        <h1 className="text-xl font-extrabold" style={{ color: '#FFFFFF' }}>Cross-Border Banking</h1>
        <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
          Banks that work with Canadian immigrants — no SSN required to open
        </p>
      </div>
      <div className="flex flex-col gap-4 px-4 pt-4 pb-40">
        {BANKS.map((b) => <BankCard key={b.id} bank={b} />)}
      </div>
      <TabBar active="essentials" />
    </div>
  )
}

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────

export default function J6Essentials() {
  const navigate = useNavigate()
  const [category, setCategory] = useState(null) // null | 'auto-insurance' | 'banking'

  // Read country from D2 answers saved in localStorage
  const isCanada = (() => {
    try {
      const saved = localStorage.getItem('migratrak_answers')
      if (!saved) return true // default to Canada for demo
      return JSON.parse(saved)?.country === 'Canada'
    } catch (_) { return true }
  })()

  const SECTIONS = buildSections(isCanada)
  const TOTAL_ITEMS = SECTIONS.reduce((sum, s) => sum + s.items.length, 0)

  const [items, setItems] = useState(() => {
    const map = {}
    buildSections(true).forEach((s) => s.items.forEach((item) => { map[item.id] = item.status }))
    return map
  })

  function handleAction(action) {
    if (action.category === 'auto-insurance') { setCategory('auto-insurance'); return }
    if (action.category === 'banking')        { setCategory('banking');        return }
    if (action.route) { navigate(action.route, action.routeState ? { state: action.routeState } : undefined); return }
    if (action.dismiss) { /* handled by toggle */ }
  }

  function handleToggle(id) {
    setItems((prev) => ({
      ...prev,
      [id]: prev[id] === 'complete' ? 'empty' : 'complete',
    }))
  }

  // Inject live statuses into sections
  const liveSections = SECTIONS.map((s) => ({
    ...s,
    items: s.items.map((item) => ({ ...item, status: items[item.id] ?? item.status })),
  }))

  const completeCount = Object.values(items).filter((s) => s === 'complete').length
  const pct = Math.round((completeCount / TOTAL_ITEMS) * 100)

  if (category === 'auto-insurance') return <AutoInsuranceScreen onBack={() => setCategory(null)} />
  if (category === 'banking')        return <BankingScreen onBack={() => setCategory(null)} />

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F9FC' }}>

      {/* Header */}
      <div className="px-5 pt-5 pb-5" style={{ backgroundColor: '#0D2B4E' }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#4A9FD4' }}>
          Chen Family · EB-5 Journey
        </p>
        <h1 className="text-2xl font-extrabold" style={{ color: '#FFFFFF' }}>Essentials</h1>
        <p className="text-xs mt-1 leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
          Everything you need to set up your life in the US — the list nobody gives you
        </p>

        {/* Progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {completeCount} of {TOTAL_ITEMS} tasks complete
            </span>
            <span className="text-sm font-extrabold" style={{ color: '#F0A500' }}>{pct}%</span>
          </div>
          <div className="w-full h-2 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
            <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: '#F0A500' }} />
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-4 px-4 pt-4 pb-40">
        {liveSections.map((section) => (
          <SectionBlock
            key={section.id}
            section={section}
            onAction={handleAction}
            onToggle={handleToggle}
          />
        ))}
      </div>

      <TabBar active="essentials" />
      <NavFooter backPath="/j5" nextPath="/a1" nextLabel="Next →" />
    </div>
  )
}
