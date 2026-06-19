import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getJobResults } from '../../api/jobs.api';
import { useFixStore } from '../../stores/fix.store';
import { Badge } from '../ui/Badge';
import { FixSuggestionRow } from './FixSuggestionRow';
import { Spinner } from '../ui/Spinner';

interface ErrorTableProps {
  jobId: string;
  onRequestFixes?: (rows: ReturnType<typeof useQuery>['data']) => void;
}

export function ErrorTable({ jobId, onRequestFixes }: ErrorTableProps) {
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<number | null>(null);
  const { suggestions } = useFixStore();

  const { data, isLoading } = useQuery({
    queryKey: ['jobResults', jobId, page, 'INVALID'],
    queryFn: () => getJobResults(jobId, page, 50, 'INVALID'),
    enabled: !!jobId,
  });

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: 24 }}><Spinner /></div>;
  }

  if (!data || data.rows.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 24, color: '#16a34a', fontWeight: 600 }}>
        No invalid rows found.
      </div>
    );
  }

  const { rows, pagination } = data;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h4 style={{ margin: 0 }}>Invalid Rows — Page {pagination.page} of {pagination.totalPages} ({pagination.total.toLocaleString()} total)</h4>
        {onRequestFixes && (
          <button
            onClick={() => onRequestFixes(data as unknown as ReturnType<typeof useQuery>['data'])}
            style={{
              background: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              padding: '6px 16px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            ✨ Get AI Fix Suggestions
          </button>
        )}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              <th style={thStyle}>Row</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Errors</th>
              <th style={thStyle}>AI Fixes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <>
                <tr
                  key={row.rowNumber}
                  onClick={() => setExpanded(expanded === row.rowNumber ? null : row.rowNumber)}
                  style={{ cursor: 'pointer', borderBottom: '1px solid #e5e7eb' }}
                >
                  <td style={tdStyle}>#{row.rowNumber}</td>
                  <td style={tdStyle}>
                    <Badge variant="error">INVALID</Badge>
                  </td>
                  <td style={tdStyle}>
                    {(row.errors ?? []).map((e, i) => (
                      <div key={i} style={{ marginBottom: 2 }}>
                        <strong>{e.field}:</strong> {e.message}
                      </div>
                    ))}
                  </td>
                  <td style={tdStyle}>
                    {suggestions[row.rowNumber]
                      ? <Badge variant="success">{suggestions[row.rowNumber].length} suggestion(s)</Badge>
                      : <span style={{ color: '#9ca3af' }}>—</span>
                    }
                  </td>
                </tr>
                {expanded === row.rowNumber && (
                  <tr key={`${row.rowNumber}-detail`}>
                    <td colSpan={4} style={{ padding: 12, background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 12 }}>
                        {Object.entries(row.rowData).map(([k, v]) => (
                          <div key={k}>
                            <div style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: 600 }}>{k}</div>
                            <div style={{ color: '#111827' }}>{v || '—'}</div>
                          </div>
                        ))}
                      </div>
                      {suggestions[row.rowNumber]?.map((fix, i) => (
                        <FixSuggestionRow key={i} rowNumber={row.rowNumber} fix={fix} />
                      ))}
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
        <button
          disabled={page === 1}
          onClick={() => setPage(p => p - 1)}
          style={pageBtn(page === 1)}
        >
          ← Prev
        </button>
        <span style={{ padding: '6px 12px', color: '#374151' }}>
          {page} / {pagination.totalPages}
        </span>
        <button
          disabled={page >= pagination.totalPages}
          onClick={() => setPage(p => p + 1)}
          style={pageBtn(page >= pagination.totalPages)}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '10px 12px',
  textAlign: 'left',
  fontWeight: 600,
  fontSize: '0.75rem',
  color: '#6b7280',
  textTransform: 'uppercase',
};

const tdStyle: React.CSSProperties = {
  padding: '10px 12px',
  verticalAlign: 'top',
};

function pageBtn(disabled: boolean): React.CSSProperties {
  return {
    padding: '6px 16px',
    borderRadius: 6,
    border: '1px solid #e5e7eb',
    background: disabled ? '#f3f4f6' : 'white',
    cursor: disabled ? 'not-allowed' : 'pointer',
    color: disabled ? '#9ca3af' : '#374151',
  };
}
