import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import NavFooter from '../components/NavFooter'

// ── Personalization helpers ────────────────────────────────────────────────────

function isCanada(answers) { return answers.country === 'Canada' }
function isBusiness(answers) { return answers.motivation === 'Buying or starting a business' }
function isEmployerTransfer(answers) { return answers.motivation === 'My employer is transferring me' }
function isLifestyleOrFamily(answers) {
  return answers.motivation === 'Lifestyle — I want a fresh start' || answers.motivation === 'Family reasons'
}
function isLowBudget(answers) { return answers.budget === 'Under $100,000' }
function isNotSure(answers) { return answers.motivation === 'Not sure yet' }
function hasAgeOutRisk(answers) { return answers.children === 'Yes — aged 18, 19, or 20' }
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
function isExploringDestination(answers) {
  const settled = answers.destinationSettled ?? ''
  return settled.startsWith('🔍') || settled.startsWith('🤷')
}

// ── Country helpers ────────────────────────────────────────────────────────────

function countryKey(answers) {
  const c = answers.country ?? ''
  if (c === 'Canada')         return 'canada'
  if (c === 'United Kingdom') return 'uk'
  if (c === 'Australia')      return 'australia'
  return 'other'
}

function homeCity(answers) {
  const map = { canada: 'Toronto', uk: 'London', australia: 'Sydney', other: 'your home city' }
  return map[countryKey(answers)]
}

function expatLabel(answers) {
  const map = { canada: 'Canadian', uk: 'UK', australia: 'Australian', other: 'International' }
  return map[countryKey(answers)]
}

function countryName(answers) {
  const c = answers.country ?? ''
  return c === 'Other country' ? 'your home country' : c
}

// ── Comparison table rows by country ──────────────────────────────────────────

const COMPARISON_ROWS = {
  canada: [
    { label: 'State income tax',         fl: 'None ✅',      tx: 'None ✅',   az: 'Moderate' },
    { label: 'Canadian expat community', fl: 'Large ✅',     tx: 'Growing',  az: 'Moderate' },
    { label: 'E-2 business environment', fl: 'Strong',      tx: 'Strong',   az: 'Moderate' },
    { label: 'EB-5 regional centers',    fl: 'Many ✅',      tx: 'Many ✅',   az: 'Some' },
    { label: 'Avg home price',           fl: '$420K',       tx: '$340K',    az: '$380K' },
    { label: 'Climate vs Canada',        fl: 'Low',         tx: 'Low',      az: 'Low 😄' },
    { label: 'Healthcare quality',       fl: 'Strong',      tx: 'Strong',   az: 'Moderate' },
    { label: 'Direct flights to Canada', fl: 'Many ✅',      tx: 'Many ✅',   az: 'Some' },
  ],
  uk: [
    { label: 'State income tax',         fl: 'None ✅',      tx: 'None ✅',   az: 'Moderate' },
    { label: 'UK expat community',       fl: 'Large ✅',     tx: 'Growing',  az: 'Moderate' },
    { label: 'E-2 business environment', fl: 'Strong',      tx: 'Strong',   az: 'Moderate' },
    { label: 'EB-5 regional centers',    fl: 'Many ✅',      tx: 'Many ✅',   az: 'Some' },
    { label: 'Avg home price',           fl: '$420K',       tx: '$340K',    az: '$380K' },
    { label: 'Climate vs UK',            fl: 'Much warmer ✅', tx: 'Much warmer ✅', az: 'Much warmer ✅' },
    { label: 'Healthcare quality',       fl: 'Strong',      tx: 'Strong',   az: 'Moderate' },
    { label: 'Direct flights to UK',     fl: 'Many ✅',      tx: 'Some',     az: 'Limited' },
  ],
  australia: [
    { label: 'State income tax',           fl: 'None ✅',    tx: 'None ✅',   az: 'Moderate' },
    { label: 'Australian expat community', fl: 'Moderate',  tx: 'Small',    az: 'Small' },
    { label: 'E-2 business environment',   fl: 'Strong',    tx: 'Strong',   az: 'Moderate' },
    { label: 'EB-5 regional centers',      fl: 'Many ✅',    tx: 'Many ✅',   az: 'Some' },
    { label: 'Avg home price',             fl: '$420K',     tx: '$340K',    az: '$380K' },
    { label: 'Climate vs Australia',       fl: 'Similar ✅', tx: 'Similar ✅', az: 'Similar ✅' },
    { label: 'Healthcare quality',         fl: 'Strong',    tx: 'Strong',   az: 'Moderate' },
    { label: 'Direct flights to Australia',fl: 'Limited',   tx: 'Limited',  az: 'Limited' },
  ],
  other: [
    { label: 'State income tax',           fl: 'None ✅',    tx: 'None ✅',   az: 'Moderate' },
    { label: 'Intl expat community',       fl: 'Large ✅',   tx: 'Growing',  az: 'Moderate' },
    { label: 'E-2 business environment',   fl: 'Strong',    tx: 'Strong',   az: 'Moderate' },
    { label: 'EB-5 regional centers',      fl: 'Many ✅',    tx: 'Many ✅',   az: 'Some' },
    { label: 'Avg home price',             fl: '$420K',     tx: '$340K',    az: '$380K' },
    { label: 'Cost of living',             fl: 'Moderate',  tx: 'Lower ✅',  az: 'Moderate' },
    { label: 'Healthcare quality',         fl: 'Strong',    tx: 'Strong',   az: 'Moderate' },
    { label: 'International flights',      fl: 'Many ✅',    tx: 'Many ✅',   az: 'Some' },
  ],
}

// ── City spotlights by country ─────────────────────────────────────────────────

const CITY_SPOTLIGHTS = {
  canada: [
    {
      id: 'tampa', emoji: '🌴', city: 'Tampa / Southwest Florida',
      headline: 'Most popular with Canadian EB-5 and E-2 investors',
      bullets: [
        'Largest established Canadian expat community in Florida',
        'Strong E-2 business acquisition market — especially services and hospitality',
        'No state income tax — significant advantage vs Canada',
      ],
      stars: 5, costLabel: 'Cost of living vs Toronto', cost: '~35% lower',
      flightsLabel: 'Direct flights from', flights: 'Toronto, Calgary, Vancouver, Montreal',
    },
    {
      id: 'miami', emoji: '🌊', city: 'Miami / Fort Lauderdale',
      headline: 'International business hub — highest property values in Florida',
      bullets: [
        'Strongest EB-5 regional center concentration in the Southeast',
        'International business environment — ideal for global entrepreneurs',
        'Higher cost of living than other Florida metros',
      ],
      stars: 4, costLabel: 'Cost of living vs Toronto', cost: '~15% lower',
      flightsLabel: 'Direct flights from', flights: 'Toronto, Montreal, Vancouver',
    },
    {
      id: 'orlando', emoji: '🎡', city: 'Orlando',
      headline: 'Fastest growing metro — strong E-2 franchise market',
      bullets: [
        'Tourism and hospitality economy creates strong E-2 franchise acquisition opportunities',
        'More affordable than Miami or Tampa',
        'Large and growing Canadian snowbird and expat community',
      ],
      stars: 4, costLabel: 'Cost of living vs Toronto', cost: '~30% lower',
      flightsLabel: 'Direct flights from', flights: 'Toronto, Ottawa, Montreal',
    },
    {
      id: 'dallas', emoji: '⭐', city: 'Dallas / Austin, Texas',
      headline: 'No state income tax — booming business environment',
      bullets: [
        'One of the fastest growing business markets in the US',
        'No state income tax — same advantage as Florida',
        'Smaller Canadian expat community than Florida but growing rapidly',
      ],
      stars: 3, costLabel: 'Cost of living vs Toronto', cost: '~20% lower',
      flightsLabel: 'Direct flights from', flights: 'Toronto, Calgary',
    },
    {
      id: 'phoenix', emoji: '🌵', city: 'Phoenix / Scottsdale, Arizona',
      headline: 'Popular with Western Canadian expats — dry climate, lower costs',
      bullets: [
        'Strong draw for British Columbia and Alberta expats',
        'Lower humidity than Florida — popular with retirees and lifestyle movers',
        'Smaller immigration attorney network than Florida or Texas',
      ],
      stars: 3, costLabel: 'Cost of living vs Toronto', cost: '~25% lower',
      flightsLabel: 'Direct flights from', flights: 'Vancouver, Calgary',
    },
  ],

  uk: [
    {
      id: 'tampa', emoji: '🌴', city: 'Tampa / Southwest Florida',
      headline: 'Most popular with UK expats relocating on E-2 and EB-5 visas',
      bullets: [
        'Large and established UK expat community — especially Southwest Florida',
        'Strong E-2 business acquisition market',
        'No state income tax',
      ],
      stars: 5, costLabel: 'Cost of living vs London', cost: '~40% lower',
      flightsLabel: 'Direct flights from', flights: 'London Heathrow, London Gatwick, Manchester, Birmingham',
    },
    {
      id: 'miami', emoji: '🌊', city: 'Miami / Fort Lauderdale',
      headline: 'International hub with strong UK business connections',
      bullets: [
        'Major international business environment familiar to UK executives',
        'Strongest EB-5 concentration in the Southeast',
        'Higher cost of living than other Florida metros',
      ],
      stars: 4, costLabel: 'Cost of living vs London', cost: '~20% lower',
      flightsLabel: 'Direct flights from', flights: 'London Heathrow, London Gatwick',
    },
    {
      id: 'orlando', emoji: '🎡', city: 'Orlando',
      headline: 'Affordable and fast growing — strong UK expat presence',
      bullets: [
        'Large UK expat and tourist familiarity with the market',
        'Strong E-2 franchise opportunities',
        'Most affordable major Florida metro',
      ],
      stars: 4, costLabel: 'Cost of living vs London', cost: '~45% lower',
      flightsLabel: 'Direct flights from', flights: 'London Gatwick, Manchester, Birmingham, Edinburgh',
    },
    {
      id: 'dallas', emoji: '⭐', city: 'Dallas / Austin, Texas',
      headline: 'Booming business market — growing UK expat community',
      bullets: [
        'Fast growing technology and business economy',
        'No state income tax',
        'Smaller UK expat community than Florida but growing',
      ],
      stars: 3, costLabel: 'Cost of living vs London', cost: '~30% lower',
      flightsLabel: 'Direct flights from', flights: 'London Heathrow',
    },
    {
      id: 'phoenix', emoji: '🌵', city: 'Phoenix / Scottsdale, Arizona',
      headline: 'Dry climate — popular with UK retirees and lifestyle movers',
      bullets: [
        'Popular destination for UK lifestyle movers',
        'Lower cost of living than coastal cities',
        'Smaller immigration specialist network than Florida or Texas',
      ],
      stars: 3, costLabel: 'Cost of living vs London', cost: '~35% lower',
      flightsLabel: 'Direct flights from', flights: 'London Heathrow, Manchester (seasonal)',
    },
  ],

  australia: [
    {
      id: 'tampa', emoji: '🌴', city: 'Tampa / Southwest Florida',
      headline: 'Climate and lifestyle most similar to Eastern Australia',
      bullets: [
        'Climate and outdoor lifestyle most comparable to Queensland and New South Wales',
        'Strong E-2 business market',
        'No state income tax',
      ],
      stars: 4, costLabel: 'Cost of living vs Sydney', cost: '~35% lower',
      flightsLabel: 'Direct flights from', flights: 'Sydney, Melbourne (via LAX or DFW connection)',
    },
    {
      id: 'miami', emoji: '🌊', city: 'Miami / Fort Lauderdale',
      headline: 'International business hub — closest cultural fit for Australians',
      bullets: [
        'Cosmopolitan international environment familiar to Australians',
        'Strong EB-5 investor market',
        'Higher cost of living but still below Sydney',
      ],
      stars: 4, costLabel: 'Cost of living vs Sydney', cost: '~15% lower',
      flightsLabel: 'Direct flights from', flights: 'Sydney, Melbourne (via LAX connection)',
    },
    {
      id: 'la', emoji: '🌅', city: 'Los Angeles / California',
      headline: 'Most established Australian expat community in the US',
      bullets: [
        'Largest Australian expat community in the United States',
        'Pacific timezone closer to Australian business hours',
        'Higher cost of living — state income tax applies',
      ],
      stars: 5, costLabel: 'Cost of living vs Sydney', cost: '~10% lower',
      flightsLabel: 'Direct flights from', flights: 'Sydney, Melbourne, Brisbane, Perth (direct)',
    },
    {
      id: 'dallas', emoji: '⭐', city: 'Dallas / Austin, Texas',
      headline: 'No state income tax — fast growing economy',
      bullets: [
        'Strong technology and business sector',
        'No state income tax',
        'Smaller Australian expat community',
      ],
      stars: 3, costLabel: 'Cost of living vs Sydney', cost: '~30% lower',
      flightsLabel: 'Direct flights from', flights: 'Sydney (via LAX connection)',
    },
    {
      id: 'phoenix', emoji: '🌵', city: 'Phoenix / Scottsdale, Arizona',
      headline: 'Desert climate — popular with Western Australians',
      bullets: [
        'Dry desert climate familiar to Western Australians',
        'Affordable cost of living',
        'Smaller expat network than coastal cities',
      ],
      stars: 3, costLabel: 'Cost of living vs Sydney', cost: '~30% lower',
      flightsLabel: 'Direct flights from', flights: 'Perth (via connection)',
    },
  ],

  other: [
    {
      id: 'tampa', emoji: '🌴', city: 'Tampa / Southwest Florida',
      headline: 'Most popular destination for international investor visa applicants',
      bullets: [
        'Large and diverse international expat community',
        'Strong E-2 business acquisition market',
        'No state income tax',
      ],
      stars: 5, costLabel: 'Cost of living', cost: 'Moderate — lower than most major US metros',
      flightsLabel: 'International flights', flights: 'Tampa and Miami airports serve most major international routes',
    },
    {
      id: 'miami', emoji: '🌊', city: 'Miami / Fort Lauderdale',
      headline: 'Most international city in the Southeast US',
      bullets: [
        'Largest international business and expat hub in Florida',
        'Most diverse cultural environment in the Southeast',
        'Higher cost of living than other Florida metros',
      ],
      stars: 5, costLabel: 'Cost of living', cost: 'Higher — comparable to major international cities',
      flightsLabel: 'International flights', flights: 'Miami is a major international hub',
    },
    {
      id: 'orlando', emoji: '🎡', city: 'Orlando',
      headline: 'Affordable and internationally diverse — strong business market',
      bullets: [
        'Highly internationally diverse population',
        'Strong E-2 franchise and hospitality market',
        'Most affordable major Florida metro',
      ],
      stars: 4, costLabel: 'Cost of living', cost: 'Lower — among the most affordable major metros',
      flightsLabel: 'International flights', flights: 'Orlando International serves key routes',
    },
    {
      id: 'dallas', emoji: '⭐', city: 'Dallas / Austin, Texas',
      headline: 'No state income tax — major international business hub',
      bullets: [
        'Major international airport with global connections',
        'No state income tax',
        'Fast growing business economy',
      ],
      stars: 4, costLabel: 'Cost of living', cost: 'Moderate',
      flightsLabel: 'International flights', flights: 'Dallas/Fort Worth is a major international hub',
    },
    {
      id: 'phoenix', emoji: '🌵', city: 'Phoenix / Scottsdale, Arizona',
      headline: 'Warm climate — affordable and growing',
      bullets: [
        'Year-round warm climate',
        'Lower cost of living than coastal metros',
        'Growing international community',
      ],
      stars: 3, costLabel: 'Cost of living', cost: 'Lower',
      flightsLabel: 'International flights', flights: 'Phoenix Sky Harbor serves key routes',
    },
  ],
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
  if (isExploringDestination(answers)) {
    return "Based on your answers — still exploring US destinations — here are your most likely visa pathways. Lock in your destination to see city-specific specialists."
  }
  if (isEmployerTransfer(answers)) {
    return "Based on your answers — employer-sponsored move — the L-1 visa is likely your primary pathway. Your employer's immigration counsel will typically lead this process."
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

function DestinationComparisonCard({ answers, onSetDestination, onCoach }) {
  const key     = countryKey(answers)
  const rows    = COMPARISON_ROWS[key]
  const spots   = CITY_SPOTLIGHTS[key]
  const expat   = expatLabel(answers)

  return (
    <div className="mx-4 mb-4 rounded-2xl overflow-hidden"
      style={{ backgroundColor: '#FFFFFF', border: '2px solid #1B5FA8' }}>

      {/* Card header */}
      <div className="px-4 py-4" style={{ backgroundColor: '#0D2B4E' }}>
        <p className="text-base font-extrabold leading-snug" style={{ color: '#FFFFFF' }}>
          🗺️ Not sure where to land?
        </p>
        <p className="text-sm mt-0.5" style={{ color: '#4A9FD4' }}>
          Here's what matters for your move.
        </p>
      </div>

      {/* Comparison table — horizontally scrollable with sticky first column */}
      <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
        <table style={{ minWidth: 460, borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr style={{ backgroundColor: '#F7F9FC' }}>
              <th className="text-left py-2.5 pl-4 pr-2 text-xs font-extrabold uppercase tracking-wider"
                style={{ color: '#4A5568', minWidth: 150, position: 'sticky', left: 0, backgroundColor: '#F7F9FC', zIndex: 1, borderBottom: '2px solid #E2E8F0' }}>
                Criteria
              </th>
              {['Florida', 'Texas', 'Arizona'].map(s => (
                <th key={s} className="py-2.5 px-3 text-center text-xs font-extrabold uppercase tracking-wider"
                  style={{ color: '#0D2B4E', minWidth: 100, borderBottom: '2px solid #E2E8F0' }}>
                  {s}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.label} style={{ backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#F7F9FC' }}>
                <td className="py-2.5 pl-4 pr-2 text-xs font-semibold"
                  style={{ color: '#4A5568', position: 'sticky', left: 0, backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#F7F9FC', zIndex: 1, borderBottom: '1px solid #F1F5F9' }}>
                  {row.label}
                </td>
                {[row.fl, row.tx, row.az].map((val, ci) => (
                  <td key={ci} className="py-2.5 px-3 text-center text-xs font-semibold"
                    style={{
                      color: val.includes('✅') ? '#1A7A4A' : val === 'Moderate' || val === 'Limited' || val === 'Small' ? '#92400E' : '#0D2B4E',
                      borderBottom: '1px solid #F1F5F9',
                    }}>
                    {val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* City spotlight header */}
      <div className="px-4 pt-4 pb-2">
        <p className="text-xs font-extrabold uppercase tracking-wider" style={{ color: '#0D2B4E' }}>
          City Spotlights
        </p>
      </div>

      {/* Horizontally scrollable city cards */}
      <div className="flex gap-3 px-4 pb-4 overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
        {spots.map((spot) => (
          <div key={spot.id} className="flex-shrink-0 flex flex-col gap-2 rounded-2xl p-4"
            style={{ width: 240, backgroundColor: '#F7F9FC', border: '1px solid #E2E8F0' }}>
            <p className="text-2xl">{spot.emoji}</p>
            <div>
              <p className="text-sm font-extrabold leading-tight" style={{ color: '#0D2B4E' }}>{spot.city}</p>
              <p className="text-xs mt-0.5 leading-snug" style={{ color: '#4A9FD4' }}>{spot.headline}</p>
            </div>
            <div className="flex flex-col gap-1.5">
              {spot.bullets.map((b, i) => (
                <p key={i} className="text-xs leading-snug flex gap-1.5" style={{ color: '#4A5568' }}>
                  <span style={{ color: '#4A9FD4', flexShrink: 0 }}>•</span>{b}
                </p>
              ))}
            </div>
            <div className="flex flex-col gap-0.5 pt-1" style={{ borderTop: '1px solid #E2E8F0' }}>
              <div className="flex items-center gap-1">
                <Stars count={spot.stars} />
                <span className="text-xs font-semibold" style={{ color: '#4A5568' }}>{expat} expat score</span>
              </div>
              <p className="text-xs" style={{ color: '#4A5568' }}>
                <span className="font-semibold">{spot.costLabel}:</span> {spot.cost}
              </p>
              <p className="text-xs" style={{ color: '#4A5568' }}>
                <span className="font-semibold">{spot.flightsLabel}:</span> {spot.flights}
              </p>
            </div>
            <button
              onClick={() => onSetDestination(spot.city)}
              className="w-full py-2.5 rounded-xl text-xs font-bold mt-auto transition-all active:scale-95"
              style={{ backgroundColor: '#0D2B4E', color: '#F0A500' }}>
              Set as my destination →
            </button>
          </div>
        ))}
      </div>

      {/* Info note */}
      <div className="mx-4 mb-3 rounded-xl px-4 py-3" style={{ backgroundColor: '#F1F5F9', border: '1px solid #E2E8F0' }}>
        <p className="text-xs leading-relaxed" style={{ color: '#4A5568' }}>
          These comparisons are general indicators. Your ideal destination depends on your business type, family needs, lifestyle preferences, and visa pathway. A specialist familiar with your destination market can give you city-specific guidance.
        </p>
      </div>

      {/* AI Coach CTA */}
      <div className="px-4 pb-4">
        <button
          onClick={onCoach}
          className="w-full py-3 rounded-xl text-sm font-bold transition-all active:scale-95"
          style={{ backgroundColor: 'transparent', color: '#0D2B4E', border: '2px solid #0D2B4E' }}>
          Ask our AI Coach about destinations →
        </button>
      </div>
    </div>
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
    <div className="rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: '#FFFFFF', border: `2px solid ${borderColor}` }}>
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
        <div className="px-3 py-2 rounded-lg flex gap-2" style={{ backgroundColor: '#FEF3C7' }}>
          <span className="text-sm flex-shrink-0">⚠️</span>
          <p className="text-xs leading-relaxed" style={{ color: '#92400E' }}>{card.warning}</p>
        </div>
        <button onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs font-semibold transition-opacity active:opacity-60"
          style={{ color: '#1B5FA8' }}>
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
        <button onClick={() => onCostEstimate(card.ctaVisa)}
          className="w-full py-3 rounded-xl text-sm font-bold transition-all active:scale-95"
          style={{ backgroundColor: '#F0A500', color: '#0D2B4E' }}>
          {card.ctaLabel} →
        </button>
      </div>
    </div>
  )
}

function Toast({ message }) {
  if (!message) return null
  return (
    <div className="fixed bottom-24 left-1/2 z-50 px-5 py-3 rounded-2xl shadow-lg text-sm font-bold"
      style={{ transform: 'translateX(-50%)', backgroundColor: '#0D2B4E', color: '#F0A500', whiteSpace: 'nowrap' }}>
      {message}
    </div>
  )
}

// ── Main screen ────────────────────────────────────────────────────────────────

export default function D3Results() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const baseAnswers = state?.answers ?? {}

  const [destOverride,    setDestOverride]    = useState(null)
  const [settledOverride, setSettledOverride] = useState(null)
  const [toast,           setToast]           = useState(null)

  const answers = {
    ...baseAnswers,
    ...(destOverride    ? { destination: destOverride }           : {}),
    ...(settledOverride ? { destinationSettled: settledOverride } : {}),
  }

  function handleSetDestination(city) {
    setDestOverride(city)
    setSettledOverride("✅  Decided — I know exactly where I'm going")
    setToast(`✓ Destination set to ${city}`)
    try {
      localStorage.setItem('migratrak_destination', city)
      const saved = JSON.parse(localStorage.getItem('migratrak_answers') || '{}')
      saved.destination = city
      saved.destinationSettled = "✅  Decided — I know exactly where I'm going"
      localStorage.setItem('migratrak_answers', JSON.stringify(saved))
    } catch (_) {}
    setTimeout(() => setToast(null), 2800)
  }

  function goToCoach() {
    const country = countryName(answers)
    navigate('/j4', {
      state: {
        seedPrompt: `I'm originally from ${country} and considering relocating to the US but haven't decided on a destination. Can you help me think through the best options for my situation?`,
      },
    })
  }

  const ageOut           = hasAgeOutRisk(answers)
  const showLifestyleBox = isLifestyleOrFamily(answers)
  const showLowBudgetBox = isLowBudget(answers)
  const showDestCard     = isExploringDestination(answers) && !destOverride
  const cards            = buildCards(answers)
  const headerText       = buildHeader(answers)
  const leadVisa         = cards[0]?.id ?? 'e2'

  function goToJ5()    { navigate('/j5', { state: { filter: 'attorneys' } }) }
  function goToD4(visa){ navigate('/d4', { state: { visa: visa ?? leadVisa, answers } }) }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F9FC' }}>
      <Toast message={toast} />

      {ageOut && <AgeOutBanner onFindAttorney={goToJ5} />}

      <div className="px-5 pt-5 pb-4">
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#4A9FD4' }}>Your Results</p>
        <h1 className="text-2xl font-extrabold leading-tight mb-2" style={{ color: '#0D2B4E' }}>Visa Pathways to Explore</h1>
        <div className="rounded-xl px-4 py-3" style={{ backgroundColor: '#EBF4FB' }}>
          <p className="text-sm leading-relaxed" style={{ color: '#0D2B4E' }}>{headerText}</p>
        </div>
      </div>

      {showLowBudgetBox  && <LowBudgetInfoBox />}
      {showLifestyleBox  && <LifestyleInfoBox />}

      {showDestCard && (
        <DestinationComparisonCard
          answers={answers}
          onSetDestination={handleSetDestination}
          onCoach={goToCoach}
        />
      )}

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
        <p className="text-sm font-bold leading-snug" style={{ color: '#FFFFFF' }}>Not sure which path is right for you?</p>
        <p className="text-xs leading-relaxed" style={{ color: '#4A9FD4' }}>A 30-minute consultation with an immigration specialist costs nothing and clarifies everything.</p>
        <button onClick={goToJ5}
          className="w-full py-3.5 rounded-xl text-sm font-bold transition-all active:scale-95"
          style={{ backgroundColor: '#F0A500', color: '#0D2B4E' }}>
          Speak with an immigration specialist — find one near you →
        </button>
      </div>

      <p className="text-xs text-center px-6 mb-28 leading-relaxed" style={{ color: '#A0AEC0' }}>
        MigraTrak provides general information only — not legal advice. Visa eligibility depends on your specific circumstances. Always confirm your pathway with a licensed immigration attorney.
      </p>

      <NavFooter backPath="/d2" onNext={goToD4} nextLabel="See Cost Breakdown →" />
    </div>
  )
}
