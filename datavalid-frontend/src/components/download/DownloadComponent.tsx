import { useDownload } from '../../hooks/useDownload';
import { Spinner } from '../ui/Spinner';

interface DownloadComponentProps {
  jobId: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
}

export function DownloadComponent({ jobId, totalRows, validRows, invalidRows }: DownloadComponentProps) {
  const { mutate: download, isPending } = useDownload();

  return (
    <div style={{
      textAlign: 'center',
      padding: 40,
      background: '#f0fdf4',
      borderRadius: 16,
      border: '1px solid #bbf7d0',
    }}>
      <div style={{ fontSize: 56, marginBottom: 12 }}>✅</div>
      <h3 style={{ margin: '0 0 8px', color: '#166534' }}>Validation Complete</h3>
      <p style={{ color: '#4b7c59', margin: '0 0 24px' }}>
        {totalRows.toLocaleString()} rows processed · {validRows.toLocaleString()} valid · {invalidRows.toLocaleString()} invalid
      </p>

      <div style={{ margin: '0 0 24px', fontSize: '0.875rem', color: '#6b7280' }}>
        Your validated CSV will be downloaded. Files &gt;10,000 rows are split into chunks and zipped automatically.
      </div>

      <button
        onClick={() => download(jobId)}
        disabled={isPending}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: '#16a34a',
          color: 'white',
          border: 'none',
          borderRadius: 10,
          padding: '12px 32px',
          fontWeight: 700,
          fontSize: '1rem',
          cursor: isPending ? 'wait' : 'pointer',
          opacity: isPending ? 0.8 : 1,
        }}
      >
        {isPending ? <Spinner size={20} /> : '⬇'}
        {isPending ? 'Preparing download...' : 'Download Validated CSV'}
      </button>
    </div>
  );
}
