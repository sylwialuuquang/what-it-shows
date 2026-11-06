// The problems inside one merged ticket. The desk's cause table keeps a one-day
// report under the tenant's cause and footnotes it. Here that report is its own problem.
import { causeOf, uniqueById, type Cause, type Report, type Tenant } from '#lib/kb/causes';

export type ProblemId = Cause | 'one-day';

export type ProblemGroup = {
  id: ProblemId;
  name: string;
  reports: Report[];
  tenants: number;
  firstSeen: string;
  lastSeen: string;
};

const NAME: Record<ProblemId, string> = {
  parser: 'Parser reads day-first dates month-first',
  hint: 'booking-v3 form hint says MM/DD/YYYY',
  'one-day': 'Dates move by one day',
};

const ORDER: readonly ProblemId[] = ['parser', 'hint', 'one-day'];

export function groupProblems(
  reports: Report[],
  oneDayMove: readonly string[],
  tenantOf: (r: Report) => Tenant | undefined,
  ticket: number,
): ProblemGroup[] {
  const oneDay = new Set(oneDayMove);
  const buckets = new Map<ProblemId, Report[]>();
  for (const r of uniqueById(reports).filter((row) => row.mergedInto === ticket)) {
    const id: ProblemId = oneDay.has(r.id) ? 'one-day' : causeOf(r, tenantOf(r)) ?? 'parser';
    if (!oneDay.has(r.id) && causeOf(r, tenantOf(r)) === null) {
      throw new Error(`${r.id} has no cause and is not a one-day report`);
    }
    buckets.set(id, [...(buckets.get(id) ?? []), r]);
  }
  const oneOrder = new Map(oneDayMove.map((id, i) => [id, i]));
  return ORDER.filter((id) => buckets.has(id)).map((id) => {
    const rs = [...(buckets.get(id) ?? [])];
    if (id === 'one-day') rs.sort((a, b) => (oneOrder.get(a.id) ?? 0) - (oneOrder.get(b.id) ?? 0));
    const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
    return {
      id,
      name: NAME[id],
      reports: rs,
      tenants: new Set(rs.map((r) => r.tenant)).size,
      firstSeen: days[0] ?? '',
      lastSeen: days[days.length - 1] ?? '',
    };
  });
}
