import React from 'react';

const styles = {
  ACTIVE: { background: '#d4edda', color: '#155724', border: '1px solid #c3e6cb' },
  OUT_OF_SERVICE: { background: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb' },
  UNDER_MAINTENANCE: { background: '#fff3cd', color: '#856404', border: '1px solid #ffeeba' },
};

const labels = {
  ACTIVE: 'Active',
  OUT_OF_SERVICE: 'Out of Service',
  UNDER_MAINTENANCE: 'Under Maintenance',
};

export default function StatusBadge({ status }) {
  const style = styles[status] || { background: '#e2e3e5', color: '#383d41' };
  return (
    <span style={{
      ...style,
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      display: 'inline-block',
    }}>
      {labels[status] || status}
    </span>
  );
}