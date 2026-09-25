import { describe, it, expect } from 'vitest';
import {
  calculateAdherence,
  calculateStockProjection,
  generateDosesForDate,
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
});
