import React, { useState } from 'react';
import { useVideo } from '../../context/VideoContext';
import StatusBadge from '../common/StatusBadge';
import { History, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

export default function VersionsTab({ video }) {
  const { restoreVersion } = useVideo();
  const [expandedIndex, setExpandedIndex] = useState(null);

  const versions = video.versions || [];

  const toggleExpand = (idx) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  const handleRestore = (ver) => {
    if (window.confirm(`Restore Storyboard Version ${ver.version} into the active live board? This will replace current live shots with this version's snapshot.`)) {
      restoreVersion(video.id, ver);
    }
  };

  return (
    <div>
      <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '16px' }}>
        Every storyboard uploaded for this video — who built it, who reviewed it, and how many shots it carried.
        You can inspect individual shot snapshots or restore any previous version to the live storyboard editor.
      </p>

      {versions.length === 0 ? (
        <div className="empty-state">
          <History className="w-6 h-6 text-purple-400 mb-2" />
          No storyboard versions archived yet.
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Version</th>
                <th>Date Uploaded</th>
                <th>Uploaded By</th>
                <th>Shots</th>
                <th>Status</th>
                <th>Approved By</th>
                <th>Notes</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {versions.map((ver, idx) => {
                const isExpanded = expandedIndex === idx;

                return (
                  <React.Fragment key={ver.version || idx}>
                    <tr>
                      <td style={{ fontWeight: 700, color: 'var(--lilac)' }}>
                        v{ver.version}
                      </td>
                      <td>{ver.date}</td>
                      <td>{ver.uploadedBy}</td>
                      <td>{ver.shotCount} shots</td>
                      <td>
                        <StatusBadge status={ver.status} />
                      </td>
                      <td>{ver.approvedBy || '—'}</td>
                      <td style={{ maxWidth: '240px', color: 'var(--muted-light)', fontSize: '12px' }}>
                        {ver.notes}
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button
                          className="link-btn"
                          style={{ marginRight: '12px' }}
                          onClick={() => toggleExpand(idx)}
                        >
                          {isExpanded ? (
                            <>Hide shots <ChevronUp className="w-3 h-3 inline" /></>
                          ) : (
                            <>View shots <ChevronDown className="w-3 h-3 inline" /></>
                          )}
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ fontSize: '11px', padding: '3px 8px' }}
                          onClick={() => handleRestore(ver)}
                          title="Restore this version into live board"
                        >
                          <RotateCcw className="w-3 h-3 mr-1 inline" />
                          Restore
                        </button>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="expand-row show">
                        <td colSpan={8}>
                          <div style={{ fontSize: '11.5px', color: 'var(--iris)', marginBottom: '6px', fontWeight: 600 }}>
                            Snapshot Shots in v{ver.version}:
                          </div>
                          <div className="snapshot-list">
                            {ver.snapshot.map((shotDesc, sIdx) => (
                              <span key={sIdx} className="snapshot-chip">
                                <b>{sIdx + 1}.</b> {shotDesc}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
