import { describe, expect, it } from 'vitest';
import {
  buildReminderSpeech,
  getReminderState,
  isDoseForActiveMedication,
  resolveNextScheduledAt,
  sortReminderStates,
} from './reminderEngine';

describe('reminderEngine', () => {
  it('calculates relative reminders from the exact current timestamp', () => {
    const now = new Date(2026, 8, 26, 12, 0, 30);
    const target = resolveNextScheduledAt('15', now);

    expect(target.getTime() - now.getTime()).toBe(15 * 60 * 1000);
    expect(target.getHours()).toBe(12);
    expect(target.getMinutes()).toBe(15);
    expect(target.getSeconds()).toBe(30);
  });

  it('calculates a two-hour reminder from the current timestamp', () => {
    const now = new Date(2026, 8, 26, 12, 0, 0);
    const target = resolveNextScheduledAt('120', now);

    expect(target.getHours()).toBe(14);
    expect(target.getMinutes()).toBe(0);
  });

  it('uses the same day for a future fixed time', () => {
    const now = new Date(2026, 8, 26, 12, 0, 0);
    const target = resolveNextScheduledAt('14:00', now);

    expect(target.getDate()).toBe(26);
    expect(target.getHours()).toBe(14);
  });


  it('keeps a fixed time in the current day when it is still the selected minute', () => {
    const now = new Date(2026, 8, 26, 14, 0, 30);
    const target = resolveNextScheduledAt('14:00', now);

    expect(target.getDate()).toBe(26);
    expect(target.getHours()).toBe(14);
    expect(target.getMinutes()).toBe(0);
  });

  it('moves a relative reminder across midnight using the real timestamp', () => {
    const now = new Date(2026, 8, 26, 23, 50, 0);
    const target = resolveNextScheduledAt('15', now);

    expect(target.getDate()).toBe(27);
    expect(target.getHours()).toBe(0);
    expect(target.getMinutes()).toBe(5);
  });

  it('recognizes doses belonging to active medications by id or name', () => {
    const medications = [
      { id: 'med-1', nome: 'Losartana' },
      { id: 'med-2', nome: 'Anlodipino' },
    ];

    expect(
      isDoseForActiveMedication(
        { medicationId: 'med-1', medicationNome: 'Losartana' },
        medications
      )
    ).toBe(true);

    expect(
      isDoseForActiveMedication(
        { medicationId: 'removed', medicationNome: 'Losartana' },
        medications
      )
    ).toBe(false);

    expect(
      isDoseForActiveMedication(
        { medicationNome: 'Losartana' },
        medications
      )
    ).toBe(true);

    expect(
      isDoseForActiveMedication(
        { medicationId: 'removed', medicationNome: 'Ibuprofeno' },
        medications
      )
    ).toBe(false);
  });

  it('keeps total, taken and pending counts from the same active dose set', async () => {
    const { getDailyDoseSummary } = await import('./reminderEngine');

    const medications = [{ id: 'm1', nome: 'Paracetamol' }];
    const doses = [
      { id: 'd1', medicationId: 'm1', status: 'taken' },
      { id: 'd2', medicationId: 'm1', status: 'taken' },
      { id: 'd3', medicationId: 'm1', status: 'pending' },
      { id: 'orphan', medicationId: 'removed', status: 'pending' },
    ];

    expect(getDailyDoseSummary(doses, medications)).toEqual({
      total: 3,
      taken: 2,
      pending: 1,
      skipped: 0,
    });
  });

  it('keeps a selected evening time on the same day', () => {
    const now = new Date(2026, 8, 26, 14, 35, 20);
    const target = resolveNextScheduledAt('18:45', now);

    expect(target.getDate()).toBe(26);
    expect(target.getHours()).toBe(18);
    expect(target.getMinutes()).toBe(45);
  });

  it('moves a fixed time that already passed to the next day', () => {
    const now = new Date(2026, 8, 26, 14, 0, 30);
    const target = resolveNextScheduledAt('08:00', now);

    expect(target.getDate()).toBe(27);
    expect(target.getHours()).toBe(8);
    expect(target.getMinutes()).toBe(0);
  });

  it('does not mark a future reminder as due', () => {
    const now = new Date(2026, 8, 26, 13, 59, 59);
    const dose = {
      medicationNome: 'Ibuprofeno',
      dosagem: '1 comprimido',
      scheduledAt: new Date(2026, 8, 26, 14, 0, 0).toISOString(),
    };

    expect(getReminderState(dose, now).isDue).toBe(false);
  });

  it('marks the reminder due exactly at its target', () => {
    const now = new Date(2026, 8, 26, 14, 0, 0);
    const dose = {
      medicationNome: 'Ibuprofeno',
      dosagem: '1 comprimido',
      scheduledAt: now.toISOString(),
    };

    expect(getReminderState(dose, now).isDue).toBe(true);
  });

  it('keeps the nearest reminder first', () => {
    const now = new Date(2026, 8, 26, 12, 0, 0);
    const doses = [
      {
        id: 'late',
        medicationNome: 'Paracetamol',
        scheduledAt: new Date(2026, 8, 26, 13, 0, 0).toISOString(),
        status: 'pending',
      },
      {
        id: 'near',
        medicationNome: 'Ibuprofeno',
        scheduledAt: new Date(2026, 8, 26, 12, 15, 0).toISOString(),
        status: 'pending',
      },
    ].map((dose) => getReminderState(dose, now));

    expect(sortReminderStates(doses)[0].id).toBe('near');
  });

  it('speaks future reminders as future reminders', () => {
    const now = new Date(2026, 8, 26, 12, 0, 0);
    const dose = {
      medicationNome: 'Ibuprofeno',
      dosagem: '1 comprimido',
      scheduledAt: new Date(2026, 8, 26, 14, 0, 0).toISOString(),
    };

    const speech = buildReminderSpeech(dose, now);

    expect(speech).toContain('marcado para hoje');
    expect(speech).toContain('Faltam 2 horas');
    expect(speech).not.toContain('Está na hora');
  });

  it('speaks due reminders as immediate actions', () => {
    const now = new Date(2026, 8, 26, 14, 0, 0);
    const dose = {
      medicationNome: 'Ibuprofeno',
      dosagem: '1 comprimido',
      scheduledAt: now.toISOString(),
    };

    const speech = buildReminderSpeech(dose, now);

    expect(speech).toContain('Está na hora');
    expect(speech).toContain('Ibuprofeno');
  });
});
