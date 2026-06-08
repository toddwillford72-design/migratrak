import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const USCIS_URL = 'https://egov.uscis.gov/casestatus/landing.do'

const TABS = [
  { id: 'dashboard', label: 'Dashboard', path: '/j1' },
  { id: 'expenses',  label: 'Expenses',  path: '/j2' },
  { id: 'documents', label: 'Documents', path: '/j3' },
  { id: 'coach',     label: 'AI Coach',  path: '/j4' },
  { id: 'directory', label: 'Directory', path: '/j5' },
  { id: 'essentials',label: 'Essentials',path: '/j6' },
  { id: 'help',      label: 'Help',      path: '/a2' },
]

const QA = [
  {
    id: 'mandamus',
    chip: 'What is a Writ of Mandamus?',
    user: 'What is a Writ of Mandamus and when should I file one?',
    ai: [
      'A Writ of Mandamus is a federal court petition asking a judge to compel USCIS to make a decision on your long-pending case.',
      'It is appropriate when your case has been pending significantly longer than USCIS published processing times and service requests have not resolved the delay.',
      'Filing typically costs $5,000 to $15,000 in attorney fees but has a strong track record of accelerating decisions. Ask your attorney whether your case qualifies.',
    ],
  },
  {
    id: 'congressional',
    chip: 'How do I file a congressional inquiry?',
    user: 'How do I file a congressional office inquiry to accelerate my case?',
    ai: [
      'This is one of the most effective tools almost nobody knows about — and it is completely free. Here is exactly what to do:',
      '1. Go to house.gov and find your US Representative\n2. Call their local district office\n3. Say: "I have a pending immigration case and I would like to request a congressional inquiry to USCIS"\n4. Give them your case number and receipt number',
      'USCIS responds to congressional inquiries differently than regular service requests. Most applicants never know this option exists.',
    ],
  },
  {
    id: 'ssn',
    chip: 'When can I apply for my SSN?',
    user: 'When exactly can I apply for my SSN after arrival?',
    ai: [
      'You can apply for an SSN after you arrive in the US and have your immigration documents. Bring your passport, visa stamp, I-94 record, and any employment authorization document.',
      'Apply in person at your local Social Security Administration office. Important: call 2 weeks after applying to confirm there are no documentation issues — errors can delay your SSN for months if uncaught.',
      'No SSN means no US bank account, no credit history, and delays with your employer.',
    ],
  },
  {
    id: 'i94',
    chip: 'What happens if my I-94 has an error?',
    user: 'What happens if my I-94 has an error?',
    ai: [
      'First verify your I-94 record at cbp.dhs.gov — errors happen at the border more often than people realize.',
      'If your record is incorrect, contact CBP to have it corrected immediately. An incorrect I-94 can prevent you from completing your medical examination, opening a US bank account, and applying for your SSN.',
      'Fix it as early as possible.',
    ],
  },
]

function Disclaimer() {
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-xl mt-2"
      style={{ backgroundColor: '#FEF3C7' }}
    >
      <span className="text-xs">⚠️</span>
      <p className="text-xs font-semibold italic" style={{ color: '#92400E' }}>
        Not legal advice — confirm with your attorney
      </p>
    </div>
  )
}

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

function UserBubble({ text }) {
  return (
    <div className="flex justify-end">
      <div
        className="max-w-[80%] px-4 py-3 rounded-2xl rounded-tr-sm"
        style={{ backgroundColor: '#1B5FA8' }}
      >
        <p className="text-sm leading-relaxed" style={{ color: '#FFFFFF' }}>{text}</p>
      </div>
    </div>
  )
}

function AIBubble({ paragraphs, showDisclaimer, isTyping }) {
  return (
    <div className="flex gap-2 items-start">
      <div
        className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1"
        style={{ backgroundColor: '#0D2B4E' }}
      >
        <span className="text-sm">🤖</span>
      </div>
      <div className="flex-1">
        <div
          className="px-4 py-3 rounded-2xl rounded-tl-sm"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}
        >
          {isTyping ? (
            <div className="flex gap-1 items-center py-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: '#4A9FD4',
                    animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {paragraphs.map((p, i) => (
                <p key={i} className="text-sm leading-relaxed whitespace-pre-line" style={{ color: '#0D2B4E' }}>
                  {p}
                </p>
              ))}
            </div>
          )}
        </div>
        {showDisclaimer && !isTyping && <Disclaimer />}
      </div>
    </div>
  )
}

export default function J4Coach() {
  const [messages, setMessages]     = useState([])
  const [input, setInput]           = useState('')
  const [typingId, setTypingId]     = useState(null)
  const [usedChips, setUsedChips]   = useState(new Set())
  const bottomRef                   = useRef(null)
  const inputRef                    = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typingId])

  function fireQA(qa) {
    if (usedChips.has(qa.id)) return
    setUsedChips((prev) => new Set([...prev, qa.id]))

    // Add user message
    setMessages((prev) => [...prev, { type: 'user', text: qa.user, id: Date.now() }])

    // Show typing indicator then AI response
    const typId = qa.id + Date.now()
    setTypingId(typId)
    setTimeout(() => {
      setTypingId(null)
      setMessages((prev) => [
        ...prev,
        { type: 'ai', paragraphs: qa.ai, showDisclaimer: true, id: Date.now() },
      ])
    }, 1400)
  }

  function handleSend() {
    const text = input.trim()
    if (!text) return

    // Match against known questions (loose)
    const matched = QA.find((q) =>
      text.toLowerCase().includes(q.id) ||
      q.chip.toLowerCase().includes(text.toLowerCase().slice(0, 10))
    )

    setMessages((prev) => [...prev, { type: 'user', text, id: Date.now() }])
    setInput('')
    inputRef.current?.blur()

    const typId = 'custom' + Date.now()
    setTypingId(typId)

    setTimeout(() => {
      setTypingId(null)
      if (matched && !usedChips.has(matched.id)) {
        setUsedChips((prev) => new Set([...prev, matched.id]))
        setMessages((prev) => [
          ...prev,
          { type: 'ai', paragraphs: matched.ai, showDisclaimer: true, id: Date.now() },
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          {
            type: 'ai',
            paragraphs: [
              'That\'s a great question for your immigration journey. For your specific situation, I\'d recommend discussing this directly with your immigration specialist who has the full context of your case.',
              'In the meantime, try one of the suggested questions above — they cover some of the most important topics for EB-5 applicants.',
            ],
            showDisclaimer: true,
            id: Date.now(),
          },
        ])
      }
    }, 1400)
  }

  const showChips = messages.length === 0

  return (
    <>
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>

      <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F9FC' }}>

        {/* Header */}
        <div className="px-5 pt-5 pb-4" style={{ backgroundColor: '#0D2B4E' }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-extrabold" style={{ color: '#FFFFFF' }}>
                MigraTrak AI Coach
              </h1>
              <p className="text-xs mt-0.5 leading-snug" style={{ color: 'rgba(255,255,255,0.55)' }}>
                Educational guidance — not legal advice.{'\n'}Always confirm specifics with your attorney.
              </p>
            </div>
            <a
              href={USCIS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-opacity active:opacity-70"
              style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: '#4A9FD4' }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4" />
                <path d="M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              USCIS Status
            </a>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2" style={{ paddingBottom: showChips ? 180 : 120 }}>

          {/* Empty state */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center text-center gap-3 py-6">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#EBF4FB' }}
              >
                <span className="text-3xl">🤖</span>
              </div>
              <div>
                <p className="text-base font-extrabold" style={{ color: '#0D2B4E' }}>
                  Ask me anything about your journey
                </p>
                <p className="text-xs mt-1" style={{ color: '#4A5568' }}>
                  I know EB-5, E-2, TN, timelines, costs, and more
                </p>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex flex-col gap-4">
            {messages.map((msg) =>
              msg.type === 'user'
                ? <UserBubble key={msg.id} text={msg.text} />
                : <AIBubble key={msg.id} paragraphs={msg.paragraphs} showDisclaimer={msg.showDisclaimer} />
            )}
            {typingId && <AIBubble paragraphs={[]} isTyping />}
          </div>

          <div ref={bottomRef} />
        </div>

        {/* Suggested chips */}
        {showChips && (
          <div
            className="px-4 pb-3 pt-2"
            style={{ backgroundColor: '#F7F9FC' }}
          >
            <p className="text-xs font-extrabold uppercase tracking-widest mb-2" style={{ color: '#4A5568' }}>
              Suggested questions
            </p>
            <div className="flex flex-col gap-2">
              {QA.map((qa) => (
                <button
                  key={qa.id}
                  onClick={() => fireQA(qa)}
                  className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all active:scale-[0.98]"
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    color: '#1B5FA8',
                  }}
                >
                  {qa.chip} →
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chips after chat started — compact horizontal scroll */}
        {!showChips && (
          <div
            className="px-4 py-2 flex gap-2 overflow-x-auto"
            style={{ scrollbarWidth: 'none', backgroundColor: '#F7F9FC', borderTop: '1px solid #E2E8F0' }}
          >
            {QA.filter((qa) => !usedChips.has(qa.id)).map((qa) => (
              <button
                key={qa.id}
                onClick={() => fireQA(qa)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95"
                style={{ backgroundColor: '#EBF4FB', color: '#1B5FA8', border: '1px solid #4A9FD4' }}
              >
                {qa.chip}
              </button>
            ))}
          </div>
        )}

        {/* Input bar */}
        <div
          className="px-4 py-3 flex gap-2 items-end"
          style={{
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid #E2E8F0',
            paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))',
            marginBottom: 44,
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything about your journey..."
            className="flex-1 px-4 py-3 rounded-2xl text-sm outline-none"
            style={{
              backgroundColor: '#F7F9FC',
              border: '2px solid #E2E8F0',
              color: '#0D2B4E',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#1B5FA8')}
            onBlur={(e) => (e.target.style.borderColor = '#E2E8F0')}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all active:scale-95"
            style={{
              backgroundColor: input.trim() ? '#1B5FA8' : '#E2E8F0',
              color: input.trim() ? '#FFFFFF' : '#A0AEC0',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13" />
              <path d="M22 2L15 22l-4-9-9-4 20-7z" />
            </svg>
          </button>
        </div>

        <TabBar active="coach" />
      </div>
    </>
  )
}
