import { ProgressBar } from '../ui/ProgressBar';

export function UploadProgress({ percent }: { percent: number }) {
  return (
    <div style={{ padding: '16px 0' }}>
      <ProgressBar value={percent} label={`Uploading... ${percent}%`} color="#3b82f6" />
    </div>
  );
}
