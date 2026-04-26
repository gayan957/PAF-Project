import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  Clock,
  DoorOpen,
  Edit3,
  FlaskConical,
  MapPin,
  Package,
  ShieldCheck,
  Trash2,
  Users,
  Wrench,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { deleteResource, getResourceById, updateResourceStatus } from '../api/resourceApi';
import ResourceAvailabilityCalendar from '../components/resources/ResourceAvailabilityCalendar';
import StatusBadge from '../components/resources/StatusBadge';
import { getResourceImageGallery } from '../components/resources/resourceImages';

const typeMeta = {
  LECTURE_HALL: { label: 'Lecture Hall', icon: DoorOpen, bg: '#f3e8ff', color: '#7c3aed' },
  LAB: { label: 'Laboratory', icon: FlaskConical, bg: '#e0f2fe', color: '#0284c7' },
  MEETING_ROOM: { label: 'Meeting Room', icon: Building2, bg: '#ccfbf1', color: '#0f766e' },
  EQUIPMENT: { label: 'Equipment', icon: Package, bg: '#ffedd5', color: '#c2410c' },
};

const allowedTransitions = {
  ACTIVE: ['UNDER_MAINTENANCE', 'OUT_OF_SERVICE'],
  UNDER_MAINTENANCE: ['ACTIVE', 'OUT_OF_SERVICE'],
  OUT_OF_SERVICE: ['UNDER_MAINTENANCE'],
};

export default function ResourceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN';

  useEffect(() => {
    getResourceById(id)
      .then((response) => setResource(response.data.data))
      .catch(() => navigate('/resources'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const meta = useMemo(() => typeMeta[resource?.type] || typeMeta.EQUIPMENT, [resource]);
  const imageUrls = useMemo(
    () => getResourceImageGallery(resource),
    [resource]
  );

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [resource?.id]);

  const handleStatusChange = async (newStatus) => {
    const reason = window.prompt(`Reason for changing status to ${newStatus.replace(/_/g, ' ')}:`);
    if (reason === null) return;

    setStatusLoading(true);
    try {
      const response = await updateResourceStatus(id, newStatus, reason);
      setResource(response.data.data);
    } catch (error) {
      window.alert('Failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setStatusLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Remove this facility from the catalogue? This action cannot be undone.')) return;
    await deleteResource(id);
    navigate(isAdmin ? '/admin/resources' : '/resources');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center', color: '#64748b' }}>
          <Building2 size={38} />
          <p>Loading facility details...</p>
        </div>
      </div>
    );
  }

  if (!resource) return null;

  const TypeIcon = meta.icon;
  const transitions = allowedTransitions[resource.status] || [];

  return (
    <div style={{ padding: '24px', maxWidth: '1140px', margin: '0 auto' }}>
      <button
        type="button"
        onClick={() => navigate(isAdmin ? '/admin/resources' : '/resources')}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: '#475569',
          fontSize: '14px',
          padding: 0,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '7px',
          marginBottom: '18px',
          fontWeight: '700',
        }}
      >
        <ArrowLeft size={17} />
        Back to {isAdmin ? 'Facilities Management' : 'Resource Catalogue'}
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '24px' }}>
        <div>
          {imageUrls.length > 0 ? (
            <div style={{ marginBottom: '20px' }}>
              <img
                src={imageUrls[selectedImageIndex]}
                alt={resource.name}
                style={{ width: '100%', height: '326px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'block' }}
              />
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))',
                gap: '10px',
                marginTop: '12px',
              }}>
                {imageUrls.map((imageUrl, index) => (
                  <button
                    type="button"
                    key={imageUrl}
                    onClick={() => setSelectedImageIndex(index)}
                    style={{
                      padding: 0,
                      border: index === selectedImageIndex ? '2px solid #0f766e' : '1px solid #e2e8f0',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      background: '#fff',
                      height: '72px',
                    }}
                  >
                    <img
                      src={imageUrl}
                      alt={`${resource.name} ${index + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{
              height: '286px',
              borderRadius: '8px',
              marginBottom: '20px',
              border: '1px solid #e2e8f0',
              background: `linear-gradient(135deg, ${meta.bg} 0%, #ffffff 100%)`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
            }}>
              <div style={{
                width: '76px',
                height: '76px',
                borderRadius: '18px',
                background: '#fff',
                color: meta.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 16px 34px rgba(15, 23, 42, 0.10)',
              }}>
                <TypeIcon size={38} />
              </div>
              <span style={{ fontSize: '14px', color: meta.color, fontWeight: '800' }}>{meta.label}</span>
            </div>
          )}

          <div style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '24px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '18px', marginBottom: '18px' }}>
              <div>
                <p style={{ margin: '0 0 6px', color: '#0f766e', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0' }}>
                  Facility Record
                </p>
                <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '850', color: '#0f172a', letterSpacing: '0' }}>
                  {resource.name}
                </h1>
              </div>
              <StatusBadge status={resource.status} />
            </div>

            {resource.statusReason && (
              <div style={{
                background: '#fff7ed',
                border: '1px solid #fed7aa',
                borderRadius: '8px',
                padding: '11px 14px',
                fontSize: '13px',
                color: '#9a3412',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <AlertTriangle size={16} />
                {resource.statusReason}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '18px' }}>
              <InfoItem icon={MapPin} label="Location" value={resource.location} />
              {resource.building && <InfoItem icon={Building2} label="Building" value={resource.building} />}
              <InfoItem icon={TypeIcon} label="Type" value={meta.label} />
              {resource.capacity && <InfoItem icon={Users} label="Capacity" value={`${resource.capacity} people`} />}
              <InfoItem icon={Clock} label="Operating Hours" value={`${resource.availabilityStart} to ${resource.availabilityEnd}`} />
              {resource.createdBy && <InfoItem icon={ShieldCheck} label="Added By" value={resource.createdBy} />}
            </div>

            {resource.description && (
              <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '20px', paddingTop: '18px' }}>
                <h4 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: '800', color: '#334155' }}>
                  Facilities Notes
                </h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#64748b', lineHeight: 1.7 }}>
                  {resource.description}
                </p>
              </div>
            )}
          </div>

          <ResourceAvailabilityCalendar resource={resource} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Panel title="Operations Summary" icon={Building2}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '11px', fontSize: '13px' }}>
              <SummaryRow label="Type" value={meta.label} />
              <SummaryRow label="Status" value={<StatusBadge status={resource.status} />} />
              {resource.capacity && <SummaryRow label="Capacity" value={`${resource.capacity} seats`} />}
              <SummaryRow label="Opens" value={resource.availabilityStart} />
              <SummaryRow label="Closes" value={resource.availabilityEnd} />
              <SummaryRow label="Daily Hours" value={`${Math.max(0, timeToHour(resource.availabilityEnd) - timeToHour(resource.availabilityStart))}h`} />
            </div>
          </Panel>

          {isAdmin && (
            <Panel title="Admin Controls" icon={Wrench}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button type="button" onClick={() => navigate('/admin/resources')} style={adminButton('#0f766e')}>
                  <Edit3 size={15} />
                  Edit in Facilities Management
                </button>

                {transitions.includes('ACTIVE') && (
                  <button type="button" onClick={() => handleStatusChange('ACTIVE')} disabled={statusLoading} style={adminButton('#16a34a')}>
                    Mark Active
                  </button>
                )}
                {transitions.includes('UNDER_MAINTENANCE') && (
                  <button type="button" onClick={() => handleStatusChange('UNDER_MAINTENANCE')} disabled={statusLoading} style={adminButton('#d97706')}>
                    Mark Under Maintenance
                  </button>
                )}
                {transitions.includes('OUT_OF_SERVICE') && (
                  <button type="button" onClick={() => handleStatusChange('OUT_OF_SERVICE')} disabled={statusLoading} style={adminButton('#dc2626')}>
                    Mark Out of Service
                  </button>
                )}

                <div style={{ borderTop: '1px solid #f1f5f9', margin: '4px 0' }} />
                <button type="button" onClick={handleDelete} style={adminButton('#dc2626')}>
                  <Trash2 size={15} />
                  Remove Facility
                </button>
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}

function timeToHour(timeStr) {
  if (!timeStr) return 0;
  return Number(timeStr.split(':')[0]);
}

function Panel({ title, icon: Icon, children }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '18px',
    }}>
      <h4 style={{
        margin: '0 0 14px',
        fontSize: '14px',
        fontWeight: '800',
        color: '#334155',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <Icon size={17} color="#0f766e" />
        {title}
      </h4>
      {children}
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div>
      <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#64748b', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Icon size={14} />
        {label}
      </p>
      <p style={{ margin: 0, fontSize: '14px', color: '#0f172a', fontWeight: '700' }}>{value}</p>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
      <span style={{ color: '#64748b' }}>{label}</span>
      <span style={{ color: '#0f172a', fontWeight: '800', textAlign: 'right' }}>{value}</span>
    </div>
  );
}

function adminButton(color) {
  return {
    padding: '10px 12px',
    borderRadius: '8px',
    border: `1px solid ${color}24`,
    color,
    background: `${color}0d`,
    cursor: 'pointer',
    fontSize: '13px',
    textAlign: 'left',
    fontWeight: '800',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  };
}
