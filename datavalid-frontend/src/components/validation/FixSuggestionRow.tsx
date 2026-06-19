import { useFixStore } from '../../stores/fix.store';
import { type FixEntry } from '../../types/api';

interface FixSuggestionRowProps {
  rowNumber: number;
  fix: FixEntry;
}

export function FixSuggestionRow({ rowNumber, fix }: FixSuggestionRowProps) {
  const { approvals, approve, reject } = useFixStore();
  const key = `${rowNumber}-${fix.field}`;
  const decision = approvals[key];

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '8px 12px',
      background: decision === true ? '#dcfce7' : decision === false ? '#fee2e2' : '#fef9c3',
      borderRadius: 8,
      marginBottom: 6,
      flexWrap: 'wrap',
    }}>
      <span style={{ fontWeight: 600, color: '#374151', minWidth: 120 }}>{fix.field}</span>
      <code style={{ background: '#fee2e2', padding: '2px 6px', borderRadius: 4, fontSize: '0.85rem' }}>
        {fix.originalValue}
      </code>
      <span>→</span>
      <code style={{ background: '#dcfce7', padding: '2px 6px', borderRadius: 4, fontSize: '0.85rem' }}>
        {fix.suggestedValue}
      </code>
      <span style={{ color: '#6b7280', fontSize: '0.8rem', flex: 1 }}>
        {fix.reason} ({Math.round(fix.confidence * 100)}% confidence)
      </span>
      {decision === undefined && (
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => approve(rowNumber, fix.field)}
            style={btnStyle('#16a34a')}
          >
            ✓ Accept
          </button>
          <button
            onClick={() => reject(rowNumber, fix.field)}
            style={btnStyle('#dc2626')}
          >
            ✗ Reject
          </button>
        </div>
      )}
      {decision === true && <span style={{ color: '#16a34a', fontWeight: 600 }}>Accepted</span>}
      {decision === false && <span style={{ color: '#dc2626', fontWeight: 600 }}>Rejected</span>}
    </div>
  );
}

function btnStyle(color: string): React.CSSProperties {
  return {
    background: color,
    color: 'white',
    border: 'none',
    borderRadius: 6,
    padding: '4px 12px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.8rem',
  };
}
