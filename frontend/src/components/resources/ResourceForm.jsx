import React, { useEffect, useMemo, useState } from 'react';
import { Clock, MapPin, Plus, Save, Trash2, Upload, X } from 'lucide-react';
import { DAY_OPTIONS, getAvailabilityWindows } from './resourceAvailability';
import { getResourceImageUrl } from './resourceImages';

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
  availabilityWindows: [{ day: 'MONDAY', openingTime: '08:00', closingTime: '18:00' }],
  status: 'ACTIVE',
  description: '',
  imageUrls: [],
};

const MAX_RESOURCE_IMAGES = 5;

export default function ResourceForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [existingImages, setExistingImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);

  useEffect(() => {
    if (!initial) {
      setForm(emptyForm);
      setExistingImages([]);
      setImageFiles([]);
      return;
    }

    const initialImages = normalizeImages(initial.imageUrls, initial.imageUrl);
    const initialWindows = getAvailabilityWindows(initial);
    setForm({
      ...emptyForm,
      ...initial,
      capacity: initial.capacity ?? '',
      availabilityStart: initialWindows[0]?.openingTime || '08:00',
      availabilityEnd: initialWindows[0]?.closingTime || '18:00',
      availabilityWindows: initialWindows.length > 0 ? initialWindows : emptyForm.availabilityWindows,
      imageUrls: initialImages,
      description: initial.description ?? '',
      building: initial.building ?? '',
    });
    setExistingImages(initialImages);
    setImageFiles([]);
  }, [initial]);

  const selectedPreviews = useMemo(
    () => imageFiles.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [imageFiles]
  );

  useEffect(() => {
    return () => {
      selectedPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [selectedPreviews]);

  const handle = (key) => (e) => {
    setForm((current) => ({ ...current, [key]: e.target.value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleImageSelect = (event) => {
    const selectedFiles = Array.from(event.target.files || []).filter((file) =>
      file.type.startsWith('image/')
    );
    const remainingSlots = MAX_RESOURCE_IMAGES - existingImages.length - imageFiles.length;

    if (remainingSlots <= 0) {
      setErrors((current) => ({
        ...current,
        images: `Maximum ${MAX_RESOURCE_IMAGES} photos can be added per resource.`,
      }));
      event.target.value = '';
      return;
    }

    const acceptedFiles = selectedFiles.slice(0, remainingSlots);
    setImageFiles((current) => [...current, ...acceptedFiles]);
    setErrors((current) => ({
      ...current,
      images: selectedFiles.length > remainingSlots
        ? `Only ${remainingSlots} more photo${remainingSlots === 1 ? '' : 's'} can be added. Maximum is ${MAX_RESOURCE_IMAGES}.`
        : undefined,
    }));
    event.target.value = '';
  };

  const removeExistingImage = (imageUrl) => {
    setExistingImages((current) => current.filter((url) => url !== imageUrl));
  };

  const removeSelectedImage = (index) => {
    setImageFiles((current) => current.filter((_, currentIndex) => currentIndex !== index));
  };

  const handleWindowChange = (index, key) => (event) => {
    const value = event.target.value;
    setForm((current) => ({
      ...current,
      availabilityWindows: current.availabilityWindows.map((window, currentIndex) =>
        currentIndex === index ? { ...window, [key]: value } : window
      ),
    }));
    setErrors((current) => ({ ...current, availabilityWindows: undefined }));
  };

  const addAvailabilityWindow = () => {
    setForm((current) => ({
      ...current,
      availabilityWindows: [
        ...current.availabilityWindows,
        { day: 'MONDAY', openingTime: '08:00', closingTime: '18:00' },
      ],
    }));
  };

  const removeAvailabilityWindow = (index) => {
    setForm((current) => ({
      ...current,
      availabilityWindows: current.availabilityWindows.filter((_, currentIndex) => currentIndex !== index),
    }));
  };

  const validate = () => {
    const nextErrors = {};
    const windows = form.availabilityWindows || [];

    if (!form.name.trim()) nextErrors.name = 'Resource name is required.';
    if (!form.location.trim()) nextErrors.location = 'Location is required.';
    if (windows.length === 0) {
      nextErrors.availabilityWindows = 'At least one availability window is required.';
    }
    if (windows.some((window) => !window.day || !window.openingTime || !window.closingTime)) {
      nextErrors.availabilityWindows = 'Each availability window needs a day, opening time, and closing time.';
    }
    if (windows.some((window) => window.openingTime && window.closingTime && window.openingTime >= window.closingTime)) {
      nextErrors.availabilityWindows = 'Each closing time must be later than its opening time.';
    }
    if (form.capacity !== '' && Number(form.capacity) < 1) {
      nextErrors.capacity = 'Capacity must be at least 1.';
    }
    if (existingImages.length + imageFiles.length > MAX_RESOURCE_IMAGES) {
      nextErrors.images = `Maximum ${MAX_RESOURCE_IMAGES} photos can be added per resource.`;
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
      imageUrl: existingImages[0] || '',
      imageUrls: existingImages,
      capacity: form.capacity === '' ? null : Number(form.capacity),
      availabilityStart: form.availabilityWindows[0]?.openingTime || '',
      availabilityEnd: form.availabilityWindows[0]?.closingTime || '',
      availabilityWindows: form.availabilityWindows,
    }, imageFiles);
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

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>Availability windows *</label>
          <button type="button" onClick={addAvailabilityWindow} style={smallActionButton}>
            <Plus size={15} />
            Add Window
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {form.availabilityWindows.map((window, index) => (
            <div key={index} style={windowRow}>
              <select style={fieldStyle} value={window.day} onChange={handleWindowChange(index, 'day')}>
                {DAY_OPTIONS.map((day) => (
                  <option key={day.value} value={day.value}>{day.label}</option>
                ))}
              </select>
              <div style={{ position: 'relative' }}>
                <Clock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
                <input
                  style={{ ...fieldStyle, paddingLeft: '36px' }}
                  type="time"
                  value={window.openingTime}
                  onChange={handleWindowChange(index, 'openingTime')}
                />
              </div>
              <input
                style={fieldStyle}
                type="time"
                value={window.closingTime}
                onChange={handleWindowChange(index, 'closingTime')}
              />
              <button
                type="button"
                title="Remove window"
                onClick={() => removeAvailabilityWindow(index)}
                disabled={form.availabilityWindows.length === 1}
                style={{
                  ...iconButton,
                  opacity: form.availabilityWindows.length === 1 ? 0.45 : 1,
                  cursor: form.availabilityWindows.length === 1 ? 'not-allowed' : 'pointer',
                }}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
        {errors.availabilityWindows && <span style={errorStyle}>{errors.availabilityWindows}</span>}
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
        <label style={labelStyle}>Facility photos</label>
        <label htmlFor="resource-images" style={uploadBox}>
          <Upload size={22} color="#0f766e" />
          <span style={{ fontWeight: '800', color: '#0f172a' }}>Choose images from this PC</span>
          <span style={{ color: '#64748b', fontSize: '12px' }}>
            Select up to {MAX_RESOURCE_IMAGES} JPG, PNG, or WEBP files
          </span>
        </label>
        <input
          id="resource-images"
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageSelect}
          hidden
        />

        {(existingImages.length > 0 || selectedPreviews.length > 0) && (
          <div style={imageGrid}>
            {existingImages.map((imageUrl, index) => (
              <ImagePreview
                key={imageUrl}
                src={getResourceImageUrl(imageUrl)}
                label={index === 0 ? 'Primary' : 'Saved'}
                onRemove={() => removeExistingImage(imageUrl)}
              />
            ))}
            {selectedPreviews.map((preview, index) => (
              <ImagePreview
                key={`${preview.file.name}-${index}`}
                src={preview.url}
                label={existingImages.length === 0 && index === 0 ? 'Primary' : 'New'}
                onRemove={() => removeSelectedImage(index)}
              />
            ))}
          </div>
        )}
        {errors.images && <span style={errorStyle}>{errors.images}</span>}
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

const smallActionButton = {
  padding: '7px 10px',
  borderRadius: '8px',
  border: '1px solid #99f6e4',
  background: '#ecfeff',
  color: '#0f766e',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: '800',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
};

const windowRow = {
  display: 'grid',
  gridTemplateColumns: '1.2fr 1fr 1fr 38px',
  gap: '10px',
  alignItems: 'center',
  padding: '10px',
  border: '1px solid #e2e8f0',
  borderRadius: '10px',
  background: '#f8fafc',
};

const iconButton = {
  width: '38px',
  height: '38px',
  borderRadius: '8px',
  border: '1px solid #fecaca',
  color: '#b91c1c',
  background: '#fff',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const uploadBox = {
  minHeight: '104px',
  border: '1px dashed #94a3b8',
  borderRadius: '10px',
  background: '#f8fafc',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '7px',
  textAlign: 'center',
  padding: '18px',
};

const imageGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(118px, 1fr))',
  gap: '10px',
  marginTop: '12px',
};

function ImagePreview({ src, label, onRemove }) {
  return (
    <div style={{ position: 'relative', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', background: '#fff' }}>
      <img src={src} alt="Facility preview" style={{ width: '100%', height: '94px', objectFit: 'cover', display: 'block' }} />
      <div style={{
        position: 'absolute',
        left: '7px',
        top: '7px',
        padding: '3px 7px',
        borderRadius: '999px',
        background: 'rgba(15, 23, 42, 0.72)',
        color: '#fff',
        fontSize: '11px',
        fontWeight: '800',
      }}>
        {label}
      </div>
      <button type="button" title="Remove image" onClick={onRemove} style={{
        position: 'absolute',
        right: '7px',
        top: '7px',
        width: '26px',
        height: '26px',
        borderRadius: '999px',
        border: 'none',
        background: 'rgba(255, 255, 255, 0.92)',
        color: '#b91c1c',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Trash2 size={14} />
      </button>
    </div>
  );
}

function normalizeImages(imageUrls, imageUrl) {
  const images = new Set();
  (imageUrls || []).filter(Boolean).forEach((url) => images.add(url));
  if (imageUrl) images.add(imageUrl);
  return Array.from(images);
}
