interface ProgressBarProps {
  value: number;  // 0-100
  label?: string;
  color?: string;
}

export function ProgressBar({ value, label, color = '#3b82f6' }: ProgressBarProps) {
  return (
    <div style={{ width: '100%' }}>
      {label && <div style={{ fontSize: '0.875rem', color: '#374151', marginBottom: 4 }}>{label}</div>}
      <div style={{ height: 12, background: '#e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${Math.min(100, Math.max(0, value))}%`,
            background: color,
            borderRadius: 8,
            transition: 'width 0.3s ease',
          }}
        />
      </div>
      <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 2, textAlign: 'right' }}>
        {value}%
      </div>
    </div>
  );
}
