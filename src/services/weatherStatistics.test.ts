import assert from 'node:assert/strict';
import test from 'node:test';
import { DailyWeatherRecord } from '../models/weather';
import { getMonthEndDate } from '../utils/dates';
import { convertMetricDelta, convertMetricValue } from '../utils/units';
import {
  processAnnualAnalysis,
  processAnomalies,
  processMonthlyAnalysis,
  processWeatherRecords,
} from './weatherStatistics';

function makeRecord(date: string, overrides: Partial<DailyWeatherRecord> = {}): DailyWeatherRecord {
  const [year, month, day] = date.split('-').map(Number);
  return {
    date,
    year,
    month,
    day,
    tempMean: 10,
    tempMin: 5,
    tempMax: 15,
    precipitation: 1,
    windSpeedMax: 10,
    ...overrides,
  };
}

function recordsForRange(start: string, end: string, overrides: Partial<DailyWeatherRecord> = {}) {
  const records: DailyWeatherRecord[] = [];
  const cursor = new Date(`${start}T00:00:00Z`);
  const last = new Date(`${end}T00:00:00Z`);
  while (cursor <= last) {
    records.push(makeRecord(cursor.toISOString().slice(0, 10), overrides));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return records;
}

test('month end calculation preserves leap day', () => {
  assert.equal(getMonthEndDate(2024, 2), '2024-02-29');
  assert.equal(getMonthEndDate(2025, 2), '2025-02-28');
});

test('monthly summaries exclude incomplete months and preserve missing precipitation', () => {
  const completeFebruary = recordsForRange('2024-02-01', '2024-02-29', { precipitation: null });
  const complete = processMonthlyAnalysis(completeFebruary, 2);
  assert.equal(complete.length, 1);
  assert.equal(complete[0].precipTotal, null);

  const incomplete = processMonthlyAnalysis(completeFebruary.slice(0, -1), 2);
  assert.deepEqual(incomplete, []);
});

test('annual summaries exclude partial years and preserve missing precipitation', () => {
  const completeYear = recordsForRange('2024-01-01', '2024-12-31', { precipitation: null });
  const partialYear = recordsForRange('2025-01-01', '2025-08-09');
  const result = processAnnualAnalysis([...completeYear, ...partialYear]);
  assert.deepEqual(result.map((item) => item.year), [2024]);
  assert.equal(result[0].precipTotal, null);
});

test('anomalies omit years whose selected metric is missing', () => {
  const baseline = recordsForRange('2023-01-01', '2023-12-31', { tempMean: 10 });
  const missing = recordsForRange('2024-01-01', '2024-12-31', { tempMean: null });
  const result = processAnomalies([...baseline, ...missing], 2023, 2023, 'tempMean');
  assert.deepEqual(result.anomalies.map((item) => item.year), [2023]);
  assert.equal(result.anomalies[0].anomaly, 0);
});

test('metric conversions distinguish absolute values from deltas', () => {
  const settings = { tempUnit: 'F' as const, windUnit: 'mph' as const, precipUnit: 'inch' as const };
  assert.equal(convertMetricValue(10, 'tempMean', settings), 50);
  assert.equal(convertMetricDelta(10, 'tempMean', settings), 18);
  assert.equal(convertMetricValue(25.4, 'precipitation', settings)?.toFixed(2), '1.00');
});

test('weather records honor configured display units', () => {
  const records = recordsForRange('2024-01-01', '2024-12-31', {
    tempMean: 20,
    tempMin: 10,
    tempMax: 30,
    precipitation: 25.4,
  });
  const result = processWeatherRecords(records, 2024, 2024, 'F', 'inch');
  assert.match(result.find((item) => item.id === 'highest_temp')?.value ?? '', /86\.0 °F/);
  assert.match(result.find((item) => item.id === 'wettest_day')?.value ?? '', /1\.0 in/);
});
