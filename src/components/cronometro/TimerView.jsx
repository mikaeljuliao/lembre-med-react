import React, { useEffect, useMemo, useState } from 'react';

export default function TimerView() {
  const [seconds, setSeconds] = useState(15 * 60);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) return undefined;
    const timer = setInterval(() => {
      setSeconds((current) => {
        if (current <= 1) {
          setIsRunning(false);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isRunning]);

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const remainingSeconds = (seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${remainingSeconds}`;
  }, [seconds]);

  const handleReset = () => {
    setIsRunning(false);
    setSeconds(15 * 60);
  };

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 text-center">
        <p className="text-sm font-bold uppercase tracking-wide text-slate-500">Cronômetro</p>
        <div className="mt-5 text-5xl font-black text-slate-900">{formattedTime}</div>

        <div className="mt-6 flex gap-3 justify-center">
          {!isRunning ? (
            <button
              type="button"
              onClick={() => setIsRunning(true)}
              className="rounded-2xl bg-blue-600 px-6 py-3 text-white font-bold"
            >
              Iniciar
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsRunning(false)}
              className="rounded-2xl bg-slate-200 px-6 py-3 text-slate-700 font-bold"
            >
              Pausar
            </button>
          )}

          <button
            type="button"
            onClick={handleReset}
            className="rounded-2xl border border-slate-200 px-6 py-3 text-slate-700 font-bold"
          >
            Cancelar
          </button>
        </div>

        {seconds === 0 && (
          <div className="mt-5 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-emerald-800 font-bold">
            Tempo concluído.
          </div>
        )}
      </div>
    </div>
  );
}
