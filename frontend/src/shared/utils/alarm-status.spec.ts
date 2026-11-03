import { Alarm } from '../../services/dtos/alarm';
import { alarmStatus } from './alarm-status';

describe('alarmStatus', () => {
  const alarm = (severity: Alarm['severity'], status: Alarm['status']): Alarm => ({
    id: '1',
    installationId: 'i',
    installationName: 'Streha',
    deviceId: 'd',
    deviceType: 'Panel',
    serialNumber: 'S1',
    type: 'LowProduction',
    severity,
    status,
    detectedAt: '2026-11-03T10:00:00Z',
    resolvedAt: null,
    description: `${severity} ${status}`,
  });

  it('is OK without active alarms', () => {
    expect(alarmStatus([alarm('Critical', 'Resolved')])).toEqual({ status: 'OK', messages: [] });
  });

  it('is a warning when only warnings are active', () => {
    expect(alarmStatus([alarm('Warning', 'Active')]).status).toBe('Opozorilo');
  });

  it('is an alarm when any active alarm is critical and lists the active descriptions', () => {
    const result = alarmStatus([alarm('Warning', 'Active'), alarm('Critical', 'Active'), alarm('Critical', 'Resolved')]);
    expect(result.status).toBe('Alarm');
    expect(result.messages).toEqual(['Warning Active', 'Critical Active']);
  });
});
