import { useState } from 'react';
import { format } from 'date-fns';

interface OnboardingProps {
  onComplete: (data: {
    lastPeriodStart: Date;
    cycleLength: number;
    periodLength: number;
  }) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [lastPeriodStart, setLastPeriodStart] = useState<Date>(new Date());
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({
      lastPeriodStart,
      cycleLength,
      periodLength,
    });
  };

  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center text-pink-600 mb-8">
          {step === 1 && "Quando è iniziato il tuo ultimo ciclo?"}
          {step === 2 && "Quanto dura in media il tuo ciclo?"}
          {step === 3 && "Quanto durano in media le tue mestruazioni?"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <div>
              <input
                type="date"
                value={format(lastPeriodStart, 'yyyy-MM-dd')}
                onChange={(e) => setLastPeriodStart(new Date(e.target.value))}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>
          )}

          {step === 2 && (
            <div>
              <input
                type="number"
                value={cycleLength}
                onChange={(e) => setCycleLength(Number(e.target.value))}
                min="20"
                max="40"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
              <p className="text-sm text-gray-500 mt-2">
                La durata media è di 28 giorni
              </p>
            </div>
          )}

          {step === 3 && (
            <div>
              <input
                type="number"
                value={periodLength}
                onChange={(e) => setPeriodLength(Number(e.target.value))}
                min="2"
                max="10"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
              <p className="text-sm text-gray-500 mt-2">
                La durata media è di 5 giorni
              </p>
            </div>
          )}

          <div className="flex justify-between">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 text-pink-600 hover:text-pink-700"
              >
                Indietro
              </button>
            )}
            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
              >
                Avanti
              </button>
            ) : (
              <button
                type="submit"
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
              >
                Inizia
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
} 