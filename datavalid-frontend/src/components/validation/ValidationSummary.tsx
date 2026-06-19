import { type JobProgress } from '../../types/domain';
import { ProgressBar } from '../ui/ProgressBar';
import { Badge } from '../ui/Badge';
import { formatNumber } from '../../utils/format';

interface ValidationSummaryProps {
  progress: JobProgress;
  status: string;
}

export function ValidationSummary({ progress, status }: ValidationSummaryProps) {
  const statusVariant = status === 'COMPLETED' ? 'success' : status === 'FAILED' ? 'error' : status === 'PROCESSING' ? 'info' : 'neutral';

  return (
    <div style={{ background: '#f9fafb', borderRadius: 12, padding: 24, border: '1px solid #e5e7eb' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ margin: 0, color: '#111827' }}>Validation Progress</h3>
        <Badge variant={statusVariant as 'success' | 'error' | 'info' | 'neutral'}>{status}</Badge>
      </div>

      <ProgressBar value={progress.percentage} label={`${formatNumber(progress.processedRows)} / ${progress.totalRows != null ? formatNumber(progress.totalRows) : '?'} rows`} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 20 }}>
        <StatBox label="Total Rows" value={formatNumber(progress.totalRows ?? 0)} color="#6b7280" />
        <StatBox label="Valid" value={formatNumber(progress.validRows)} color="#16a34a" />
        <StatBox label="Invalid" value={formatNumber(progress.invalidRows)} color="#dc2626" />
      </div>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '12px 8px', background: 'white', borderRadius: 8, border: '1px solid #e5e7eb' }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 2 }}>{label}</div>
    </div>
  );
}
