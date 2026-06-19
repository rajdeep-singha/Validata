import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UploadPage } from './pages/UploadPage';
import { MappingPage } from './pages/MappingPage';
import { ValidationResultsPage } from './pages/ValidationResultsPage';
import { AIInsightsPage } from './pages/AIInsightsPage';
import { DownloadPage } from './pages/DownloadPage';
import { LandingPage } from './pages/LandingPage';
import { useUIStore, type AppStep } from './stores/ui.store';
import { useEffect } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,
      retry: 1,
    },
  },
});

const STEP_LABELS: Record<AppStep, string> = {
  upload: '1. Upload',
  mapping: '2. Column Mapping',
  validation: '3. Validation',
  insights: '4. AI Insights',
  download: '5. Download',
};

const STEPS: AppStep[] = ['upload', 'mapping', 'validation', 'insights', 'download'];

function StepBar() {
  const { activeStep } = useUIStore();
  const activeIndex = STEPS.indexOf(activeStep);

  return (
    <div style={{ display: 'flex', gap: 0, justifyContent: 'center', padding: '16px 0', overflowX: 'auto' }}>
      {STEPS.map((step, i) => (
        <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            padding: '6px 16px',
            borderRadius: 20,
            fontSize: '0.8rem',
            fontWeight: i <= activeIndex ? 700 : 400,
            color: i === activeIndex ? 'white' : i < activeIndex ? '#16a34a' : '#9ca3af',
            background: i === activeIndex ? '#3b82f6' : 'transparent',
            whiteSpace: 'nowrap',
          }}>
            {i < activeIndex ? '✓ ' : ''}{STEP_LABELS[step]}
          </div>
          {i < STEPS.length - 1 && (
            <div style={{ width: 24, height: 1, background: i < activeIndex ? '#16a34a' : '#e5e7eb' }} />
          )}
        </div>
      ))}
    </div>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <header style={{
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16, height: 56 }}>
          <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#111827' }}>DataValid</span>
          <span style={{ fontSize: '0.75rem', color: '#6b7280', background: '#f3f4f6', padding: '2px 8px', borderRadius: 10 }}>AI-Powered</span>
        </div>
      </header>
      <div style={{ borderBottom: '1px solid #e5e7eb', background: 'white' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <StepBar />
        </div>
      </div>
      <main>{children}</main>
    </div>
  );
}

function AppRoutes() {
  const { setStep } = useUIStore();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/app') setStep('upload');
    else if (location.pathname.startsWith('/mapping')) setStep('mapping');
    else if (location.pathname.startsWith('/validation')) setStep('validation');
    else if (location.pathname.startsWith('/insights')) setStep('insights');
    else if (location.pathname.startsWith('/download')) setStep('download');
  }, [location.pathname, setStep]);

  return (
    <Routes>
      {/* Landing page — no layout wrapper */}
      <Route path="/" element={<LandingPage />} />

      {/* App pages — wrapped in layout */}
      <Route path="/app" element={<Layout><UploadPage /></Layout>} />
      <Route path="/mapping/:jobId" element={<Layout><MappingPage /></Layout>} />
      <Route path="/validation/:jobId" element={<Layout><ValidationResultsPage /></Layout>} />
      <Route path="/insights/:jobId" element={<Layout><AIInsightsPage /></Layout>} />
      <Route path="/download/:jobId" element={<Layout><DownloadPage /></Layout>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
