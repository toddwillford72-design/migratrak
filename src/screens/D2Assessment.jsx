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
      'Me and my children (no spouse or partner)',
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
    showIf: (answers) => answers.household === 'Me, spouse, and children' || answers.household === 'Me and my children (no spouse or partner)',
  },
  {
    id: 'num_children',
    text: 'How many children are coming with you?',
    options: ['1', '2', '3', '4', '5 or more'],
    showIf: (answers) => answers.children?.startsWith('Yes'),
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
  {
    id: 'fund_source',
    text: 'What is the primary source of your investment funds?',
    options: [
      'Savings / cash on hand',
      'Sale of a business',
      'Sale of property (e.g., your home)',
      'RRSP, RRIF, or investment accounts',
      'Home equity loan or line of credit (HELOC)',
      'Gift or inheritance from family',
      'Not sure yet',
    ],
    showIf: (answers) => answers.motivation === 'Buying or starting a business',
  },
  {
    id: 'fund_readiness',
    text: 'Are these funds accessible right now, or would you need to sell, withdraw, or borrow first?',
    options: [
      'Accessible now — funds are liquid and in hand',
      'Mostly accessible — would take some time (e.g., selling property, RRSP withdrawal)',
      'Not yet — I would need to arrange financing or sell major assets first',
      'Not sure',
    ],
    showIf: (answers) => answers.motivation === 'Buying or starting a business',
  },
  {
    id: 'professional_background',
    text: 'Do any of these describe your professional background?',
    options: [
      'I work in a profession on the USMCA professional list (engineer, accountant, teacher, scientist, etc.)',
      'I have notable achievements, awards, or recognition in my field',
      'I have a job offer (or strong prospects) from a US employer',
      "None of these — I'm exploring investment or starting fresh",
      'Not sure',
    ],
    showIf: (answers) => answers.motivation === 'Lifestyle — I want a fresh start',
  },
  {
    id: 'family_situation',
    text: 'Are you engaged to a US citizen and planning to marry within 90 days of moving to the US?',
    options: [
      'Yes',
      'No — but I have other family ties to the US',
      'Not sure',
    ],
    showIf: (answers) => answers.motivation === 'Family reasons',
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

  // Visible questions are those whose showIf passes (or have no showIf)
  const visibleQuestions = QUESTIONS.filter((q) => !q.showIf || q.showIf(answers))
  const visibleIndex = visibleQuestions.findIndex((vq) => vq.id === q.id)
  const total = visibleQuestions.length
  const displayStep = visibleIndex + 1
  const isLast = visibleIndex === total - 1

  function nextStep(fromStep, newAnswers) {
    let next = fromStep + 1
    while (next < QUESTIONS.length && QUESTIONS[next].showIf && !QUESTIONS[next].showIf(newAnswers)) {
      next++
    }
    return next
  }

  function prevStep(fromStep) {
    let prev = fromStep - 1
    while (prev > 0 && QUESTIONS[prev].showIf && !QUESTIONS[prev].showIf(answers)) {
      prev--
    }
    return prev
  }

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
      const next = nextStep(step, newAnswers)
      if (next >= QUESTIONS.length) {
        try { localStorage.setItem('migratrak_answers', JSON.stringify(newAnswers)) } catch (_) {}
        navigate('/d3', { state: { answers: newAnswers } })
      } else {
        setStep(next)
        setSelected(newAnswers[QUESTIONS[next].id] ?? null)
      }
    }
  }

  function handleBack() {
    if (step === 0) {
      navigate('/')
    } else {
      const prev = prevStep(step)
      setStep(prev)
      setSelected(answers[QUESTIONS[prev].id] ?? null)
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
