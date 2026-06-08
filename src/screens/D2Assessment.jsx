import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { VISA_TYPES } from '../data/config'

const QUESTIONS = [
  {
    id: 'country',
    text: 'Where are you moving from?',
    options: ['Canada', 'United Kingdom', 'Australia', 'Other country'],
  },
  {
    id: 'motivation',
    text: 'What is driving your move?',
    options: [
      'Buying or starting a business',
      'My employer is transferring me',
      'Lifestyle — I want a fresh start',
      'Family reasons',
      'Not sure yet',
    ],
  },
  {
    id: 'household',
    text: 'Who is making this move?',
    options: [
      'Just me',
      'Me and my spouse or partner',
      'Me, spouse, and children',
    ],
  },
  {
    id: 'children',
    text: 'Do you have children coming with you?',
    options: [
      'No children',
      'Yes — under 18 years old',
      'Yes — aged 18, 19, or 20',
      'Yes — over 21',
    ],
    alertOption: 'Yes — aged 18, 19, or 20',
  },
  {
    id: 'budget',
    text: 'What is your approximate investment budget for this move?',
    options: [
      'Under $100,000',
      '$100,000 to $300,000',
      '$300,000 to $800,000',
      'Over $800,000',
      'Not sure yet',
    ],
    footnote: `Visa options powered by ${VISA_TYPES.map((v) => v.name).join(', ')}`,
  },
]

function ProgressBar({ step, total }) {
  return (
    <div className="px-5 pt-5 pb-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold" style={{ color: '#4A5568' }}>
          Step {step} of {total}
        </span>
        <span className="text-xs font-semibold" style={{ color: '#F0A500' }}>
          {Math.round((step / total) * 100)}%
        </span>
      </div>
      <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: '#E2E8F0' }}>
        <div
          className="h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${(step / total) * 100}%`, backgroundColor: '#F0A500' }}
        />
      </div>
    </div>
  )
}

export default function D2Assessment() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [selected, setSelected] = useState(null)

  const q = QUESTIONS[step]
  const total = QUESTIONS.length
  const displayStep = step + 1
  const isLast = step === total - 1

  function handleSelect(option) {
    setSelected(option)
  }

  function handleContinue() {
    if (!selected) return
    const newAnswers = { ...answers, [q.id]: selected }
    setAnswers(newAnswers)

    if (isLast) {
      try { localStorage.setItem('migratrak_answers', JSON.stringify(newAnswers)) } catch (_) {}
      navigate('/d3', { state: { answers: newAnswers } })
    } else {
      setStep(step + 1)
      setSelected(null)
    }
  }

  function handleBack() {
    if (step === 0) {
      navigate('/')
    } else {
      setStep(step - 1)
      setSelected(answers[QUESTIONS[step - 1].id] ?? null)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F9FC' }}>
      {/* Header */}
      <div className="flex items-center px-4 pt-4 pb-1 gap-2" style={{ backgroundColor: '#F7F9FC' }}>
        {step > 0 && (
          <button
            onClick={handleBack}
            className="flex items-center justify-center w-10 h-10 rounded-full transition-opacity active:opacity-60"
            style={{ backgroundColor: '#EBF4FB' }}
            aria-label="Go back"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0D2B4E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
        )}
        {step === 0 && <div className="w-10" />}
        <div className="flex-1">
          <ProgressBar step={displayStep} total={total} />
        </div>
      </div>

      {/* Question card */}
      <div className="flex-1 px-4 pt-4 pb-8 flex flex-col gap-4">
        <div className="rounded-2xl px-5 py-6 shadow-sm" style={{ backgroundColor: '#FFFFFF' }}>
          <h2 className="text-xl font-bold leading-snug mb-6" style={{ color: '#0D2B4E' }}>
            {q.text}
          </h2>

          <div className="flex flex-col gap-3">
            {q.options.map((option) => {
              const isActive = selected === option
              return (
                <button
                  key={option}
                  onClick={() => handleSelect(option)}
                  className="flex items-center gap-3 w-full text-left rounded-xl px-4 transition-all duration-150 active:scale-[0.98]"
                  style={{
                    minHeight: q.large ? '64px' : '52px',
                    border: `2px solid ${isActive ? '#1B5FA8' : '#E2E8F0'}`,
                    backgroundColor: isActive ? '#EBF4FB' : '#FFFFFF',
                    color: isActive ? '#0D2B4E' : '#4A5568',
                  }}
                >
                  <div
                    className="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center"
                    style={{
                      borderColor: isActive ? '#1B5FA8' : '#CBD5E0',
                      backgroundColor: isActive ? '#1B5FA8' : 'transparent',
                    }}
                  >
                    {isActive && (
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#FFFFFF' }} />
                    )}
                  </div>
                  <span
                    className="font-medium py-3 leading-snug"
                    style={{ fontSize: q.large ? '15px' : '14px' }}
                  >
                    {option}
                  </span>
                </button>
              )
            })}
          </div>

          {q.footnote && (
            <p className="mt-4 text-xs" style={{ color: '#A0AEC0' }}>
              {q.footnote}
            </p>
          )}
        </div>

        <button
          onClick={handleContinue}
          disabled={!selected}
          className="w-full py-4 rounded-2xl text-base font-bold tracking-wide transition-all active:scale-95"
          style={{
            backgroundColor: selected ? '#F0A500' : '#E2E8F0',
            color: selected ? '#0D2B4E' : '#A0AEC0',
          }}
        >
          {isLast ? 'See My Visa Options →' : 'Continue →'}
        </button>
      </div>
    </div>
  )
}
