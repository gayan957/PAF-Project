import React from 'react';
import { RotateCcw, Search, SlidersHorizontal } from 'lucide-react';

const inputStyle = {
  width: '100%',
  padding: '9px 11px',
  border: '1px solid #d7dde8',
  borderRadius: '8px',
  fontSize: '14px',
  marginTop: '6px',
  boxSizing: 'border-box',
  outline: 'none',
  background: '#fff',
};

const labelStyle = {
  fontSize: '12px',
  fontWeight: '800',
  color: '#475569',
  display: 'block',
  textTransform: 'uppercase',
  letterSpacing: '0',
};

export default function ResourceFilter({ filters, onChange, onReset }) {
  const handle = (key) => (event) => onChange({ ...filters, [key]: event.target.value });

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '18px',
      display: 'flex',
      flexDirection: 'column',
      gap: '15px',
      boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>
          Filters
        </h3>
        <SlidersHorizontal size={17} color="#64748b" />
      </div>

      <div>
        <label style={labelStyle}>Search</label>
        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: '11px', top: '16px', color: '#64748b' }} />
          <input
            style={{ ...inputStyle, paddingLeft: '34px' }}
            placeholder="Name or notes"
            value={filters.keyword || ''}
            onChange={handle('keyword')}
          />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Type</label>
        <select style={inputStyle} value={filters.type || ''} onChange={handle('type')}>
          <option value="">All Types</option>
          <option value="LECTURE_HALL">Lecture Hall</option>
          <option value="LAB">Laboratory</option>
          <option value="MEETING_ROOM">Meeting Room</option>
          <option value="EQUIPMENT">Equipment</option>
        </select>
      </div>

      <div>
        <label style={labelStyle}>Status</label>
        <select style={inputStyle} value={filters.status || ''} onChange={handle('status')}>
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="UNDER_MAINTENANCE">Under Maintenance</option>
          <option value="OUT_OF_SERVICE">Out of Service</option>
        </select>
      </div>

      <div>
        <label style={labelStyle}>Location</label>
        <input
          style={inputStyle}
          placeholder="Block A"
          value={filters.location || ''}
          onChange={handle('location')}
        />
      </div>

      <div>
        <label style={labelStyle}>Minimum Capacity</label>
        <input
          style={inputStyle}
          type="number"
          min="1"
          placeholder="30"
          value={filters.minCapacity || ''}
          onChange={handle('minCapacity')}
        />
      </div>

      <button type="button" onClick={onReset} style={{
        padding: '9px 12px',
        borderRadius: '8px',
        border: '1px solid #d7dde8',
        background: '#f8fafc',
        cursor: 'pointer',
        fontSize: '13px',
        color: '#334155',
        fontWeight: '800',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
      }}>
        <RotateCcw size={15} />
        Reset
      </button>
    </div>
  );
}
