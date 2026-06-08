import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

// ── Matching logic ─────────────────────────────────────────────────────────────

const DEST_DATA = {
  'Tampa / Southwest Florida': {
    state: 'FL', stateTax: 'None ✅', rent: '$2,100/mo', home: '$420,000',
    climate: 'Warm & sunny',
    bullets: {
      default: [
        'Largest established Canadian and international expat community in Florida',
        'Strong E-2 business acquisition market — especially services and hospitality',
        'No state income tax — significant advantage vs most home countries',
      ],
      business: [
        'Strong E-2 acquisition market — especially services, hospitality and trades',
        'Established international expat community — large and growing',
        'Suburban lifestyle with Gulf Coast access',
      ],
      lifestyle: [
        'Gulf Coast beaches, outdoor lifestyle, and year-round warmth',
        'Large international expat community — easy to find familiar connections',
        'No state income tax — lower overall tax burden vs most countries',
      ],
    },
    expat: 'Large ✅',
    flights: { Canada: 'Many direct flights — Toronto, Calgary, Vancouver, Montreal', 'United Kingdom': 'Direct from London Heathrow, Gatwick, Manchester', Australia: 'Via LAX or DFW connection', default: 'Many international connections via Miami' },
  },
  'Miami / Fort Lauderdale': {
    state: 'FL', stateTax: 'None ✅', rent: '$2,800/mo', home: '$560,000',
    climate: 'Warm & sunny',
    bullets: {
      default: [
        'Largest international business hub in Florida — strong EB-5 concentration',
        'Most diverse international city in the Southeast',
        'Higher cost of living than other Florida metros',
      ],
      business: [
        'Strongest EB-5 regional center concentration in the Southeast US',
        'International business environment — ideal for global entrepreneurs',
        'Higher cost of living — offset by no state income tax',
      ],
      lifestyle: [
        'World-class international city — cosmopolitan culture and nightlife',
        'Highest international expat density in Florida',
        'Higher cost of living than other Florida metros',
      ],
    },
    expat: 'Large ✅',
    flights: { Canada: 'Direct from Toronto and Montreal', 'United Kingdom': 'Direct from London Heathrow and Gatwick', Australia: 'Via LAX connection', default: 'Miami is a major international hub' },
  },
  'Orlando': {
    state: 'FL', stateTax: 'None ✅', rent: '$1,900/mo', home: '$370,000',
    climate: 'Warm & sunny',
    bullets: {
      default: [
        'Most affordable major Florida metro — strong value for families',
        'Large and diverse international community',
        'Tourism economy creates strong E-2 franchise opportunities',
      ],
      business: [
        'Tourism and hospitality economy — strong E-2 franchise acquisition market',
        'Most affordable major Florida metro',
        'Large growing Canadian and international expat community',
      ],
      lifestyle: [
        'Family-friendly with excellent schools in outer suburbs',
        'More affordable than Miami or Tampa',
        'Large international expat community',
      ],
    },
    expat: 'Large ✅',
    flights: { Canada: 'Direct from Toronto, Ottawa, Montreal', 'United Kingdom': 'Direct from Gatwick, Manchester, Birmingham, Edinburgh', Australia: 'Via LAX or DFW connection', default: 'Major international connections' },
  },
  'Phoenix / Scottsdale, AZ': {
    state: 'AZ', stateTax: '2.5%', rent: '$1,800/mo', home: '$380,000',
    climate: 'Warm & dry',
    bullets: {
      default: [
        'Dry desert climate — very popular with lifestyle movers',
        'Lower cost of living than Florida coastal metros',
        'Smaller immigration specialist network',
      ],
      business: [
        'Growing business market with no state income tax on most income',
        'Lower cost of living than Florida coastal metros',
        'Smaller but growing international expat community',
      ],
      lifestyle: [
        'Dry heat and outdoor lifestyle — golf, hiking, year-round sun',
        'Very affordable cost of living vs major metros',
        'Popular with retirees and lifestyle movers from Western countries',
      ],
    },
    expat: 'Moderate',
    flights: { Canada: 'Direct from Vancouver and Calgary', 'United Kingdom': 'Direct from London Heathrow, Manchester (seasonal)', Australia: 'Via connection from Perth', default: 'Good international connections via LAX' },
  },
  'Dallas / Fort Worth, TX': {
    state: 'TX', stateTax: 'None ✅', rent: '$1,700/mo', home: '$340,000',
    climate: 'Warm — hot summers',
    bullets: {
      default: [
        'No state income tax — strong financial advantage',
        'One of the fastest growing business markets in the US',
        'Lower cost of living than coastal metros',
      ],
      business: [
        'Major technology and professional services hub',
        'No state income tax — same advantage as Florida',
        'Fast growing economy with strong business acquisition market',
      ],
      lifestyle: [
        'Very affordable cost of living — lower than most major US metros',
        'No state income tax',
        'Large and fast growing international expat community',
      ],
    },
    expat: 'Growing',
    flights: { Canada: 'Direct from Toronto and Calgary', 'United Kingdom': 'Direct from London Heathrow', Australia: 'Via LAX connection', default: 'Dallas/Fort Worth is a major international hub' },
  },
  'Austin, TX': {
    state: 'TX', stateTax: 'None ✅', rent: '$2,000/mo', home: '$450,000',
    climate: 'Warm — hot summers',
    bullets: {
      default: [
        'Technology hub with strong entrepreneurial culture',
        'No state income tax',
        'Fast growing with strong quality of life',
      ],
      business: [
        'Leading US technology and startup hub',
        'No state income tax',
        'Fast growing professional services market',
      ],
      lifestyle: [
        'Vibrant culture, live music, outdoor lifestyle',
        'No state income tax',
        'Fast growing international community',
      ],
    },
    expat: 'Growing',
    flights: { Canada: 'Connections via Dallas', 'United Kingdom': 'Connections via Dallas or Houston', Australia: 'Via connection', default: 'Austin-Bergstrom International Airport' },
  },
  'Denver, CO': {
    state: 'CO', stateTax: '4.4%', rent: '$2,000/mo', home: '$550,000',
    climate: 'Mild — four seasons',
    bullets: {
      default: [
        'Outdoor lifestyle — skiing, hiking, Rocky Mountain access',
        'Moderate cost of living vs coastal metros',
        'Growing technology and professional services sector',
      ],
      business: [
        'Growing technology and professional services hub',
        'Outdoor lifestyle appeal — strong talent attraction',
        'More affordable than coastal metros',
      ],
      lifestyle: [
        'World-class outdoor recreation — skiing, hiking, year-round activities',
        'Mild climate with genuine four seasons',
        'Strong international expat and professional community',
      ],
    },
    expat: 'Moderate',
    flights: { Canada: 'Direct from Calgary, Toronto', 'United Kingdom': 'Direct from London Heathrow', Australia: 'Via LAX connection', default: 'Denver International is a major hub' },
  },
  'Charlotte, NC': {
    state: 'NC', stateTax: '4.75%', rent: '$1,600/mo', home: '$380,000',
    climate: 'Mild — four seasons',
    bullets: {
      default: [
        'Major financial services hub — fast growing metro',
        'Very affordable cost of living',
        'Good quality of life with mild climate',
      ],
      business: [
        'Major banking and financial services centre',
        'Affordable business operating costs',
        'Fast growing metro with strong economy',
      ],
      lifestyle: [
        'Very affordable cost of living',
        'Mild climate — warm summers, light winters',
        'Fast growing international community',
      ],
    },
    expat: 'Moderate',
    flights: { Canada: 'Connections via major hubs', 'United Kingdom': 'Direct from London Heathrow', Australia: 'Via connection', default: 'Charlotte Douglas International Airport' },
  },
  'Nashville, TN': {
    state: 'TN', stateTax: 'None ✅', rent: '$1,700/mo', home: '$420,000',
    climate: 'Mild — four seasons',
    bullets: {
      default: [
        'No state income tax — significant advantage',
        'Fast growing city with strong economy',
        'Lower cost of living than coastal metros',
      ],
      business: [
        'No state income tax',
        'Strong healthcare, technology and hospitality sectors',
        'Fast growing business-friendly environment',
      ],
      lifestyle: [
        'Vibrant music and culture scene',
        'No state income tax',
        'Growing international community',
      ],
    },
    expat: 'Small',
    flights: { Canada: 'Connections via major hubs', 'United Kingdom': 'Connections via Atlanta or Chicago', Australia: 'Via connection', default: 'Nashville International Airport' },
  },
  'Chicago, IL': {
    state: 'IL', stateTax: '4.95%', rent: '$2,200/mo', home: '$320,000',
    climate: 'Four seasons',
    bullets: {
      default: [
        'Major international city with large diverse expat community',
        'World-class culture, architecture, and business environment',
        'Real four seasons — similar to many home countries',
      ],
      business: [
        'Major financial, professional services and technology hub',
        'World-class international business environment',
        'Large and established international expat community',
      ],
      lifestyle: [
        'World-class culture, restaurants, arts and architecture',
        'Real four seasons — familiar to people from temperate countries',
        'Large international expat community',
      ],
    },
    expat: 'Large ✅',
    flights: { Canada: 'Many direct flights from Toronto, Montreal, Calgary, Vancouver', 'United Kingdom': 'Direct from London Heathrow and Gatwick', Australia: 'Direct from Melbourne and Sydney', default: "O'Hare is a major international hub" },
  },
  'Boston, MA': {
    state: 'MA', stateTax: '5%', rent: '$2,800/mo', home: '$680,000',
    climate: 'Four seasons',
    bullets: {
      default: [
        'World-class universities, healthcare and technology sectors',
        'Strong international professional community',
        'Real four seasons — similar climate to many home countries',
      ],
      business: [
        'Leading biotech, technology and financial services hub',
        'World-class talent pool and professional network',
        'Strong international business environment',
      ],
      lifestyle: [
        'Historic, walkable city with strong cultural identity',
        'Excellent healthcare and education',
        'Real four seasons',
      ],
    },
    expat: 'Large ✅',
    flights: { Canada: 'Direct from Toronto and Montreal', 'United Kingdom': 'Direct from London Heathrow and Gatwick', Australia: 'Via connection', default: 'Boston Logan International Airport' },
  },
  'New York, NY': {
    state: 'NY', stateTax: '6.85%', rent: '$3,500/mo', home: '$750,000',
    climate: 'Four seasons',
    bullets: {
      default: [
        'The world\'s most international city — largest expat community in the US',
        'Unmatched business, culture, finance and professional opportunity',
        'Highest cost of living in the US — plan accordingly',
      ],
      business: [
        'World\'s leading financial, media and professional services centre',
        'Unmatched deal flow and investor network',
        'Highest cost of living — offset by unmatched opportunity',
      ],
      lifestyle: [
        'Unmatched cultural diversity, restaurants, arts and nightlife',
        'The most international city in the United States',
        'Highest cost of living — plan budget carefully',
      ],
    },
    expat: 'Large ✅',
    flights: { Canada: 'Many direct flights from Toronto, Montreal, Vancouver, Calgary', 'United Kingdom': 'Many direct flights from all major UK airports', Australia: 'Direct from Sydney and Melbourne', default: 'JFK, Newark and LaGuardia serve all major international routes' },
  },
  'San Francisco / Bay Area': {
    state: 'CA', stateTax: '9.3%', rent: '$3,200/mo', home: '$1,200,000',
    climate: 'Mild year-round',
    bullets: {
      default: [
        'Global technology and innovation hub — unmatched for tech professionals',
        'Mild climate year-round — no extreme heat or cold',
        'Highest cost of living in the US outside Manhattan',
      ],
      business: [
        'World\'s leading technology and venture capital hub',
        'Unmatched professional network for technology and innovation',
        'Very high cost of living and operating costs',
      ],
      lifestyle: [
        'Mild year-round climate — no extreme seasons',
        'World-class food, culture and outdoor access',
        'Very high cost of living',
      ],
    },
    expat: 'Large ✅',
    flights: { Canada: 'Direct from Vancouver, Toronto, Calgary', 'United Kingdom': 'Direct from London Heathrow', Australia: 'Direct from Sydney and Melbourne', default: 'SFO and Oakland serve major international routes' },
  },
  'Seattle, WA': {
    state: 'WA', stateTax: 'None ✅', rent: '$2,400/mo', home: '$750,000',
    climate: 'Mild — cool and rainy',
    bullets: {
      default: [
        'No state income tax — strong financial advantage',
        'Major technology hub — Amazon, Microsoft, Boeing headquarters',
        'Mild but grey climate — very familiar to people from UK or Canada',
      ],
      business: [
        'Major technology and aerospace hub — Amazon and Microsoft HQ',
        'No state income tax',
        'Strong international business environment',
      ],
      lifestyle: [
        'No state income tax',
        'Outdoor lifestyle — mountains, water, forests',
        'Mild climate familiar to people from northern countries',
      ],
    },
    expat: 'Large ✅',
    flights: { Canada: 'Direct from Vancouver — 45 min; Toronto and Calgary', 'United Kingdom': 'Direct from London Heathrow', Australia: 'Direct from Sydney', default: 'Seattle-Tacoma International Airport' },
  },
  'Minneapolis, MN': {
    state: 'MN', stateTax: '6.8%', rent: '$1,400/mo', home: '$310,000',
    climate: 'Four seasons — cold winters',
    bullets: {
      default: [
        'Very affordable cost of living vs major US metros',
        'Strong economy — Fortune 500 headquarters',
        'Real four seasons — very cold winters familiar to Canadians and Northern Europeans',
      ],
      business: [
        'Major medical device, retail and financial services hub',
        'Very affordable business operating costs',
        'Strong talent pool and quality of life',
      ],
      lifestyle: [
        'Very affordable — among lowest cost of living for major US metros',
        'Strong outdoor culture — lakes, trails, winter sports',
        'Real four seasons — familiar to people from cold climates',
      ],
    },
    expat: 'Moderate',
    flights: { Canada: 'Direct from Toronto and Winnipeg', 'United Kingdom': 'Direct from London Heathrow', Australia: 'Via connection', default: 'Minneapolis-Saint Paul International Airport' },
  },
  'Las Vegas, NV': {
    state: 'NV', stateTax: 'None ✅', rent: '$1,600/mo', home: '$380,000',
    climate: 'Warm & dry',
    bullets: {
      default: [
        'No state income tax',
        'Strong tourism, hospitality and entertainment economy',
        'Affordable cost of living for a major metro',
      ],
      business: [
        'World\'s leading tourism, hospitality and entertainment market — ideal for E-2',
        'No state income tax',
        'Lower cost of living than coastal metros',
      ],
      lifestyle: [
        'No state income tax',
        'Warm dry climate',
        'Entertainment and lifestyle amenities',
      ],
    },
    expat: 'Moderate',
    flights: { Canada: 'Direct from Vancouver, Calgary, Toronto', 'United Kingdom': 'Direct from London Heathrow and Manchester', Australia: 'Via LAX connection', default: 'Harry Reid International Airport serves major international routes' },
  },
  'Columbus, OH': {
    state: 'OH', stateTax: '3.99%', rent: '$1,200/mo', home: '$260,000',
    climate: 'Four seasons',
    bullets: {
      default: [
        'Most affordable major metro on this list',
        'Strong university and healthcare economy',
        'Real four seasons — familiar climate',
      ],
      business: [ 'Very low operating costs', 'Strong logistics and distribution hub', 'Affordable talent pool' ],
      lifestyle: [ 'Very affordable cost of living', 'Real four seasons', 'Growing arts and food scene' ],
    },
    expat: 'Small',
    flights: { Canada: 'Connections via major hubs', 'United Kingdom': 'Connections via Chicago or New York', Australia: 'Via connection', default: 'John Glenn Columbus International Airport' },
  },
  'Pittsburgh, PA': {
    state: 'PA', stateTax: '3.07%', rent: '$1,100/mo', home: '$220,000',
    climate: 'Four seasons',
    bullets: {
      default: [
        'Most affordable major metro in the Northeast',
        'Growing technology and healthcare hub',
        'Real four seasons',
      ],
      business: [ 'Very low operating costs', 'Growing technology sector — Carnegie Mellon', 'Affordable real estate' ],
      lifestyle: [ 'Most affordable on the list', 'Real four seasons', 'Growing arts and culture scene' ],
    },
    expat: 'Small',
    flights: { Canada: 'Connections via major hubs', 'United Kingdom': 'Connections via New York', Australia: 'Via connection', default: 'Pittsburgh International Airport' },
  },
}

function matchDestinations(d5answers, d2answers) {
  const climate  = d5answers.climate  ?? ''
  const env      = d5answers.env      ?? ''
  const business = d5answers.business ?? ''

  const warm     = climate.startsWith('☀️')
  const mild     = climate.startsWith('🌤️')
  const seasons  = climate.startsWith('🍂')
  const anyClim  = climate.startsWith('🤷') || !climate

  const major    = env.startsWith('🏙️')
  const midsize  = env.startsWith('🌆')
  const suburban = env.startsWith('🏡')

  const restaurant = business.startsWith('🍽️')
  const trades     = business.startsWith('🔧')
  const prof       = business.startsWith('💼')

  if (warm && major)                               return ['Miami / Fort Lauderdale', 'Tampa / Southwest Florida', 'Los Angeles']
  if ((warm || anyClim) && suburban)               return ['Tampa / Southwest Florida', 'Phoenix / Scottsdale, AZ', 'Dallas / Fort Worth, TX']
  if (warm && midsize)                             return ['Tampa / Southwest Florida', 'Orlando', 'Austin, TX']
  if (mild && major)                               return ['San Francisco / Bay Area', 'Seattle, WA', 'Denver, CO']
  if (mild && suburban)                            return ['Denver, CO', 'Charlotte, NC', 'Nashville, TN']
  if (mild && midsize)                             return ['Denver, CO', 'Seattle, WA', 'Charlotte, NC']
  if (seasons && major)                            return ['Chicago, IL', 'Boston, MA', 'New York, NY']
  if (seasons && (suburban || midsize))            return ['Minneapolis, MN', 'Columbus, OH', 'Pittsburgh, PA']
  if (anyClim && restaurant)                       return ['Orlando', 'Las Vegas, NV', 'Miami / Fort Lauderdale']
  if (anyClim && prof)                             return ['New York, NY', 'Chicago, IL', 'Dallas / Fort Worth, TX']
  if (anyClim && trades)                           return ['Tampa / Southwest Florida', 'Dallas / Fort Worth, TX', 'Phoenix / Scottsdale, AZ']
  // default
  return ['Tampa / Southwest Florida', 'Dallas / Fort Worth, TX', 'Orlando']
}

const BADGE = ['Strong match', 'Good match', 'Worth considering']
const BADGE_COLOR = ['#1A7A4A', '#1B5FA8', '#4A5568']
const BADGE_BG    = ['#D1FAE5', '#EBF4FB', '#F1F5F9']

// ── D5 Questions ───────────────────────────────────────────────────────────────

const US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut',
  'Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa',
  'Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan',
  'Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada',
  'New Hampshire','New Jersey','New Mexico','New York','North Carolina',
  'North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island',
  'South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont',
  'Virginia','Washington','West Virginia','Wisconsin','Wyoming',
]

function buildQuestions(d2motivation) {
  const isBusiness = d2motivation === 'Buying or starting a business'
  const qs = [
    {
      id: 'climate',
      text: 'What climate suits you best?',
      options: [
        '☀️  Warm and sunny year-round',
        '🌤️  Mild — not too hot, not too cold',
        '🍂  Four seasons — I want a proper winter',
        '🤷  Climate doesn\'t matter much to me',
      ],
    },
    {
      id: 'env',
      text: 'What kind of environment are you looking for?',
      options: [
        '🏙️  Major city — urban energy and international culture',
        '🌆  Mid-size city — urban feel without the chaos',
        '🏡  Suburban — space, good schools, quieter lifestyle',
        '🌿  Small town or rural — open space and community',
      ],
    },
    {
      id: 'connections',
      text: 'Do you have existing connections in any US city or region?',
      options: [
        '✅  Yes — I already know where I want to go',
        '👥  Yes — I have friends or family in a specific area',
        '🔍  No — completely open',
        '🤷  Not sure yet',
      ],
    },
  ]
  if (isBusiness) {
    qs.push({
      id: 'business',
      text: 'If you\'re pursuing an E-2 visa, what type of business interests you?',
      options: [
        '🍽️  Restaurant / hospitality / food service',
        '🔧  Services — trades, cleaning, maintenance',
        '📦  Retail or e-commerce',
        '💼  Professional services — consulting, tech, financial',
        '🏨  Tourism or short-term rentals',
        '🤷  Not sure yet / exploring options',
      ],
    })
  }
  qs.push({
    id: 'housing',
    text: 'What is your approximate monthly housing budget?',
    options: [
      '🏠  Under $2,000/month',
      '🏠🏠  $2,000 – $3,500/month',
      '🏠🏠🏠  $3,500 – $6,000/month',
      '🏠🏠🏠🏠  Over $6,000/month',
      '🤷  Not sure yet',
    ],
  })
  return qs
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function ProgressBar({ step, total }) {
  return (
    <div className="px-5 pt-4 pb-1">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold" style={{ color: '#4A5568' }}>
          Destination {step} of {total}
        </span>
        <span className="text-xs font-semibold" style={{ color: '#F0A500' }}>
          {Math.round((step / total) * 100)}%
        </span>
      </div>
      <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: '#E2E8F0' }}>
        <div className="h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${(step / total) * 100}%`, backgroundColor: '#F0A500' }} />
      </div>
    </div>
  )
}

function StatPill({ label, highlight }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{
        backgroundColor: highlight ? '#D1FAE5' : '#F1F5F9',
        color: highlight ? '#1A7A4A' : '#4A5568',
      }}>
      {label}
    </span>
  )
}

function DestinationCard({ name, rank, d2answers, d5answers, onSet }) {
  const [expanded, setExpanded] = useState(false)
  const data = DEST_DATA[name] ?? DEST_DATA['Tampa / Southwest Florida']
  const country = d2answers?.country ?? ''
  const isBusiness = d2answers?.motivation === 'Buying or starting a business'
  const bulletSet = isBusiness ? data.bullets.business : (
    d2answers?.motivation === 'Lifestyle — I want a fresh start' || d2answers?.motivation === 'Family reasons'
      ? data.bullets.lifestyle : data.bullets.default
  )
  const flightText = data.flights[country] ?? data.flights.default
  const expatCountry = country === 'Other country' ? 'International' : (country || 'International')

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ backgroundColor: '#FFFFFF', border: rank === 0 ? '2px solid #1B5FA8' : '1px solid #E2E8F0' }}>

      {/* Match badge + city */}
      <div className="px-4 pt-4 pb-3">
        <span className="inline-block text-xs font-extrabold px-2.5 py-1 rounded-full mb-2"
          style={{ backgroundColor: BADGE_BG[rank], color: BADGE_COLOR[rank] }}>
          {BADGE[rank]}
        </span>
        <p className="text-xl font-extrabold leading-tight" style={{ color: '#0D2B4E' }}>{name}</p>
        <p className="text-sm mt-0.5 font-semibold" style={{ color: '#4A9FD4' }}>{data.state === 'FL' ? 'Florida' : data.state === 'TX' ? 'Texas' : data.state === 'AZ' ? 'Arizona' : data.state === 'CA' ? 'California' : data.state === 'WA' ? 'Washington' : data.state === 'CO' ? 'Colorado' : data.state === 'NC' ? 'North Carolina' : data.state === 'TN' ? 'Tennessee' : data.state === 'IL' ? 'Illinois' : data.state === 'MA' ? 'Massachusetts' : data.state === 'NY' ? 'New York' : data.state === 'MN' ? 'Minnesota' : data.state === 'NV' ? 'Nevada' : data.state === 'OH' ? 'Ohio' : data.state === 'PA' ? 'Pennsylvania' : data.state}</p>
      </div>

      {/* Stat pills */}
      <div className="flex flex-wrap gap-1.5 px-4 pb-3">
        <StatPill label={`Tax: ${data.stateTax}`} highlight={data.stateTax === 'None ✅'} />
        <StatPill label={`Rent: ${data.rent}`} />
        <StatPill label={`Home: ${data.home}`} />
        <StatPill label={`Climate: ${data.climate}`} />
      </div>

      {/* Bullets */}
      <div className="flex flex-col gap-1.5 px-4 pb-3">
        {bulletSet.map((b, i) => (
          <p key={i} className="text-xs leading-snug flex gap-1.5" style={{ color: '#4A5568' }}>
            <span style={{ color: '#4A9FD4', flexShrink: 0 }}>•</span>{b}
          </p>
        ))}
      </div>

      {/* Expat + flights */}
      <div className="mx-4 mb-3 rounded-xl px-3 py-2.5"
        style={{ backgroundColor: '#F7F9FC', border: '1px solid #E2E8F0' }}>
        <p className="text-xs" style={{ color: '#4A5568' }}>
          <span className="font-semibold">{expatCountry} expat community:</span> {data.expat}
        </p>
        <p className="text-xs mt-1" style={{ color: '#4A5568' }}>
          <span className="font-semibold">Direct flights:</span> {flightText}
        </p>
      </div>

      {/* Expand toggle */}
      <button onClick={() => setExpanded(!expanded)}
        className="mx-4 mb-3 text-xs font-semibold transition-opacity active:opacity-60 flex items-center gap-1"
        style={{ color: '#1B5FA8' }}>
        <span>Learn more about {name.split('/')[0].trim()} →</span>
        <span style={{ transform: expanded ? 'rotate(90deg)' : 'none', display: 'inline-block', transition: 'transform 0.2s' }}>›</span>
      </button>

      {expanded && (
        <div className="mx-4 mb-3 rounded-xl px-3 py-3 flex flex-col gap-2"
          style={{ backgroundColor: '#EBF4FB' }}>
          <p className="text-xs leading-relaxed" style={{ color: '#0D2B4E' }}>
            <span className="font-semibold">Average rent:</span> {data.rent} · <span className="font-semibold">Average home price:</span> {data.home}
          </p>
          <p className="text-xs leading-relaxed" style={{ color: '#0D2B4E' }}>
            <span className="font-semibold">State income tax:</span> {data.stateTax}
          </p>
          <p className="text-xs leading-relaxed" style={{ color: '#0D2B4E' }}>
            <span className="font-semibold">International flights:</span> {flightText}
          </p>
        </div>
      )}

      {/* Set destination button */}
      <div className="px-4 pb-4">
        <button onClick={() => onSet(name, data.state)}
          className="w-full py-3 rounded-xl text-sm font-extrabold transition-all active:scale-95"
          style={{ backgroundColor: '#0D2B4E', color: '#F0A500' }}>
          Set as my destination ✓
        </button>
      </div>
    </div>
  )
}

// ── Results screen ─────────────────────────────────────────────────────────────

function ResultsScreen({ d5answers, d2answers, onBack, onContinue }) {
  const navigate = useNavigate()
  const [confirmed, setConfirmed] = useState(null)

  const allUnsure = Object.values(d5answers).every(v => v.startsWith('🤷') || v.startsWith('🔍') || v.startsWith('👥'))

  function handleSet(city, state) {
    setConfirmed({ city, state })
    try {
      localStorage.setItem('migratrak_destination', city)
      const saved = JSON.parse(localStorage.getItem('migratrak_answers') || '{}')
      saved.destination = city
      localStorage.setItem('migratrak_answers', JSON.stringify(saved))
    } catch (_) {}
  }

  const country = d2answers?.country ?? ''
  const coachPrompt = `I'm relocating to the US from ${country || 'my home country'} and still deciding where to go. Can you help me think through the best destination for my situation?`

  if (confirmed) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F9FC' }}>
        <div className="flex flex-col flex-1 items-center justify-center gap-6 px-5 py-12">
          <div className="w-full rounded-2xl px-6 py-8 flex flex-col items-center gap-4 text-center"
            style={{ backgroundColor: '#D1FAE5', border: '2px solid #1A7A4A' }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#1A7A4A' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-extrabold" style={{ color: '#1A7A4A' }}>
                ✓ Destination set — {confirmed.city}
              </p>
              <p className="text-sm mt-1 leading-relaxed" style={{ color: '#1A7A4A' }}>
                Your professional directory and life setup checklist will be tailored to {confirmed.city.split('/')[0].trim()}.
              </p>
            </div>
          </div>
          <button onClick={onContinue}
            className="w-full py-4 rounded-2xl text-base font-extrabold transition-all active:scale-95"
            style={{ backgroundColor: '#F0A500', color: '#0D2B4E' }}>
            Continue to my timeline →
          </button>
        </div>
      </div>
    )
  }

  const matches = matchDestinations(d5answers, d2answers)

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F9FC' }}>
      <div className="px-5 pt-5 pb-4" style={{ backgroundColor: '#0D2B4E' }}>
        <button onClick={onBack} className="flex items-center gap-1.5 mb-3 transition-opacity active:opacity-70">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>Back</span>
        </button>
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#4A9FD4' }}>
          Destination Discovery
        </p>
        <h1 className="text-2xl font-extrabold" style={{ color: '#FFFFFF' }}>Your top destination matches</h1>
        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>
          Based on your preferences — here are your best fits
        </p>
      </div>

      {allUnsure ? (
        <div className="flex flex-col gap-4 px-4 pt-4 pb-32">
          <div className="rounded-2xl px-4 py-4" style={{ backgroundColor: '#EBF4FB', border: '1px solid #4A9FD4' }}>
            <p className="text-sm leading-relaxed" style={{ color: '#0D2B4E' }}>
              No problem — many people are still figuring this out at this stage. You can set your destination later once you're further along in your research. Your directory will show nationwide specialists in the meantime.
            </p>
          </div>
          <button onClick={onContinue}
            className="w-full py-4 rounded-2xl text-base font-bold transition-all active:scale-95"
            style={{ backgroundColor: '#F0A500', color: '#0D2B4E' }}>
            Continue without selecting →
          </button>
          <button onClick={() => navigate('/j4', { state: { seedPrompt: coachPrompt } })}
            className="w-full py-3.5 rounded-2xl text-sm font-bold transition-all active:scale-95"
            style={{ backgroundColor: 'transparent', color: '#0D2B4E', border: '2px solid #0D2B4E' }}>
            Ask our AI Coach about destinations →
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4 px-4 pt-4 pb-32">
          {matches.map((city, i) => (
            <DestinationCard key={city} name={city} rank={i} d2answers={d2answers} d5answers={d5answers} onSet={handleSet} />
          ))}
          <div className="rounded-2xl px-4 py-3" style={{ backgroundColor: '#F1F5F9', border: '1px solid #E2E8F0' }}>
            <p className="text-xs leading-relaxed" style={{ color: '#4A5568' }}>
              These recommendations are based on your stated preferences and are starting points for your own research. Visit each city if possible before committing — destination choice is one of the most important decisions you'll make.
            </p>
          </div>
          <button onClick={() => navigate('/j4', { state: { seedPrompt: coachPrompt } })}
            className="w-full py-3.5 rounded-2xl text-sm font-bold transition-all active:scale-95"
            style={{ backgroundColor: 'transparent', color: '#0D2B4E', border: '2px solid #0D2B4E' }}>
            Ask our AI Coach about destinations →
          </button>
        </div>
      )}
    </div>
  )
}

// ── Destination known — pick state + city ──────────────────────────────────────

function KnownDestinationPicker({ onConfirm, onBack }) {
  const [selState, setSelState] = useState('')
  const [city, setCity] = useState('')
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F9FC' }}>
      <div className="flex items-center px-4 pt-4 pb-1 gap-2">
        <button onClick={onBack}
          className="flex items-center justify-center w-10 h-10 rounded-full transition-opacity active:opacity-60"
          style={{ backgroundColor: '#EBF4FB' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0D2B4E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <p className="text-sm font-semibold" style={{ color: '#0D2B4E' }}>Your destination</p>
      </div>
      <div className="flex-1 px-4 pt-4 pb-8 flex flex-col gap-4">
        <div className="rounded-2xl px-5 py-6 shadow-sm" style={{ backgroundColor: '#FFFFFF' }}>
          <h2 className="text-xl font-bold leading-snug mb-4" style={{ color: '#0D2B4E' }}>
            Great — tell us where you're headed
          </h2>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#4A5568' }}>State</label>
              <select value={selState} onChange={e => setSelState(e.target.value)}
                className="w-full px-3 rounded-xl text-sm outline-none appearance-none"
                style={{ height: 44, border: '2px solid #E2E8F0', backgroundColor: '#F7F9FC', color: '#0D2B4E' }}>
                <option value="">Select a state…</option>
                {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#4A5568' }}>City or metro (optional)</label>
              <input type="text" value={city} onChange={e => setCity(e.target.value)}
                placeholder="e.g. Tampa, Miami, Austin…"
                className="w-full px-3 rounded-xl text-sm outline-none"
                style={{ height: 44, border: '2px solid #E2E8F0', backgroundColor: '#F7F9FC', color: '#0D2B4E' }} />
            </div>
          </div>
        </div>
        <button onClick={() => selState && onConfirm(city ? `${city}, ${selState}` : selState)}
          disabled={!selState}
          className="w-full py-4 rounded-2xl text-base font-bold tracking-wide transition-all active:scale-95"
          style={{ backgroundColor: selState ? '#F0A500' : '#E2E8F0', color: selState ? '#0D2B4E' : '#A0AEC0' }}>
          Confirm my destination →
        </button>
      </div>
    </div>
  )
}

// ── Main screen ────────────────────────────────────────────────────────────────

export default function D5Destination() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const d2answers = state?.answers ?? (() => {
    try { return JSON.parse(localStorage.getItem('migratrak_answers') || '{}') } catch (_) { return {} }
  })()

  const QUESTIONS = buildQuestions(d2answers.motivation)

  const [step,       setStep]       = useState(0)
  const [answers,    setAnswers]     = useState({})
  const [selected,   setSelected]   = useState(null)
  const [view,       setView]        = useState('questions') // 'questions' | 'known' | 'results'
  const [confirmed,  setConfirmed]   = useState(null)

  const q = QUESTIONS[step]
  const total = QUESTIONS.length
  const isLast = step === total - 1

  function handleSelect(opt) { setSelected(opt) }

  function handleContinue() {
    if (!selected) return
    const newAnswers = { ...answers, [q.id]: selected }
    setAnswers(newAnswers)

    // If connections Q — already know → show picker
    if (q.id === 'connections' && selected.startsWith('✅')) {
      setView('known')
      return
    }

    if (isLast) {
      setAnswers(newAnswers)
      setView('results')
    } else {
      setStep(step + 1)
      setSelected(null)
    }
  }

  function handleBack() {
    if (step === 0) navigate('/d4')
    else { setStep(step - 1); setSelected(answers[QUESTIONS[step - 1].id] ?? null) }
  }

  function handleKnownConfirm(dest) {
    try {
      localStorage.setItem('migratrak_destination', dest)
      const saved = JSON.parse(localStorage.getItem('migratrak_answers') || '{}')
      saved.destination = dest
      localStorage.setItem('migratrak_answers', JSON.stringify(saved))
    } catch (_) {}
    navigate('/d6')
  }

  function handleContinueToD6() { navigate('/d6') }

  if (view === 'known') {
    return <KnownDestinationPicker onConfirm={handleKnownConfirm} onBack={() => setView('questions')} />
  }

  if (view === 'results') {
    return <ResultsScreen d5answers={answers} d2answers={d2answers} onBack={() => { setView('questions'); setStep(total - 1); setSelected(answers[q.id] ?? null) }} onContinue={handleContinueToD6} />
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F9FC' }}>
      {/* Header */}
      <div className="flex items-center px-4 pt-4 pb-0 gap-2">
        <button onClick={handleBack}
          className="flex items-center justify-center w-10 h-10 rounded-full transition-opacity active:opacity-60"
          style={{ backgroundColor: '#EBF4FB' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0D2B4E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <div className="flex-1">
          <ProgressBar step={step + 1} total={total} />
        </div>
      </div>

      {/* Intro on Q1 only */}
      {step === 0 && (
        <div className="px-5 pt-4 pb-1">
          <h1 className="text-2xl font-extrabold leading-tight" style={{ color: '#0D2B4E' }}>
            Where in the US are you headed?
          </h1>
          <p className="text-sm mt-1" style={{ color: '#4A5568' }}>
            Answer a few quick questions and we'll suggest destinations that fit your lifestyle and goals.
          </p>
        </div>
      )}

      {/* Question card */}
      <div className="flex-1 px-4 pt-4 pb-8 flex flex-col gap-4">
        <div className="rounded-2xl px-5 py-6 shadow-sm" style={{ backgroundColor: '#FFFFFF' }}>
          <h2 className="text-xl font-bold leading-snug mb-5" style={{ color: '#0D2B4E' }}>
            {q.text}
          </h2>
          <div className="flex flex-col gap-3">
            {q.options.map((opt) => {
              const isActive = selected === opt
              return (
                <button key={opt} onClick={() => handleSelect(opt)}
                  className="flex items-center gap-3 w-full text-left rounded-xl px-4 transition-all duration-150 active:scale-[0.98]"
                  style={{
                    minHeight: 56,
                    border: `2px solid ${isActive ? '#1B5FA8' : '#E2E8F0'}`,
                    backgroundColor: isActive ? '#EBF4FB' : '#FFFFFF',
                    color: isActive ? '#0D2B4E' : '#4A5568',
                  }}>
                  <div className="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center"
                    style={{ borderColor: isActive ? '#1B5FA8' : '#CBD5E0', backgroundColor: isActive ? '#1B5FA8' : 'transparent' }}>
                    {isActive && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#FFFFFF' }} />}
                  </div>
                  <span className="text-sm font-medium py-2.5 leading-snug">{opt}</span>
                </button>
              )
            })}
          </div>
        </div>

        <button onClick={handleContinue} disabled={!selected}
          className="w-full py-4 rounded-2xl text-base font-bold tracking-wide transition-all active:scale-95"
          style={{ backgroundColor: selected ? '#F0A500' : '#E2E8F0', color: selected ? '#0D2B4E' : '#A0AEC0' }}>
          {isLast ? 'See My Destination Matches →' : 'Continue →'}
        </button>
      </div>
    </div>
  )
}
