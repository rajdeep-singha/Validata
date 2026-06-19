import { useParams, useNavigate } from 'react-router-dom';
import { useJobPolling } from '../hooks/useJobPolling';
import { useFixSuggestions } from '../hooks/useFixSuggestions';
import { useJobStore } from '../stores/job.store';
import { ValidationSummary } from '../components/validation/ValidationSummary';
import { ErrorTable } from '../components/validation/ErrorTable';
import { Spinner } from '../components/ui/Spinner';
import { type JobResultsResponse } from '../types/api';

export function ValidationResultsPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { status, progress } = useJobStore();
  const { mutate: fetchFixes, isPending: fetchingFixes } = useFixSuggestions(jobId ?? '');

  useJobPolling(jobId ?? null);

  if (!jobId) return <div>No job ID</div>;

  const isComplete = status === 'COMPLETED';
  const isFailed = status === 'FAILED';

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ background: 'white', borderRadius: 16, padding: 32, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, color: '#111827' }}>Validation Results</h2>
          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Job: {jobId.slice(0, 8)}…</div>
        </div>

        {isFailed && (
          <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 8, padding: 16, marginBottom: 20, color: '#991b1b' }}>
            Validation failed. Please try uploading the file again.
          </div>
        )}

        {progress && (
          <div style={{ marginBottom: 24 }}>
            <ValidationSummary progress={progress} status={status ?? 'PENDING'} />
          </div>
        )}

        {!isComplete && !isFailed && (
          <div style={{ textAlign: 'center', padding: 24, color: '#6b7280' }}>
            <Spinner size={32} />
            <div style={{ marginTop: 12 }}>Processing your file… page updates automatically</div>
          </div>
        )}

        {isComplete && (
          <>
            <div style={{ marginBottom: 24 }}>
              <ErrorTable
                jobId={jobId}
                onRequestFixes={(data) => {
                  const resultsData = data as unknown as JobResultsResponse;
                  if (resultsData?.rows) {
                    fetchFixes(resultsData.rows.map(r => ({
                      rowNumber: r.rowNumber,
                      status: r.status,
                      rowData: r.rowData,
                      errors: r.errors,
                      fixSuggestions: r.fixSuggestions,
                    })));
                  }
                }}
              />
              {fetchingFixes && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6b7280', marginTop: 12 }}>
                  <Spinner size={16} /> Getting AI fix suggestions…
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={() => navigate(`/insights/${jobId}`)}
                style={{ background: '#8b5cf6', color: 'white', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 600, cursor: 'pointer' }}
              >
                ✨ AI Insights →
              </button>
              <button
                onClick={() => navigate(`/download/${jobId}`)}
                style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 600, cursor: 'pointer' }}
              >
                ⬇ Download →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
