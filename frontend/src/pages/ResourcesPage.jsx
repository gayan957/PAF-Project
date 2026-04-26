import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Building2, Clock, Grid3X3, List, MapPin, Search, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getResources } from '../api/resourceApi';
import ResourceCard from '../components/resources/ResourceCard';
import ResourceFilter from '../components/resources/ResourceFilter';
import StatusBadge from '../components/resources/StatusBadge';
import { getPrimaryResourceImage } from '../components/resources/resourceImages';

export default function ResourcesPage() {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const [viewMode, setViewMode] = useState('grid');
  const [bookingResource, setBookingResource] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState('');

  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, page, size: 12 };
      Object.keys(params).forEach((key) => {
        if (!params[key] && params[key] !== 0) delete params[key];
      });
      const response = await getResources(params);
      const data = response.data.data;
      setResources(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (error) {
      console.error('Failed to load resources', error);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const hasActiveFilters = useMemo(
    () => Object.values(filters).some((value) => value),
    [filters]
  );

  return (
    <div style={{ padding: '24px', maxWidth: '1320px', margin: '0 auto' }}>
      {bookingSuccess && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '12px 16px', marginBottom: '16px',
          background: '#f0fdf4', border: '1px solid #bbf7d0',
          borderRadius: '8px', fontSize: '14px', color: '#15803d', fontWeight: '600',
        }}>
          ✓ {bookingSuccess}
          <button
            type="button"
            onClick={() => setBookingSuccess('')}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#15803d', fontSize: '16px', lineHeight: 1 }}
          >×</button>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px', marginBottom: '24px' }}>
        <div>
          <p style={{ margin: '0 0 6px', color: '#0f766e', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0' }}>
            Campus Facilities
          </p>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '850', color: '#0f172a', letterSpacing: '0' }}>
            Resource Catalogue
          </h1>
          <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '14px' }}>
            {totalElements > 0
              ? `${totalElements} managed facilities and equipment items`
              : 'Browse facilities and equipment maintained by the administration team'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', borderRadius: '8px', padding: '4px', border: '1px solid #e2e8f0' }}>
          <ToggleButton active={viewMode === 'grid'} onClick={() => setViewMode('grid')} title="Grid view">
            <Grid3X3 size={17} />
          </ToggleButton>
          <ToggleButton active={viewMode === 'list'} onClick={() => setViewMode('list')} title="List view">
            <List size={18} />
          </ToggleButton>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px minmax(0, 1fr)', gap: '24px', alignItems: 'start' }}>
        <div style={{ position: 'sticky', top: '20px' }}>
          <ResourceFilter
            filters={filters}
            onChange={(nextFilters) => {
              setFilters(nextFilters);
              setPage(0);
            }}
            onReset={() => {
              setFilters({});
              setPage(0);
            }}
          />
          {hasActiveFilters && (
            <div style={{
              marginTop: '10px',
              padding: '10px 12px',
              background: '#ecfeff',
              border: '1px solid #a5f3fc',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#0e7490',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: '700',
            }}>
              <Search size={14} />
              {resources.length} result{resources.length !== 1 ? 's' : ''} match the filters
            </div>
          )}
        </div>

        <div>
          {loading ? (
            <LoadingGrid />
          ) : resources.length === 0 ? (
            <EmptyState
              hasActiveFilters={hasActiveFilters}
              onClear={() => {
                setFilters({});
                setPage(0);
              }}
            />
          ) : (
            <>
              {viewMode === 'grid' ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                  gap: '18px',
                }}>
                  {resources.map((resource) => (
                    <ResourceCard key={resource.id} resource={resource} onBook={setBookingResource} />
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {resources.map((resource) => (
                    <ResourceRow
                      key={resource.id}
                      resource={resource}
                      onClick={() => navigate(`/resources/${resource.id}`)}
                    />
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <Pagination page={page} totalPages={totalPages} setPage={setPage} />
              )}
            </>
          )}
        </div>
      </div>

      {bookingResource && (
        <BookingFormModal
          resource={bookingResource}
          onClose={() => setBookingResource(null)}
          onSuccess={() => {
            setBookingResource(null);
            setBookingSuccess('Booking request submitted! Pending admin approval.');
          }}
        />
      )}
    </div>
  );
}

function ToggleButton({ active, onClick, title, children }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      style={{
        width: '36px',
        height: '32px',
        borderRadius: '7px',
        border: 'none',
        background: active ? '#fff' : 'transparent',
        color: active ? '#0f766e' : '#64748b',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: active ? '0 1px 4px rgba(15, 23, 42, 0.12)' : 'none',
      }}
    >
      {children}
    </button>
  );
}

function ResourceRow({ resource, onClick }) {
  const primaryImage = getPrimaryResourceImage(resource);

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '15px 18px',
        cursor: 'pointer',
        display: 'grid',
        gridTemplateColumns: 'minmax(230px, 1.2fr) 150px minmax(170px, 1fr) 110px 170px',
        gap: '14px',
        alignItems: 'center',
        textAlign: 'left',
      }}
    >
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={resource.name}
            style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0, border: '1px solid #e2e8f0' }}
          />
        ) : (
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '8px',
            background: '#ecfeff',
            color: '#0f766e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Building2 size={21} />
          </div>
        )}
        <div>
          <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '14px' }}>{resource.name}</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>{resource.building || 'Campus facility'}</div>
        </div>
      </div>
      <Info icon={MapPin} text={resource.location} />
      <Info icon={Clock} text={`${resource.availabilityStart} to ${resource.availabilityEnd}`} />
      <Info icon={Users} text={resource.capacity ? `${resource.capacity}` : 'N/A'} />
      <StatusBadge status={resource.status} />
    </button>
  );
}

function Info({ icon: Icon, text }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: '7px', color: '#475569', fontSize: '13px' }}>
      <Icon size={15} color="#64748b" />
      {text}
    </span>
  );
}

function LoadingGrid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '18px' }}>
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} style={{
          height: '326px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          background: 'linear-gradient(90deg, #f8fafc 25%, #eef2f7 50%, #f8fafc 75%)',
          backgroundSize: '200% 100%',
        }} />
      ))}
    </div>
  );
}

function EmptyState({ hasActiveFilters, onClear }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '72px 40px',
      background: '#fff',
      borderRadius: '8px',
      border: '1px dashed #cbd5e1',
    }}>
      <Building2 size={46} color="#94a3b8" />
      <h3 style={{ margin: '14px 0 8px', color: '#0f172a', fontSize: '18px' }}>
        {hasActiveFilters ? 'No facilities match your filters' : 'No facilities have been added yet'}
      </h3>
      <p style={{ margin: '0 0 20px', color: '#64748b', fontSize: '14px' }}>
        {hasActiveFilters
          ? 'Adjust the filters to widen the catalogue view.'
          : 'Facilities will appear here after an administrator adds them.'}
      </p>
      {hasActiveFilters && (
        <button type="button" onClick={onClear} style={{
          padding: '10px 16px',
          borderRadius: '8px',
          border: '1px solid #d7dde8',
          background: '#fff',
          cursor: 'pointer',
          fontSize: '14px',
          color: '#334155',
          fontWeight: '800',
        }}>
          Clear filters
        </button>
      )}
    </div>
  );
}

function Pagination({ page, totalPages, setPage }) {
  const start = Math.max(0, Math.min(page - 2, totalPages - 5));
  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, index) => start + index);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '30px' }}>
      <button type="button" onClick={() => setPage(0)} disabled={page === 0} style={pageButton(page === 0)}>First</button>
      <button type="button" onClick={() => setPage((current) => current - 1)} disabled={page === 0} style={pageButton(page === 0)}>Prev</button>
      {pages.map((pageNum) => (
        <button
          type="button"
          key={pageNum}
          onClick={() => setPage(pageNum)}
          style={{
            ...pageButton(false),
            background: page === pageNum ? '#0f766e' : '#fff',
            color: page === pageNum ? '#fff' : '#334155',
            borderColor: page === pageNum ? '#0f766e' : '#d7dde8',
          }}
        >
          {pageNum + 1}
        </button>
      ))}
      <button type="button" onClick={() => setPage((current) => current + 1)} disabled={page >= totalPages - 1} style={pageButton(page >= totalPages - 1)}>Next</button>
      <button type="button" onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1} style={pageButton(page >= totalPages - 1)}>Last</button>
    </div>
  );
}

function pageButton(disabled) {
  return {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #d7dde8',
    background: '#fff',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.45 : 1,
    fontSize: '13px',
    color: '#334155',
    fontWeight: '800',
  };
}
