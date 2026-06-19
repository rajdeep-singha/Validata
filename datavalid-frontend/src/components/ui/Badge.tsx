import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'error' | 'warning' | 'info' | 'neutral';
}

const variantStyles: Record<string, string> = {
  success: 'background:#dcfce7;color:#166534;border:1px solid #bbf7d0',
  error:   'background:#fee2e2;color:#991b1b;border:1px solid #fecaca',
  warning: 'background:#fef9c3;color:#854d0e;border:1px solid #fde047',
  info:    'background:#dbeafe;color:#1e40af;border:1px solid #bfdbfe',
  neutral: 'background:#f3f4f6;color:#374151;border:1px solid #e5e7eb',
};

export function Badge({ children, variant = 'neutral' }: BadgeProps) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 600,
        ...Object.fromEntries(
          variantStyles[variant].split(';').filter(Boolean).map((s) => {
            const [k, v] = s.split(':');
            // convert kebab-case to camelCase
            const key = k.trim().replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
            return [key, v.trim()];
          })
        ),
      }}
    >
      {children}
    </span>
  );
}
