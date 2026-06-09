import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

// ── Destination data ───────────────────────────────────────────────────────────

const DEST_DATA = {
  'Tampa / Southwest Florida': {
    state: 'FL', stateName: 'Florida', stateTax: 'None ✅', climate: 'Warm & sunny',
    housing: { medianHome: '$385,000', trend: 'Stable', inventory: 'Moderate', rent2br: '$1,950/mo', rentalMarket: 'Moderate' },
    bullets: {
      default: ['Largest established Canadian and international expat community in Florida', 'Strong E-2 business acquisition market — especially services and hospitality', 'No state income tax — significant advantage vs most home countries'],
      business: ['Strong E-2 acquisition market — especially services, hospitality and trades', 'Established international expat community — large and growing', 'Suburban lifestyle with Gulf Coast access'],
      lifestyle: ['Gulf Coast beaches, outdoor lifestyle, and year-round warmth', 'Large international expat community — easy to find familiar connections', 'No state income tax — lower overall tax burden vs most countries'],
    },
    expat: 'Large ✅',
    flights: { Canada: 'Many direct flights — Toronto, Calgary, Vancouver, Montreal', 'United Kingdom': 'Direct from London Heathrow, Gatwick, Manchester', Australia: 'Via LAX or DFW connection', default: 'Many international connections via Miami' },
  },
  'Miami / Fort Lauderdale': {
    state: 'FL', stateName: 'Florida', stateTax: 'None ✅', climate: 'Warm & sunny',
    housing: { medianHome: '$620,000', trend: 'Rising', inventory: 'Low', rent2br: '$2,800/mo', rentalMarket: 'Competitive' },
    bullets: {
      default: ['Largest international business hub in Florida — strong EB-5 concentration', 'Most diverse international city in the Southeast', 'Higher cost of living than other Florida metros'],
      business: ['Strongest EB-5 regional center concentration in the Southeast US', 'International business environment — ideal for global entrepreneurs', 'Higher cost of living — offset by no state income tax'],
      lifestyle: ['World-class international city — cosmopolitan culture and nightlife', 'Highest international expat density in Florida', 'Higher cost of living than other Florida metros'],
    },
    expat: 'Large ✅',
    flights: { Canada: 'Direct from Toronto and Montreal', 'United Kingdom': 'Direct from London Heathrow and Gatwick', Australia: 'Via LAX connection', default: 'Miami is a major international hub' },
  },
  'Orlando': {
    state: 'FL', stateName: 'Florida', stateTax: 'None ✅', climate: 'Warm & sunny',
    housing: { medianHome: '$365,000', trend: 'Stable', inventory: 'Moderate', rent2br: '$1,750/mo', rentalMarket: 'Moderate' },
    bullets: {
      default: ['Most affordable major Florida metro — strong value for families', 'Large and diverse international community', 'Tourism economy creates strong E-2 franchise opportunities'],
      business: ['Tourism and hospitality economy — strong E-2 franchise acquisition market', 'Most affordable major Florida metro', 'Large growing international expat community'],
      lifestyle: ['Family-friendly with excellent schools in outer suburbs', 'More affordable than Miami or Tampa', 'Large international expat community'],
    },
    expat: 'Large ✅',
    flights: { Canada: 'Direct from Toronto, Ottawa, Montreal', 'United Kingdom': 'Direct from Gatwick, Manchester, Birmingham, Edinburgh', Australia: 'Via LAX or DFW connection', default: 'Major international connections' },
  },
  'Phoenix / Scottsdale, AZ': {
    state: 'AZ', stateName: 'Arizona', stateTax: '2.5%', climate: 'Warm & dry',
    housing: { medianHome: '$420,000', trend: 'Stable', inventory: 'Moderate', rent2br: '$1,700/mo', rentalMarket: 'Moderate' },
    bullets: {
      default: ['Dry desert climate — very popular with lifestyle movers', 'Lower cost of living than Florida coastal metros', 'Smaller immigration specialist network'],
      business: ['Growing business market — lower state income tax than many states', 'Lower cost of living than Florida coastal metros', 'Smaller but growing international expat community'],
      lifestyle: ['Dry heat and outdoor lifestyle — golf, hiking, year-round sun', 'Very affordable cost of living vs major metros', 'Popular with retirees and lifestyle movers from Western countries'],
    },
    expat: 'Moderate',
    flights: { Canada: 'Direct from Vancouver and Calgary', 'United Kingdom': 'Direct from London Heathrow, Manchester (seasonal)', Australia: 'Via connection from Perth', default: 'Good international connections via LAX' },
  },
  'Dallas / Fort Worth, TX': {
    state: 'TX', stateName: 'Texas', stateTax: 'None ✅', climate: 'Warm — hot summers',
    housing: { medianHome: '$375,000', trend: 'Cooling', inventory: 'Moderate', rent2br: '$1,650/mo', rentalMarket: 'Moderate' },
    bullets: {
      default: ['No state income tax — strong financial advantage', 'One of the fastest growing business markets in the US', 'Lower cost of living than coastal metros'],
      business: ['Major technology and professional services hub', 'No state income tax — same advantage as Florida', 'Fast growing economy with strong business acquisition market'],
      lifestyle: ['Very affordable cost of living — lower than most major US metros', 'No state income tax', 'Large and fast growing international expat community'],
    },
    expat: 'Growing',
    flights: { Canada: 'Direct from Toronto and Calgary', 'United Kingdom': 'Direct from London Heathrow', Australia: 'Via LAX connection', default: 'Dallas/Fort Worth is a major international hub' },
  },
  'Austin, TX': {
    state: 'TX', stateName: 'Texas', stateTax: 'None ✅', climate: 'Warm — hot summers',
    housing: { medianHome: '$490,000', trend: 'Cooling', inventory: 'High', rent2br: '$1,900/mo', rentalMarket: 'Renter-friendly' },
    bullets: {
      default: ['Technology hub with strong entrepreneurial culture', 'No state income tax', 'Fast growing with strong quality of life'],
      business: ['Leading US technology and startup hub', 'No state income tax', 'Fast growing professional services market'],
      lifestyle: ['Vibrant culture, live music, outdoor lifestyle', 'No state income tax', 'Fast growing international community'],
    },
    expat: 'Growing',
    flights: { Canada: 'Connections via Dallas', 'United Kingdom': 'Connections via Dallas or Houston', Australia: 'Via connection', default: 'Austin-Bergstrom International Airport' },
  },
  'Denver, CO': {
    state: 'CO', stateName: 'Colorado', stateTax: '4.4%', climate: 'Mild — four seasons',
    housing: { medianHome: '$550,000', trend: 'Stable', inventory: 'Low', rent2br: '$2,100/mo', rentalMarket: 'Competitive' },
    bullets: {
      default: ['Outdoor lifestyle — skiing, hiking, Rocky Mountain access', 'Moderate cost of living vs coastal metros', 'Growing technology and professional services sector'],
      business: ['Growing technology and professional services hub', 'Outdoor lifestyle appeal — strong talent attraction', 'More affordable than coastal metros'],
      lifestyle: ['World-class outdoor recreation — skiing, hiking, year-round activities', 'Mild climate with genuine four seasons', 'Strong international expat and professional community'],
    },
    expat: 'Moderate',
    flights: { Canada: 'Direct from Calgary, Toronto', 'United Kingdom': 'Direct from London Heathrow', Australia: 'Via LAX connection', default: 'Denver International is a major hub' },
  },
  'Charlotte, NC': {
    state: 'NC', stateName: 'North Carolina', stateTax: '4.75%', climate: 'Mild — four seasons',
    housing: { medianHome: '$375,000', trend: 'Rising', inventory: 'Low', rent2br: '$1,600/mo', rentalMarket: 'Moderate' },
    bullets: {
      default: ['Major financial services hub — fast growing metro', 'Very affordable cost of living', 'Good quality of life with mild climate'],
      business: ['Major banking and financial services centre', 'Affordable business operating costs', 'Fast growing metro with strong economy'],
      lifestyle: ['Very affordable cost of living', 'Mild climate — warm summers, light winters', 'Fast growing international community'],
    },
    expat: 'Moderate',
    flights: { Canada: 'Connections via major hubs', 'United Kingdom': 'Direct from London Heathrow', Australia: 'Via connection', default: 'Charlotte Douglas International Airport' },
  },
  'Nashville, TN': {
    state: 'TN', stateName: 'Tennessee', stateTax: 'None ✅', climate: 'Mild — four seasons',
    housing: { medianHome: '$430,000', trend: 'Stable', inventory: 'Moderate', rent2br: '$1,800/mo', rentalMarket: 'Moderate' },
    bullets: {
      default: ['No state income tax — significant advantage', 'Fast growing city with strong economy', 'Lower cost of living than coastal metros'],
      business: ['No state income tax', 'Strong healthcare, technology and hospitality sectors', 'Fast growing business-friendly environment'],
      lifestyle: ['Vibrant music and culture scene', 'No state income tax', 'Growing international community'],
    },
    expat: 'Small',
    flights: { Canada: 'Connections via major hubs', 'United Kingdom': 'Connections via Atlanta or Chicago', Australia: 'Via connection', default: 'Nashville International Airport' },
  },
  'Chicago, IL': {
    state: 'IL', stateName: 'Illinois', stateTax: '4.95%', climate: 'Four seasons',
    housing: { medianHome: '$320,000', trend: 'Stable', inventory: 'Moderate', rent2br: '$2,200/mo', rentalMarket: 'Moderate' },
    bullets: {
      default: ['Major international city with large diverse expat community', 'World-class culture, architecture, and business environment', 'Real four seasons — similar to many home countries'],
      business: ['Major financial, professional services and technology hub', 'World-class international business environment', 'Large and established international expat community'],
      lifestyle: ['World-class culture, restaurants, arts and architecture', 'Real four seasons — familiar to people from temperate countries', 'Large international expat community'],
    },
    expat: 'Large ✅',
    flights: { Canada: 'Many direct flights from Toronto, Montreal, Calgary, Vancouver', 'United Kingdom': 'Direct from London Heathrow and Gatwick', Australia: 'Direct from Melbourne and Sydney', default: "O'Hare is a major international hub" },
  },
  'Boston, MA': {
    state: 'MA', stateName: 'Massachusetts', stateTax: '5%', climate: 'Four seasons',
    housing: { medianHome: '$680,000', trend: 'Stable', inventory: 'Low', rent2br: '$2,800/mo', rentalMarket: 'Competitive' },
    bullets: {
      default: ['World-class universities, healthcare and technology sectors', 'Strong international professional community', 'Real four seasons — similar climate to many home countries'],
      business: ['Leading biotech, technology and financial services hub', 'World-class talent pool and professional network', 'Strong international business environment'],
      lifestyle: ['Historic, walkable city with strong cultural identity', 'Excellent healthcare and education', 'Real four seasons'],
    },
    expat: 'Large ✅',
    flights: { Canada: 'Direct from Toronto and Montreal', 'United Kingdom': 'Direct from London Heathrow and Gatwick', Australia: 'Via connection', default: 'Boston Logan International Airport' },
  },
  'New York, NY': {
    state: 'NY', stateName: 'New York', stateTax: '6.85%', climate: 'Four seasons',
    housing: { medianHome: '$750,000', trend: 'Stable', inventory: 'Low', rent2br: '$3,500/mo', rentalMarket: 'Competitive' },
    bullets: {
      default: ["The world's most international city — largest expat community in the US", 'Unmatched business, culture, finance and professional opportunity', 'Highest cost of living in the US — plan accordingly'],
      business: ["World's leading financial, media and professional services centre", 'Unmatched deal flow and investor network', 'Highest cost of living — offset by unmatched opportunity'],
      lifestyle: ['Unmatched cultural diversity, restaurants, arts and nightlife', 'The most international city in the United States', 'Highest cost of living — plan budget carefully'],
    },
    expat: 'Large ✅',
    flights: { Canada: 'Many direct flights from Toronto, Montreal, Vancouver, Calgary', 'United Kingdom': 'Many direct flights from all major UK airports', Australia: 'Direct from Sydney and Melbourne', default: 'JFK, Newark and LaGuardia serve all major international routes' },
  },
  'San Francisco / Bay Area': {
    state: 'CA', stateName: 'California', stateTax: '9.3%', climate: 'Mild year-round',
    housing: { medianHome: '$1,200,000', trend: 'Stable', inventory: 'Low', rent2br: '$3,200/mo', rentalMarket: 'Competitive' },
    bullets: {
      default: ['Global technology and innovation hub — unmatched for tech professionals', 'Mild climate year-round — no extreme heat or cold', 'Highest cost of living in the US outside Manhattan'],
      business: ["World's leading technology and venture capital hub", 'Unmatched professional network for technology and innovation', 'Very high cost of living and operating costs'],
      lifestyle: ['Mild year-round climate — no extreme seasons', 'World-class food, culture and outdoor access', 'Very high cost of living'],
    },
    expat: 'Large ✅',
    flights: { Canada: 'Direct from Vancouver, Toronto, Calgary', 'United Kingdom': 'Direct from London Heathrow', Australia: 'Direct from Sydney and Melbourne', default: 'SFO and Oakland serve major international routes' },
  },
  'Seattle, WA': {
    state: 'WA', stateName: 'Washington', stateTax: 'None ✅', climate: 'Mild — cool and rainy',
    housing: { medianHome: '$750,000', trend: 'Stable', inventory: 'Low', rent2br: '$2,400/mo', rentalMarket: 'Competitive' },
    bullets: {
      default: ['No state income tax — strong financial advantage', 'Major technology hub — Amazon, Microsoft, Boeing headquarters', 'Mild but grey climate — very familiar to people from UK or Canada'],
      business: ['Major technology and aerospace hub — Amazon and Microsoft HQ', 'No state income tax', 'Strong international business environment'],
      lifestyle: ['No state income tax', 'Outdoor lifestyle — mountains, water, forests', 'Mild climate familiar to people from northern countries'],
    },
    expat: 'Large ✅',
    flights: { Canada: 'Direct from Vancouver — 45 min; Toronto and Calgary', 'United Kingdom': 'Direct from London Heathrow', Australia: 'Direct from Sydney', default: 'Seattle-Tacoma International Airport' },
  },
  'Minneapolis, MN': {
    state: 'MN', stateName: 'Minnesota', stateTax: '6.8%', climate: 'Four seasons — cold winters',
    housing: { medianHome: '$310,000', trend: 'Stable', inventory: 'Moderate', rent2br: '$1,400/mo', rentalMarket: 'Moderate' },
    bullets: {
      default: ['Very affordable cost of living vs major US metros', 'Strong economy — Fortune 500 headquarters', 'Real four seasons — very cold winters familiar to Canadians and Northern Europeans'],
      business: ['Major medical device, retail and financial services hub', 'Very affordable business operating costs', 'Strong talent pool and quality of life'],
      lifestyle: ['Very affordable — among lowest cost of living for major US metros', 'Strong outdoor culture — lakes, trails, winter sports', 'Real four seasons — familiar to people from cold climates'],
    },
    expat: 'Moderate',
    flights: { Canada: 'Direct from Toronto and Winnipeg', 'United Kingdom': 'Direct from London Heathrow', Australia: 'Via connection', default: 'Minneapolis-Saint Paul International Airport' },
  },
  'Las Vegas, NV': {
    state: 'NV', stateName: 'Nevada', stateTax: 'None ✅', climate: 'Warm & dry',
    housing: { medianHome: '$380,000', trend: 'Stable', inventory: 'Moderate', rent2br: '$1,600/mo', rentalMarket: 'Moderate' },
    bullets: {
      default: ['No state income tax', 'Strong tourism, hospitality and entertainment economy', 'Affordable cost of living for a major metro'],
      business: ["World's leading tourism, hospitality and entertainment market — ideal for E-2", 'No state income tax', 'Lower cost of living than coastal metros'],
      lifestyle: ['No state income tax', 'Warm dry climate', 'Entertainment and lifestyle amenities'],
    },
    expat: 'Moderate',
    flights: { Canada: 'Direct from Vancouver, Calgary, Toronto', 'United Kingdom': 'Direct from London Heathrow and Manchester', Australia: 'Via LAX connection', default: 'Harry Reid International Airport serves major international routes' },
  },
  'Columbus, OH': {
    state: 'OH', stateName: 'Ohio', stateTax: '3.99%', climate: 'Four seasons',
    housing: { medianHome: '$260,000', trend: 'Stable', inventory: 'Moderate', rent2br: '$1,200/mo', rentalMarket: 'Moderate' },
    bullets: {
      default: ['Most affordable major metro on this list', 'Strong university and healthcare economy', 'Real four seasons — familiar climate'],
      business: ['Very low operating costs', 'Strong logistics and distribution hub', 'Affordable talent pool'],
      lifestyle: ['Very affordable cost of living', 'Real four seasons', 'Growing arts and food scene'],
    },
    expat: 'Small',
    flights: { Canada: 'Connections via major hubs', 'United Kingdom': 'Connections via Chicago or New York', Australia: 'Via connection', default: 'John Glenn Columbus International Airport' },
  },
  'Pittsburgh, PA': {
    state: 'PA', stateName: 'Pennsylvania', stateTax: '3.07%', climate: 'Four seasons',
    housing: { medianHome: '$220,000', trend: 'Stable', inventory: 'Moderate', rent2br: '$1,100/mo', rentalMarket: 'Moderate' },
    bullets: {
      default: ['Most affordable major metro in the Northeast', 'Growing technology and healthcare hub', 'Real four seasons'],
      business: ['Very low operating costs', 'Growing technology sector — Carnegie Mellon', 'Affordable real estate'],
      lifestyle: ['Most affordable on the list', 'Real four seasons', 'Growing arts and culture scene'],
    },
    expat: 'Small',
    flights: { Canada: 'Connections via major hubs', 'United Kingdom': 'Connections via New York', Australia: 'Via connection', default: 'Pittsburgh International Airport' },
  },
  // ── Additional states ──────────────────────────────────────────────────────────
  'Atlanta, GA': {
    state: 'GA', stateName: 'Georgia', stateTax: '5.75%', climate: 'Warm — mild winters',
    housing: { medianHome: '$375,000', trend: 'Rising', inventory: 'Low', rent2br: '$1,750/mo', rentalMarket: 'Competitive' },
    bullets: {
      default: ["World's busiest airport — unmatched US and international connectivity", 'Fast growing economy and diverse international community', 'Warm climate with mild winters — shorter than the Northeast'],
      business: ['Major logistics, film and technology hub', 'Lower operating costs than coastal metros', 'Fast growing international business community'],
      lifestyle: ['Warm climate — mild winters', 'Fast growing diverse international community', 'Lower cost of living than DC or New York'],
    },
    expat: 'Growing',
    flights: { Canada: 'Direct from Toronto and Montreal', 'United Kingdom': 'Direct from London Heathrow', Australia: 'Via LAX or direct from Sydney', default: "Hartsfield-Jackson Atlanta — world's busiest airport" },
  },
  'Houston, TX': {
    state: 'TX', stateName: 'Texas', stateTax: 'None ✅', climate: 'Warm & humid',
    housing: { medianHome: '$310,000', trend: 'Stable', inventory: 'Moderate', rent2br: '$1,600/mo', rentalMarket: 'Moderate' },
    bullets: {
      default: ['No state income tax', 'Major international energy and business hub', 'Largest city in Texas — extremely diverse international community'],
      business: ['Global energy sector headquarters', 'No state income tax', 'Large international business community — very diverse'],
      lifestyle: ['No state income tax', 'Extremely diverse international community — over 145 languages spoken', 'Very affordable cost of living for a major metro'],
    },
    expat: 'Large ✅',
    flights: { Canada: 'Direct from Toronto', 'United Kingdom': 'Direct from London Heathrow', Australia: 'Via LAX connection', default: 'George Bush Intercontinental — major international hub' },
  },
  'Los Angeles, CA': {
    state: 'CA', stateName: 'California', stateTax: '9.3%', climate: 'Warm & sunny',
    housing: { medianHome: '$850,000', trend: 'Stable', inventory: 'Low', rent2br: '$2,900/mo', rentalMarket: 'Competitive' },
    bullets: {
      default: ['Entertainment and creative industry capital of the world', 'Year-round warm and sunny climate', 'Extremely diverse international community — 140+ languages spoken'],
      business: ['Global entertainment, media and technology hub', 'Very large international business community', 'High cost of living and taxes'],
      lifestyle: ['Year-round sun, beaches and outdoor lifestyle', "The world's most diverse city — enormous international community", 'Very high cost of living'],
    },
    expat: 'Large ✅',
    flights: { Canada: 'Direct from Vancouver, Calgary, Toronto', 'United Kingdom': 'Direct from London Heathrow and Gatwick', Australia: 'Direct from Sydney and Melbourne — LAX is the main gateway', default: 'LAX is one of the largest international airports in the world' },
  },
  'Portland, OR': {
    state: 'OR', stateName: 'Oregon', stateTax: '9.9%', climate: 'Mild — cool and rainy',
    housing: { medianHome: '$490,000', trend: 'Cooling', inventory: 'Moderate', rent2br: '$1,800/mo', rentalMarket: 'Moderate' },
    bullets: {
      default: ['No sales tax — significant everyday cost advantage', 'Outdoor lifestyle — forests, coast and mountains within an hour', 'Growing technology and creative sector'],
      business: ['No sales tax — retail and hospitality cost advantage', 'Growing technology sector at lower cost than San Francisco', 'Strong creative and food economy'],
      lifestyle: ['Outdoor lifestyle — hiking, skiing, coast within 90 minutes', 'No sales tax', 'Vibrant food, coffee and arts culture'],
    },
    expat: 'Moderate',
    flights: { Canada: 'Direct from Vancouver (45 min); Toronto seasonal', 'United Kingdom': 'Connections via Seattle or San Francisco', Australia: 'Connections via San Francisco', default: 'Portland International Airport' },
  },
  'Salt Lake City, UT': {
    state: 'UT', stateName: 'Utah', stateTax: '4.85%', climate: 'Mild — four seasons',
    housing: { medianHome: '$480,000', trend: 'Cooling', inventory: 'Moderate', rent2br: '$1,650/mo', rentalMarket: 'Moderate' },
    bullets: {
      default: ['World-class skiing — 7 resorts within an hour of downtown', 'Fast growing technology sector — Silicon Slopes', 'Outdoor lifestyle with genuine four seasons'],
      business: ['Fast growing technology hub — Silicon Slopes', 'Lower cost of living than coastal metros', 'Business-friendly state environment'],
      lifestyle: ['World-class skiing and outdoor recreation year-round', 'Clean, safe community with strong family values', 'Fast growing international community'],
    },
    expat: 'Small',
    flights: { Canada: 'Direct from Calgary and Vancouver', 'United Kingdom': 'Connections via Los Angeles or Denver', Australia: 'Via LAX connection', default: 'Salt Lake City International Airport' },
  },
  'New Orleans, LA': {
    state: 'LA', stateName: 'Louisiana', stateTax: '4.25%', climate: 'Warm & humid',
    housing: { medianHome: '$235,000', trend: 'Stable', inventory: 'Moderate', rent2br: '$1,350/mo', rentalMarket: 'Moderate' },
    bullets: {
      default: ['Most affordable major city in the South', 'Unique culture, cuisine and vibrant hospitality economy', 'Warm climate with mild winters'],
      business: ['Strong hospitality and tourism economy — ideal for E-2', 'Very affordable real estate and operating costs', 'Unique culture drives strong restaurant and entertainment market'],
      lifestyle: ['World-famous culture, music, food and festivals', 'One of the most affordable major cities on this list', 'Warm subtropical climate year-round'],
    },
    expat: 'Small',
    flights: { Canada: 'Connections via Houston or Atlanta', 'United Kingdom': 'Connections via New York or Atlanta', Australia: 'Via connection', default: 'Louis Armstrong New Orleans International Airport' },
  },
  'Charleston, SC': {
    state: 'SC', stateName: 'South Carolina', stateTax: '6.5%', climate: 'Warm — mild winters',
    housing: { medianHome: '$400,000', trend: 'Rising', inventory: 'Low', rent2br: '$1,700/mo', rentalMarket: 'Moderate' },
    bullets: {
      default: ['Beautiful historic coastal city with exceptional quality of life', 'Fast growing metro with warm climate and mild winters', 'Lower cost of living than comparable Florida coastal cities'],
      business: ['Growing technology and aerospace manufacturing sector', 'Strong hospitality and tourism opportunity', 'Lower operating costs than Florida coastal metros'],
      lifestyle: ['Beautiful historic architecture, beaches and coastal lifestyle', 'Warm climate — mild winters', 'Strong local food and culture scene'],
    },
    expat: 'Small',
    flights: { Canada: 'Connections via Atlanta or Charlotte', 'United Kingdom': 'Connections via Atlanta', Australia: 'Via connection', default: 'Charleston International Airport' },
  },
  'Asheville, NC': {
    state: 'NC', stateName: 'North Carolina', stateTax: '4.75%', climate: 'Mild — four seasons',
    housing: { medianHome: '$385,000', trend: 'Rising', inventory: 'Low', rent2br: '$1,600/mo', rentalMarket: 'Moderate' },
    bullets: {
      default: ['Consistently rated top small city for quality of life and arts', 'Blue Ridge Mountains — world-class hiking, biking and outdoor living', 'Vibrant food, craft beer and independent arts scene'],
      business: ['Strong tourism and hospitality economy', 'Growing remote worker and creative professional community', 'Lower costs than major metros'],
      lifestyle: ['World-class outdoor recreation in the Blue Ridge Mountains', 'Highly rated food and arts scene', 'Genuine four seasons in a walkable small city'],
    },
    expat: 'Small',
    flights: { Canada: 'Connections via Charlotte or Atlanta', 'United Kingdom': 'Connections via Charlotte (CLT)', Australia: 'Via connection', default: 'Asheville Regional Airport — connections via Charlotte' },
  },
  'Bozeman, MT': {
    state: 'MT', stateName: 'Montana', stateTax: '6.75%', climate: 'Four seasons — cold winters',
    housing: { medianHome: '$530,000', trend: 'Rising', inventory: 'Low', rent2br: '$1,800/mo', rentalMarket: 'Competitive' },
    bullets: {
      default: ['Gateway to Yellowstone National Park — world-class outdoor recreation', 'No sales tax', 'Fast growing small city with strong outdoor culture and quality of life'],
      business: ['No sales tax', 'Growing technology and remote worker community', 'Tourism and outdoor recreation economy'],
      lifestyle: ['Gateway to Yellowstone — world-class skiing, fly fishing and hiking', 'No sales tax', 'Beautiful four seasons in a tight-knit community'],
    },
    expat: 'Small',
    flights: { Canada: 'Connections via Salt Lake City or Seattle', 'United Kingdom': 'Connections via Salt Lake City or Seattle', Australia: 'Via connection', default: 'Bozeman Yellowstone International Airport' },
  },
  'Burlington, VT': {
    state: 'VT', stateName: 'Vermont', stateTax: '8.75%', climate: 'Four seasons — cold winters',
    housing: { medianHome: '$395,000', trend: 'Rising', inventory: 'Low', rent2br: '$1,700/mo', rentalMarket: 'Competitive' },
    bullets: {
      default: ['Highly rated quality of life — clean, safe, welcoming community', 'Stunning natural beauty — Green Mountains and Lake Champlain', 'University of Vermont town — strong arts, food and culture scene'],
      business: ['Strong tourism and outdoor recreation economy', 'University of Vermont drives education and healthcare sector', 'Proximity to Montreal (1.5 hours) — strong Canadian connections'],
      lifestyle: ['World-class skiing and outdoor recreation', 'Beautiful four seasons — especially fall foliage', 'Only 1.5 hours from Montreal — very accessible for Canadians'],
    },
    expat: 'Small',
    flights: { Canada: 'Very close to Montreal — 1.5 hours by car', 'United Kingdom': 'Connections via Boston or New York', Australia: 'Via Boston or New York', default: 'Burlington International Airport — connections via Boston' },
  },
  'Northern Virginia / DC Metro': {
    state: 'VA', stateName: 'Virginia', stateTax: '5.75%', climate: 'Four seasons',
    housing: { medianHome: '$620,000', trend: 'Stable', inventory: 'Low', rent2br: '$2,300/mo', rentalMarket: 'Competitive' },
    bullets: {
      default: ['Gateway to Washington DC — federal government and major contractor market', 'Amazon HQ2 — major technology and professional services hub', 'Strong international expat community from diplomatic and government sectors'],
      business: ['Largest concentration of US federal and tech contracts', 'Amazon HQ2 and major federal contractor market', 'Access to DC business environment and talent'],
      lifestyle: ['Proximity to Washington DC culture without DC prices', 'Excellent schools and large international community', 'Four seasons — familiar to many European and Canadian expats'],
    },
    expat: 'Large ✅',
    flights: { Canada: 'Direct from Toronto and Montreal via Dulles Airport', 'United Kingdom': 'Direct from London Heathrow via Dulles', Australia: 'Via LAX connection', default: 'Dulles International (IAD) and Reagan National (DCA) airports' },
  },
  'Baltimore / Bethesda, MD': {
    state: 'MD', stateName: 'Maryland', stateTax: '5.75%', climate: 'Four seasons',
    housing: { medianHome: '$370,000', trend: 'Stable', inventory: 'Moderate', rent2br: '$1,750/mo', rentalMarket: 'Moderate' },
    bullets: {
      default: ['Proximity to Washington DC without DC prices', 'Major biomedical and healthcare hub — Johns Hopkins University', 'Easy Amtrak access to Philadelphia, New York and Boston'],
      business: ['Leading biomedical research and healthcare sector', 'Access to DC federal market from Baltimore (45 min)', 'More affordable than DC or Northern Virginia'],
      lifestyle: ['Chesapeake Bay lifestyle — waterfront culture and fresh seafood', 'Real four seasons', 'Easy access to DC and Northeast corridor'],
    },
    expat: 'Moderate',
    flights: { Canada: 'Direct from Toronto (BWI Airport)', 'United Kingdom': 'Direct from London Heathrow (BWI)', Australia: 'Via connection', default: 'BWI Airport — convenient to both DC and Philadelphia' },
  },
  'Wilmington / Dover, DE': {
    state: 'DE', stateName: 'Delaware', stateTax: '6.6%', climate: 'Four seasons',
    housing: { medianHome: '$310,000', trend: 'Stable', inventory: 'Moderate', rent2br: '$1,550/mo', rentalMarket: 'Moderate' },
    bullets: {
      default: ['No sales tax — significant everyday cost advantage', '2 hours from New York City, 30 minutes from Philadelphia by Amtrak', 'Delaware is the corporate registration capital of the US — strong business environment'],
      business: ['No sales tax and Delaware corporate-friendly legal system', 'Proximity to Philadelphia and New York business markets', 'Lower operating costs than Pennsylvania or New Jersey'],
      lifestyle: ['No sales tax', 'Easy Amtrak access to Philadelphia and New York', 'Affordable suburban and coastal living with beach access'],
    },
    expat: 'Small',
    flights: { Canada: 'Via Philadelphia (PHL) — 30 min drive; Baltimore (BWI) — 1 hour', 'United Kingdom': 'Via Philadelphia (PHL) — many direct UK flights', Australia: 'Via Philadelphia or New York', default: 'Philadelphia PHL (30 min) and Baltimore BWI (1 hour) are the closest major airports' },
  },
  'Hartford / Stamford, CT': {
    state: 'CT', stateName: 'Connecticut', stateTax: '6.99%', climate: 'Four seasons',
    housing: { medianHome: '$370,000', trend: 'Stable', inventory: 'Low', rent2br: '$1,900/mo', rentalMarket: 'Moderate' },
    bullets: {
      default: ['Easy access to both New York City (1 hour) and Boston (2 hours)', 'Major insurance and financial services hub', 'Affluent and well-resourced communities — excellent schools'],
      business: ['Major insurance and financial services sector', 'Access to NYC and Boston professional markets', 'Highly educated workforce'],
      lifestyle: ['Access to New York City and Boston culture', 'Real four seasons', 'Affluent communities in Fairfield County — very safe, excellent schools'],
    },
    expat: 'Moderate',
    flights: { Canada: 'Via Boston Logan (2 hours) or New York JFK/EWR', 'United Kingdom': 'Via New York or Boston connections', Australia: 'Via New York', default: 'Bradley International Airport or New York / Boston airports' },
  },
  'Jersey City / Newark, NJ': {
    state: 'NJ', stateName: 'New Jersey', stateTax: '6.37%', climate: 'Four seasons',
    housing: { medianHome: '$480,000', trend: 'Stable', inventory: 'Low', rent2br: '$2,400/mo', rentalMarket: 'Competitive' },
    bullets: {
      default: ['Direct transit access to Manhattan — without full New York City prices', 'Newark Liberty is a major international hub serving the Northeast', 'Extremely diverse international community'],
      business: ['Access to New York City business market via PATH train', 'Newark is a major international logistics and airport hub', 'Large and diverse international business community'],
      lifestyle: ['Access to New York City culture at lower cost', 'Extremely diverse — among the most international communities in the US', 'Real four seasons'],
    },
    expat: 'Large ✅',
    flights: { Canada: 'Many direct flights via Newark (EWR)', 'United Kingdom': 'Many direct flights from all major UK airports via EWR', Australia: 'Direct from Sydney and Melbourne via EWR', default: 'Newark Liberty is a top-tier international hub' },
  },
  'Manchester / Concord, NH': {
    state: 'NH', stateName: 'New Hampshire', stateTax: 'None ✅', climate: 'Four seasons — cold winters',
    housing: { medianHome: '$400,000', trend: 'Rising', inventory: 'Low', rent2br: '$1,750/mo', rentalMarket: 'Competitive' },
    bullets: {
      default: ['No state income tax — unique advantage in the Northeast US', 'Easy access to Boston (1 hour) without Massachusetts taxes', 'Beautiful four seasons — White Mountains, fall foliage, skiing'],
      business: ['No state income tax', 'Access to Boston labor market and innovation ecosystem', 'Lower costs than Massachusetts'],
      lifestyle: ['No state income tax', 'White Mountains — hiking, skiing, and stunning fall foliage', 'Easy access to Boston and the New England coast'],
    },
    expat: 'Small',
    flights: { Canada: 'Connections via Boston Logan (1 hour drive)', 'United Kingdom': 'Via Boston Logan connections', Australia: 'Via Boston', default: 'Manchester-Boston Regional Airport or Boston Logan (1 hour drive)' },
  },
  'Providence, RI': {
    state: 'RI', stateName: 'Rhode Island', stateTax: '5.99%', climate: 'Four seasons',
    housing: { medianHome: '$340,000', trend: 'Rising', inventory: 'Low', rent2br: '$1,700/mo', rentalMarket: 'Competitive' },
    bullets: {
      default: ['Vibrant arts and university city — Brown University, RISD', 'More affordable than Boston with easy Amtrak access', 'Highly rated food scene — one of the best restaurant cities per capita'],
      business: ['Access to Boston business market (45 min by Amtrak)', 'Strong university economy', 'More affordable than Boston or New York'],
      lifestyle: ['Excellent food scene and arts culture', 'Easy Amtrak access to Boston and New York', 'Real four seasons'],
    },
    expat: 'Small',
    flights: { Canada: 'Via Boston Logan (45 min) or direct from Toronto (seasonal)', 'United Kingdom': 'Via Boston connections', Australia: 'Via Boston or New York', default: 'TF Green Airport or Boston Logan (45 min)' },
  },
  'Portland, ME': {
    state: 'ME', stateName: 'Maine', stateTax: '7.15%', climate: 'Four seasons — cold winters',
    housing: { medianHome: '$390,000', trend: 'Rising', inventory: 'Low', rent2br: '$1,750/mo', rentalMarket: 'Competitive' },
    bullets: {
      default: ['Top-rated small city for quality of life — safe, clean, walkable', 'Stunning coastline — lobster, sailing, lighthouses and ocean lifestyle', 'Consistently rated one of the best food cities per capita in the US'],
      business: ['Tourism and hospitality economy', 'Growing remote worker and technology community', 'Proximity to Boston market (2 hours)'],
      lifestyle: ['World-class seafood and coastal lifestyle', 'Beautiful four seasons', 'Very safe, welcoming and close-knit community'],
    },
    expat: 'Small',
    flights: { Canada: 'Close to Canadian border — Quebec City 3 hours by car', 'United Kingdom': 'Via Boston Logan connections (2 hours)', Australia: 'Via Boston or New York', default: 'Portland International Jetport — connections via Boston' },
  },
  'Indianapolis, IN': {
    state: 'IN', stateName: 'Indiana', stateTax: '3.15%', climate: 'Four seasons',
    housing: { medianHome: '$265,000', trend: 'Stable', inventory: 'Moderate', rent2br: '$1,200/mo', rentalMarket: 'Moderate' },
    bullets: {
      default: ['Very affordable major metro — among the lowest cost of living in the US', 'Low flat state income tax', "Central US location — within a day's drive of most major cities"],
      business: ['Very low operating costs', 'Strong manufacturing, logistics and life sciences hub', 'Low flat state income tax'],
      lifestyle: ['Very affordable cost of living', 'Real four seasons', 'Central Midwest location — easy access across the country'],
    },
    expat: 'Small',
    flights: { Canada: 'Connections via Chicago or Detroit', 'United Kingdom': 'Connections via Chicago or New York', Australia: 'Via connection', default: 'Indianapolis International Airport' },
  },
  'Madison / Milwaukee, WI': {
    state: 'WI', stateName: 'Wisconsin', stateTax: '7.65%', climate: 'Four seasons — cold winters',
    housing: { medianHome: '$275,000', trend: 'Stable', inventory: 'Moderate', rent2br: '$1,250/mo', rentalMarket: 'Moderate' },
    bullets: {
      default: ['Very affordable cost of living', 'University of Wisconsin — world-class university town', 'Real four seasons — cold winters familiar to Canadians and Scandinavians'],
      business: ['Low operating costs', 'Strong manufacturing and university-driven economy', 'Access to Chicago market (1.5 hours)'],
      lifestyle: ['Very affordable', 'Lake lifestyle — water access and outdoor culture in summer', 'Cold winters familiar to Canadians and Northern Europeans'],
    },
    expat: 'Small',
    flights: { Canada: "Connections via Chicago O'Hare (1.5 hours)", 'United Kingdom': 'Connections via Chicago', Australia: 'Via connection', default: 'Milwaukee Mitchell and Madison airports — connections via Chicago' },
  },
  'Detroit / Ann Arbor, MI': {
    state: 'MI', stateName: 'Michigan', stateTax: '4.25%', climate: 'Four seasons — cold winters',
    housing: { medianHome: '$235,000', trend: 'Stable', inventory: 'Moderate', rent2br: '$1,250/mo', rentalMarket: 'Moderate' },
    bullets: {
      default: ['Major automotive and manufacturing hub undergoing significant revival', 'Very affordable cost of living — especially for a major metro', 'Real four seasons — very familiar climate for Canadians'],
      business: ['Automotive, advanced manufacturing and mobility technology center', 'Very affordable operating costs', 'University of Michigan drives research and technology sector'],
      lifestyle: ['Very affordable', 'Great Lakes lifestyle — water access in summer', 'Very close to Windsor, Ontario — familiar for Canadians'],
    },
    expat: 'Moderate',
    flights: { Canada: 'Direct from Toronto — 45 min; very close to Windsor, Ontario', 'United Kingdom': 'Direct from London Heathrow', Australia: 'Via connection', default: 'Detroit Metropolitan Wayne County Airport' },
  },
  'Kansas City, MO': {
    state: 'MO', stateName: 'Missouri', stateTax: '5.4%', climate: 'Four seasons',
    housing: { medianHome: '$255,000', trend: 'Stable', inventory: 'Moderate', rent2br: '$1,200/mo', rentalMarket: 'Moderate' },
    bullets: {
      default: ['Very affordable major metro — strong value for cost of living', 'Central US location — major logistics and agriculture hub', 'Strong local food, arts and music culture'],
      business: ['Major agricultural and logistics hub', 'Very low operating costs', 'Central US location reduces logistics costs'],
      lifestyle: ['Very affordable cost of living', 'Real four seasons', 'World-famous barbecue and growing arts scene'],
    },
    expat: 'Small',
    flights: { Canada: 'Connections via Chicago or Dallas', 'United Kingdom': 'Connections via Chicago or New York', Australia: 'Via connection', default: 'Kansas City International Airport' },
  },
  'Louisville, KY': {
    state: 'KY', stateName: 'Kentucky', stateTax: '5%', climate: 'Four seasons',
    housing: { medianHome: '$230,000', trend: 'Stable', inventory: 'Moderate', rent2br: '$1,100/mo', rentalMarket: 'Moderate' },
    bullets: {
      default: ['Very affordable — among lowest cost of living for mid-size US metros', 'Major UPS air hub — strong logistics and manufacturing sector', 'Real four seasons — Kentucky Derby, bourbon trail and unique culture'],
      business: ['Major UPS global air hub — strong logistics advantage', 'Very low operating costs', 'Growing healthcare and spirits industry'],
      lifestyle: ['Very affordable cost of living', 'Kentucky Derby and bourbon trail — unique American experience', 'Real four seasons'],
    },
    expat: 'Small',
    flights: { Canada: 'Connections via Chicago or Charlotte', 'United Kingdom': 'Connections via New York or Atlanta', Australia: 'Via connection', default: 'Louisville Muhammad Ali International Airport' },
  },
  'Birmingham, AL': {
    state: 'AL', stateName: 'Alabama', stateTax: '5%', climate: 'Warm — mild winters',
    housing: { medianHome: '$225,000', trend: 'Stable', inventory: 'Moderate', rent2br: '$1,100/mo', rentalMarket: 'Moderate' },
    bullets: {
      default: ['Most affordable major metro in the Southeast', 'Warm climate with short, mild winters', 'Growing healthcare and manufacturing economy'],
      business: ['Very low operating costs', 'Growing healthcare and automotive manufacturing sector', 'Affordable real estate and talent'],
      lifestyle: ['Very affordable cost of living', 'Warm climate — short, mild winters', 'Growing food and arts scene'],
    },
    expat: 'Small',
    flights: { Canada: 'Connections via Atlanta or Charlotte', 'United Kingdom': 'Connections via Atlanta', Australia: 'Via connection', default: 'Birmingham-Shuttlesworth Airport — connections via Atlanta' },
  },
  'Biloxi / Gulfport, MS': {
    state: 'MS', stateName: 'Mississippi', stateTax: '4.7%', climate: 'Warm & humid',
    housing: { medianHome: '$165,000', trend: 'Stable', inventory: 'High', rent2br: '$900/mo', rentalMarket: 'Renter-friendly' },
    bullets: {
      default: ['Most affordable cost of living in the US', 'Gulf Coast lifestyle — beaches, seafood and warm climate', 'Warm subtropical climate year-round'],
      business: ['Lowest operating costs in the US', 'Strong gaming, tourism and hospitality economy', 'Gulf Coast strategic location'],
      lifestyle: ['Most affordable state in the US', 'Gulf Coast beaches and seafood culture', 'Warm subtropical climate'],
    },
    expat: 'Small',
    flights: { Canada: 'Connections via Atlanta or Dallas', 'United Kingdom': 'Connections via Atlanta', Australia: 'Via connection', default: 'Gulfport-Biloxi International Airport — connections via Atlanta' },
  },
  'Des Moines, IA': {
    state: 'IA', stateName: 'Iowa', stateTax: '6%', climate: 'Four seasons',
    housing: { medianHome: '$235,000', trend: 'Stable', inventory: 'Moderate', rent2br: '$1,050/mo', rentalMarket: 'Moderate' },
    bullets: {
      default: ['Very affordable cost of living', 'Major insurance and financial services hub', 'Safe and growing mid-size city'],
      business: ['Major insurance industry hub — Principal Financial, Nationwide', 'Very low operating costs', 'Strong agriculture and financial services economy'],
      lifestyle: ['Very affordable', 'Real four seasons', 'Safe, clean and growing community'],
    },
    expat: 'Small',
    flights: { Canada: 'Connections via Chicago or Minneapolis', 'United Kingdom': 'Connections via Chicago', Australia: 'Via connection', default: 'Des Moines International Airport — connections via Chicago' },
  },
  'Wichita / Overland Park, KS': {
    state: 'KS', stateName: 'Kansas', stateTax: '5.7%', climate: 'Four seasons',
    housing: { medianHome: '$235,000', trend: 'Stable', inventory: 'Moderate', rent2br: '$1,050/mo', rentalMarket: 'Moderate' },
    bullets: {
      default: ['Very affordable cost of living', 'Major aviation manufacturing hub — Spirit AeroSystems, Cessna', 'Central US location'],
      business: ['Aviation and aerospace manufacturing center', 'Very low operating costs', 'Central US logistics advantage'],
      lifestyle: ['Very affordable', 'Real four seasons', 'Wide open space and quiet suburban lifestyle'],
    },
    expat: 'Small',
    flights: { Canada: 'Connections via Dallas or Chicago', 'United Kingdom': 'Connections via Dallas', Australia: 'Via connection', default: 'Wichita Eisenhower National Airport — connections via Dallas' },
  },
  'Oklahoma City, OK': {
    state: 'OK', stateName: 'Oklahoma', stateTax: '4.75%', climate: 'Warm — hot summers',
    housing: { medianHome: '$215,000', trend: 'Stable', inventory: 'High', rent2br: '$1,050/mo', rentalMarket: 'Renter-friendly' },
    bullets: {
      default: ['One of the most affordable major metros in the US', 'Growing economy — energy, aerospace and agriculture', 'Very low cost of living'],
      business: ['Very low operating costs', 'Strong energy and aerospace sector', 'Low state income tax'],
      lifestyle: ['Lowest cost of living on this list', 'Warm climate with hot summers', 'Growing arts and culture scene'],
    },
    expat: 'Small',
    flights: { Canada: 'Connections via Dallas', 'United Kingdom': 'Connections via Dallas or Chicago', Australia: 'Via connection', default: 'Will Rogers World Airport — connections via Dallas' },
  },
  'Omaha, NE': {
    state: 'NE', stateName: 'Nebraska', stateTax: '6.84%', climate: 'Four seasons',
    housing: { medianHome: '$255,000', trend: 'Stable', inventory: 'Moderate', rent2br: '$1,150/mo', rentalMarket: 'Moderate' },
    bullets: {
      default: ['Very affordable major metro', "Warren Buffett's hometown — strong financial and insurance sector", 'Safe, clean and family-friendly community'],
      business: ['Major financial services and insurance hub', 'Very low operating costs', 'Strong agriculture and logistics economy'],
      lifestyle: ['Very affordable cost of living', 'Real four seasons', 'Safe, clean and family-friendly'],
    },
    expat: 'Small',
    flights: { Canada: 'Connections via Chicago or Minneapolis', 'United Kingdom': 'Connections via Chicago', Australia: 'Via connection', default: 'Eppley Airfield — connections via Chicago or Dallas' },
  },
  'Sioux Falls, SD': {
    state: 'SD', stateName: 'South Dakota', stateTax: 'None ✅', climate: 'Four seasons — cold winters',
    housing: { medianHome: '$285,000', trend: 'Stable', inventory: 'Moderate', rent2br: '$1,100/mo', rentalMarket: 'Moderate' },
    bullets: {
      default: ['No state income tax', 'Very affordable cost of living', 'One of the fastest growing small metros in the US'],
      business: ['No state income tax', 'Very business-friendly regulatory environment', 'Very low operating costs'],
      lifestyle: ['No state income tax', 'Very affordable', 'Four seasons — familiar to people from cold climates'],
    },
    expat: 'Small',
    flights: { Canada: 'Connections via Minneapolis or Denver', 'United Kingdom': 'Connections via Chicago or Minneapolis', Australia: 'Via connection', default: 'Sioux Falls Regional Airport — connections via Minneapolis' },
  },
  'Fargo, ND': {
    state: 'ND', stateName: 'North Dakota', stateTax: '2.5%', climate: 'Four seasons — very cold winters',
    housing: { medianHome: '$240,000', trend: 'Stable', inventory: 'Moderate', rent2br: '$1,000/mo', rentalMarket: 'Moderate' },
    bullets: {
      default: ['Very affordable cost of living', 'One of the lowest state income tax rates in the US', 'Growing university and technology economy'],
      business: ['Very low operating costs', 'One of the lowest state income tax rates in the US', 'NDSU-driven technology and agriculture sector'],
      lifestyle: ['Very affordable', 'Very cold winters — familiar to Canadians and Scandinavians', 'Safe, clean and close-knit community'],
    },
    expat: 'Small',
    flights: { Canada: 'Close to Canadian border — Winnipeg 3 hours by car', 'United Kingdom': 'Connections via Minneapolis', Australia: 'Via connection', default: 'Hector International Airport — connections via Minneapolis' },
  },
  'Anchorage, AK': {
    state: 'AK', stateName: 'Alaska', stateTax: 'None ✅', climate: 'Cold — subarctic',
    housing: { medianHome: '$370,000', trend: 'Stable', inventory: 'Moderate', rent2br: '$1,500/mo', rentalMarket: 'Moderate' },
    bullets: {
      default: ['No state income tax — plus annual Permanent Fund dividend for residents', 'Extraordinary natural beauty — aurora borealis, glaciers, wildlife', 'Unique lifestyle — deeply rewarding for those who love nature and adventure'],
      business: ['No state income tax', 'Strong oil, gas, fishing and tourism industries', 'Strategic Pacific Rim location for cargo and logistics'],
      lifestyle: ['World-class outdoor adventure — aurora borealis, glaciers, wildlife', 'No state income tax', 'A truly unique American experience'],
    },
    expat: 'Small',
    flights: { Canada: 'Direct from Vancouver and Whitehorse', 'United Kingdom': 'Connections via Seattle', Australia: 'Connections via Seattle or Tokyo', default: 'Ted Stevens Anchorage International Airport — major Pacific cargo hub' },
  },
  'Honolulu, HI': {
    state: 'HI', stateName: 'Hawaii', stateTax: '11%', climate: 'Warm & tropical',
    housing: { medianHome: '$850,000', trend: 'Stable', inventory: 'Low', rent2br: '$2,600/mo', rentalMarket: 'Competitive' },
    bullets: {
      default: ['Tropical paradise — beaches, warm weather and outdoor lifestyle year-round', 'Strong Asia-Pacific connections — ideal for Asian and Australian expats', 'High cost of living offset by extraordinary lifestyle'],
      business: ['Strong tourism and hospitality economy', 'Strategic Asia-Pacific location', 'Tourism-driven E-2 opportunity'],
      lifestyle: ['Year-round warm tropical weather — truly paradise living', 'World-class beaches and outdoor lifestyle', 'Unique Pacific island culture with strong international community'],
    },
    expat: 'Large ✅',
    flights: { Canada: 'Direct from Vancouver', 'United Kingdom': 'Connections via Los Angeles', Australia: 'Direct from Sydney and Melbourne', default: 'Daniel K. Inouye International Airport — major Pacific hub' },
  },
  'Jackson Hole / Cheyenne, WY': {
    state: 'WY', stateName: 'Wyoming', stateTax: 'None ✅', climate: 'Four seasons — cold winters',
    housing: { medianHome: '$295,000', trend: 'Stable', inventory: 'Moderate', rent2br: '$1,100/mo', rentalMarket: 'Moderate' },
    bullets: {
      default: ['No state income tax — one of the most tax-friendly states in the US', 'Gateway to Grand Teton and Yellowstone National Parks', 'Wide open Western lifestyle with extraordinary natural beauty'],
      business: ['No state income tax', 'Very low operating costs', 'Strong energy, tourism and ranching economy'],
      lifestyle: ['No state income tax', 'Gateway to Grand Teton and Yellowstone (Jackson Hole area)', 'Wide open spaces and authentic Western lifestyle'],
    },
    expat: 'Small',
    flights: { Canada: 'Connections via Denver or Salt Lake City', 'United Kingdom': 'Connections via Denver', Australia: 'Via connection', default: 'Jackson Hole Airport or Cheyenne Regional Airport — connections via Denver' },
  },
  'Charleston, WV': {
    state: 'WV', stateName: 'West Virginia', stateTax: '6.5%', climate: 'Four seasons',
    housing: { medianHome: '$145,000', trend: 'Stable', inventory: 'High', rent2br: '$800/mo', rentalMarket: 'Renter-friendly' },
    bullets: {
      default: ['Most affordable housing in the US', 'Extraordinary natural beauty — Appalachian Mountains and whitewater rivers', 'Small but close-knit and welcoming community'],
      business: ['Lowest real estate costs in the US', 'Growing outdoor recreation and tourism economy', 'Very low operating costs'],
      lifestyle: ['Extraordinary affordability', 'Outdoor recreation — whitewater rafting, hiking in Appalachian Mountains', 'Authentic small city experience'],
    },
    expat: 'Small',
    flights: { Canada: 'Connections via Charlotte or Pittsburgh', 'United Kingdom': 'Connections via Charlotte', Australia: 'Via connection', default: 'Yeager Airport — connections via Charlotte or Pittsburgh' },
  },
  'Bentonville / Fayetteville, AR': {
    state: 'AR', stateName: 'Arkansas', stateTax: '4.9%', climate: 'Warm — mild winters',
    housing: { medianHome: '$290,000', trend: 'Rising', inventory: 'Low', rent2br: '$1,000/mo', rentalMarket: 'Moderate' },
    bullets: {
      default: ['Walmart headquarters drives a fast growing, high-quality business ecosystem', 'Very affordable cost of living with a surprisingly strong arts and mountain biking scene', 'Warm climate with mild, short winters'],
      business: ['Walmart HQ and major supplier network — strong retail and logistics opportunity', 'Very affordable operating costs', 'Fast growing entrepreneurial ecosystem'],
      lifestyle: ['World-class mountain biking trails and Crystal Bridges Museum of American Art', 'Very affordable', 'Warm climate with mild winters'],
    },
    expat: 'Small',
    flights: { Canada: 'Connections via Dallas or Atlanta', 'United Kingdom': 'Connections via Dallas', Australia: 'Via connection', default: 'Northwest Arkansas National Airport — connections via Dallas' },
  },
  'Albuquerque / Santa Fe, NM': {
    state: 'NM', stateName: 'New Mexico', stateTax: '5.9%', climate: 'Warm & dry',
    housing: { medianHome: '$290,000', trend: 'Stable', inventory: 'Moderate', rent2br: '$1,300/mo', rentalMarket: 'Moderate' },
    bullets: {
      default: ['Very affordable cost of living — 300 days of sun per year', 'Unique culture — rich blend of Native American, Spanish and American heritage', 'Warm and dry climate with mild winters at altitude'],
      business: ['Very affordable operating costs', 'Growing film industry and technology sector', 'Strong arts, tourism and hospitality economy'],
      lifestyle: ['300 days of sun — warm and dry with mild winters', 'Unique cultural experience unlike anywhere else in the US', 'Very affordable cost of living'],
    },
    expat: 'Small',
    flights: { Canada: 'Connections via Denver or Dallas', 'United Kingdom': 'Connections via Dallas or Denver', Australia: 'Via connection', default: 'Albuquerque International Sunport' },
  },
  'Boise, ID': {
    state: 'ID', stateName: 'Idaho', stateTax: '5.8%', climate: 'Mild — four seasons',
    housing: { medianHome: '$420,000', trend: 'Cooling', inventory: 'Moderate', rent2br: '$1,500/mo', rentalMarket: 'Moderate' },
    bullets: {
      default: ['Fast growing outdoor lifestyle city — consistently rated top for quality of life', 'Affordable alternative to Seattle or Denver', 'Outdoor recreation — skiing, hiking and river access within an hour'],
      business: ['Fast growing technology sector', 'Lower costs than Pacific Northwest metros', 'Business-friendly state environment'],
      lifestyle: ['Outdoor lifestyle — skiing, hiking, whitewater rafting nearby', 'More affordable than Seattle or Denver', 'Clean, safe and fast growing community'],
    },
    expat: 'Small',
    flights: { Canada: 'Connections via Seattle or Salt Lake City', 'United Kingdom': 'Connections via Seattle or San Francisco', Australia: 'Via connection', default: 'Boise Airport' },
  },
  'Raleigh / Durham, NC': {
    state: 'NC', stateName: 'North Carolina', stateTax: '4.75%', climate: 'Mild — four seasons',
    housing: { medianHome: '$400,000', trend: 'Rising', inventory: 'Low', rent2br: '$1,650/mo', rentalMarket: 'Competitive' },
    bullets: {
      default: ['Research Triangle — major technology and biotech hub', 'Fast growing metro with strong quality of life', 'Duke, UNC and NC State drive world-class talent'],
      business: ['Leading biotech, technology and life sciences hub', 'Highly educated workforce at competitive cost', 'Strong international professional community'],
      lifestyle: ['Mild four seasons', 'Fast growing diverse international community', 'Strong food, arts and university culture'],
    },
    expat: 'Moderate',
    flights: { Canada: 'Connections via Charlotte or New York', 'United Kingdom': 'Direct from London Heathrow (seasonal)', Australia: 'Via connection', default: 'Raleigh-Durham International Airport' },
  },
}

// ── Matching ───────────────────────────────────────────────────────────────────

function matchDestinations(d5answers) {
  const climate  = d5answers.climate  ?? ''
  const env      = d5answers.env      ?? ''
  const business = d5answers.business ?? ''

  const warm    = climate.startsWith('☀️')
  const mild    = climate.startsWith('🌤️')
  const seasons = climate.startsWith('🍂')
  const anyClim = climate.startsWith('🤷') || !climate

  const major    = env.startsWith('🏙️')
  const midsize  = env.startsWith('🌆')
  const suburban = env.startsWith('🏡')
  const rural    = env.startsWith('🌿')

  const restaurant = business.startsWith('🍽️')
  const trades     = business.startsWith('🔧')
  const prof       = business.startsWith('💼')
  const tourism    = business.startsWith('🏨')

  if (rural)                            return ['Asheville, NC', 'Bozeman, MT', 'Burlington, VT']
  if (warm && major)                    return ['Miami / Fort Lauderdale', 'Los Angeles, CA', 'Houston, TX']
  if (warm && suburban)                 return ['Tampa / Southwest Florida', 'Phoenix / Scottsdale, AZ', 'Dallas / Fort Worth, TX']
  if (warm && midsize)                  return ['Orlando', 'Austin, TX', 'Tampa / Southwest Florida']
  if (mild && major)                    return ['Seattle, WA', 'Denver, CO', 'Chicago, IL']
  if (mild && suburban)                 return ['Denver, CO', 'Nashville, TN', 'Charlotte, NC']
  if (mild && midsize)                  return ['Denver, CO', 'Nashville, TN', 'Charlotte, NC']
  if (seasons && major)                 return ['Chicago, IL', 'Boston, MA', 'New York, NY']
  if (seasons && (suburban || midsize)) return ['Minneapolis, MN', 'Columbus, OH', 'Pittsburgh, PA']
  if (anyClim && (restaurant || tourism)) return ['Orlando', 'Las Vegas, NV', 'Miami / Fort Lauderdale']
  if (anyClim && prof)                  return ['New York, NY', 'Chicago, IL', 'Dallas / Fort Worth, TX']
  if (anyClim && trades)                return ['Tampa / Southwest Florida', 'Dallas / Fort Worth, TX', 'Phoenix / Scottsdale, AZ']
  return ['Denver, CO', 'Nashville, TN', 'Charlotte, NC']
}

function getBestCityForState(stateName) {
  const keys = Object.keys(DEST_DATA)
  return keys.find(k => DEST_DATA[k].stateName === stateName) ?? null
}

const BADGE      = ['Strong match',   'Good match',  'Worth considering']
const BADGE_BG   = ['#D1FAE5',        '#EBF4FB',     '#F1F5F9']
const BADGE_CLR  = ['#1A7A4A',        '#1B5FA8',     '#4A5568']

const TREND_CLR = { Rising: '#DC2626', Stable: '#1A7A4A', Cooling: '#1B5FA8' }
const TREND_BG  = { Rising: '#FEE2E2', Stable: '#D1FAE5', Cooling: '#EBF4FB' }

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

// ── Sub-components ─────────────────────────────────────────────────────────────

function ProgressBar({ step, total, label }) {
  return (
    <div className="px-5 pt-4 pb-1">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold" style={{ color: '#4A5568' }}>
          {label ?? `Destination ${step} of ${total}`}
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

function StatPill({ label, highlight, color, bg }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ backgroundColor: bg ?? (highlight ? '#D1FAE5' : '#F1F5F9'), color: color ?? (highlight ? '#1A7A4A' : '#4A5568') }}>
      {label}
    </span>
  )
}

function HousingSection({ housing, rentBuy }) {
  const showBuy  = rentBuy === 'buy'  || rentBuy === 'unsure'
  const showRent = rentBuy === 'rent' || rentBuy === 'unsure'
  return (
    <div className="mx-4 mb-3 flex flex-col gap-1.5">
      {showBuy && (
        <div className="rounded-xl px-3 py-2.5" style={{ backgroundColor: '#F7F9FC', border: '1px solid #E2E8F0' }}>
          <p className="text-xs font-extrabold uppercase tracking-wider mb-1.5" style={{ color: '#4A5568' }}>
            🏠 Buying
          </p>
          <div className="flex flex-wrap gap-1.5">
            <StatPill label={`Median home: ${housing.medianHome}`} />
            <StatPill
              label={`Trend: ${housing.trend}`}
              bg={TREND_BG[housing.trend] ?? '#F1F5F9'}
              color={TREND_CLR[housing.trend] ?? '#4A5568'}
            />
            <StatPill label={`Inventory: ${housing.inventory}`} highlight={housing.inventory === 'High'} />
          </div>
        </div>
      )}
      {showRent && (
        <div className="rounded-xl px-3 py-2.5" style={{ backgroundColor: '#F7F9FC', border: '1px solid #E2E8F0' }}>
          <p className="text-xs font-extrabold uppercase tracking-wider mb-1.5" style={{ color: '#4A5568' }}>
            🔑 Renting
          </p>
          <div className="flex flex-wrap gap-1.5">
            <StatPill label={`2BR rent: ${housing.rent2br}`} />
            <StatPill
              label={`Market: ${housing.rentalMarket}`}
              highlight={housing.rentalMarket === 'Renter-friendly'}
              color={housing.rentalMarket === 'Competitive' ? '#DC2626' : undefined}
              bg={housing.rentalMarket === 'Competitive' ? '#FEE2E2' : undefined}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function DestinationCard({ name, rank, d2answers, rentBuy, onSet, isKnownChoice }) {
  const [expanded, setExpanded] = useState(false)
  const data = DEST_DATA[name] ?? Object.values(DEST_DATA)[0]
  const country = d2answers?.country ?? ''
  const isBusiness = d2answers?.motivation === 'Buying or starting a business'
  const isLifestyle = d2answers?.motivation === 'Lifestyle — I want a fresh start' || d2answers?.motivation === 'Family reasons'
  const bulletSet = isBusiness ? data.bullets.business : isLifestyle ? data.bullets.lifestyle : data.bullets.default
  const flightText = data.flights[country] ?? data.flights.default
  const expatCountry = country === 'Other country' ? 'International' : (country || 'International')
  const isTop = rank === 0

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ backgroundColor: '#FFFFFF', border: isTop ? '2px solid #1B5FA8' : '1px solid #E2E8F0' }}>

      <div className="px-4 pt-4 pb-3">
        {isKnownChoice ? (
          <span className="inline-block text-xs font-extrabold px-2.5 py-1 rounded-full mb-2"
            style={{ backgroundColor: '#D1FAE5', color: '#1A7A4A', border: '1px solid #1A7A4A' }}>
            Your chosen destination ✓
          </span>
        ) : (
          <span className="inline-block text-xs font-extrabold px-2.5 py-1 rounded-full mb-2"
            style={{ backgroundColor: BADGE_BG[rank], color: BADGE_CLR[rank] }}>
            {BADGE[rank]}
          </span>
        )}
        <p className="text-xl font-extrabold leading-tight" style={{ color: '#0D2B4E' }}>{name}</p>
        <p className="text-sm mt-0.5 font-semibold" style={{ color: '#4A9FD4' }}>{data.stateName}</p>
      </div>

      {/* Stat pills row */}
      <div className="flex flex-wrap gap-1.5 px-4 pb-3">
        <StatPill label={`Tax: ${data.stateTax}`} highlight={data.stateTax === 'None ✅'} />
        <StatPill label={`Climate: ${data.climate}`} />
      </div>

      {/* Housing section */}
      <HousingSection housing={data.housing} rentBuy={rentBuy} />

      {/* Bullets */}
      <div className="flex flex-col gap-1.5 px-4 pb-3">
        {bulletSet.map((b, i) => (
          <p key={i} className="text-xs leading-snug flex gap-1.5" style={{ color: '#4A5568' }}>
            <span style={{ color: '#4A9FD4', flexShrink: 0 }}>•</span>{b}
          </p>
        ))}
      </div>

      {/* Expat + flights */}
      <div className="mx-4 mb-3 rounded-xl px-3 py-2.5" style={{ backgroundColor: '#F7F9FC', border: '1px solid #E2E8F0' }}>
        <p className="text-xs" style={{ color: '#4A5568' }}>
          <span className="font-semibold">{expatCountry} expat community:</span> {data.expat}
        </p>
        <p className="text-xs mt-1" style={{ color: '#4A5568' }}>
          <span className="font-semibold">Direct flights:</span> {flightText}
        </p>
      </div>

      {/* Expand */}
      <button onClick={() => setExpanded(!expanded)}
        className="mx-4 mb-3 text-xs font-semibold flex items-center gap-1 transition-opacity active:opacity-60"
        style={{ color: '#1B5FA8' }}>
        <span>Learn more about {name.split('/')[0].trim()} →</span>
        <span style={{ transform: expanded ? 'rotate(90deg)' : 'none', display: 'inline-block', transition: 'transform 0.2s' }}>›</span>
      </button>

      {expanded && (
        <div className="mx-4 mb-3 rounded-xl px-3 py-3 flex flex-col gap-1.5" style={{ backgroundColor: '#EBF4FB' }}>
          <p className="text-xs" style={{ color: '#0D2B4E' }}><span className="font-semibold">State:</span> {data.stateName} · <span className="font-semibold">Tax:</span> {data.stateTax}</p>
          <p className="text-xs" style={{ color: '#0D2B4E' }}><span className="font-semibold">Climate:</span> {data.climate}</p>
          <p className="text-xs" style={{ color: '#0D2B4E' }}><span className="font-semibold">Median home:</span> {data.housing.medianHome} · <span className="font-semibold">Trend:</span> {data.housing.trend}</p>
          <p className="text-xs" style={{ color: '#0D2B4E' }}><span className="font-semibold">2BR rent:</span> {data.housing.rent2br} · <span className="font-semibold">Market:</span> {data.housing.rentalMarket}</p>
          <p className="text-xs" style={{ color: '#0D2B4E' }}><span className="font-semibold">Flights:</span> {flightText}</p>
        </div>
      )}

      <div className="px-4 pb-4">
        <button onClick={() => onSet(name)}
          className="w-full py-3 rounded-xl text-sm font-extrabold transition-all active:scale-95"
          style={{ backgroundColor: '#0D2B4E', color: '#F0A500' }}>
          Set as my destination ✓
        </button>
      </div>
    </div>
  )
}

// ── Results screen ─────────────────────────────────────────────────────────────

function ResultsScreen({ d5answers, d2answers, matches, onBack, onContinue, isKnownDest }) {
  const navigate = useNavigate()
  const [confirmed, setConfirmed] = useState(null)
  const rentBuy = d5answers.rentbuy?.startsWith('🏠') ? 'buy' : d5answers.rentbuy?.startsWith('🔑') ? 'rent' : 'unsure'
  const country = d2answers?.country ?? ''
  const coachPrompt = `I'm relocating to the US from ${country || 'my home country'} and still deciding where to go. Can you help me think through the best destination for my situation?`

  function handleSet(city) {
    setConfirmed(city)
    try {
      localStorage.setItem('migratrak_destination', city)
      const saved = JSON.parse(localStorage.getItem('migratrak_answers') || '{}')
      saved.destination = city
      localStorage.setItem('migratrak_answers', JSON.stringify(saved))
    } catch (_) {}
  }

  if (confirmed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5 py-12" style={{ backgroundColor: '#F7F9FC' }}>
        <div className="w-full rounded-2xl px-6 py-8 flex flex-col items-center gap-4 text-center mb-6"
          style={{ backgroundColor: '#D1FAE5', border: '2px solid #1A7A4A' }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1A7A4A' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-extrabold" style={{ color: '#1A7A4A' }}>✓ Destination set — {confirmed}</p>
            <p className="text-sm mt-1 leading-relaxed" style={{ color: '#1A7A4A' }}>
              Your professional directory and life setup checklist will be tailored to {confirmed.split('/')[0].trim()}.
            </p>
          </div>
        </div>
        <button onClick={onContinue}
          className="w-full py-4 rounded-2xl text-base font-extrabold transition-all active:scale-95"
          style={{ backgroundColor: '#F0A500', color: '#0D2B4E' }}>
          Continue to my timeline →
        </button>
      </div>
    )
  }

  const noMatches = !matches || matches.length === 0

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F9FC' }}>
      <div className="px-5 pt-5 pb-4" style={{ backgroundColor: '#0D2B4E' }}>
        <button onClick={onBack} className="flex items-center gap-1.5 mb-3 transition-opacity active:opacity-70">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>Back</span>
        </button>
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#4A9FD4' }}>Destination Discovery</p>
        <h1 className="text-2xl font-extrabold" style={{ color: '#FFFFFF' }}>
          {isKnownDest ? 'Your chosen destination' : 'Your top destination matches'}
        </h1>
        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>
          {isKnownDest ? 'Here is the key information for your selected destination' : 'Based on your preferences — here are your best fits'}
        </p>
      </div>

      <div className="flex flex-col gap-4 px-4 pt-4 pb-32">
        {noMatches ? (
          <>
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
          </>
        ) : (
          matches.map((city, i) => (
            <DestinationCard key={city} name={city} rank={i} d2answers={d2answers} rentBuy={rentBuy} onSet={handleSet} isKnownChoice={isKnownDest && i === 0} />
          ))
        )}

        <div className="rounded-2xl px-4 py-3" style={{ backgroundColor: '#F1F5F9', border: '1px solid #E2E8F0' }}>
          <p className="text-xs leading-relaxed" style={{ color: '#4A5568' }}>
            These recommendations are based on your stated preferences. Visit each city if possible before committing — destination choice is one of the most important decisions you'll make.
          </p>
        </div>
        <button onClick={() => navigate('/j4', { state: { seedPrompt: coachPrompt } })}
          className="w-full py-3.5 rounded-2xl text-sm font-bold transition-all active:scale-95"
          style={{ backgroundColor: 'transparent', color: '#0D2B4E', border: '2px solid #0D2B4E' }}>
          Ask our AI Coach about destinations →
        </button>
      </div>
    </div>
  )
}

// ── Single-state picker ────────────────────────────────────────────────────────

function KnownDestPicker({ onConfirm, onBack }) {
  const [selState, setSelState] = useState('')
  const [city, setCity] = useState('')
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F9FC' }}>
      <div className="flex items-center px-4 pt-4 pb-0 gap-2">
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
                className="w-full px-3 rounded-xl text-sm outline-none"
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
          className="w-full py-4 rounded-2xl text-base font-bold transition-all active:scale-95"
          style={{ backgroundColor: selState ? '#F0A500' : '#E2E8F0', color: selState ? '#0D2B4E' : '#A0AEC0' }}>
          Confirm my destination →
        </button>
      </div>
    </div>
  )
}

// ── Multi-state picker ─────────────────────────────────────────────────────────

function MultiStatePicker({ onConfirm, onBack }) {
  const [selected, setSelected] = useState([])

  function toggle(s) {
    setSelected(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : prev.length < 3 ? [...prev, s] : prev
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F9FC' }}>
      <div className="flex items-center px-4 pt-4 pb-0 gap-2">
        <button onClick={onBack}
          className="flex items-center justify-center w-10 h-10 rounded-full transition-opacity active:opacity-60"
          style={{ backgroundColor: '#EBF4FB' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0D2B4E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <p className="text-sm font-semibold flex-1" style={{ color: '#0D2B4E' }}>Select up to 3 states</p>
        <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: '#EBF4FB', color: '#1B5FA8' }}>
          {selected.length}/3
        </span>
      </div>
      <div className="flex-1 px-4 pt-3 pb-8 flex flex-col gap-3 overflow-y-auto">
        <div className="flex flex-wrap gap-2">
          {US_STATES.map(s => {
            const isActive = selected.includes(s)
            const isDisabled = !isActive && selected.length >= 3
            return (
              <button key={s} onClick={() => toggle(s)} disabled={isDisabled}
                className="px-3 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95"
                style={{
                  backgroundColor: isActive ? '#0D2B4E' : '#FFFFFF',
                  color: isActive ? '#F0A500' : isDisabled ? '#CBD5E0' : '#4A5568',
                  border: isActive ? '2px solid #0D2B4E' : '2px solid #E2E8F0',
                }}>
                {s}
              </button>
            )
          })}
        </div>
        <button onClick={() => selected.length > 0 && onConfirm(selected)}
          disabled={selected.length === 0}
          className="w-full py-4 rounded-2xl text-base font-bold transition-all active:scale-95 mt-2"
          style={{ backgroundColor: selected.length > 0 ? '#F0A500' : '#E2E8F0', color: selected.length > 0 ? '#0D2B4E' : '#A0AEC0' }}>
          {selected.length > 0 ? `Continue with ${selected.join(', ')} →` : 'Select at least one state'}
        </button>
      </div>
    </div>
  )
}

// ── Linear question screen ─────────────────────────────────────────────────────

function QuestionScreen({ question, step, total, onContinue, onBack, selected: initialSelected }) {
  const [selected, setSelected] = useState(initialSelected ?? null)
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F9FC' }}>
      <div className="flex items-center px-4 pt-4 pb-0 gap-2">
        <button onClick={onBack}
          className="flex items-center justify-center w-10 h-10 rounded-full transition-opacity active:opacity-60"
          style={{ backgroundColor: '#EBF4FB' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0D2B4E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <div className="flex-1">
          <ProgressBar step={step} total={total} />
        </div>
      </div>

      <div className="flex-1 px-4 pt-4 pb-8 flex flex-col gap-4">
        <div className="rounded-2xl px-5 py-6 shadow-sm" style={{ backgroundColor: '#FFFFFF' }}>
          {question.heading && (
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#4A9FD4' }}>{question.heading}</p>
          )}
          <h2 className="text-xl font-bold leading-snug mb-5" style={{ color: '#0D2B4E' }}>{question.text}</h2>
          {question.infoBox && (
            <div className="mb-4 rounded-xl px-3 py-2.5" style={{ backgroundColor: '#EBF4FB', border: '1px solid #4A9FD4' }}>
              <p className="text-xs leading-relaxed" style={{ color: '#0D2B4E' }}>{question.infoBox}</p>
            </div>
          )}
          <div className="flex flex-col gap-3">
            {question.options.map(opt => {
              const isActive = selected === opt
              return (
                <button key={opt} onClick={() => setSelected(opt)}
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
        <button onClick={() => selected && onContinue(selected)} disabled={!selected}
          className="w-full py-4 rounded-2xl text-base font-bold tracking-wide transition-all active:scale-95"
          style={{ backgroundColor: selected ? '#F0A500' : '#E2E8F0', color: selected ? '#0D2B4E' : '#A0AEC0' }}>
          {question.last ? 'See My Destination Matches →' : 'Continue →'}
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

  const isBusiness = d2answers.motivation === 'Buying or starting a business'

  // Phase state machine
  const [phase,      setPhase]      = useState('q1')       // q1 | known | multi | linear | results
  const [q1Answer,   setQ1Answer]   = useState(null)
  const [multiStates,setMultiStates]= useState([])
  const [answers,    setAnswers]    = useState({})          // linear question answers
  const [linStep,    setLinStep]    = useState(0)
  const [matches,    setMatches]    = useState(null)
  const [isKnownDest,setIsKnownDest]= useState(false)

  // Build the linear question sequence based on q1 answer
  function buildLinear(q1, rentbuyAnswer) {
    const openPath = q1?.startsWith('🤷')  // No — open
    const qs = []

    if (openPath) {
      qs.push({
        id: 'climate', text: 'What climate suits you best?',
        options: ['☀️  Warm and sunny year-round', '🌤️  Mild — not too hot, not too cold', '🍂  Four seasons — I want a proper winter', '🤷  Climate doesn\'t matter much to me'],
      })
      qs.push({
        id: 'env', text: 'What kind of environment are you looking for?',
        options: ['🏙️  Major city — urban energy and international culture', '🌆  Mid-size city — urban feel without the chaos', '🏡  Suburban — space, good schools, quieter lifestyle', '🌿  Small town or rural — open space and community'],
      })
    }

    qs.push({
      id: 'rentbuy', text: 'Are you planning to rent or buy?',
      options: ['🏠  Buy — I plan to purchase a home', '🔑  Rent — at least initially', '🤷  Not sure yet'],
    })

    // Budget question — options depend on rentbuy
    const isBuy  = (rentbuyAnswer ?? '').startsWith('🏠')
    const isRent = (rentbuyAnswer ?? '').startsWith('🔑')
    const isUnsure = !isBuy && !isRent

    if (isBuy) {
      qs.push({
        id: 'budget', text: 'What is your approximate purchase budget?',
        options: ['🏠  Under $300,000', '🏠🏠  $300,000 – $500,000', '🏠🏠🏠  $500,000 – $800,000', '🏠🏠🏠🏠  Over $800,000', '🤷  Not sure yet'],
      })
    } else if (isRent) {
      qs.push({
        id: 'budget', text: 'What is your approximate monthly rental budget?',
        options: ['🔑  Under $1,500/month', '🔑🔑  $1,500 – $2,500/month', '🔑🔑🔑  $2,500 – $4,000/month', '🔑🔑🔑🔑  Over $4,000/month', '🤷  Not sure yet'],
      })
    } else {
      qs.push({
        id: 'budget', text: 'Which housing range feels more relevant to your situation?',
        infoBox: 'Typical purchase range: $300K–$800K · Typical rental range: $1,500–$3,500/mo',
        options: ['🏠  Purchase: Under $300,000', '🏠🏠  Purchase: $300,000 – $500,000', '🏠🏠🏠  Purchase: $500,000 – $800,000', '🔑  Rental: Under $1,500/month', '🔑🔑  Rental: $1,500 – $2,500/month', '🔑🔑🔑  Rental: $2,500 – $4,000/month'],
      })
    }

    if (isBusiness) {
      qs.push({
        id: 'business', text: 'If pursuing an E-2 visa, what type of business interests you?',
        options: ['🍽️  Restaurant / hospitality / food service', '🔧  Services — trades, cleaning, maintenance', '📦  Retail or e-commerce', '💼  Professional services', '🏨  Tourism or short-term rentals', '🤷  Not sure yet / exploring options'],
      })
    }

    // Mark last question
    if (qs.length > 0) qs[qs.length - 1].last = true
    return qs
  }

  function handleQ1(opt) {
    setQ1Answer(opt)
    if (opt.startsWith('✅')) {
      setPhase('known')
    } else if (opt.startsWith('🔍')) {
      setPhase('multi')
    } else {
      // Open — start linear from Q2
      setLinStep(0)
      setAnswers({})
      setPhase('linear')
    }
  }

  function handleKnownConfirm(dest) {
    // They know where — go straight to housing questions then results
    setAnswers({ knownDest: dest })
    const qs = buildLinear('known', null)
    // Filter to rentbuy + budget + business only
    setLinStep(0)
    setPhase('linear-known')
  }

  function handleMultiConfirm(states) {
    setMultiStates(states)
    setLinStep(0)
    setAnswers({})
    setPhase('linear-multi')
  }

  // Build current linear sequence
  function getCurrentLinear() {
    if (phase === 'linear') {
      return buildLinear(q1Answer, answers.rentbuy)
    }
    if (phase === 'linear-known' || phase === 'linear-multi') {
      // Only housing + business questions (no climate/env)
      return buildLinear('known', answers.rentbuy)
    }
    return []
  }

  function handleLinearAnswer(questionId, value) {
    const newAnswers = { ...answers, [questionId]: value }
    setAnswers(newAnswers)

    const qs = buildLinear(
      phase === 'linear' ? q1Answer : 'known',
      questionId === 'rentbuy' ? value : newAnswers.rentbuy
    )

    const currentIdx = qs.findIndex(q => q.id === questionId)
    const nextIdx    = currentIdx + 1

    if (nextIdx < qs.length) {
      setLinStep(nextIdx)
    } else {
      // Build results
      let resultMatches
      if (phase === 'linear') {
        resultMatches = matchDestinations(newAnswers)
      } else if (phase === 'linear-multi') {
        // Use their selected states — find best matching city for each state
        const stateMatches = multiStates.map(s => getBestCityForState(s)).filter(Boolean)
        resultMatches = stateMatches.length > 0 ? stateMatches.slice(0, 3) : matchDestinations(newAnswers)
      } else {
        // Known destination — show only that city, no alternatives
        const dest = answers.knownDest ?? ''
        const allKeys = Object.keys(DEST_DATA)
        // Try exact match first, then partial on city portion before comma
        const cityPart = dest.split(',')[0].trim().toLowerCase()
        const statePart = dest.split(',')[1]?.trim().toLowerCase() ?? ''
        const primary = allKeys.find(k => k.toLowerCase() === dest.toLowerCase())
          ?? allKeys.find(k => k.toLowerCase().includes(cityPart))
          ?? (statePart ? allKeys.find(k => DEST_DATA[k].stateName.toLowerCase() === statePart) : null)
          ?? allKeys.find(k => DEST_DATA[k].stateName.toLowerCase() === cityPart)
          ?? null
        resultMatches = primary ? [primary] : []
        newAnswers._isKnownDest = true
      }
      setIsKnownDest(!!newAnswers._isKnownDest)
      setMatches(resultMatches)
      setPhase('results')
    }
  }

  function handleLinearBack() {
    if (linStep === 0) {
      if (phase === 'linear')       setPhase('q1')
      if (phase === 'linear-known') setPhase('known')
      if (phase === 'linear-multi') setPhase('multi')
    } else {
      setLinStep(linStep - 1)
    }
  }

  // ── Render phases ────────────────────────────────────────────────────────────

  if (phase === 'known') {
    return <KnownDestPicker onConfirm={handleKnownConfirm} onBack={() => setPhase('q1')} />
  }

  if (phase === 'multi') {
    return <MultiStatePicker onConfirm={handleMultiConfirm} onBack={() => setPhase('q1')} />
  }

  if (phase === 'results') {
    return (
      <ResultsScreen
        d5answers={answers}
        d2answers={d2answers}
        matches={matches}
        isKnownDest={isKnownDest}
        onBack={() => {
          const qs = getCurrentLinear()
          setLinStep(qs.length - 1)
          setPhase(q1Answer?.startsWith('✅') ? 'linear-known' : q1Answer?.startsWith('🔍') ? 'linear-multi' : 'linear')
        }}
        onContinue={() => navigate('/d6')}
      />
    )
  }

  if (phase === 'linear' || phase === 'linear-known' || phase === 'linear-multi') {
    const qs = buildLinear(
      phase === 'linear' ? q1Answer : 'known',
      answers.rentbuy
    )
    const q = qs[linStep]
    if (!q) return null
    return (
      <QuestionScreen
        question={q}
        step={linStep + 1}
        total={qs.length}
        selected={answers[q.id] ?? null}
        onContinue={(val) => handleLinearAnswer(q.id, val)}
        onBack={handleLinearBack}
      />
    )
  }

  // ── Q1 screen ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F9FC' }}>
      <div className="flex items-center px-4 pt-4 pb-0 gap-2">
        <button onClick={() => navigate('/d4')}
          className="flex items-center justify-center w-10 h-10 rounded-full transition-opacity active:opacity-60"
          style={{ backgroundColor: '#EBF4FB' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0D2B4E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <div className="flex-1">
          <ProgressBar step={1} total={1} label="Destination Discovery" />
        </div>
      </div>

      <div className="flex-1 px-4 pt-4 pb-8 flex flex-col gap-4">
        <div className="px-1 pt-1">
          <h1 className="text-2xl font-extrabold leading-tight" style={{ color: '#0D2B4E' }}>
            Where in the US are you headed?
          </h1>
          <p className="text-sm mt-1" style={{ color: '#4A5568' }}>
            Answer a few quick questions and we'll suggest destinations that fit your lifestyle and goals.
          </p>
        </div>

        <div className="rounded-2xl px-5 py-6 shadow-sm" style={{ backgroundColor: '#FFFFFF' }}>
          <h2 className="text-xl font-bold leading-snug mb-5" style={{ color: '#0D2B4E' }}>
            Do you have a destination in mind already?
          </h2>
          <div className="flex flex-col gap-3">
            {[
              { opt: '✅  Yes — I know exactly where I\'m going', sub: 'Tell us your state and city' },
              { opt: '🔍  Yes — I have 2–3 places in mind',       sub: 'We\'ll compare them for you' },
              { opt: '🤷  No — completely open to suggestions',   sub: 'We\'ll suggest destinations based on your preferences' },
            ].map(({ opt, sub }) => {
              const isActive = q1Answer === opt
              return (
                <button key={opt} onClick={() => setQ1Answer(opt)}
                  className="flex items-start gap-3 w-full text-left rounded-xl px-4 py-4 transition-all duration-150 active:scale-[0.98]"
                  style={{
                    border: `2px solid ${isActive ? '#1B5FA8' : '#E2E8F0'}`,
                    backgroundColor: isActive ? '#EBF4FB' : '#FFFFFF',
                  }}>
                  <div className="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5"
                    style={{ borderColor: isActive ? '#1B5FA8' : '#CBD5E0', backgroundColor: isActive ? '#1B5FA8' : 'transparent' }}>
                    {isActive && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#FFFFFF' }} />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: isActive ? '#0D2B4E' : '#4A5568' }}>{opt}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#A0AEC0' }}>{sub}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <button onClick={() => q1Answer && handleQ1(q1Answer)} disabled={!q1Answer}
          className="w-full py-4 rounded-2xl text-base font-bold tracking-wide transition-all active:scale-95"
          style={{ backgroundColor: q1Answer ? '#F0A500' : '#E2E8F0', color: q1Answer ? '#0D2B4E' : '#A0AEC0' }}>
          Continue →
        </button>
      </div>
    </div>
  )
}
