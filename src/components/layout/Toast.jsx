import React from 'react';
import { useVideo } from '../../context/VideoContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useVideo();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => {
        let Icon = Info;
        let borderCol = 'var(--iris)';
        if (toast.type === 'success') {
          Icon = CheckCircle2;
          borderCol = 'var(--good)';
        } else if (toast.type === 'error') {
          Icon = AlertCircle;
          borderCol = 'var(--bad)';
        }

        return (
          <div
            key={toast.id}
            className="toast"
            style={{ borderColor: borderCol }}
            onClick={() => removeToast(toast.id)}
          >
            <Icon className="w-4 h-4" style={{ color: borderCol, flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{toast.text}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeToast(toast.id);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
