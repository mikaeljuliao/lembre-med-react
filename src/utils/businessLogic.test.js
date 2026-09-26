import { describe, it, expect } from 'vitest';
import {
  calculateAdherence,
  calculateStockProjection,
  generateDosesForDate,
  buildQuickReminderTreatment,
  buildMedicationTreatment,
  resolveReminderTimes,
  isSameMedication,
  sanitizeStoredData,
  normalizeMedicationName,
} from './businessLogic';

describe('businessLogic tests', () => {
  describe('calculateAdherence', () => {
    it('returns 100% adherence for empty array', () => {
      const result = calculateAdherence([]);
      expect(result.adherencePercentage).toBe(100);
      expect(result.totalDoses).toBe(0);
    });

    it('calculates adherence percentage correctly for mixed statuses', () => {
      const occurrences = [
        { status: 'taken' },
        { status: 'taken' },
        { status: 'skipped' },
        { status: 'missed' },
      ];
      const result = calculateAdherence(occurrences);
      expect(result.totalDoses).toBe(4);
      expect(result.takenDoses).toBe(2);
      // 2 taken out of 4 evaluated = 50%
      expect(result.adherencePercentage).toBe(50);
    });
  });

  describe('calculateStockProjection', () => {
    it('calculates daily consumption and estimated days correctly', () => {
      const medication = {
        id: 'med-1',
        nome: 'Paracetamol',
        quantidadeEstoque: 20,
        alertaEstoqueMinimo: 7,
      };

      const activeTreatments = [
        {
          id: 'treat-1',
          nome: 'Tratamento Dor',
          status: 'active',
          medicamentos: [
            {
              medicamentoId: 'med-1',
              nome: 'Paracetamol',
              quantidadePorDose: 1,
              vezesPorDia: 2,
            },
          ],
        },
      ];

      const result = calculateStockProjection(medication, activeTreatments);
      expect(result.dailyConsumption).toBe(2);
      expect(result.estimatedDays).toBe(10);
      expect(result.isLowStock).toBe(false);
    });

    it('flags low stock when stock days fall below threshold', () => {
      const medication = {
        id: 'med-1',
        nome: 'Paracetamol',
        quantidadeEstoque: 4,
        alertaEstoqueMinimo: 5,
      };

      const activeTreatments = [
        {
          id: 'treat-1',
          status: 'active',
          medicamentos: [
            { medicamentoId: 'med-1', quantidadePorDose: 1, vezesPorDia: 2 },
          ],
        },
      ];

      const result = calculateStockProjection(medication, activeTreatments);
      expect(result.dailyConsumption).toBe(2);
      expect(result.estimatedDays).toBe(2);
      expect(result.isLowStock).toBe(true);
      expect(result.isCritical).toBe(true);
    });
  });

  describe('generateDosesForDate', () => {
    it('generates chronological doses from active treatments', () => {
      const activeTreatments = [
        {
          id: 't1',
          nome: 'Controle de Pressão',
          status: 'active',
          dataInicio: '2026-01-01',
          medicamentos: [
            {
              medicamentoId: 'm1',
              nome: 'Losartana',
              dosagem: '50mg',
              quantidadePorDose: 1,
              horarios: ['20:00', '08:00'],
            },
          ],
        },
      ];

      const doses = generateDosesForDate(activeTreatments, '2026-09-25');
      expect(doses.length).toBe(2);
      expect(doses[0].horario).toBe('08:00');
      expect(doses[1].horario).toBe('20:00');
    });
  });

  describe('schedule-specific first reminders', () => {
    it('does not apply one exact first reminder time to every schedule', () => {
      const doses = generateDosesForDate(
        [
          {
            id: 't1',
            status: 'active',
            dataInicio: '2026-09-26',
            medicamentos: [
              {
                medicamentoId: 'm1',
                nome: 'Paracetamol',
                dosagem: '1 comprimido',
                horarios: ['08:00', '20:00'],
                primeiroLembreteAt: new Date(2026, 8, 26, 20, 0, 30).toISOString(),
                primeiroLembreteHorario: '20:00',
              },
            ],
          },
        ],
        '2026-09-26'
      );

      expect(doses).toHaveLength(2);
      expect(doses[0].scheduledAt).toBe(new Date(2026, 8, 26, 8, 0, 0).toISOString());
      expect(doses[1].scheduledAt).toBe(new Date(2026, 8, 26, 20, 0, 30).toISOString());
    });

    it('does not generate a newly added schedule before its first occurrence', () => {
      const doses = generateDosesForDate(
        [
          {
            id: 't1',
            status: 'active',
            dataInicio: '2026-09-26',
            medicamentos: [
              {
                medicamentoId: 'm1',
                nome: 'Paracetamol',
                dosagem: '1 comprimido',
                horarios: ['08:00', '20:00'],
                primeirosLembretesAt: {
                  '20:00': new Date(2026, 8, 27, 20, 0, 0).toISOString(),
                },
              },
            ],
          },
        ],
        '2026-09-26'
      );

      expect(doses).toHaveLength(1);
      expect(doses[0].horario).toBe('08:00');
    });
  });

  describe('buildQuickReminderTreatment', () => {
    it('creates a simple reminder treatment from name, quantity and schedule', () => {
      const reminder = buildQuickReminderTreatment('Losartana', 1, ['08:00', '20:00']);

      expect(reminder.nome).toBe('Lembrete: Losartana');
      expect(reminder.status).toBe('active');
      expect(reminder.medicamentos).toHaveLength(1);
      expect(reminder.medicamentos[0].nome).toBe('Losartana');
      expect(reminder.medicamentos[0].quantidadePorDose).toBe(1);
      expect(reminder.medicamentos[0].horarios).toEqual(['08:00', '20:00']);
    });
  });

  describe('expanded medication treatment', () => {
    it('supports non-tablet doses and optional medication data', () => {
      const treatment = buildMedicationTreatment({
        nome: 'Xarope',
        apresentacao: 'Líquido',
        quantidadePorDose: 5,
        unidadeDose: 'mL',
        horarios: ['08:00', '20:00'],
        principioAtivo: 'Substância',
        concentracao: '100 mg/5 mL',
        viaAdministracao: 'Oral',
        finalidade: 'Tratamento',
        observacoes: 'Agitar antes de usar',
        intervaloMinimoHoras: 6,
        limiteDosesDia: 4,
        condicaoUso: 'Se estiver com dor',
      });

      expect(treatment.medicamentos[0].dosagem).toBe('5 mL');
      expect(treatment.medicamentos[0].concentracao).toBe('100 mg/5 mL');
      expect(treatment.medicamentos[0].viaAdministracao).toBe('Oral');
      expect(treatment.medicamentos[0].horarios).toEqual(['08:00', '20:00']);
      expect(treatment.medicamentos[0].intervaloMinimoHoras).toBe(6);
      expect(treatment.medicamentos[0].limiteDosesDia).toBe(4);
      expect(treatment.medicamentos[0].condicaoUso).toBe('Se estiver com dor');
    });

    it('does not generate fixed doses for as-needed medication', () => {
      const treatment = buildMedicationTreatment({
        nome: 'Dipirona',
        apresentacao: 'Gotas',
        quantidadePorDose: 20,
        unidadeDose: 'gota',
        tipoUso: 'as_needed',
      });

      expect(treatment.medicamentos[0].tipoUso).toBe('as_needed');
      expect(generateDosesForDate([treatment], '2026-09-26')).toEqual([]);
    });

    it('starts a multi-time treatment on the earliest actual reminder', () => {
      const treatment = buildMedicationTreatment(
        {
          nome: 'Losartana',
          horarios: ['08:00', '20:00'],
        },
        new Date(2026, 8, 26, 14, 0, 0)
      );

      expect(treatment.dataInicio).toBe('2026-09-26');
      expect(treatment.medicamentos[0].primeirosLembretesAt['20:00']).toBe(
        new Date(2026, 8, 26, 20, 0, 0).toISOString()
      );
    });
  });

  describe('interval schedules', () => {
    it('generates every interval across midnight', () => {
      const treatment = buildMedicationTreatment(
        {
          nome: 'Antibiótico',
          horarios: ['22:00'],
          horarioInicial: '22:00',
          intervaloHoras: 8,
          tipoUso: 'interval',
        },
        new Date(2026, 8, 26, 10, 0, 0)
      );

      expect(generateDosesForDate([treatment], '2026-09-26').map((dose) => dose.horario)).toEqual(['22:00']);
      expect(generateDosesForDate([treatment], '2026-09-27').map((dose) => dose.horario)).toEqual(['06:00', '14:00', '22:00']);
    });

    it('preserves the interval anchor when an existing interval medication is edited', () => {
      const anchor = new Date(2026, 8, 26, 6, 0, 0).toISOString();
      const treatment = buildMedicationTreatment({
        nome: 'Antibiótico',
        horarioInicial: '06:00',
        intervaloHoras: 8,
        tipoUso: 'interval',
        preservePrimeiroLembreteAt: anchor,
      });

      expect(treatment.medicamentos[0].primeiroLembreteAt).toBe(anchor);
    });

    it('does not generate doses for as-needed use', () => {
      const treatment = buildMedicationTreatment({
        nome: 'Dipirona',
        quantidadePorDose: 20,
        unidadeDose: 'gota',
        tipoUso: 'as_needed',
        intervaloMinimoHoras: 6,
        limiteDosesDia: 4,
        condicaoUso: 'Se estiver com dor',
      });

      expect(generateDosesForDate([treatment], '2026-09-26')).toEqual([]);
    });
  });

  describe('medication identity', () => {
    it('keeps different concentrations as different medications', () => {
      expect(
        isSameMedication(
          { nome: 'Losartana', concentracao: '50 mg', apresentacao: 'Comprimido' },
          { nome: 'Losartana', concentracao: '25 mg', apresentacao: 'Comprimido' }
        )
      ).toBe(false);

      expect(
        isSameMedication(
          { nome: 'Losartana', concentracao: '50 mg', apresentacao: 'Comprimido' },
          { nome: 'Losartana', concentracao: '50 mg', apresentacao: 'Comprimido' }
        )
      ).toBe(true);
    });
  });

  describe('resolveReminderTimes', () => {
    it('converts relative reminders to actual times and keeps a custom time', () => {
      const now = new Date('2026-09-25T20:40:00');
      const times = resolveReminderTimes(['agora', '15', '22:30'], now);

      expect(times[0]).toBe('20:40');
      expect(times[1]).toBe('20:55');
      expect(times[2]).toBe('22:30');
    });
  });

  describe('normalizeMedicationName', () => {
    it('normalizes casing and repeated spaces', () => {
      expect(normalizeMedicationName('  Paracetamol   500mg ')).toBe('paracetamol 500mg');
    });
  });

  describe('sanitizeStoredData', () => {
    it('removes stale mock medication names and empty reminder data', () => {
      const payload = {
        medications: [
          { id: 'm-1', nome: 'Paracetamol' },
          { id: 'm-2', nome: 'Remédio do usuário' },
        ],
        treatments: [
          { id: 't-1', nome: 'Lembrete: Losartana' },
          { id: 't-2', nome: 'Rotina do usuário' },
        ],
        history: [{ id: 'h-1', medicationNome: 'Dipirona' }],
      };

      const cleaned = sanitizeStoredData(payload);

      expect(cleaned.medications).toEqual([
        { id: 'm-1', nome: 'Paracetamol' },
        { id: 'm-2', nome: 'Remédio do usuário' },
      ]);
      expect(cleaned.treatments).toEqual([{ id: 't-2', nome: 'Rotina do usuário' }]);
      expect(cleaned.history).toEqual([]);
    });
  });
});
