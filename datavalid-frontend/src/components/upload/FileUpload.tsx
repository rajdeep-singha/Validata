import React, { useRef, useState } from 'react';
import { parseCsvPreview } from '../../utils/csv-preview';
import type { CsvPreview } from '../../utils/csv-preview';

interface FileUploadProps {
  onFileSelected: (file: File, preview: CsvPreview) => void;
  maxFileSizeMB?: number;
  disabled?: boolean;
}

export function FileUpload({ onFileSelected, maxFileSizeMB = 500, disabled = false }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    if (!file.name.endsWith('.csv')) {
      setError('Only CSV files are accepted.');
      return;
    }
    if (file.size > maxFileSizeMB * 1024 * 1024) {
      setError(`File exceeds maximum size of ${maxFileSizeMB} MB.`);
      return;
    }
    // Always call onFileSelected — preview errors are non-blocking
    const preview = await parseCsvPreview(file);
    onFileSelected(file, preview);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div>
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        style={{
          border: `2px dashed ${dragOver ? '#3b82f6' : '#d1d5db'}`,
          borderRadius: 12,
          padding: '48px 24px',
          textAlign: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          background: dragOver ? '#eff6ff' : '#fafafa',
          transition: 'all 0.2s',
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 12 }}>📁</div>
        <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#111827' }}>
          Drag & drop your CSV file here
        </div>
        <div style={{ color: '#6b7280', marginTop: 4 }}>
          or <span style={{ color: '#3b82f6', textDecoration: 'underline' }}>browse</span> to select
        </div>
        <div style={{ color: '#9ca3af', fontSize: '0.8rem', marginTop: 8 }}>
          Max file size: {maxFileSizeMB} MB · CSV only
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        style={{ display: 'none' }}
        onChange={onInputChange}
        disabled={disabled}
      />
      {error && (
        <div style={{ color: '#dc2626', marginTop: 8, fontSize: '0.875rem' }}>{error}</div>
      )}
    </div>
  );
}
