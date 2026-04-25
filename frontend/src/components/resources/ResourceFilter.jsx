import React from 'react';

const input = {
  width: '100%', padding: '8px 12px', border: '1px solid #ddd',
  borderRadius: '8px', fontSize: '14px', marginTop: '4px', boxSizing: 'border-box',
};
const label = {
  fontSize: '13px', fontWeight: '600', color: '#555', display: 'block',
};

export default function ResourceFilter({ filters, onChange, onReset }) {
  const handle = (key) => (e) => onChange({ ...filters, [key]: e.target.value });

  return (
    <div style={{
      background: '#fff', border: '1px solid #e0e0e0', borderRadius: '12px',
      padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px',
    }}>
      <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>Filters</h3>

      <div>
        <label style={label}>Search</label>
        <input style={input} placeholder="Name or description..."
          value={filters.keyword || ''} onChange={handle('keyword')} />
      </div>

      <div>
        <label style={label}>Type</label>
        <select style={input} value={filters.type || ''} onChange={handle('type')}>
          <option value="">All Types</option>
          <option value="LECTURE_HALL">Lecture Hall</option>
          <option value="LAB">Lab</option>
          <option value="MEETING_ROOM">Meeting Room</option>
          <option value="EQUIPMENT">Equipment</option>
        </select>
      </div>

      <div>
        <label style={label}>Status</label>
        <select style={input} value={filters.status || ''} onChange={handle('status')}>
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="UNDER_MAINTENANCE">Under Maintenance</option>
          <option value="OUT_OF_SERVICE">Out of Service</option>
        </select>
      </div>

      <div>
        <label style={label}>Location</label>
        <input style={input} placeholder="e.g. Block A"
          value={filters.location || ''} onChange={handle('location')} />
      </div>

      <div>
        <label style={label}>Min Capacity</label>
        <input style={input} type="number" placeholder="e.g. 30"
          value={filters.minCapacity || ''} onChange={handle('minCapacity')} />
      </div>

      <button onClick={onReset} style={{
        padding: '8px', borderRadius: '8px', border: '1px solid #ddd',
        background: '#f5f5f5', cursor: 'pointer', fontSize: '13px',
      }}>
        Clear Filters
      </button>
    </div>
  );
}