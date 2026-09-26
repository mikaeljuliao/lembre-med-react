const MINUTE_MS = 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

function pad(value) {
  return String(value).padStart(2, '0');
}

export function getLocalDateString(date = new Date()) {
  return [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join('-');
}

export function parseClockTime(value) {
  const match = String(value || '').trim().match(/^(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = Number(match[3] || 0);
  if (hours > 23 || minutes > 59 || seconds > 59) return null;
  return { hours, minutes, seconds };
}

export function createLocalDate(date, clockTime) {
  const parsed = parseClockTime(clockTime);
  if (!parsed) return null;
  const result = new Date(date);
  result.setHours(parsed.hours, parsed.minutes, parsed.seconds, 0);
  return result;
}

export function formatClockTime(date, includeSeconds = false) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '--:--';
  return includeSeconds ? pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds()) : pad(date.getHours()) + ':' + pad(date.getMinutes());
}

export function addMinutes(date, minutes) {
  return new Date(date.getTime() + Number(minutes) * MINUTE_MS);
}

export function resolveNextScheduledAt(selection, referenceDate = new Date()) {
  const value = String(selection || '').trim().toLowerCase();
  if (value === 'agora') return new Date(referenceDate);
  if (/^\d+$/.test(value)) return addMinutes(referenceDate, Number(value));
  const targetToday = createLocalDate(referenceDate, value);
  if (!targetToday) return null;
  const referenceMinute = new Date(referenceDate);
  referenceMinute.setSeconds(0, 0);
  if (targetToday.getTime() >= referenceMinute.getTime()) return targetToday;
  const targetTomorrow = new Date(targetToday);
  targetTomorrow.setDate(targetTomorrow.getDate() + 1);
  return targetTomorrow;
}

export function resolveReminderSelection(selection, referenceDate = new Date()) {
  const scheduledAt = resolveNextScheduledAt(selection, referenceDate);
  if (!scheduledAt) return null;
  const rawSelection = String(selection || '').trim().toLowerCase();
  return {
    scheduledAt,
    horario: formatClockTime(scheduledAt),
    dataInicio: getLocalDateString(scheduledAt),
    tipo: /^\d+$/.test(rawSelection) || rawSelection === 'agora' ? 'relative' : 'scheduled',
  };
}

function createDateFromStoredDose(dose) {
  const parsedDate = String(dose?.data || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!parsedDate) return null;
  const baseDate = new Date(Number(parsedDate[1]), Number(parsedDate[2]) - 1, Number(parsedDate[3]), 0, 0, 0, 0);
  return createLocalDate(baseDate, dose?.horario || '00:00');
}

export function isDoseForActiveMedication(dose, medications = []) {
  const medicationIds = new Set(
    medications.map((medication) => String(medication?.id || ''))
  );

  if (dose?.medicationId) {
    return medicationIds.has(String(dose.medicationId));
  }

  const doseName = String(dose?.medicationNome || '').trim().toLowerCase();

  return medications.some(
    (medication) =>
      String(medication?.nome || '').trim().toLowerCase() === doseName
  );
}

export function getDoseTarget(dose) {
  if (dose?.snoozedUntil) {
    const snoozedTarget = new Date(dose.snoozedUntil);
    if (!Number.isNaN(snoozedTarget.getTime())) return snoozedTarget;
  }
  if (dose?.scheduledAt) {
    const scheduledTarget = new Date(dose.scheduledAt);
    if (!Number.isNaN(scheduledTarget.getTime())) return scheduledTarget;
  }
  const storedTarget = createDateFromStoredDose(dose);
  if (storedTarget) return storedTarget;
  return new Date();
}

export function getReminderState(dose, now = new Date()) {
  const target = getDoseTarget(dose);
  const remainingMs = target.getTime() - now.getTime();
  return { ...dose, target, remainingMs, isDue: remainingMs <= 0, isOverdue: remainingMs < 0 };
}

function getDoseCalendarDate(dose) {
  const storedDate = String(dose?.data || '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(storedDate)) return storedDate;

  if (dose?.scheduledAt) {
    const scheduledAt = new Date(dose.scheduledAt);
    if (!Number.isNaN(scheduledAt.getTime())) {
      return getLocalDateString(scheduledAt);
    }
  }

  return null;
}

export function getDailyDoseSummary(doses = [], medications = [], referenceDate = new Date()) {
  const today = getLocalDateString(referenceDate);
  const activeDoses = doses.filter((dose) => {
    if (!isDoseForActiveMedication(dose, medications)) return false;

    const doseDate = getDoseCalendarDate(dose);
    return doseDate === null || doseDate === today;
  });

  return {
    total: activeDoses.length,
    taken: activeDoses.filter((dose) => dose.status === 'taken').length,
    pending: activeDoses.filter((dose) => dose.status === 'pending').length,
    skipped: activeDoses.filter((dose) => dose.status === 'skipped').length,
  };
}

export function sortReminderStates(doses) {
  return [...doses].sort((a, b) => {
    if (a.remainingMs !== b.remainingMs) return a.remainingMs - b.remainingMs;
    const nameDifference = String(a.medicationNome || '').localeCompare(String(b.medicationNome || ''), 'pt-BR');
    if (nameDifference !== 0) return nameDifference;
    return String(a.id || '').localeCompare(String(b.id || ''));
  });
}

export function formatCountdown(remainingMs) {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map(pad).join(':');
}

export function getCalendarLabel(target, now = new Date()) {
  const targetDate = getLocalDateString(target);
  const today = getLocalDateString(now);
  const tomorrowDate = new Date(now);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  if (targetDate === today) return 'Hoje';
  if (targetDate === getLocalDateString(tomorrowDate)) return 'Amanhã';
  return target.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatRemainingForUser(remainingMs) {
  if (remainingMs <= 0) return 'Está na hora';
  const totalMinutes = Math.ceil(remainingMs / MINUTE_MS);
  const totalHours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (totalHours > 0) {
    if (minutes === 0) return 'Falta ' + totalHours + ' hora' + (totalHours === 1 ? '' : 's');
    return 'Falta ' + totalHours + ' hora' + (totalHours === 1 ? '' : 's') + ' e ' + minutes + ' minuto' + (minutes === 1 ? '' : 's');
  }
  return 'Falta ' + totalMinutes + ' minuto' + (totalMinutes === 1 ? '' : 's');
}

export function formatDurationForSpeech(remainingMs) {
  if (remainingMs <= 0) return 'agora';
  const totalMinutes = Math.ceil(remainingMs / MINUTE_MS);
  if (totalMinutes === 1 && remainingMs < MINUTE_MS) return 'menos de 1 minuto';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0 && minutes > 0) return hours + ' hora' + (hours === 1 ? '' : 's') + ' e ' + minutes + ' minuto' + (minutes === 1 ? '' : 's');
  if (hours > 0) return hours + ' hora' + (hours === 1 ? '' : 's');
  return minutes + ' minuto' + (minutes === 1 ? '' : 's');
}

export function buildReminderSpeech(dose, now = new Date()) {
  const state = getReminderState(dose, now);
  const time = formatClockTime(state.target);
  const calendar = getCalendarLabel(state.target, now);
  const duration = formatDurationForSpeech(state.remainingMs);
  if (state.isDue) return 'Está na hora de tomar ' + dose.dosagem + ' de ' + dose.medicationNome + '. O horário é ' + time + '.';
  if (calendar === 'Hoje') return 'Seu lembrete de ' + dose.medicationNome + ' está marcado para hoje, às ' + time + '. Faltam ' + duration + '.';
  if (calendar === 'Amanhã') return 'Seu lembrete de ' + dose.medicationNome + ' está marcado para amanhã, às ' + time + '. Faltam ' + duration + '.';
  return 'Seu lembrete de ' + dose.medicationNome + ' está marcado para ' + calendar + ', às ' + time + '. Faltam ' + duration + '.';
}

export function getReminderDateDescription(target, now = new Date()) {
  return getCalendarLabel(target, now) + ', às ' + formatClockTime(target);
}

export const REMINDER_DAY_MS = DAY_MS;