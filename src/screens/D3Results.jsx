import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

// ── Personalization helpers ────────────────────────────────────────────────────

function isCanada(answers) { return answers.country === 'Canada' }
function isBusiness(answers) { return answers.motivation === 'Buying or starting a business' }
function isEmployerTransfer(answers) { return answers.motivation === 'My employer is transferring me' }
function isLifestyleOrFamily(answers) {
  return answers.motivation === 'Lifestyle — I want a fresh start' || answers.motivation === 'Family reasons'
}
function isFamilyNonK1(answers) {
  return answers.motivation === 'Family reasons' && answers.family_situation !== 'Yes'
}
function isLowBudget(answers) { return answers.budget === 'Under $100,000' }
function isNotSure(answers) { return answers.motivation === 'Not sure yet' }
function hasAgeOutRisk(answers) { return answers.children === 'Yes — aged 18, 19, or 20' }
function hasFundSource(answers) { return !!answers.fund_source }
function fundReadinessIsLimited(answers) {
  return !!answers.fund_readiness && answers.fund_readiness !== 'Accessible now — funds are liquid and in hand'
}
const FUND_SOURCE_NOTES = {
  'Savings / cash on hand':
    'Cash savings are the most straightforward source of funds — keep bank statements showing the accumulation over time, as USCIS and your attorney will want to see where the balance came from.',
  'Sale of a business':
    "You'll need the sale agreement, business tax returns, and bank statements showing the proceeds landing — keep these organized from day one.",
  'Sale of property (e.g., your home)':
    'Selling property takes time to close, and USCIS will want the purchase and sale agreements plus bank records showing the proceeds — start this process early.',
  'RRSP, RRIF, or investment accounts':
    'Withdrawing from an RRSP or RRIF triggers Canadian withholding tax immediately and adds the amount to your taxable income for the year — factor that into your real budget, not just the investment minimum.',
  'Home equity loan or line of credit (HELOC)':
    "A HELOC against Canadian property is one of the most common — and best-documented — sources of investor visa funds. You'll need the HELOC agreement and bank records showing the draw.",
  'Gift or inheritance from family':
    "Gifted or inherited funds are accepted, but USCIS will also want to see the lawful source of the donor's funds and proof of your relationship — not just a gift letter.",
  'Not sure yet':
    'Where your funds come from — and proving they were lawfully obtained — is one of the most scrutinized parts of any investor visa case. This is exactly the kind of thing worth mapping out with an attorney early.',
}
function hasFamilyChildren(answers) {
  return answers.household === 'Me, spouse, and children' || answers.children?.startsWith('Yes')
}
function budgetLabel(answers) {
  const map = {
    'Under $100,000': 'under $100,000',
    '$100,000 to $300,000': '$100,000 to $300,000',
    '$300,000 to $800,000': '$300,000 to $800,000',
    'Over $800,000': 'over $800,000',
    'Not sure yet': 'undecided',
  }
  return map[answers.budget] || answers.budget || 'undecided'
}
// ── Visa card logic ────────────────────────────────────────────────────────────

function buildCards(answers) {
  const canada   = isCanada(answers)
  const budget   = answers.budget
  const children = hasFamilyChildren(answers)
  const dependentNote = children ? 'Dependent family members add processing steps and fees to each stage.' : null

  const e2Card = {
    id: 'e2', title: 'E-2 Investor Visa', lead: false,
    opener: canada && isBusiness(answers)
      ? `As a Canadian citizen with a business motivation and a ${budgetLabel(answers)} budget, the E-2 is typically the first visa attorneys explore in your situation.`
      : 'This pathway may be worth exploring with an immigration attorney based on your profile.',
    budgetWarning: budget === 'Under $100,000'
      ? 'Your stated budget is below the typical E-2 investment range. An attorney can advise on whether structuring options exist.' : null,
    whatItIs: 'Invest in or buy a US business and live and work here while you operate it.',
    investment: '$100,000 – $500,000 typical', timeline: '4–8 months',
    greenCard: 'Not directly — requires a separate petition later', greenCardPath: false,
    renewable: 'Yes, indefinitely while business operates',
    rightFor: 'You want to buy or start a business and be actively involved in running it',
    warning: 'Does not by itself lead to permanent residency or citizenship', dependentNote,
    expandLabel: 'Learn more about E-2', ctaLabel: 'Get my cost estimate', ctaVisa: 'e2',
    expandContent: [
      'The E-2 requires you to invest a "substantial" amount in a US business — USCIS does not specify a minimum, but $100,000–$500,000 is typical in practice.',
      'You must own at least 50% of the business and be actively managing it.',
      'Canada is a treaty country, meaning Canadians are eligible. Not all nationalities qualify.',
      'The E-2 is renewable indefinitely as long as the business continues to operate — but it does not create a direct path to a green card.',
    ],
  }

  const eb5Card = {
    id: 'eb5', title: 'EB-5 Investor Green Card', lead: false,
    opener: budget === 'Over $800,000'
      ? 'With your investment budget and long-term residency goal, the EB-5 is worth exploring as your primary pathway.'
      : 'If permanent US residency is your ultimate goal, the EB-5 is worth understanding — though your current budget may require planning for the investment threshold.',
    whatItIs: 'Invest in a qualifying US project or business and receive a green card.',
    investment: '$800,000 minimum (USCIS 2024)', timeline: '12–36 months (processing times vary)',
    greenCard: 'YES — this IS the green card', greenCardPath: true,
    renewable: 'N/A — leads to permanent residence',
    rightFor: 'Long-term US residency and a pathway to citizenship is your ultimate goal',
    warning: 'Higher investment threshold and longer wait — but leads directly to permanent residency. Processing times have improved significantly since 2023.',
    dependentNote, expandLabel: 'Learn more about EB-5', ctaLabel: 'Get my cost estimate', ctaVisa: 'eb5',
    expandContent: [
      'The $800,000 threshold applies to investments in Targeted Employment Areas (TEA). Non-TEA investments require $1,050,000.',
      'The investment must create at least 10 full-time US jobs.',
      'Regional center investments are passive — you do not need to manage the business.',
      'Your investment is held in the project, not spent as a fee. It is at-risk capital.',
      'After 2 years of conditional residency, you file to remove conditions and receive a permanent green card.',
    ],
  }

  const tnCard = {
    id: 'tn', title: 'TN Visa — USMCA Professional', lead: false,
    opener: 'As a Canadian citizen, you have access to the TN visa — one of the fastest and simplest US work authorization options available.',
    whatItIs: 'Work authorization for Canadian professionals in specific qualifying occupations under the USMCA trade agreement.',
    investment: 'None', timeline: 'Can be approved same day at the border',
    greenCard: 'Not directly', greenCardPath: false,
    renewable: 'Yes, annually (no maximum period)',
    rightFor: 'You work in a qualifying profession and have a US employer offering you a position',
    warning: 'Only available to Canadian and Mexican citizens. Requires a job offer from a US employer in a qualifying occupation. Does not lead to permanent residency.',
    dependentNote, expandLabel: 'Check qualifying occupations', ctaLabel: 'Get my cost estimate', ctaVisa: 'tn',
    expandContent: [
      'TN qualifying occupations include: accountants, engineers, lawyers, pharmacists, scientists, teachers, and many more — over 60 categories.',
      'You apply at the port of entry (land border or airport) or via DS-160 at a US consulate.',
      'There is no annual cap or lottery — unlike the H-1B.',
      'Each TN admission is granted for up to 3 years, renewable indefinitely.',
      'Spouses and children enter on TD visas but are not authorized to work.',
    ],
  }

  const l1Card = {
    id: 'l1', title: 'L-1 Intracompany Transfer Visa', lead: false,
    opener: "You're being transferred by your employer — the L-1 is almost certainly your pathway. Your company's immigration counsel will typically manage this process.",
    whatItIs: 'Allows multinational companies to transfer employees from a foreign office to a US office.',
    investment: 'None — employer sponsored', timeline: '2–4 months standard; 15 business days with premium processing',
    greenCard: 'Yes — L-1A (managers) can lead to EB-1C green card', greenCardPath: true,
    renewable: 'Up to 7 years (L-1A managers); up to 5 years (L-1B specialists)',
    rightFor: "You've worked for your employer for at least 1 year and are being transferred to a US office",
    warning: "Tied to your employer — if you leave the company your status is affected. Confirm details with your employer's immigration counsel.",
    dependentNote, expandLabel: 'Learn more about L-1', ctaLabel: 'Get my cost estimate', ctaVisa: 'l1',
    expandContent: [
      'L-1A is for managers and executives; L-1B is for employees with specialized knowledge.',
      'You must have worked for the company for at least 1 continuous year within the past 3 years.',
      'L-1A holders can pursue the EB-1C green card (multinational manager/executive) — often faster than EB-2 or EB-3.',
      'Your employer files the petition — you do not file individually.',
      'Premium processing (15 business days) is available for an additional $2,805 fee.',
    ],
  }

  const o1Card = {
    id: 'o1', title: 'O-1 Extraordinary Ability Visa', lead: false,
    opener: 'If you have recognized achievements in your field — awards, media coverage, leadership roles, published work — the O-1 may let you work in the US without a lottery or large investment.',
    whatItIs: 'For individuals with extraordinary ability in sciences, arts, education, business, or athletics, evidenced by sustained national or international acclaim.',
    investment: 'None', timeline: '2–4 months',
    greenCard: 'Yes — can lead to EB-1 green card', greenCardPath: true,
    renewable: 'Renewable in 1-year increments, no maximum',
    rightFor: 'You have documented evidence of extraordinary achievement — major awards, significant media coverage, critical roles, high remuneration, published work, or similar',
    warning: 'The evidentiary bar is genuinely high — USCIS requires at least 3 of 8 specific criteria (or comparable evidence). An attorney can assess whether your background is strong enough before you invest time building a petition.',
    dependentNote, expandLabel: 'Learn more about O-1', ctaLabel: 'Get my cost estimate', ctaVisa: 'o1',
    expandContent: [
      'O-1 requires evidence of sustained acclaim — examples include major awards, published material about you, judging others\u2019 work, high salary relative to your field, or original contributions of major significance.',
      'You need a US petitioner (employer, agent, or organization) — but no employer sponsorship in the traditional H-1B sense.',
      'No annual cap and no lottery — processing is faster and more predictable than H-1B.',
      'Initial period is up to 3 years, renewable in 1-year increments indefinitely.',
      'Can transition toward an EB-1A green card (extraordinary ability) if your achievements continue.',
      'Your spouse and unmarried children under 21 can accompany you on O-3 status — same rules as TD: they can live in the US but cannot work.',
    ],
  }

  const h1bCard = {
    id: 'h1b', title: 'H-1B Specialty Occupation Visa', lead: false,
    opener: "With a US job offer in hand, the H-1B is the standard pathway for specialty-occupation roles — though it's subject to an annual lottery.",
    whatItIs: "Work authorization for roles requiring at least a bachelor's degree in a specialty field, sponsored by a US employer.",
    investment: 'None', timeline: '3–6 months (lottery in April)',
    greenCard: 'Yes — can lead to EB-2/EB-3 green card', greenCardPath: true,
    renewable: 'Up to 6 years; extendable with green card petition',
    rightFor: 'You have a job offer from a US employer in a role requiring a bachelor\u2019s degree or higher',
    warning: 'Subject to an annual lottery with limited spots — not guaranteed even with a valid job offer. Your employer files the petition on your behalf.',
    dependentNote, expandLabel: 'Learn more about H-1B', ctaLabel: 'Get my cost estimate', ctaVisa: 'h1b',
    expandContent: [
      'The H-1B has an annual cap, and most years receive far more applications than available slots — selection is by random lottery each March/April.',
      'Your employer must file the petition (Form I-129) — you cannot self-petition.',
      'H-1B status is valid for up to 3 years initially, renewable to a maximum of 6 years (longer if a green card petition is in process).',
      'If your role might qualify as a TN occupation and you\u2019re Canadian, TN has no lottery and may be faster — worth discussing with an attorney.',
      'H-1B can lead to an EB-2 or EB-3 green card if your employer sponsors you.',
      'Your spouse and unmarried children under 21 can accompany you on H-4 status. H-4 spouses generally cannot work — but may qualify for an H-4 EAD (work permit) once you have an approved I-140 immigrant petition.',
    ],
  }

  const k1Card = {
    id: 'k1', title: 'K-1 Fianc\u00e9(e) Visa', lead: false,
    relationshipNote: answers.household !== 'Just me'
      ? "K-1 is for couples who are engaged but not yet married. If you're already married or in a long-term relationship with someone other than your US citizen fianc\u00e9(e), your situation may call for a different pathway — this is worth clarifying with an attorney right away."
      : null,
    opener: "Since you're engaged to a US citizen and planning to marry within 90 days of arriving, the K-1 fianc\u00e9 visa is the pathway built for exactly this situation.",
    whatItIs: 'For the foreign-citizen fianc\u00e9(e) of a US citizen — you enter the US, must marry your sponsor within 90 days, then apply to adjust status to permanent resident.',
    investment: 'None', timeline: '6–9 months',
    greenCard: 'Yes — apply for green card after marriage', greenCardPath: true,
    renewable: 'Single-entry — leads directly to a green card after marriage',
    rightFor: 'You are engaged to a US citizen and plan to marry within 90 days of entering the US',
    warning: 'You must marry your US citizen sponsor within 90 days of entry, or you are required to leave the US. The relationship and engagement must be well-documented for USCIS.',
    dependentNote, expandLabel: 'Learn more about K-1', ctaLabel: 'Get my cost estimate', ctaVisa: 'k1',
    expandContent: [
      'Your US citizen fianc\u00e9(e) files Form I-129F on your behalf — the process starts in the US, not at the consulate.',
      'You must have met your fianc\u00e9(e) in person within the last 2 years (with limited exceptions).',
      'After entering on the K-1, you must marry within 90 days, then file Form I-485 to become a permanent resident.',
      'Children of the K-1 applicant may be eligible for K-2 visas.',
      'This is a one-time entry with no renewal — the pathway leads directly toward a green card through marriage.',
    ],
  }

  if (isLowBudget(answers)) {
    const e2Caution = { ...e2Card, lead: false, caution: true,
      opener: 'The E-2 typically requires a minimum investment of $100,000 or more to demonstrate it is "substantial" under USCIS guidelines. Your current budget may make this pathway difficult without additional capital planning.',
      warning: 'An attorney may identify creative structuring options — but be cautious of anyone who guarantees E-2 approval at under $100,000.',
    }
    if (canada) return [{ ...tnCard, lead: true }, e2Caution]
    return [e2Caution]
  }
  if (isEmployerTransfer(answers)) {
    const cards = [{ ...l1Card, lead: true }]
    if (canada) cards.push(tnCard)
    return cards
  }
  if (answers.motivation === 'Family reasons') {
    if (answers.family_situation === 'Yes') {
      const cards = [{ ...k1Card, lead: true }]
      if (canada) cards.push(tnCard)
      return cards
    }
    return []
  }
  if (answers.motivation === 'Lifestyle — I want a fresh start') {
    const pb = answers.professional_background
    if (canada && pb === 'I work in a profession on the USMCA professional list (engineer, accountant, teacher, scientist, etc.)') {
      return [{ ...tnCard, lead: true }]
    }
    if (pb === 'I have notable achievements, awards, or recognition in my field') {
      const cards = [{ ...o1Card, lead: true }]
      if (canada) cards.push(tnCard)
      return cards
    }
    if (pb === 'I have a job offer (or strong prospects) from a US employer') {
      const cards = [{ ...h1bCard, lead: true }]
      if (canada) cards.push(tnCard)
      return cards
    }
    const cards = [e2Card, eb5Card]
    if (canada) cards.push(tnCard)
    return cards
  }
  if (isLifestyleOrFamily(answers) || isNotSure(answers)) {
    const cards = [e2Card, eb5Card]
    if (canada) cards.push(tnCard)
    return cards
  }
  if (isBusiness(answers)) {
    if (budget === 'Over $800,000') {
      const cards = [{ ...eb5Card, lead: true }, e2Card]
      if (canada) cards.push(tnCard)
      return cards
    }
    if (budget === '$300,000 to $800,000') {
      const cards = [{ ...e2Card, lead: true }, eb5Card]
      if (canada) cards.push(tnCard)
      return cards
    }
    const cards = [{ ...e2Card, lead: true }]
    if (canada) cards.push(tnCard)
    return cards
  }
  const cards = [e2Card, eb5Card]
  if (canada) cards.push(tnCard)
  return cards
}

function buildHeader(answers) {
  if (isEmployerTransfer(answers)) {
    return "Based on your answers — employer-sponsored move — the L-1 visa is likely your primary pathway. Your employer's immigration counsel will typically lead this process."
  }
  if (answers.motivation === 'Family reasons' && answers.family_situation === 'Yes') {
    return "Based on your answers — engaged to a US citizen and planning to marry within 90 days of arriving — the K-1 fianc\u00e9 visa is likely your primary pathway."
  }
  if (answers.motivation === 'Lifestyle — I want a fresh start') {
    const pb = answers.professional_background
    if (isCanada(answers) && pb === 'I work in a profession on the USMCA professional list (engineer, accountant, teacher, scientist, etc.)') {
      return 'Based on your answers — a Canadian citizen in a qualifying profession — the TN visa is likely your fastest pathway, with other options below for context.'
    }
    if (pb === 'I have notable achievements, awards, or recognition in my field') {
      return 'Based on your answers, the O-1 visa may let you work in the US based on your professional achievements — without the typical lottery or investment requirements.'
    }
    if (pb === 'I have a job offer (or strong prospects) from a US employer') {
      return "Based on your answers — you have a US job offer — the H-1B is the standard pathway, though it's subject to an annual lottery. A faster alternative is included below if it applies to you."
    }
  }
  if (isFamilyNonK1(answers)) {
    return 'Family-sponsored immigration — based on your relationship to a US citizen or permanent resident relative — follows a different process than the work and investment visa pathways covered here. An immigration attorney can map out the right category and timeline for your specific situation.'
  }
  if (isLifestyleOrFamily(answers)) {
    return "Your situation doesn't fit a single obvious visa category — which is actually common. The right path depends on factors an attorney will uncover in a 30-minute consultation. Here's a general overview of the most common options for your profile."
  }
  if (isNotSure(answers)) {
    return "No problem — most people aren't sure at this stage. Here's an overview of the main pathways so you can go into an attorney consultation already informed."
  }
  if (isBusiness(answers) && isCanada(answers)) {
    return `Based on your answers — Canadian citizen, business motivation, ${budgetLabel(answers)} budget — here are your most likely pathways. These are starting points for a conversation with an attorney, not a final determination.`
  }
  return 'Based on your answers, here are your most likely visa pathways. These are starting points for a conversation with an attorney, not a final determination.'
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Stars({ count }) {
  return (
    <span style={{ color: '#F0A500', letterSpacing: 1 }}>
      {'★'.repeat(count)}{'☆'.repeat(5 - count)}
    </span>
  )
}

function AgeOutBanner({ onFindAttorney }) {
  return (
    <div style={{ backgroundColor: '#DC2626' }} className="w-full px-4 pt-4 pb-3">
      <div className="flex gap-2 items-start mb-3">
        <span className="text-xl leading-none mt-0.5">🚨</span>
        <div>
          <p className="text-sm font-extrabold uppercase tracking-wide mb-1" style={{ color: '#FFFFFF' }}>
            Time-Sensitive: Age-Out Risk
          </p>
          <p className="text-sm leading-relaxed" style={{ color: '#FEE2E2' }}>
            Based on your answers, you have a dependent child approaching 21. They could lose eligibility as a dependent on your application when they turn 21 — regardless of where you are in the process. This affects your entire family's timeline.
          </p>
          <p className="text-sm font-semibold mt-2" style={{ color: '#FFFFFF' }}>
            Speak with a specialist this week — not next month.
          </p>
        </div>
      </div>
      <button onClick={onFindAttorney}
        className="w-full py-2.5 rounded-xl text-sm font-bold transition-opacity active:opacity-80"
        style={{ backgroundColor: '#FFFFFF', color: '#DC2626' }}>
        Find a specialist now →
      </button>
    </div>
  )
}

function LowBudgetInfoBox() {
  return (
    <div className="mx-4 mb-2 rounded-2xl px-4 py-4" style={{ backgroundColor: '#FFFBEB', border: '1px solid #FCD34D' }}>
      <p className="text-xs font-extrabold uppercase tracking-wider mb-1" style={{ color: '#92400E' }}>Budget Consideration</p>
      <p className="text-sm leading-relaxed" style={{ color: '#78350F' }}>
        Based on your budget range, your visa options are more limited than higher investment tiers. This is worth discussing with an immigration attorney — some pathways have more flexibility than published minimums suggest, and your situation may have options not immediately obvious.
      </p>
    </div>
  )
}

function LifestyleInfoBox() {
  return (
    <div className="mx-4 mb-2 rounded-2xl px-4 py-4" style={{ backgroundColor: '#EBF4FB', border: '1px solid #4A9FD4' }}>
      <p className="text-sm leading-relaxed" style={{ color: '#0D2B4E' }}>
        Your move is lifestyle or family motivated — which means your visa pathway depends heavily on factors like your profession, whether you have a US employer, your investment capacity, and your long-term residency goals.
      </p>
      <p className="text-sm leading-relaxed mt-2" style={{ color: '#4A5568' }}>
        The options below are the most common pathways for people in your situation. A 30-minute consultation with an immigration attorney will clarify which applies to you — most offer this at no charge.
      </p>
    </div>
  )
}

function FamilySponsoredInfoBox({ onFindAttorney }) {
  return (
    <div className="mx-4 mb-2 rounded-2xl px-4 py-4" style={{ backgroundColor: '#EBF4FB', border: '1px solid #4A9FD4' }}>
      <p className="text-sm leading-relaxed" style={{ color: '#0D2B4E' }}>
        Family-sponsored immigration — based on a US citizen or permanent resident parent, sibling, adult child, or spouse — follows immigrant visa categories with their own priority dates, petitions, and timelines.
      </p>
      <p className="text-sm leading-relaxed mt-2" style={{ color: '#4A5568' }}>
        This is a different process than the work and investment visa pathways MigraTrak currently maps out. An immigration attorney can identify the right family-based category for your relationship and walk you through realistic timelines — most offer an initial consultation at no charge.
      </p>
      <button onClick={onFindAttorney}
        className="w-full mt-3 py-2.5 rounded-xl text-sm font-bold transition-opacity active:opacity-80"
        style={{ backgroundColor: '#1B5FA8', color: '#FFFFFF' }}>
        Find an immigration attorney →
      </button>
    </div>
  )
}

function FundSourceInfoBox({ answers }) {
  const note = FUND_SOURCE_NOTES[answers.fund_source]
  if (!note) return null
  const limited = fundReadinessIsLimited(answers)
  return (
    <div className="mx-4 mb-2 rounded-2xl px-4 py-4" style={{ backgroundColor: '#F5F3FF', border: '1px solid #C4B5FD' }}>
      <p className="text-xs font-extrabold uppercase tracking-wider mb-1" style={{ color: '#5B21B6' }}>
        About Your Investment Funds
      </p>
      <p className="text-sm leading-relaxed" style={{ color: '#4C1D95' }}>{note}</p>
      {limited && (
        <p className="text-sm leading-relaxed mt-2" style={{ color: '#4C1D95' }}>
          Since accessing these funds will take some time, an attorney can help you sequence this alongside your visa filing — so you're not waiting on funds when you're ready to file.
        </p>
      )}
    </div>
  )
}

function DetailRow({ label, value, highlight }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2" style={{ borderBottom: '1px solid #F1F5F9' }}>
      <span className="text-xs font-semibold uppercase tracking-wider flex-shrink-0" style={{ color: '#4A5568' }}>{label}</span>
      <span className="text-xs text-right font-semibold" style={{ color: highlight ? '#1A7A4A' : '#0D2B4E' }}>{value}</span>
    </div>
  )
}

function VisaCard({ card, onCta, onCostEstimate }) {
  const [expanded, setExpanded] = useState(false)
  const borderColor = card.caution ? '#FCD34D' : card.lead ? '#1B5FA8' : '#E2E8F0'
  const headerBg    = card.caution ? '#FFFBEB' : card.lead ? '#0D2B4E' : '#F7F9FC'
  const titleColor  = card.caution ? '#92400E' : card.lead ? '#FFFFFF' : '#0D2B4E'

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-sm cursor-pointer transition-shadow active:shadow-md"
      style={{ backgroundColor: '#FFFFFF', border: `2px solid ${borderColor}` }}
      onClick={() => onCostEstimate(card.ctaVisa)}
    >
      <div className="px-5 py-4" style={{ backgroundColor: headerBg }}>
        <div className="flex items-start justify-between gap-2">
          <p className="text-lg font-extrabold leading-tight" style={{ color: titleColor }}>{card.title}</p>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            {card.caution && (
              <span className="text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap" style={{ backgroundColor: '#FCD34D', color: '#92400E' }}>
                Budget may be a limiting factor
              </span>
            )}
            {card.lead && !card.caution && (
              <span className="text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap" style={{ backgroundColor: '#F0A500', color: '#0D2B4E' }}>
                Most likely fit
              </span>
            )}
            {card.greenCardPath && !card.lead && !card.caution && (
              <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: '#D1FAE5', color: '#1A7A4A' }}>
                Green Card
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="px-5 pt-3 pb-4 flex flex-col gap-3">
        <p className="text-sm leading-relaxed" style={{ color: '#4A5568' }}>{card.opener}</p>
        {card.budgetWarning && (
          <div className="px-3 py-2 rounded-lg" style={{ backgroundColor: '#FEF3C7', border: '1px solid #F0A500' }}>
            <p className="text-xs font-semibold" style={{ color: '#92400E' }}>⚠️ {card.budgetWarning}</p>
          </div>
        )}
        <div className="px-3 py-2 rounded-lg" style={{ backgroundColor: '#F7F9FC' }}>
          <p className="text-xs font-extrabold uppercase tracking-wider mb-1" style={{ color: '#4A5568' }}>What it is</p>
          <p className="text-sm" style={{ color: '#0D2B4E' }}>{card.whatItIs}</p>
        </div>
        <div>
          <DetailRow label="Investment" value={card.investment} />
          <DetailRow label="Timeline" value={card.timeline} />
          <DetailRow label="Green Card" value={card.greenCard} highlight={card.greenCardPath} />
          <DetailRow label="Renewable" value={card.renewable} />
        </div>
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wider mb-1" style={{ color: '#4A5568' }}>Right for you if</p>
          <p className="text-sm" style={{ color: '#0D2B4E' }}>{card.rightFor}</p>
        </div>
        {card.dependentNote && <p className="text-xs italic" style={{ color: '#4A9FD4' }}>{card.dependentNote}</p>}
        {card.relationshipNote && (
          <div className="px-3 py-2 rounded-lg flex gap-2" style={{ backgroundColor: '#FFFBEB', border: '1px solid #FCD34D' }}>
            <span className="text-sm flex-shrink-0">ℹ️</span>
            <p className="text-xs leading-relaxed" style={{ color: '#92400E' }}>{card.relationshipNote}</p>
          </div>
        )}
        <div className="px-3 py-2 rounded-lg flex gap-2" style={{ backgroundColor: '#FEF3C7' }}>
          <span className="text-sm flex-shrink-0">⚠️</span>
          <p className="text-xs leading-relaxed" style={{ color: '#92400E' }}>{card.warning}</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
          className="flex items-center gap-1 text-xs font-semibold transition-opacity active:opacity-60"
          style={{ color: '#1B5FA8' }}
        >
          <span>{card.expandLabel} →</span>
          <span style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)', display: 'inline-block', transition: 'transform 0.2s' }}>›</span>
        </button>
        {expanded && (
          <div className="rounded-xl px-4 py-3 flex flex-col gap-2" style={{ backgroundColor: '#EBF4FB' }}>
            {card.expandContent.map((line, i) => (
              <p key={i} className="text-xs leading-relaxed flex gap-2" style={{ color: '#0D2B4E' }}>
                <span style={{ color: '#4A9FD4', flexShrink: 0 }}>•</span>{line}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* CTA button */}
      <div className="px-5 pb-5">
        <button
          onClick={(e) => { e.stopPropagation(); onCostEstimate(card.ctaVisa) }}
          className="w-full py-3 rounded-lg text-sm font-bold transition-all active:scale-95"
          style={{ backgroundColor: '#F0A500', color: '#0D2B4E' }}
        >
          See cost estimate →
        </button>
      </div>
    </div>
  )
}

// ── Main screen ────────────────────────────────────────────────────────────────

export default function D3Results() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const answers = state?.answers ?? {}

  const ageOut           = hasAgeOutRisk(answers)
  const showFamilyBox    = isFamilyNonK1(answers)
  const showLifestyleBox = isLifestyleOrFamily(answers) && !showFamilyBox
  const showLowBudgetBox = isLowBudget(answers)
  const showFundBox      = hasFundSource(answers)
  const cards            = buildCards(answers)
  const headerText       = buildHeader(answers)
  const leadVisa         = cards[0]?.id ?? 'e2'

  function goToJ5()    { navigate('/j5', { state: { filter: 'attorneys' } }) }
  function goToD4(visa) {
    const v = visa ?? leadVisa
    try { localStorage.setItem('migratrak_visa', v) } catch (_) {}
    navigate('/d4', { state: { visa: v, answers } })
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F9FC' }}>
      {ageOut && <AgeOutBanner onFindAttorney={goToJ5} />}

      <div className="px-5 pt-5 pb-4">
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#4A9FD4' }}>Your Results</p>
        <h1 className="text-2xl font-extrabold leading-tight mb-2" style={{ color: '#0D2B4E' }}>Visa Pathways to Explore</h1>
        <div className="rounded-xl px-4 py-3" style={{ backgroundColor: '#EBF4FB' }}>
          <p className="text-sm leading-relaxed" style={{ color: '#0D2B4E' }}>{headerText}</p>
        </div>
      </div>

      {showLowBudgetBox  && <LowBudgetInfoBox />}
      {showFamilyBox     && <FamilySponsoredInfoBox onFindAttorney={goToJ5} />}
      {showLifestyleBox  && <LifestyleInfoBox />}
      {showFundBox       && <FundSourceInfoBox answers={answers} />}

      <div className="flex flex-col gap-4 px-4 pb-4">
        {cards.map((card) => (
          <VisaCard key={card.id} card={card} onCta={goToJ5} onCostEstimate={goToD4} />
        ))}
      </div>

      <div className="mx-4 mb-4 rounded-2xl px-5 py-5 flex flex-col items-center gap-3 text-center"
        style={{ backgroundColor: '#F1F5F9', border: '1px solid #E2E8F0' }}>
        <span className="text-3xl">💬</span>
        <div>
          <p className="text-sm font-bold" style={{ color: '#0D2B4E' }}>Have questions before speaking to anyone?</p>
          <p className="text-xs mt-1.5 leading-relaxed" style={{ color: '#4A5568' }}>
            Our AI coach can explain any visa type, walk you through typical timelines and costs, and help you prepare the right questions before your first consultation with a specialist — completely free.
          </p>
        </div>
        <button onClick={() => navigate('/j4')}
          className="w-full py-3 rounded-xl text-sm font-bold transition-all active:scale-95"
          style={{ backgroundColor: 'transparent', color: '#0D2B4E', border: '2px solid #0D2B4E' }}>
          Ask our AI Coach first →
        </button>
      </div>

      <div className="mx-4 mb-4 rounded-2xl px-5 py-5 flex flex-col gap-3" style={{ backgroundColor: '#0D2B4E' }}>
        <p className="text-sm font-bold leading-snug" style={{ color: '#FFFFFF' }}>Speak with an immigration specialist — find one near you</p>
        <p className="text-xs leading-relaxed" style={{ color: '#4A9FD4' }}>A 30-minute consultation costs nothing and clarifies everything.</p>
        <button onClick={goToJ5}
          className="w-full py-3.5 rounded-xl text-sm font-bold transition-all active:scale-95"
          style={{ backgroundColor: '#F0A500', color: '#0D2B4E' }}>
          Find a specialist →
        </button>
      </div>

      <div className="mx-4 mb-28 rounded-2xl px-4 py-4" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
        <p className="text-xs leading-relaxed" style={{ color: '#64748B' }}>
          <span className="font-semibold">Educational purposes only.</span> The information above does not constitute legal advice. Visa eligibility depends on your specific circumstances and is determined by USCIS. Consult a licensed immigration attorney before making any decisions.
        </p>
      </div>

      <div className="px-4 pb-10 pt-2 text-center">
        <button onClick={() => navigate('/d2')} className="text-sm" style={{ color: '#A0AEC0' }}>
          ← Back to assessment
        </button>
      </div>
    </div>
  )
}
