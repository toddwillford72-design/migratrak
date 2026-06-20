import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import jsPDF from 'jspdf'

const TABS = [
  { id: 'dashboard', label: 'Dashboard', path: '/j1' },
  { id: 'expenses',  label: 'Expenses',  path: '/j2' },
  { id: 'documents', label: 'Documents', path: '/j3' },
  { id: 'coach',     label: 'AI Coach',  path: '/j4' },
  { id: 'directory', label: 'Directory', path: '/j5' },
  { id: 'essentials',label: 'Essentials',path: '/j6' },
  { id: 'resources', label: 'Resources', path: '/resources' },
]

const FILTERS = ['All', 'Attorneys', 'RCICs', 'CPAs', 'Financial Advisors', 'Real Estate', 'MLO / Mortgage', 'Healthcare', 'Vehicle Import', 'Business Brokers']
const STATE_FILTERS = ['All States', 'Florida', 'Texas', 'North Carolina', 'South Carolina', 'Georgia', 'Arizona', 'Tennessee']
const STATE_ABBR = { Florida: 'FL', Texas: 'TX', 'North Carolina': 'NC', 'South Carolina': 'SC', Georgia: 'GA', Arizona: 'AZ', Tennessee: 'TN' }

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
    badge: null,
    category: 'Attorneys',
    stars: 5,
    reviews: null,
    expanded: true,
    primaryAction: 'Request Introduction',
    has_account: true,
    supabase_id: '63604efe-b9bd-4e6e-b2c4-b5a1b09c1cbc',
  },
  {
    id: 29,
    name: 'Michael A. Harris',
    title: 'Immigration Attorney',
    firm: 'HarrisLaw P.A.',
    location: 'Miami, FL',
    address: '25 SE 2nd Avenue, Suite 828, Miami, FL 33131',
    phones: [{ label: 'Office', number: '(305) 792-8677' }],
    hours: null,
    specialties: [],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Attorneys',
    stars: null,
    reviews: null,
    expanded: false,
    primaryAction: 'Request Introduction',
    has_account: false,
    email: 'info@harrislawpa.com',
  },
  {
    id: 55,
    name: 'Luciano Barcellos',
    title: 'Immigration Attorney',
    firm: 'Barcellos Law',
    location: 'Miami, FL',
    address: '1000 Brickell Ave Ste 1100, Miami, FL 33131',
    phones: [{ label: 'Office', number: '786-354-5822' }],
    hours: null,
    specialties: [],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Attorneys',
    stars: null,
    reviews: null,
    expanded: false,
    primaryAction: 'Request Introduction',
    has_account: false,
    email: 'info@barcellos.law',
  },
  {
    id: 56,
    name: 'Carmen Arce',
    title: 'Immigration Attorney',
    firm: 'Arce Immigration Law',
    location: 'Miami, FL',
    address: '3692 SW 24th St, Miami, FL 33145',
    phones: [{ label: 'Office', number: '305-330-6262' }],
    hours: null,
    specialties: [],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Attorneys',
    stars: null,
    reviews: null,
    expanded: false,
    primaryAction: 'Request Introduction',
    has_account: false,
    email: 'info@arceglobal.com',
  },
  {
    id: 57,
    name: 'Connie Kaplan',
    title: 'Immigration Attorney',
    firm: 'Law Offices of Connie Kaplan, P.A.',
    location: 'Fort Lauderdale, FL',
    address: '110 SE 6th St #1736, Fort Lauderdale, FL 33301',
    phones: [{ label: 'Office', number: '754-757-2447' }],
    hours: null,
    specialties: [],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Attorneys',
    stars: null,
    reviews: null,
    expanded: false,
    primaryAction: 'Request Introduction',
    has_account: false,
    email: null,
  },
  {
    id: 58,
    name: 'Shilpa Grover Malik',
    title: 'Immigration Attorney',
    firm: 'VisaNation Law Group PLLC',
    location: 'Fort Lauderdale, FL',
    address: '800 Corporate Drive Ste 206, Fort Lauderdale, FL 33334',
    phones: [{ label: 'Office', number: '954-604-6406' }],
    hours: null,
    specialties: [],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Attorneys',
    stars: null,
    reviews: null,
    expanded: false,
    primaryAction: 'Request Introduction',
    has_account: false,
    email: 'info@immi-usa.com',
  },
  {
    id: 59,
    name: 'Kevin Daniel Slattery',
    title: 'Immigration Attorney',
    firm: 'Kevin D. Slattery, P.A.',
    location: 'Tampa, FL',
    address: '4860 W Gandy Blvd, Tampa, FL 33611',
    phones: [{ label: 'Office', number: '813-839-7474' }],
    hours: null,
    specialties: [],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Attorneys',
    stars: null,
    reviews: null,
    expanded: false,
    primaryAction: 'Request Introduction',
    has_account: false,
    email: 'info@slattery-law.com',
  },
  {
    id: 60,
    name: 'Kathryn E. Reeves',
    title: 'Immigration Attorney',
    firm: 'Immigration Attorneys, LLP',
    location: 'Tampa, FL',
    address: '2102 W. Cleveland St., Tampa, FL 33606',
    phones: [{ label: 'Office', number: '813-463-0020' }],
    hours: null,
    specialties: [],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Attorneys',
    stars: null,
    reviews: null,
    expanded: false,
    primaryAction: 'Request Introduction',
    has_account: false,
    email: 'kreeves@immattyllp.com',
  },
  {
    id: 61,
    name: 'Luciane F M Tavares',
    title: 'Immigration Attorney',
    firm: 'American Immigration Associates LLC',
    location: 'Orlando, FL',
    address: '300 S Orange Ave Suite 1150, Orlando, FL 32801',
    phones: [{ label: 'Office', number: '407-901-7556' }],
    hours: null,
    specialties: [],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Attorneys',
    stars: null,
    reviews: null,
    expanded: false,
    primaryAction: 'Request Introduction',
    has_account: false,
    email: null,
  },
  {
    id: 62,
    name: 'Elana Jean Laverty',
    title: 'Immigration Attorney',
    firm: 'BTL Immigration',
    location: 'Orlando, FL',
    address: null,
    phones: [{ label: 'Office', number: '407-489-2645' }],
    hours: null,
    specialties: [],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Attorneys',
    stars: null,
    reviews: null,
    expanded: false,
    primaryAction: 'Request Introduction',
    has_account: false,
    email: 'elaverty@btlimmigration.com',
  },
  // ── Texas ────────────────────────────────────────────────────────────────────
  {
    id: 63,
    name: 'Lance Curtright',
    title: 'Immigration Attorney',
    firm: 'De Mott, Curtright, & Armendariz (DMCA)',
    location: 'Houston, TX',
    address: '601 Sawyer Suite 280, Houston, TX 77007',
    phones: [{ label: 'Office', number: '713-373-3765' }],
    hours: null,
    specialties: [],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Attorneys',
    stars: null,
    reviews: null,
    expanded: false,
    primaryAction: 'Request Introduction',
    has_account: false,
    email: 'lance@dmcausa.com',
  },
  {
    id: 64,
    name: 'Virginia Shevaun Jijon-Caamano',
    title: 'Immigration Attorney',
    firm: 'Jackson, Landrith & Kulesz, PC',
    location: 'Arlington, TX',
    address: '601 W Abram Street, Arlington, TX 76010',
    phones: [{ label: 'Office', number: '817-226-1100' }],
    hours: null,
    specialties: [],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Attorneys',
    stars: null,
    reviews: null,
    expanded: false,
    primaryAction: 'Request Introduction',
    has_account: false,
    email: 'contact@jlkattorneys.com',
  },
  {
    id: 65,
    name: 'Faye M. Kolly',
    title: 'Immigration Attorney',
    firm: 'McChesney Kolly PLLC',
    location: 'Austin, TX',
    address: '901 Mopac Expressway South Ste. 300, Austin, TX 78746',
    phones: [{ label: 'Office', number: '512-643-2941' }],
    hours: null,
    specialties: [],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Attorneys',
    stars: null,
    reviews: null,
    expanded: false,
    primaryAction: 'Request Introduction',
    has_account: false,
    email: null,
  },
  {
    id: 66,
    name: 'Alfredo Lozano',
    title: 'Immigration Attorney',
    firm: 'The Lozano Law Firm, PLLC',
    location: 'San Antonio, TX',
    address: '5718 University Heights Blvd. Suite 104, San Antonio, TX 78249',
    phones: [{ label: 'Office', number: '210-899-2290' }],
    hours: null,
    specialties: [],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Attorneys',
    stars: null,
    reviews: null,
    expanded: false,
    primaryAction: 'Request Introduction',
    has_account: false,
    email: null,
  },
  {
    id: 67,
    name: 'Maria McIntyre',
    title: 'Immigration Attorney',
    firm: 'Nayar & McIntyre, LLP',
    location: 'Irving, TX',
    address: '800 W Airport Freeway Suite 1100, Irving, TX 75062',
    phones: [{ label: 'Office', number: '972-445-4114' }],
    hours: null,
    specialties: [],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Attorneys',
    stars: null,
    reviews: null,
    expanded: false,
    primaryAction: 'Request Introduction',
    has_account: false,
    email: 'info@dfw-immigration.com',
  },
  {
    id: 68,
    name: 'Lonnie Hank Robin',
    title: 'Immigration Attorney',
    firm: 'Law Office of Lonnie Hank Robin',
    location: 'Fort Worth, TX',
    address: 'PO Box 17400, Fort Worth, TX 76102',
    phones: [{ label: 'Office', number: '817-870-1450' }],
    hours: null,
    specialties: [],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Attorneys',
    stars: null,
    reviews: null,
    expanded: false,
    primaryAction: 'Request Introduction',
    has_account: false,
    email: 'lonnie@lonnierobin.com',
  },
  {
    id: 69,
    name: 'Kelley Noemy Ortega',
    title: 'Immigration Attorney',
    firm: 'Jaime Barron PC',
    location: 'Dallas, TX',
    address: '7610 N Stemmons Fwy Suite 555, Dallas, TX 75247',
    phones: [{ label: 'Office', number: '214-267-9300' }],
    hours: null,
    specialties: [],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Attorneys',
    stars: null,
    reviews: null,
    expanded: false,
    primaryAction: 'Request Introduction',
    has_account: false,
    email: 'info@jaimebarron.com',
  },
  {
    id: 70,
    name: 'Debra Rodriguez',
    title: 'Immigration Attorney',
    firm: 'Debra Rodriguez, P.C.',
    location: 'Corpus Christi, TX',
    address: '713 Ayers Street, Corpus Christi, TX 78404',
    phones: [{ label: 'Office', number: '361-883-8900' }],
    hours: null,
    specialties: [],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Attorneys',
    stars: null,
    reviews: null,
    expanded: false,
    primaryAction: 'Request Introduction',
    has_account: false,
    email: 'info@debrarodriguez.com',
  },
  // ── North Carolina ───────────────────────────────────────────────────────────
  {
    id: 71,
    name: 'H. Glenn Fogle Jr.',
    title: 'Immigration Attorney',
    firm: 'The Fogle Law Firm, LLC',
    location: 'Charlotte, NC',
    address: '301 S. McDowell Street Suite 800, Charlotte, NC 28204',
    phones: [{ label: 'Office', number: '704-405-9060' }],
    hours: null,
    specialties: [],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Attorneys',
    stars: null,
    reviews: null,
    expanded: false,
    primaryAction: 'Request Introduction',
    has_account: false,
    email: 'info@foglelaw.com',
  },
  {
    id: 72,
    name: 'Mary Lynn Anna Tedesco',
    title: 'Immigration Attorney',
    firm: 'Tedesco Legal, PC',
    location: 'Charlotte, NC',
    address: 'PO Box 242066, Charlotte, NC 28227',
    phones: [{ label: 'Office', number: '980-999-1253' }],
    hours: null,
    specialties: [],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Attorneys',
    stars: null,
    reviews: null,
    expanded: false,
    primaryAction: 'Request Introduction',
    has_account: false,
    email: null,
  },
  {
    id: 73,
    name: 'Patrick Hatch',
    title: 'Immigration Attorney',
    firm: 'Hatch Rockers Immigration',
    location: 'Raleigh, NC',
    address: '4909 Waters Edge Drive Suite 218, Raleigh, NC 27606',
    phones: [{ label: 'Office', number: '919-688-1788' }],
    hours: null,
    specialties: [],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Attorneys',
    stars: null,
    reviews: null,
    expanded: false,
    primaryAction: 'Request Introduction',
    has_account: false,
    email: 'info@hatchrockers.com',
  },
  {
    id: 74,
    name: 'Robb Hill',
    title: 'Immigration Attorney',
    firm: 'Robb Hill, Attorney at Law, PLLC',
    location: 'Asheville, NC',
    address: '35 Orange Street, Asheville, NC 28801',
    phones: [{ label: 'Office', number: '828-210-8171' }],
    hours: null,
    specialties: [],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Attorneys',
    stars: null,
    reviews: null,
    expanded: false,
    primaryAction: 'Request Introduction',
    has_account: false,
    email: null,
  },
  {
    id: 75,
    name: 'Jeffrey Bruce Widdison',
    title: 'Immigration Attorney',
    firm: 'McKinney Immigration Law',
    location: 'Wilmington, NC',
    address: '720 N 3rd Street Ste 102, Wilmington, NC 28401',
    phones: [{ label: 'Office', number: '336-275-5885' }],
    hours: null,
    specialties: [],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Attorneys',
    stars: null,
    reviews: null,
    expanded: false,
    primaryAction: 'Request Introduction',
    has_account: false,
    email: null,
  },
  {
    id: 76,
    name: 'David J. Long',
    title: 'Immigration Attorney',
    firm: 'Long & Chang LLP',
    location: 'Jamestown, NC',
    address: '4915 Piedmont Parkway Suite 103, Jamestown, NC 27282',
    phones: [{ label: 'Office', number: '336-855-5700' }],
    hours: null,
    specialties: [],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Attorneys',
    stars: null,
    reviews: null,
    expanded: false,
    primaryAction: 'Request Introduction',
    has_account: false,
    email: 'info@longchangonline.com',
  },
  {
    id: 77,
    name: 'Daniel Christmann',
    title: 'Immigration Attorney',
    firm: 'Christmann Legal Immigration Law',
    location: 'Greensboro, NC',
    address: '7800 Airport Center Drive Suite 401, Greensboro, NC 27409',
    phones: [{ label: 'Office', number: '336-790-2101' }],
    hours: null,
    specialties: [],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Attorneys',
    stars: null,
    reviews: null,
    expanded: false,
    primaryAction: 'Request Introduction',
    has_account: false,
    email: 'info@christmannlegal.com',
  },
  {
    id: 78,
    name: 'Stephen H. Smalley',
    title: 'Immigration Attorney',
    firm: 'Ogletree, Deakins, Nash et al.',
    location: 'Raleigh, NC',
    address: '4208 Six Forks Road Suite 1100, Raleigh, NC 27609',
    phones: [{ label: 'Office', number: '919-787-9700' }],
    hours: null,
    specialties: [],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Attorneys',
    stars: null,
    reviews: null,
    expanded: false,
    primaryAction: 'Request Introduction',
    has_account: false,
    email: 'stephen.smalley@ogletree.com',
  },
  // ── South Carolina ───────────────────────────────────────────────────────────
  {
    id: 79,
    name: 'Kristen Ness Ayers',
    title: 'Immigration Attorney',
    firm: 'Ayers Immigration Law Firm',
    location: 'Charleston, SC',
    address: '1466 Wando Landing Street, Charleston, SC 29492',
    phones: [{ label: 'Office', number: '678-528-3196' }],
    hours: null,
    specialties: [],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Attorneys',
    stars: null,
    reviews: null,
    expanded: false,
    primaryAction: 'Request Introduction',
    has_account: false,
    email: null,
  },
  {
    id: 80,
    name: 'Jean Sterling Chillico',
    title: 'Immigration Attorney',
    firm: 'Chillico & Associates, LLC',
    location: 'Mount Pleasant, SC',
    address: '3850 Bessemer Rd. Suite 120, Mount Pleasant, SC 29466',
    phones: [{ label: 'Office', number: '843-779-2112' }],
    hours: null,
    specialties: [],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Attorneys',
    stars: null,
    reviews: null,
    expanded: false,
    primaryAction: 'Request Introduction',
    has_account: false,
    email: 'admin@chillico.law',
  },
  {
    id: 81,
    name: 'Lawrence J. Needle',
    title: 'Immigration Attorney',
    firm: 'Lawrence J. Needle, P.A.',
    location: 'Columbia, SC',
    address: '339 Heyward St., Columbia, SC 29201',
    phones: [{ label: 'Office', number: '803-376-1203' }],
    hours: null,
    specialties: [],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Attorneys',
    stars: null,
    reviews: null,
    expanded: false,
    primaryAction: 'Request Introduction',
    has_account: false,
    email: null,
  },
  {
    id: 82,
    name: 'Aimee E. Deverall',
    title: 'Immigration Attorney',
    firm: 'Deverall Immigration Law, LLC',
    location: 'Bluffton, SC',
    address: '10 Pinckney Colony Road Suite 102, Bluffton, SC 29909',
    phones: [{ label: 'Office', number: '843-815-7444' }],
    hours: null,
    specialties: [],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Attorneys',
    stars: null,
    reviews: null,
    expanded: false,
    primaryAction: 'Request Introduction',
    has_account: false,
    email: 'info@deverall-law.com',
  },
  {
    id: 83,
    name: 'Laura E. Martin',
    title: 'Immigration Attorney',
    firm: 'Martin & Martin PA',
    location: 'Greenville, SC',
    address: '1415 Augusta St, Greenville, SC 29605',
    phones: [{ label: 'Office', number: '864-271-1822' }],
    hours: null,
    specialties: [],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Attorneys',
    stars: null,
    reviews: null,
    expanded: false,
    primaryAction: 'Request Introduction',
    has_account: false,
    email: 'laura@martinslawfirm.com',
  },
  {
    id: 84,
    name: 'Mariana Toledo-Hermina',
    title: 'Immigration Attorney',
    firm: 'Law Office of Mariana Toledo-Hermina',
    location: 'Fort Mill, SC',
    address: '120 Academy St, Fort Mill, SC 29715',
    phones: [{ label: 'Office', number: '980-785-4923' }],
    hours: null,
    specialties: [],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Attorneys',
    stars: null,
    reviews: null,
    expanded: false,
    primaryAction: 'Request Introduction',
    has_account: false,
    email: null,
  },
  {
    id: 85,
    name: 'Garrett D. Steck',
    title: 'Immigration Attorney',
    firm: 'Haynsworth Sinkler Boyd PA',
    location: 'Greenville, SC',
    address: '1 North Main Street Suite 200, Greenville, SC 29601',
    phones: [{ label: 'Office', number: '(864) 240-3200' }],
    hours: null,
    specialties: [],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Attorneys',
    stars: null,
    reviews: null,
    expanded: false,
    primaryAction: 'Request Introduction',
    has_account: false,
    email: 'gsteck@hsblawfirm.com',
  },
  {
    id: 86,
    name: 'Jessica Lynn Wallace',
    title: 'Immigration Attorney',
    firm: 'Wallace Immigration Law, LLC',
    location: 'Greer, SC',
    address: '22 Parkway Commons Way, Greer, SC 29650',
    phones: [{ label: 'Office', number: '864-326-4833' }],
    hours: null,
    specialties: [],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Attorneys',
    stars: null,
    reviews: null,
    expanded: false,
    primaryAction: 'Request Introduction',
    has_account: false,
    email: 'jessica@wallace-law.com',
  },
  // ── Georgia ──────────────────────────────────────────────────────────────────
  {
    id: 87,
    name: 'Renata C Lillywhite',
    title: 'Immigration Attorney',
    firm: 'Alliance Immigration Law LLC',
    location: 'Marietta, GA',
    address: '4343 Shallowford Rd Suite 121, Marietta, GA 30062',
    phones: [{ label: 'Office', number: '678-528-3196' }],
    hours: null,
    specialties: [],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Attorneys',
    stars: null,
    reviews: null,
    expanded: false,
    primaryAction: 'Request Introduction',
    has_account: false,
    email: null,
  },
  {
    id: 88,
    name: 'Sasha N Westerman-Keuning',
    title: 'Immigration Attorney',
    firm: 'Rostova Westerman Law Group',
    location: 'Clayton, GA',
    address: '172 N Main St Suite 1, Clayton, GA 30525',
    phones: [{ label: 'Office', number: '786-442-3177' }],
    hours: null,
    specialties: [],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Attorneys',
    stars: null,
    reviews: null,
    expanded: false,
    primaryAction: 'Request Introduction',
    has_account: false,
    email: null,
  },
  {
    id: 89,
    name: 'Layli Eskandari Deal',
    title: 'Immigration Attorney',
    firm: 'Levine & Eskandari LC',
    location: 'Atlanta, GA',
    address: '280 Interstate North Circle SE Suite 450, Atlanta, GA 30339',
    phones: [{ label: 'Office', number: '770-551-2700' }],
    hours: null,
    specialties: [],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Attorneys',
    stars: null,
    reviews: null,
    expanded: false,
    primaryAction: 'Request Introduction',
    has_account: false,
    email: 'ldeal@leimmigration.com',
  },
  {
    id: 90,
    name: 'Jeremy Smith',
    title: 'Immigration Attorney',
    firm: 'Smith Immigration Law Office, P.C.',
    location: 'Buford, GA',
    address: 'P.O. Box 1388, Buford, GA 30515',
    phones: [{ label: 'Office', number: '678-200-2910' }],
    hours: null,
    specialties: [],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Attorneys',
    stars: null,
    reviews: null,
    expanded: false,
    primaryAction: 'Request Introduction',
    has_account: false,
    email: 'jeremy@abogadojeremias.com',
  },
  {
    id: 91,
    name: 'Charles Keith Wood Jr.',
    title: 'Immigration Attorney',
    firm: 'Law Office of C. Keith Wood, Jr.',
    location: 'Jonesboro, GA',
    address: '7745 Jonesboro Rd., Jonesboro, GA 30236',
    phones: [{ label: 'Office', number: '770-471-4282' }],
    hours: null,
    specialties: [],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Attorneys',
    stars: null,
    reviews: null,
    expanded: false,
    primaryAction: 'Request Introduction',
    has_account: false,
    email: null,
  },
  {
    id: 92,
    name: 'Jameel Manji',
    title: 'Immigration Attorney',
    firm: 'Manji Law PC',
    location: 'Tucker, GA',
    address: '5745 Lawrenceville Hwy, Tucker, GA 30084',
    phones: [{ label: 'Office', number: '678-902-2999' }],
    hours: null,
    specialties: [],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Attorneys',
    stars: null,
    reviews: null,
    expanded: false,
    primaryAction: 'Request Introduction',
    has_account: false,
    email: null,
  },
  {
    id: 93,
    name: 'Hilary Smith',
    title: 'Immigration Attorney',
    firm: 'Law Offices of Hilary Smith, LLC',
    location: 'Marietta, GA',
    address: '80 Whitlock Place SW Suite 101, Marietta, GA 30064',
    phones: [{ label: 'Office', number: '404-418-8989' }],
    hours: null,
    specialties: [],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Attorneys',
    stars: null,
    reviews: null,
    expanded: false,
    primaryAction: 'Request Introduction',
    has_account: false,
    email: null,
  },
  {
    id: 94,
    name: 'Stacy M Ehrisman',
    title: 'Immigration Attorney',
    firm: 'The Ehrisman Law Firm, P.C.',
    location: 'Lawrenceville, GA',
    address: '572 Buford Drive, Lawrenceville, GA 30046',
    phones: [{ label: 'Office', number: '678-985-0313' }],
    hours: null,
    specialties: [],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Attorneys',
    stars: null,
    reviews: null,
    expanded: false,
    primaryAction: 'Request Introduction',
    has_account: false,
    email: 'stacy@ehrismanlaw.com',
  },
  // ── Arizona ──────────────────────────────────────────────────────────────────
  {
    id: 95,
    name: 'Pamela Florian',
    title: 'Immigration Attorney',
    firm: 'Acceso Immigration Law, PLLC',
    location: 'Tucson, AZ',
    address: '2030 E Broadway Blvd Ste 102, Tucson, AZ 85719',
    phones: [{ label: 'Office', number: '520-789-4360' }],
    hours: null,
    specialties: [],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Attorneys',
    stars: null,
    reviews: null,
    expanded: false,
    primaryAction: 'Request Introduction',
    has_account: false,
    email: null,
  },
  {
    id: 96,
    name: 'Juan Rocha',
    title: 'Immigration Attorney',
    firm: 'Rocha Law Office',
    location: 'Mesa, AZ',
    address: 'P.O. Box 5965, Mesa, AZ 85211',
    phones: [{ label: 'Office', number: '480-855-1759' }],
    hours: null,
    specialties: [],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Attorneys',
    stars: null,
    reviews: null,
    expanded: false,
    primaryAction: 'Request Introduction',
    has_account: false,
    email: 'juanrocha@jrochalaw.com',
  },
  {
    id: 97,
    name: 'Emma D. Wells',
    title: 'Immigration Attorney',
    firm: 'Law Office of Emma D. Wells, PLLC',
    location: 'Peoria, AZ',
    address: '24654 N. Lake Pleasant Pkwy Suite 103-289, Peoria, AZ 85383',
    phones: [{ label: 'Office', number: '602-622-9680' }],
    hours: null,
    specialties: [],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Attorneys',
    stars: null,
    reviews: null,
    expanded: false,
    primaryAction: 'Request Introduction',
    has_account: false,
    email: null,
  },
  {
    id: 98,
    name: 'Timothy A. Gambacorta',
    title: 'Immigration Attorney',
    firm: 'The Gambacorta Law Office, LLC',
    location: 'Phoenix, AZ',
    address: '1 East Washington Street Suite 500, Phoenix, AZ 85004',
    phones: [{ label: 'Office', number: '602-325-8002' }],
    hours: null,
    specialties: [],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Attorneys',
    stars: null,
    reviews: null,
    expanded: false,
    primaryAction: 'Request Introduction',
    has_account: false,
    email: 'tim@gambacortalaw.com',
  },
  {
    id: 99,
    name: 'Matthew H. Green',
    title: 'Immigration Attorney',
    firm: 'Green Evans-Schroeder',
    location: 'Tucson, AZ',
    address: '130 W. Cushing Street, Tucson, AZ 85701',
    phones: [{ label: 'Office', number: '520-882-8852' }],
    hours: null,
    specialties: [],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Attorneys',
    stars: null,
    reviews: null,
    expanded: false,
    primaryAction: 'Request Introduction',
    has_account: false,
    email: null,
  },
  {
    id: 100,
    name: 'Daniel Peter Lubarsky-Ford',
    title: 'Immigration Attorney',
    firm: 'Lubarsky Ford PLLC',
    location: 'Tempe, AZ',
    address: '424 E. Southern Ave. Suite 102, Tempe, AZ 85282',
    phones: [{ label: 'Office', number: '602-300-6183' }],
    hours: null,
    specialties: [],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Attorneys',
    stars: null,
    reviews: null,
    expanded: false,
    primaryAction: 'Request Introduction',
    has_account: false,
    email: null,
  },
  {
    id: 101,
    name: 'Rachel Bus',
    title: 'Immigration Attorney',
    firm: 'Law Offices of Brelje and Associates',
    location: 'Goodyear, AZ',
    address: '3080 N. Litchfield Rd., Goodyear, AZ 85395',
    phones: [{ label: 'Office', number: '623-536-5750' }],
    hours: null,
    specialties: [],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Attorneys',
    stars: null,
    reviews: null,
    expanded: false,
    primaryAction: 'Request Introduction',
    has_account: false,
    email: 'breljeinfo@breljelaw.com',
  },
  {
    id: 102,
    name: 'Jared C. Leung',
    title: 'Immigration Attorney',
    firm: 'JCL Immigration Attorneys, PLLC',
    location: 'Scottsdale, AZ',
    address: '1375 N Scottsdale Road Suite 390, Scottsdale, AZ 85257',
    phones: [{ label: 'Office', number: '602-831-2329' }],
    hours: null,
    specialties: [],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Attorneys',
    stars: null,
    reviews: null,
    expanded: false,
    primaryAction: 'Request Introduction',
    has_account: false,
    email: 'info@jclimmigration.com',
  },
  // ── Tennessee ────────────────────────────────────────────────────────────────
  {
    id: 103,
    name: 'Kara L. Youngblood',
    title: 'Immigration Attorney',
    firm: 'Youngblood & Associates, PLLC',
    location: 'McMinnville, TN',
    address: '118 N. Spring Street, McMinnville, TN 37110',
    phones: [{ label: 'Office', number: '931-274-7811' }],
    hours: null,
    specialties: [],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Attorneys',
    stars: null,
    reviews: null,
    expanded: false,
    primaryAction: 'Request Introduction',
    has_account: false,
    email: null,
  },
  {
    id: 104,
    name: 'Terrence Lee Olsen',
    title: 'Immigration Attorney',
    firm: 'Law Office of Terrence Lee Olsen',
    location: 'Chattanooga, TN',
    address: '615 Lindsay St. Suite 330, Chattanooga, TN 37403',
    phones: [{ label: 'Office', number: '423-648-9390' }],
    hours: null,
    specialties: [],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Attorneys',
    stars: null,
    reviews: null,
    expanded: false,
    primaryAction: 'Request Introduction',
    has_account: false,
    email: null,
  },
  {
    id: 105,
    name: 'Elizabeth Patton',
    title: 'Immigration Attorney',
    firm: 'Rose Immigration Law Firm, PLC',
    location: 'Brentwood, TN',
    address: '105 Westpark Drive Suite 330, Brentwood, TN 37027',
    phones: [{ label: 'Office', number: '615-321-2256' }],
    hours: null,
    specialties: [],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Attorneys',
    stars: null,
    reviews: null,
    expanded: false,
    primaryAction: 'Request Introduction',
    has_account: false,
    email: 'epatton@roseimmigration.com',
  },
  {
    id: 106,
    name: 'Casey Bryant',
    title: 'Immigration Attorney',
    firm: 'Advocates for Immigrant Rights',
    location: 'Memphis, TN',
    address: '815 N. McLean Blvd, Memphis, TN 38174',
    phones: [{ label: 'Office', number: '901-729-9566' }],
    hours: null,
    specialties: [],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Attorneys',
    stars: null,
    reviews: null,
    expanded: false,
    primaryAction: 'Request Introduction',
    has_account: false,
    email: 'casey@airlegal.org',
  },
  {
    id: 107,
    name: 'Michael A. Eastridge',
    title: 'Immigration Attorney',
    firm: 'Hunter, Smith & Davis, LLP',
    location: 'Kingsport, TN',
    address: '1212 N. Eastman Rd., Kingsport, TN 37664',
    phones: [{ label: 'Office', number: '423-378-8800' }],
    hours: null,
    specialties: [],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Attorneys',
    stars: null,
    reviews: null,
    expanded: false,
    primaryAction: 'Request Introduction',
    has_account: false,
    email: null,
  },
  {
    id: 108,
    name: 'Corey Austin Spearman',
    title: 'Immigration Attorney',
    firm: 'Nación del Inmigrante',
    location: 'Tullahoma, TN',
    address: '111 NW Atlantic St Ste 200, Tullahoma, TN 37388',
    phones: [{ label: 'Office', number: '931-563-0808' }],
    hours: null,
    specialties: [],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Attorneys',
    stars: null,
    reviews: null,
    expanded: false,
    primaryAction: 'Request Introduction',
    has_account: false,
    email: null,
  },
  {
    id: 109,
    name: 'Sandra Susana Gibbs',
    title: 'Immigration Attorney',
    firm: 'Sandra Gibbs Law, Inc.',
    location: 'Lebanon, TN',
    address: '115 E Main Street Ste. F, Lebanon, TN 37088',
    phones: [{ label: 'Office', number: '615-810-8186' }],
    hours: null,
    specialties: [],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Attorneys',
    stars: null,
    reviews: null,
    expanded: false,
    primaryAction: 'Request Introduction',
    has_account: false,
    email: null,
  },
  {
    id: 110,
    name: 'Martin W. Lester',
    title: 'Immigration Attorney',
    firm: 'Lester Law',
    location: 'Hixson, TN',
    address: 'P.O. Box 968, Hixson, TN 37343',
    phones: [{ label: 'Office', number: '423-402-0608' }],
    hours: null,
    specialties: [],
    languages: null,
    canadian: null,
    bio: null,
    note: null,
    badge: null,
    category: 'Attorneys',
    stars: null,
    reviews: null,
    expanded: false,
    primaryAction: 'Request Introduction',
    has_account: false,
    email: null,
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

// ── Scorecard PDF ─────────────────────────────────────────────────────────────
function generateScorecardPDF(prospect, proName, proFirm) {
  const doc = new jsPDF()
  const W = doc.internal.pageSize.getWidth()

  doc.setFillColor(13, 43, 78)
  doc.rect(0, 0, W, 28, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(15)
  doc.setFont('helvetica', 'bold')
  doc.text('MigraTrak — Attorney Scorecard', 14, 13)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 14, 22)

  doc.setTextColor(0, 0, 0)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text(proName, 14, 44)
  if (proFirm) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(proFirm, 14, 52)
  }

  const fitColor = prospect.fit_rating === 'Strong' ? [26,122,74] : prospect.fit_rating === 'Possible' ? [200,120,0] : [200,40,40]
  doc.setDrawColor(...fitColor)
  doc.setLineWidth(0.5)
  doc.rect(14, 60, W - 28, 24)
  doc.setFontSize(26)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...fitColor)
  doc.text(`${prospect.score}`, 22, 78)
  doc.setFontSize(9)
  doc.setTextColor(75, 85, 99)
  doc.text('/100', 40, 78)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...fitColor)
  doc.text(`${prospect.fit_rating} Fit`, 60, 72)
  doc.setTextColor(75, 85, 99)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(`Complexity: ${prospect.complexity}`, 60, 80)

  if (prospect.ai_consultation_note) {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(74, 85, 104)
    const noteLines = doc.splitTextToSize(`"${prospect.ai_consultation_note}"`, W - 28)
    doc.text(noteLines, 14, 98)
  }

  if (prospect.score_breakdown) {
    const b = prospect.score_breakdown
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(13, 43, 78)
    doc.text('Score Breakdown', 14, 118)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(0, 0, 0)
    const rows = [
      ['Budget fit', b.budget, 30],
      ['Pathway fit', b.pathway, 25],
      ['Completeness', b.completeness, 20],
      ['Timeline realism', b.timeline, 15],
      ['No flags', b.flags, 10],
    ]
    let y = 128
    rows.forEach(([label, val, max]) => {
      doc.text(label, 14, y)
      doc.text(`${val} / ${max}`, 130, y)
      y += 9
    })
  }

  doc.setFontSize(7.5)
  doc.setTextColor(160, 174, 192)
  doc.text('This scorecard is generated by MigraTrak for informational purposes only. It is not legal advice.', 14, 276)

  doc.save(`MigraTrak_Scorecard_${proName.replace(/\s+/g,'_')}.pdf`)
}

// ── Intro modal ───────────────────────────────────────────────────────────────
function IntroModal({ pro, prospect, introEmail, onClose }) {
  const [copied, setCopied] = useState(false)
  const [actionTaken, setActionTaken] = useState(false)

  async function markIntroSent() {
    if (actionTaken) return
    setActionTaken(true)
    const now = new Date().toISOString()
    try {
      const queue = JSON.parse(localStorage.getItem('migratrak_intro_queue') || '[]')
      const entry = { id: prospect.id, professional_name: pro.name, intro_sent_at: now, followup_count: 0 }
      localStorage.setItem('migratrak_intro_queue', JSON.stringify([...queue, entry]))
    } catch {}
    try {
      await supabase.from('prospects').update({ intro_status: 'intro_sent', intro_sent_at: now }).eq('id', prospect.id)
    } catch {}
  }

  async function handleCopy() {
    try { await navigator.clipboard.writeText(introEmail.body) } catch {}
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
    markIntroSent()
  }

  const hasEmail = !!pro.email && !!introEmail?.body
  const hasPhone = pro.phones && pro.phones.length > 0
  const mailtoLink = hasEmail
    ? `mailto:${pro.email}?subject=${encodeURIComponent(introEmail.subject)}&body=${encodeURIComponent(introEmail.body)}`
    : null

  const fitColor = prospect?.fit_rating === 'Strong' ? '#1A7A4A' : prospect?.fit_rating === 'Possible' ? '#C87800' : '#DC2626'

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: 'rgba(0,0,0,0.55)' }} onClick={onClose}>
      <div className="flex-1 min-h-0" />
      <div
        className="rounded-t-3xl overflow-hidden flex flex-col"
        style={{ backgroundColor: '#FFFFFF', maxHeight: '92vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" style={{ borderBottom: '1px solid #F1F5F9' }}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#4A9FD4' }}>Next step</p>
            <h2 className="text-lg font-extrabold leading-tight" style={{ color: '#0D2B4E' }}>{pro.name}</h2>
            <p className="text-xs mt-0.5" style={{ color: '#4A5568' }}>{pro.firm}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0" style={{ backgroundColor: '#F1F5F9' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4A5568" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Score strip */}
        {prospect && (
          <div className="flex items-center gap-4 px-5 py-3 flex-shrink-0" style={{ backgroundColor: '#F7F9FC', borderBottom: '1px solid #E2E8F0' }}>
            <div className="text-center">
              <p className="text-2xl font-extrabold leading-none" style={{ color: fitColor }}>{prospect.score}</p>
              <p className="text-xs" style={{ color: '#4A5568' }}>/ 100</p>
            </div>
            <div className="w-px self-stretch" style={{ backgroundColor: '#E2E8F0' }} />
            <div className="text-center">
              <p className="text-sm font-bold" style={{ color: fitColor }}>{prospect.fit_rating}</p>
              <p className="text-xs" style={{ color: '#4A5568' }}>fit</p>
            </div>
            <div className="w-px self-stretch" style={{ backgroundColor: '#E2E8F0' }} />
            <div className="text-center">
              <p className="text-sm font-bold" style={{ color: '#0D2B4E' }}>{prospect.complexity}</p>
              <p className="text-xs" style={{ color: '#4A5568' }}>complexity</p>
            </div>
            {prospect.ai_consultation_note && (
              <>
                <div className="w-px self-stretch" style={{ backgroundColor: '#E2E8F0' }} />
                <p className="text-xs leading-relaxed flex-1 italic" style={{ color: '#4A5568' }}>{prospect.ai_consultation_note}</p>
              </>
            )}
          </div>
        )}

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-5 py-4 flex flex-col gap-4 pb-8">
          {hasEmail ? (
            <>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider mb-2" style={{ color: '#4A5568' }}>Your intro email</p>
                <div className="rounded-xl px-4 py-3 text-sm leading-relaxed" style={{ backgroundColor: '#F7F9FC', border: '1px solid #E2E8F0', color: '#0D2B4E', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                  {introEmail.body}
                </div>
              </div>
              <div className="rounded-xl px-3 py-2.5" style={{ backgroundColor: '#FFFBEB', border: '1px solid #FCD34D' }}>
                <p className="text-xs leading-relaxed" style={{ color: '#78350F' }}>
                  MigraTrak doesn't have a relationship with this attorney yet — this email is from you, not us.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <a
                  href={mailtoLink}
                  onClick={markIntroSent}
                  className="w-full py-3 rounded-xl text-sm font-bold text-center transition-all active:scale-95"
                  style={{ backgroundColor: '#0D2B4E', color: '#FFFFFF', display: 'block' }}
                >
                  ✉️ Open in email app
                </a>
                <button
                  onClick={handleCopy}
                  className="w-full py-3 rounded-xl text-sm font-bold transition-all active:scale-95"
                  style={{ backgroundColor: copied ? '#D1FAE5' : '#EBF4FB', color: copied ? '#1A7A4A' : '#1B5FA8' }}
                >
                  {copied ? '✓ Copied to clipboard!' : '📋 Copy email text'}
                </button>
              </div>
            </>
          ) : hasPhone ? (
            <>
              <div className="rounded-xl px-4 py-3" style={{ backgroundColor: '#EBF4FB', border: '1px solid #4A9FD4' }}>
                <p className="text-sm leading-relaxed" style={{ color: '#1B5FA8' }}>
                  We don't have a direct email for this attorney — please call them at <strong>{pro.phones[0].number}</strong> to request a consultation.
                </p>
              </div>
              <a
                href={`tel:${pro.phones[0].number.replace(/\D/g,'')}`}
                onClick={markIntroSent}
                className="w-full py-3 rounded-xl text-sm font-bold text-center transition-all active:scale-95"
                style={{ backgroundColor: '#1A7A4A', color: '#FFFFFF', display: 'block' }}
              >
                📞 Call {pro.phones[0].number}
              </a>
            </>
          ) : (
            <div className="rounded-xl px-4 py-3" style={{ backgroundColor: '#F7F9FC', border: '1px solid #E2E8F0' }}>
              <p className="text-sm" style={{ color: '#4A5568' }}>Contact details not available yet. Check back soon.</p>
            </div>
          )}

          <button
            onClick={() => generateScorecardPDF(prospect, pro.name, pro.firm)}
            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
            style={{ backgroundColor: '#F1F5F9', color: '#4A5568', border: '1px solid #E2E8F0' }}
          >
            📄 Download scorecard PDF
          </button>
        </div>
      </div>
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

function ProfessionalCard({ pro, initialOpen, presignup, presignupVisa, presignupDest, onIntroReady }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(initialOpen)
  const [requested, setRequested] = useState(false)
  const [requesting, setRequesting] = useState(false)

  function handlePresignupSelect() {
    try {
      localStorage.setItem('migratrak_selected_attorney', pro.has_account ? (pro.supabase_id || '') : '')
    } catch {}
    navigate('/auth', {
      state: { mode: 'signup', visa_type: presignupVisa || '', destination_state: presignupDest || '' }
    })
  }

  async function handleRequest() {
    if (requested || requesting) return
    setRequesting(true)
    try {
      try { localStorage.setItem('migratrak_selected_attorney', pro.has_account ? (pro.supabase_id || '') : '') } catch {}

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/auth', { state: { mode: 'signup', visa_type: presignupVisa || '', destination_state: presignupDest || '' } })
        return
      }

      const { data: profile } = await supabase.from('users').select('name, email, visa_type').eq('id', user.id).single()
      const answers = (() => { try { return JSON.parse(localStorage.getItem('migratrak_answers') || '{}') } catch { return {} } })()

      const res = await fetch('/api/score-prospect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile?.name || user.email,
          email: profile?.email || user.email,
          visa_type: profile?.visa_type || answers.visa_type || null,
          budget_range: answers.budget || null,
          destination_state: null,
          assessment_answers: answers,
          attorney_id: pro.has_account && pro.supabase_id ? pro.supabase_id : null,
          professional_name: pro.name,
        }),
      })
      const data = res.ok ? await res.json() : null
      if (data?.prospect && onIntroReady) {
        onIntroReady(pro, data)
      }
      setRequested(true)
    } catch {
      setRequested(true)
    } finally {
      setRequesting(false)
    }
  }

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-sm"
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
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
              style={{ backgroundColor: '#EBF4FB', color: '#1B5FA8' }}
            >
              {pro.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-base font-extrabold leading-tight" style={{ color: '#0D2B4E' }}>
                  {pro.name}
                </p>
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
            {pro.phones && pro.phones.length > 0 ? (
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
            ) : (
              <div className="flex gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider w-20 flex-shrink-0 pt-0.5" style={{ color: '#4A5568' }}>Phone</span>
                <p className="text-sm" style={{ color: '#94A3B8' }}>Coming soon</p>
              </div>
            )}
            {pro.email ? (
              <div className="flex gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider w-20 flex-shrink-0 pt-0.5" style={{ color: '#4A5568' }}>Email</span>
                <a href={`mailto:${pro.email}`} className="text-sm font-semibold" style={{ color: '#1B5FA8' }}>{pro.email}</a>
              </div>
            ) : (
              <div className="flex gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider w-20 flex-shrink-0 pt-0.5" style={{ color: '#4A5568' }}>Email</span>
                <p className="text-sm" style={{ color: '#94A3B8' }}>Coming soon</p>
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
            {/* Call Now (Mena only) + Request Introduction */}
            <div className="flex gap-2">
              {pro.phones && pro.phones.length > 0 && (
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
            {presignup ? (
              <button
                onClick={handlePresignupSelect}
                className="w-full py-3 rounded-xl text-sm font-bold transition-all active:scale-95"
                style={{ backgroundColor: '#F0A500', color: '#0D2B4E' }}
              >
                Select this attorney →
              </button>
            ) : (
              <button
                onClick={handleRequest}
                disabled={requesting}
                className="w-full py-3 rounded-xl text-sm font-bold transition-all active:scale-95"
                style={{
                  backgroundColor: requested ? '#D1FAE5' : '#F0A500',
                  color: requested ? '#1A7A4A' : '#0D2B4E',
                  opacity: requesting ? 0.7 : 1,
                }}
              >
                {requesting ? 'Sending…' : requested ? `✓ ${pro.primaryAction || 'Request Introduction'} confirmed` : `${pro.primaryAction || 'Request Introduction'} →`}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Collapsed action strip */}
      {!open && (
        <div className="flex gap-2 px-5 pb-4">
          {presignup ? (
            <button
              onClick={handlePresignupSelect}
              className="flex-1 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
              style={{ backgroundColor: '#F0A500', color: '#0D2B4E' }}
            >
              Select this attorney →
            </button>
          ) : (
            <button
              onClick={handleRequest}
              disabled={requesting}
              className="flex-1 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
              style={{
                backgroundColor: requested ? '#D1FAE5' : '#F0A500',
                color: requested ? '#1A7A4A' : '#0D2B4E',
                opacity: requesting ? 0.7 : 1,
              }}
            >
              {requesting ? '…' : requested ? '✓ Done' : (pro.primaryAction || 'Request Intro') + ' →'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function J5Directory() {
  const { state } = useLocation()
  const presignup = state?.presignup === true
  const presignupVisa = state?.visa_type || ''
  const presignupDest = state?.destination_state || ''

  const filterMap = { attorneys: 'Attorneys', cpas: 'CPAs', 'financial-advisors': 'Financial Advisors', healthcare: 'Healthcare', 'vehicle-import': 'Vehicle Import' }
  const initialFilter = presignup ? 'Attorneys' : (filterMap[state?.filter] ?? 'All')
  const [activeFilter, setActiveFilter] = useState(initialFilter)
  const [activeState, setActiveState] = useState('All States')
  const [introModal, setIntroModal] = useState(null) // { pro, prospect, introEmail }

  function handleIntroReady(pro, data) {
    setIntroModal({ pro, prospect: data.prospect, introEmail: data.intro_email })
  }

  const filtered = PROFESSIONALS.filter((p) => {
    const categoryMatch = activeFilter === 'All' || p.category === activeFilter
    const stateMatch = activeState === 'All States' || (p.location && p.location.endsWith(`, ${STATE_ABBR[activeState]}`))
    return categoryMatch && stateMatch
  })

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F9FC' }}>

      {/* Header */}
      <div className="px-5 pt-5 pb-4" style={{ backgroundColor: '#0D2B4E' }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#4A9FD4' }}>
          {presignup ? 'Step 1 of 2' : 'Professional Directory'}
        </p>
        <h1 className="text-2xl font-extrabold" style={{ color: '#FFFFFF' }}>
          {presignup ? 'Choose your immigration specialist' : 'Find the Right Professional'}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
          {presignup ? 'Select a specialist below — we\'ll connect you after you create your account.' : 'Vetted specialists who understand the Canadian to US journey'}
        </p>
      </div>

      {/* Pre-signup banner */}
      {presignup && (
        <div className="px-4 py-3" style={{ backgroundColor: '#EBF4FB', borderBottom: '1px solid #4A9FD4' }}>
          <p className="text-xs font-semibold" style={{ color: '#1B5FA8' }}>
            Tap "Select this attorney" on any card below, then we'll take you straight to account creation.
          </p>
        </div>
      )}

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

      {/* State filter bar */}
      <div
        className="flex gap-2 px-4 py-2.5 overflow-x-auto"
        style={{ backgroundColor: '#F7F9FC', borderBottom: '1px solid #E2E8F0', scrollbarWidth: 'none' }}
      >
        {STATE_FILTERS.map((s) => {
          const isActive = s === activeState
          return (
            <button
              key={s}
              onClick={() => setActiveState(s)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95"
              style={{
                backgroundColor: isActive ? '#EBF4FB' : '#FFFFFF',
                color: isActive ? '#1B5FA8' : '#4A5568',
                border: isActive ? '1.5px solid #1B5FA8' : '1.5px solid #E2E8F0',
              }}
            >
              {s}
            </button>
          )
        })}
      </div>

      {/* Directory disclaimer */}
      <div className="px-4 py-2.5" style={{ borderBottom: '1px solid #F1F5F9' }}>
        <p className="text-xs leading-relaxed" style={{ color: '#94A3B8' }}>
          Directory listings are for informational purposes only. MigraTrak does not endorse or guarantee the services of any listed professional. Always verify credentials independently.
        </p>
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
            <ProfessionalCard
              key={pro.id}
              pro={pro}
              initialOpen={pro.expanded}
              presignup={presignup}
              presignupVisa={presignupVisa}
              presignupDest={presignupDest}
              onIntroReady={handleIntroReady}
            />
          ))
        )}

      </div>

      <TabBar active="directory" />

      {introModal && (
        <IntroModal
          pro={introModal.pro}
          prospect={introModal.prospect}
          introEmail={introModal.introEmail}
          onClose={() => setIntroModal(null)}
        />
      )}
    </div>
  )
}
