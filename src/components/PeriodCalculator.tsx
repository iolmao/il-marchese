import { useState } from 'react';
import { format, addDays, differenceInDays, subDays, isSameDay, startOfDay, isSameMonth } from 'date-fns';
import { it } from 'date-fns/locale';

interface PeriodCalculatorProps {
  lastPeriodStart: Date;
  cycleLength: number;
  periodLength: number;
  onReset: () => void;
}

interface CalendarDay {
  date: Date;
  isPeriod: boolean;
  isSelected: boolean;
  isNextMonth: boolean;
  isBeforeLastPeriod: boolean;
}

export default function PeriodCalculator({
  lastPeriodStart,
  cycleLength,
  periodLength,
  onReset,
}: PeriodCalculatorProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [result, setResult] = useState<{
    willHavePeriod: boolean;
    message: string;
    confidence: 'high' | 'medium' | 'low';
    daysUntilNextPeriod?: number;
    daysSinceLastPeriod?: number;
  } | null>(null);

  const handlePreviousMonth = () => {
    const newDate = subDays(selectedDate, 30);
    setSelectedDate(newDate);
    calculatePeriod(newDate);
  };

  const handleNextMonth = () => {
    const newDate = addDays(selectedDate, 30);
    setSelectedDate(newDate);
    calculatePeriod(newDate);
  };

  const generateCalendarDays = (centerDate: Date): CalendarDay[] => {
    const days: CalendarDay[] = [];
    const startDate = subDays(centerDate, 15);
    
    for (let i = 0; i < 31; i++) {
      const currentDate = addDays(startDate, i);
      const daysSinceLastPeriod = differenceInDays(currentDate, lastPeriodStart);
      const isBeforeLastPeriod = daysSinceLastPeriod < 0;
      const dayInCycle = Math.abs(daysSinceLastPeriod) % cycleLength;
      const isPeriod = !isBeforeLastPeriod && dayInCycle < periodLength;
      const isNextMonth = !isSameMonth(currentDate, centerDate);
      
      days.push({
        date: currentDate,
        isPeriod,
        isSelected: isSameDay(currentDate, selectedDate),
        isNextMonth,
        isBeforeLastPeriod
      });
    }
    
    return days;
  };

  const calculatePeriod = (date: Date) => {
    const daysSinceLastPeriod = differenceInDays(date, lastPeriodStart);
    const dayInCycle = daysSinceLastPeriod % cycleLength;
    
    // Calcola i giorni fino al prossimo ciclo
    const daysUntilNextPeriod = cycleLength - dayInCycle;
    
    if (dayInCycle < periodLength) {
      setResult({
        willHavePeriod: true,
        message: `Meglio stare dove stai. 🩸\nIl Marchese sarà già lì da ${dayInCycle} giorni.`,
        confidence: 'high',
        daysSinceLastPeriod: dayInCycle
      });
    } else if (dayInCycle >= cycleLength - 7) {
      setResult({
        willHavePeriod: false,
        message: `No, ma la visita del Marchese è prossima ⏰\nArriverà in ${daysUntilNextPeriod} giorni`,
        confidence: 'medium',
        daysUntilNextPeriod
      });
    } else {
      setResult({
        willHavePeriod: false,
        message: `No, dovresti essere tranquilla! 😌\nIl Marchese ti visiterà ${daysUntilNextPeriod} giorni la data selezionata`,
        confidence: 'high',
        daysUntilNextPeriod
      });
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    setSelectedDate(newDate);
    calculatePeriod(newDate);
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    calculatePeriod(date);
  };

  const formatDate = (date: Date) => {
    return format(date, 'dd MMMM yyyy', { locale: it });
  };

  const calendarDays = generateCalendarDays(selectedDate);
  const startMonth = format(calendarDays[0].date, 'MMMM', { locale: it });
  const endMonth = format(calendarDays[calendarDays.length - 1].date, 'MMMM', { locale: it });
  const monthRange = startMonth === endMonth ? startMonth : `${startMonth} - ${endMonth}`;

  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 md:p-8 w-full max-w-2xl mx-2 sm:mx-4">
        <h1 className="text-xl sm:text-2xl font-bold text-center text-pink-600 mb-4 sm:mb-8">
          Quando vuoi sapere se arriverà il marchese?
        </h1>

        <div className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Seleziona una data
            </label>
            <input
              type="date"
              value={format(selectedDate, 'yyyy-MM-dd')}
              onChange={handleDateChange}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm sm:text-base"
            />
          </div>

          {result && (
            <div
              className={`p-3 sm:p-4 rounded-lg ${
                result.willHavePeriod
                  ? 'bg-pink-100 text-pink-800'
                  : 'bg-green-100 text-green-800'
              }`}
            >
              <p className="text-base sm:text-lg font-medium whitespace-pre-line">{result.message}</p>
              <p className="text-xs sm:text-sm mt-1 sm:mt-2">
                Confidenza: {result.confidence === 'high' ? 'Alta' : 'Media'}
              </p>
            </div>
          )}

          <div className="mt-6 sm:mt-8">
            <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-1 sm:mb-2">Calendario</h2>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <button
                onClick={handlePreviousMonth}
                className="p-1 sm:p-2 text-gray-600 hover:text-pink-600 transition-colors"
                aria-label="Mese precedente"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <p className="text-xs sm:text-sm text-gray-500">{monthRange}</p>
              <button
                onClick={handleNextMonth}
                className="p-1 sm:p-2 text-gray-600 hover:text-pink-600 transition-colors"
                aria-label="Mese successivo"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map((day) => (
                <div key={day} className="text-center text-xs sm:text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
              {calendarDays.map((day, index) => (
                <div
                  key={index}
                  onClick={() => handleDayClick(day.date)}
                  className={`p-1 sm:p-2 text-center rounded-lg text-xs sm:text-sm cursor-pointer transition-colors ${
                    day.isSelected
                      ? day.isPeriod
                        ? 'bg-pink-600 text-white'
                        : 'border-2 border-pink-600 text-pink-600'
                      : day.isBeforeLastPeriod
                      ? 'bg-gray-200 text-gray-500'
                      : day.isPeriod
                      ? day.isNextMonth
                        ? 'bg-pink-50 text-pink-400 hover:bg-pink-100'
                        : 'bg-pink-100 text-pink-800 hover:bg-pink-200'
                      : day.isNextMonth
                      ? 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {format(day.date, 'd')}
                </div>
              ))}
            </div>
            <div className="mt-3 sm:mt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-pink-100 rounded mr-1 sm:mr-2"></div>
                <span>Giorni del ciclo</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-pink-600 rounded mr-1 sm:mr-2"></div>
                <span>Data selezionata</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-100 rounded mr-1 sm:mr-2"></div>
                <span>Mese diverso</span>
              </div>
            </div>
          </div>

          <div className="text-xs sm:text-sm text-gray-500 mt-4">
            <p>Ultimo ciclo: {formatDate(lastPeriodStart)}</p>
            <p>Durata ciclo: {cycleLength} giorni</p>
            <p>Durata mestruazioni: {periodLength} giorni</p>
          </div>

          <div className="mt-6 sm:mt-8 pt-4 border-t border-gray-200">
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full px-4 py-2 text-sm sm:text-base text-pink-600 border border-pink-600 rounded-lg hover:bg-pink-50"
            >
              Ricomincia da capo
            </button>
          </div>
        </div>

        {showResetConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full mx-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                Sei sicura di voler ricominciare?
              </h3>
              <p className="text-sm text-gray-600 mb-4 sm:mb-6">
                Tutti i dati inseriti verranno cancellati e dovrai ricominciare da capo.
              </p>
              <div className="flex space-x-3 sm:space-x-4">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annulla
                </button>
                <button
                  onClick={() => {
                    setShowResetConfirm(false);
                    onReset();
                  }}
                  className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base bg-pink-600 text-white rounded-lg hover:bg-pink-700"
                >
                  Conferma
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 