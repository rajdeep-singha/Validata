import { useMappingStore } from '../../stores/mapping.store';
import { type SchemaField } from '../../types/domain';
import { MappingRow } from './MappingRow';
import { Spinner } from '../ui/Spinner';

interface AIMappingReviewProps {
  onConfirm: () => void;
  isLoading: boolean;
}

export function AIMappingReview({ onConfirm, isLoading }: AIMappingReviewProps) {
  const { mappings, userOverrides, unmappedHeaders, overrideMapping } = useMappingStore();

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <Spinner size={40} />
        <div style={{ marginTop: 16, color: '#6b7280' }}>AI is analyzing your CSV headers...</div>
      </div>
    );
  }

  if (mappings.length === 0) return null;

  return (
    <div>
      <h3 style={{ margin: '0 0 16px', color: '#111827' }}>AI Column Mapping</h3>
      <p style={{ color: '#6b7280', marginBottom: 16, fontSize: '0.875rem' }}>
        Claude has suggested these field mappings. Review highlighted rows (low confidence) and adjust if needed.
      </p>

      <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid #e5e7eb' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              <th style={thStyle}>Your Column</th>
              <th style={thStyle}></th>
              <th style={thStyle}>Maps To</th>
              <th style={thStyle}>Confidence</th>
            </tr>
          </thead>
          <tbody>
            {mappings.map((m) => (
              <MappingRow
                key={m.uploadedHeader}
                mapping={m}
                overrideValue={userOverrides[m.uploadedHeader]}
                onOverride={(field: SchemaField) => overrideMapping(m.uploadedHeader, field)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {unmappedHeaders.length > 0 && (
        <div style={{ marginTop: 12, padding: '10px 12px', background: '#fef9c3', borderRadius: 8, fontSize: '0.875rem' }}>
          <strong>Unrecognised columns</strong> (will be ignored):{' '}
          {unmappedHeaders.map((h) => <code key={h} style={{ margin: '0 4px', background: '#fde68a', padding: '1px 5px', borderRadius: 4 }}>{h}</code>)}
        </div>
      )}

      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={onConfirm}
          style={{
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            padding: '10px 24px',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.95rem',
          }}
        >
          Confirm Mapping & Start Validation →
        </button>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '10px 12px',
  textAlign: 'left',
  fontSize: '0.8rem',
  fontWeight: 600,
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};
