import React, { useState, useEffect } from 'react';

const inp = {
  width: '100%', padding: '10px 12px', border: '1px solid #ddd',
  borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box',
};
const lbl = {
  fontSize: '13px', fontWeight: '600', color: '#444', display: 'block', marginBottom: '6px',
};

export default function ResourceForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    name: '', type: 'LAB', capacity: '', location: '', building: '',
    availabilityStart: '08:00', availabilityEnd: '22:00',
    status: 'ACTIVE', description: '', imageUrl: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initial) setForm(prev => ({ ...prev, ...initial }));
  }, [initial]);

  const handle = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.location.trim()) e.location = 'Location is required';
    if (!form.availabilityStart) e.availabilityStart = 'Required';
    if (!form.availabilityEnd) e.availabilityEnd = 'Required';
    if (form.capacity && parseInt(form.capacity) < 1) e.capacity = 'Must be at least 1';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ ...form, capacity: form.capacity ? parseInt(form.capacity) : null });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      <div>
        <label style={lbl}>Resource Name *</label>
        <input style={inp} value={form.name} onChange={handle('name')}
          placeholder="e.g. Computer Lab A" />
        {errors.name && <span style={{ color: 'red', fontSize: '12px' }}>{errors.name}</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={lbl}>Type *</label>
          <select style={inp} value={form.type} onChange={handle('type')}>
            <option value="LECTURE_HALL">Lecture Hall</option>
            <option value="LAB">Lab</option>
            <option value="MEETING_ROOM">Meeting Room</option>
            <option value="EQUIPMENT">Equipment</option>
          </select>
        </div>
        <div>
          <label style={lbl}>Capacity (blank for equipment)</label>
          <input style={inp} type="number" value={form.capacity}
            onChange={handle('capacity')} placeholder="e.g. 40" />
          {errors.capacity && <span style={{ color: 'red', fontSize: '12px' }}>{errors.capacity}</span>}
        </div>
      </div>

      <div>
        <label style={lbl}>Location *</label>
        <input style={inp} value={form.location} onChange={handle('location')}
          placeholder="e.g. Block A, Floor 2, Room 201" />
        {errors.location && <span style={{ color: 'red', fontSize: '12px' }}>{errors.location}</span>}
      </div>

      <div>
        <label style={lbl}>Building</label>
        <input style={inp} value={form.building} onChange={handle('building')}
          placeholder="e.g. Faculty of Computing Block" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={lbl}>Availability Start *</label>
          <input style={inp} type="time" value={form.availabilityStart}
            onChange={handle('availabilityStart')} />
        </div>
        <div>
          <label style={lbl}>Availability End *</label>
          <input style={inp} type="time" value={form.availabilityEnd}
            onChange={handle('availabilityEnd')} />
        </div>
      </div>

      <div>
        <label style={lbl}>Status *</label>
        <select style={inp} value={form.status} onChange={handle('status')}>
          <option value="ACTIVE">Active</option>
          <option value="UNDER_MAINTENANCE">Under Maintenance</option>
          <option value="OUT_OF_SERVICE">Out of Service</option>
        </select>
      </div>

      <div>
        <label style={lbl}>Description</label>
        <textarea style={{ ...inp, minHeight: '80px', resize: 'vertical' }}
          value={form.description} onChange={handle('description')}
          placeholder="Describe this resource..." />
      </div>

      <div>
        <label style={lbl}>Image URL (optional)</label>
        <input style={inp} value={form.imageUrl} onChange={handle('imageUrl')}
          placeholder="https://..." />
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
        <button type="button" onClick={onCancel} style={{
          padding: '10px 24px', borderRadius: '8px', border: '1px solid #ddd',
          background: '#f5f5f5', cursor: 'pointer', fontSize: '14px',
        }}>Cancel</button>
        <button type="submit" disabled={loading} style={{
          padding: '10px 24px', borderRadius: '8px', border: 'none',
          background: loading ? '#aaa' : '#2563eb', color: '#fff',
          cursor: loading ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: '600',
        }}>
          {loading ? 'Saving...' : 'Save Resource'}
        </button>
      </div>
    </form>
  );
}