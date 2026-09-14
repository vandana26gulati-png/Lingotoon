import React from 'react';
import { useVideo } from '../../context/VideoContext';
import { Coins, DollarSign, Film, CheckCircle, Folder } from 'lucide-react';

export default function CreditsDashboard() {
  const { videos } = useVideo();

  let totalCost = 0;
  let clipCount = 0;
  let approvedClips = 0;
  const byTool = {};
  const allRecentJobs = [];

  Object.values(videos).forEach((v) => {
    (v.queue || []).forEach((q) => {
      totalCost += q.cost || 0;
      if (q.status === 'complete') {
        clipCount++;
        approvedClips++;
      }
      if (q.tool && q.tool !== '—') {
        byTool[q.tool] = (byTool[q.tool] || 0) + (q.cost || 0);
      }
      allRecentJobs.push({
        ...q,
        episodeTitle: v.title,
        epLabel: v.epLabel
      });
    });
  });

  const avgCostCredits = approvedClips ? (totalCost / approvedClips).toFixed(1) : '0.0';
  const maxSpend = Math.max(...Object.values(byTool), 1);
  const colors = ['var(--grape)', 'var(--iris)', 'var(--lilac)', '#a78bfa', '#c4b5fd'];

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Credits & Tools</h1>
          <p>
            What's being spent, on what AI engines, across every video project, so the studio always knows the accurate cost so far.
          </p>
        </div>
      </div>

      <div className="stat-row">
        <div className="stat">
          <div className="num">{totalCost.toLocaleString()} <span style={{ fontSize: '15px', color: 'var(--iris)' }}>cr</span></div>
          <div className="lbl">Credits used across all videos</div>
        </div>

        <div className="stat">
          <div className="num" style={{ color: 'var(--good)' }}>
            ${(totalCost * 0.15).toFixed(2)}
          </div>
          <div className="lbl">Est. total studio expenditure</div>
        </div>

        <div className="stat">
          <div className="num">{clipCount}</div>
          <div className="lbl">Clips generated & rendered</div>
        </div>

        <div className="stat">
          <div className="num">${(avgCostCredits * 0.15).toFixed(2)}</div>
          <div className="lbl">Avg. cost per approved clip</div>
        </div>

        <div className="stat">
          <div className="num">{Object.keys(videos).length}</div>
          <div className="lbl">Active video folders</div>
        </div>
      </div>

      <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)', padding: '24px', marginBottom: '28px' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '18px', color: 'var(--text-bright)' }}>
          Tool Spend Breakdown (All Video Projects)
        </h3>

        {Object.keys(byTool).length === 0 ? (
          <div className="empty-state">No model generation spend recorded yet.</div>
        ) : (
          Object.entries(byTool).map(([tool, cost], idx) => {
            const pct = Math.round((cost / maxSpend) * 100);
            return (
              <div key={tool} className="bar-row">
                <div className="bar-label">{tool}</div>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${pct}%`,
                      background: colors[idx % colors.length]
                    }}
                  />
                </div>
                <div className="bar-val">{cost} cr</div>
              </div>
            );
          })
        )}
      </div>

      <div>
        <h3 style={{ fontSize: '16px', marginBottom: '14px', color: 'var(--text-bright)' }}>
          Studio-Wide Generation History
        </h3>

        {allRecentJobs.length === 0 ? (
          <div className="empty-state">No jobs across any video folder yet.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Episode</th>
                  <th>Shot</th>
                  <th>AI Model</th>
                  <th>Status</th>
                  <th>Storage Destination</th>
                  <th>Cost</th>
                </tr>
              </thead>
              <tbody>
                {allRecentJobs.map((j) => (
                  <tr key={j.id}>
                    <td style={{ fontWeight: 600, color: 'var(--lilac)' }}>
                      {j.epLabel} — {j.episodeTitle}
                    </td>
                    <td>{j.shot}</td>
                    <td>{j.tool}</td>
                    <td>
                      <span className={`status-tag ${j.status === 'complete' ? 'st-complete' : j.status === 'failed' ? 'st-failed' : 'st-generating'}`}>
                        {j.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--muted-light)', fontFamily: 'var(--font-mono)' }}>
                      {j.uploadedTo}
                    </td>
                    <td style={{ fontWeight: 600 }}>{j.cost ? `${j.cost} cr` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
