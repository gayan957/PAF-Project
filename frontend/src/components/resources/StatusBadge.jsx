import React from 'react';
import { AlertTriangle, Ban, CheckCircle2 } from 'lucide-react';

const config = {
  ACTIVE: {
    label: 'Active',
    icon: CheckCircle2,
    background: '#dcfce7',
    color: '#166534',
    border: '#bbf7d0',
  },
  UNDER_MAINTENANCE: {
    label: 'Under Maintenance',
    icon: AlertTriangle,
    background: '#fef3c7',
    color: '#92400e',
    border: '#fde68a',
  },
  OUT_OF_SERVICE: {
    label: 'Out of Service',
    icon: Ban,
    background: '#fee2e2',
    color: '#991b1b',
    border: '#fecaca',
  },
};

export default function StatusBadge({ status }) {
  const item = config[status] || {
    label: status || 'Unknown',
    icon: AlertTriangle,
    background: '#f1f5f9',
    color: '#475569',
    border: '#e2e8f0',
  };
  const Icon = item.icon;

  return (
    <span style={{
      padding: '5px 10px',
      borderRadius: '999px',
      fontSize: '12px',
      fontWeight: '700',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      background: item.background,
      color: item.color,
      border: `1px solid ${item.border}`,
      whiteSpace: 'nowrap',
    }}>
      <Icon size={13} />
      {item.label}
    </span>
  );
}
