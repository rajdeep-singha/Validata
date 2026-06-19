import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileUpload } from '../components/upload/FileUpload';
import { UploadProgress } from '../components/upload/UploadProgress';
import { ErrorAlert } from '../components/ui/ErrorAlert';
import { uploadFile } from '../api/upload.api';
import { useJobStore } from '../stores/job.store';
import { useUIStore } from '../stores/ui.store';
import type { CsvPreview } from '../utils/csv-preview';
import { formatBytes } from '../utils/format';

export function UploadPage() {
  const navigate = useNavigate();
  const { setJob } = useJobStore();
  const { setStep } = useUIStore();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CsvPreview | null>(null);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileSelected(file: File, csvPreview: CsvPreview) {
    setSelectedFile(file);
    setPreview(csvPreview);
    setError(null);
  }

  async function handleUpload() {
    if (!selectedFile) return;
    setUploading(true);
    setError(null);
    try {
      const res = await uploadFile(selectedFile, setUploadPercent);
      setJob(res.jobId, selectedFile.name);
      setStep('mapping');
      navigate(`/mapping/${res.jobId}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
      setUploadPercent(0);
    }
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h2 style={headingStyle}>Upload Transaction CSV</h2>
        <p style={{ color: '#6b7280', marginBottom: 24 }}>
          Upload your transaction dataset. Supports order details, product info, and payment records.
        </p>

        <FileUpload
          onFileSelected={handleFileSelected}
          maxFileSizeMB={parseInt(import.meta.env.VITE_MAX_FILE_SIZE_MB || '500', 10)}
          disabled={uploading}
        />

        {selectedFile && preview && !uploading && (
          <div style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', gap: 16, marginBottom: 12, fontSize: '0.875rem', color: '#374151' }}>
              <span>📄 <strong>{selectedFile.name}</strong></span>
              <span>{formatBytes(selectedFile.size)}</span>
              <span>{preview.headers.length} columns detected</span>
            </div>

            <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid #e5e7eb', marginBottom: 16 }}>
              <table style={{ borderCollapse: 'collapse', fontSize: '0.8rem', width: '100%' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    {preview.headers.map(h => (
                      <th key={h} style={{ padding: '6px 10px', fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.slice(0, 3).map((row, i) => (
                    <tr key={i}>
                      {preview.headers.map(h => (
                        <td key={h} style={{ padding: '5px 10px', borderBottom: '1px solid #f3f4f6', color: '#6b7280', whiteSpace: 'nowrap', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {row[h] || '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={handleUpload}
              style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                padding: '10px 28px',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              Upload & Analyse →
            </button>
          </div>
        )}

        {uploading && <UploadProgress percent={uploadPercent} />}
        {error && <div style={{ marginTop: 12 }}><ErrorAlert message={error} onDismiss={() => setError(null)} /></div>}
      </div>
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  maxWidth: 800,
  margin: '0 auto',
  padding: '40px 24px',
};

const cardStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: 16,
  padding: 32,
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  border: '1px solid #e5e7eb',
};

const headingStyle: React.CSSProperties = {
  margin: '0 0 8px',
  color: '#111827',
  fontSize: '1.5rem',
};
