import React from 'react';

const STATUS_LABELS = {
  'in-progress': 'In progress',
  draft: 'Draft',
  published: 'Published',
  complete: 'Complete',
  generating: 'Generating…',
  pending: 'Pending',
  failed: 'Failed',
  approved: 'Approved',
  rejected: 'Needs changes',
  archived: 'Archived',
  live: 'Live',
  scheduled: 'Scheduled'
};

export default function StatusBadge({ status }) {
  const norm = (status || '').toLowerCase();

  let className = 'status-tag ';
  if (['approved', 'complete', 'published', 'live'].includes(norm)) {
    className += 'st-complete';
  } else if (['generating', 'in-progress', 'scheduled'].includes(norm)) {
    className += 'st-generating';
  } else if (['rejected', 'failed'].includes(norm)) {
    className += 'st-failed';
  } else if (norm === 'archived') {
    className += 'st-archived';
  } else {
    className += 'st-in-progress';
  }

  return (
    <span className={`${className} ${norm === 'generating' ? 'anim-pulse' : ''}`}>
      {norm === 'generating' && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: 'currentColor',
            display: 'inline-block'
          }}
        />
      )}
      {STATUS_LABELS[norm] || status}
    </span>
  );
}
