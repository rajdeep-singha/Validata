import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AIMappingReview } from '../components/mapping/AIMappingReview';
import { ErrorAlert } from '../components/ui/ErrorAlert';
import { useColumnMapping } from '../hooks/useColumnMapping';
import { useMappingStore } from '../stores/mapping.store';
import { useUIStore } from '../stores/ui.store';
import { startValidation } from '../api/jobs.api';

export function MappingPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { mutate: fetchMapping, isPending, error } = useColumnMapping();
  const { getEffectiveMappings, confirm, confirmed } = useMappingStore();
  const { addToast, setStep } = useUIStore();

  useEffect(() => {
    if (jobId && !confirmed) {
      fetchMapping(jobId);
    }
  }, [jobId]);

  async function handleConfirm() {
    if (!jobId) return;
    const effectiveMappings = getEffectiveMappings();
    try {
      await startValidation(
        jobId,
        effectiveMappings.filter(m => m.mappedField !== '_ignore' as unknown).map(m => ({
          uploadedHeader: m.uploadedHeader,
          mappedField: m.mappedField,
        }))
      );
      confirm();
      setStep('validation');
      addToast({ type: 'success', message: 'Validation started!' });
      navigate(`/validation/${jobId}`);
    } catch (err) {
      addToast({ type: 'error', message: `Failed to start validation: ${(err as Error).message}` });
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ background: 'white', borderRadius: 16, padding: 32, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, color: '#111827' }}>AI Column Mapping</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: '#6b7280', background: '#f3f4f6', padding: '4px 10px', borderRadius: 20 }}>
            ✨ Powered by Claude
          </div>
        </div>

        {error && <div style={{ marginBottom: 16 }}><ErrorAlert message={(error as Error).message} /></div>}

        <AIMappingReview onConfirm={handleConfirm} isLoading={isPending} />
      </div>
    </div>
  );
}
