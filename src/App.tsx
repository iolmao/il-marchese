import { useState } from 'react'
import Onboarding from './components/Onboarding'
import PeriodCalculator from './components/PeriodCalculator'

interface UserData {
  lastPeriodStart: Date
  cycleLength: number
  periodLength: number
}

function App() {
  const [userData, setUserData] = useState<UserData | null>(() => {
    const saved = localStorage.getItem('periodData')
    if (saved) {
      const data = JSON.parse(saved)
      return {
        ...data,
        lastPeriodStart: new Date(data.lastPeriodStart),
      }
    }
    return null
  })

  const handleOnboardingComplete = (data: UserData) => {
    setUserData(data)
    localStorage.setItem('periodData', JSON.stringify(data))
  }

  const handleReset = () => {
    setUserData(null)
    localStorage.removeItem('periodData')
  }

  if (!userData) {
    return <Onboarding onComplete={handleOnboardingComplete} />
  }

  return <PeriodCalculator {...userData} onReset={handleReset} />
}

export default App
