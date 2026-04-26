import React, { useEffect, useState } from 'react';
import { Clock, Image, MapPin, Save, X } from 'lucide-react';

const fieldStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #d7dde8',
  borderRadius: '8px',
  fontSize: '14px',
  boxSizing: 'border-box',
  outline: 'none',
  background: '#fff',
};

const labelStyle = {
  fontSize: '13px',
  fontWeight: '700',
  color: '#334155',
  display: 'block',
  marginBottom: '6px',
};

const errorStyle = {
  color: '#b91c1c',
  fontSize: '12px',
  marginTop: '4px',
  display: 'block',
};

const emptyForm = {
  name: '',
  type: 'LAB',
  capacity: '',
  location: '',
  building: '',
  availabilityStart: '08:00',
  availabilityEnd: '18:00',
  status: 'ACTIVE',
  description: '',
  imageUrl: '',
};

export default function ResourceForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!initial) {
      setForm(emptyForm);
      return;
    }

    setForm({
      ...emptyForm,
      ...initial,
      capacity: initial.capacity ?? '',
      imageUrl: initial.imageUrl ?? '',
      description: initial.description ?? '',
      building: initial.building ?? '',
    });
  }, [initial]);

  const handle = (key) => (e) => {
    setForm((current) => ({ ...current, [key]: e.target.value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validate = () => {
    const nextErrors = {};
    const start = form.availabilityStart;
    const end = form.availabilityEnd;

    if (!form.name.trim()) nextErrors.name = 'Resource name is required.';
    if (!form.location.trim()) nextErrors.location = 'Location is required.';
    if (!start) nextErrors.availabilityStart = 'Opening time is required.';
    if (!end) nextErrors.availabilityEnd = 'Closing time is required.';
    if (start && end && start >= end) {
      nextErrors.availabilityEnd = 'Closing time must be later than opening time.';
    }
    if (form.capacity !== '' && Number(form.capacity) < 1) {
      nextErrors.capacity = 'Capacity must be at least 1.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;

    onSubmit({
      ...form,
      name: form.name.trim(),
      location: form.location.trim(),
      building: form.building.trim(),
      description: form.description.trim(),
      imageUrl: form.imageUrl.trim(),
      capacity: form.capacity === '' ? null : Number(form.capacity),
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div>
        <label style={labelStyle}>Facility name *</label>
        <input
          style={fieldStyle}
          value={form.name}
          onChange={handle('name')}
          placeholder="Computer Lab A"
        />
        {errors.name && <span style={errorStyle}>{errors.name}</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={labelStyle}>Facility type *</label>
          <select style={fieldStyle} value={form.type} onChange={handle('type')}>
            <option value="LECTURE_HALL">Lecture Hall</option>
            <option value="LAB">Laboratory</option>
            <option value="MEETING_ROOM">Meeting Room</option>
            <option value="EQUIPMENT">Equipment</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>Capacity</label>
          <input
            style={fieldStyle}
            type="number"
            min="1"
            value={form.capacity}
            onChange={handle('capacity')}
            placeholder="40"
          />
          {errors.capacity && <span style={errorStyle}>{errors.capacity}</span>}
        </div>
      </div>

      <div>
        <label style={labelStyle}>Location *</label>
        <div style={{ position: 'relative' }}>
          <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
          <input
            style={{ ...fieldStyle, paddingLeft: '36px' }}
            value={form.location}
            onChange={handle('location')}
            placeholder="Block A, Floor 2, Room 201"
          />
        </div>
        {errors.location && <span style={errorStyle}>{errors.location}</span>}
      </div>

      <div>
        <label style={labelStyle}>Building / zone</label>
        <input
          style={fieldStyle}
          value={form.building}
          onChange={handle('building')}
          placeholder="Faculty of Computing"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={labelStyle}>Opening time *</label>
          <div style={{ position: 'relative' }}>
            <Clock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
            <input
              style={{ ...fieldStyle, paddingLeft: '36px' }}
              type="time"
              value={form.availabilityStart}
              onChange={handle('availabilityStart')}
            />
          </div>
          {errors.availabilityStart && <span style={errorStyle}>{errors.availabilityStart}</span>}
        </div>

        <div>
          <label style={labelStyle}>Closing time *</label>
          <input
            style={fieldStyle}
            type="time"
            value={form.availabilityEnd}
            onChange={handle('availabilityEnd')}
          />
          {errors.availabilityEnd && <span style={errorStyle}>{errors.availabilityEnd}</span>}
        </div>
      </div>

      <div>
        <label style={labelStyle}>Operational status *</label>
        <select style={fieldStyle} value={form.status} onChange={handle('status')}>
          <option value="ACTIVE">Active</option>
          <option value="UNDER_MAINTENANCE">Under Maintenance</option>
          <option value="OUT_OF_SERVICE">Out of Service</option>
        </select>
      </div>

      <div>
        <label style={labelStyle}>Facilities notes</label>
        <textarea
          style={{ ...fieldStyle, minHeight: '92px', resize: 'vertical', lineHeight: 1.5 }}
          value={form.description}
          onChange={handle('description')}
          placeholder="List lab software, equipment, room layout, access notes, or maintenance instructions."
        />
      </div>

      <div>
        <label style={labelStyle}>Image URL</label>
        <div style={{ position: 'relative' }}>
          <Image size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
          <input
            style={{ ...fieldStyle, paddingLeft: '36px' }}
            value={form.imageUrl}
            onChange={handle('imageUrl')}
            placeholder="https://example.com/facility.jpg"
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '4px' }}>
        <button type="button" onClick={onCancel} style={secondaryButton}>
          <X size={16} />
          Cancel
        </button>
        <button type="submit" disabled={loading} style={{
          ...primaryButton,
          opacity: loading ? 0.65 : 1,
          cursor: loading ? 'not-allowed' : 'pointer',
        }}>
          <Save size={16} />
          {loading ? 'Saving...' : 'Save Facility'}
        </button>
      </div>
    </form>
  );
}

const secondaryButton = {
  padding: '10px 16px',
  borderRadius: '8px',
  border: '1px solid #d7dde8',
  background: '#fff',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '700',
  color: '#475569',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
};

const primaryButton = {
  padding: '10px 18px',
  borderRadius: '8px',
  border: 'none',
  background: '#0f766e',
  color: '#fff',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '700',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
};
