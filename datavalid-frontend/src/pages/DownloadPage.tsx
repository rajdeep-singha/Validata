import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getJobStatus } from '../api/jobs.api';
import { DownloadComponent } from '../components/download/DownloadComponent';
import { Spinner } from '../components/ui/Spinner';

export function DownloadPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['jobStatus', jobId],
    queryFn: () => getJobStatus(jobId!),
    enabled: !!jobId,
  });

  if (!jobId) return <div>No job ID</div>;

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ background: 'white', borderRadius: 16, padding: 32, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, color: '#111827' }}>Download</h2>
          <button
            onClick={() => navigate(`/insights/${jobId}`)}
            style={{ background: '#8b5cf6', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}
          >
            ✨ View AI Insights
          </button>
        </div>

        {isLoading && (
          <div style={{ textAlign: 'center', padding: 40 }}><Spinner size={40} /></div>
        )}

        {data && data.status === 'COMPLETED' && (
          <DownloadComponent
            jobId={jobId}
            totalRows={data.progress.totalRows ?? 0}
            validRows={data.progress.validRows}
            invalidRows={data.progress.invalidRows}
          />
        )}

        {data && data.status !== 'COMPLETED' && (
          <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
            Job is {data.status}. Please wait for completion.
          </div>
        )}

        <div style={{ marginTop: 24, padding: '16px', background: '#f9fafb', borderRadius: 8, fontSize: '0.8rem', color: '#6b7280' }}>
          <strong>Note:</strong> Files over 10,000 rows are automatically split into chunks and delivered as a ZIP archive.
        </div>
      </div>
    </div>
  );
}
