import React from 'react';
import { RefreshCw, RotateCcw, AlertTriangle, ExternalLink } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Lingotoon ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetCache = () => {
    if (window.confirm('Reset local temporary cache? Your projects saved on Google Drive will remain safe and re-sync on boot.')) {
      try {
        localStorage.removeItem('lingotoon_studio_clean_v3');
        localStorage.removeItem('lingotoon_active_collaborators');
      } catch (e) {}
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      const folderId = '1iwJh3GtwDtAjUy4t1FeqBgw0b_XBmyva';
      return (
        <div
          style={{
            minHeight: '100vh',
            background: 'linear-gradient(180deg, #130b24 0%, #0a0514 100%)',
            color: '#f3e8ff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}
        >
          <div
            style={{
              maxWidth: '520px',
              width: '100%',
              background: '#1d1235',
              border: '1.5px solid rgba(168, 85, 247, 0.3)',
              borderRadius: '16px',
              padding: '32px',
              textAlign: 'center',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#f87171',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px auto'
              }}
            >
              <AlertTriangle style={{ width: '28px', height: '28px' }} />
            </div>

            <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 8px 0', color: '#ffffff' }}>
              Lingotoon Studio Recovery
            </h2>
            <p style={{ fontSize: '13px', color: '#c4b5fd', margin: '0 0 18px 0', lineHeight: 1.5 }}>
              A temporary display error occurred. Your work is backed up in your linked Google Drive folder.
            </p>

            {this.state.error && (
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  fontSize: '11.5px',
                  fontFamily: 'monospace',
                  color: '#fda4af',
                  textAlign: 'left',
                  margin: '0 0 20px 0',
                  maxHeight: '120px',
                  overflowY: 'auto',
                  wordBreak: 'break-word'
                }}
              >
                {this.state.error.toString()}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={this.handleReload}
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)'
                }}
              >
                <RefreshCw style={{ width: '15px', height: '15px' }} />
                Reload Studio
              </button>

              <button
                type="button"
                onClick={this.handleResetCache}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#e2e8f0',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <RotateCcw style={{ width: '15px', height: '15px' }} />
                Clear Cache & Restart
              </button>

              <a
                href={`https://drive.google.com/drive/folders/${folderId}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  background: 'rgba(168, 85, 247, 0.15)',
                  color: '#d8b4fe',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <ExternalLink style={{ width: '15px', height: '15px' }} />
                Open Drive Folder
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
