import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getResources } from '../api/resourceApi';
import ResourceCard from '../components/resources/ResourceCard';
import ResourceFilter from '../components/resources/ResourceFilter';

export default function ResourcesPage() {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const [viewMode, setViewMode] = useState('grid');

  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, page, size: 12 };
      Object.keys(params).forEach(k => { if (!params[k] && params[k] !== 0) delete params[k]; });
      const res = await getResources(params);
      setResources(res.data.data.content);
      setTotalPages(res.data.data.totalPages);
      setTotalElements(res.data.data.totalElements);
    } catch (err) {
      console.error('Failed to load resources', err);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { fetchResources(); }, [fetchResources]);

  const hasActiveFilters = Object.values(filters).some(v => v);

  return (
    <div style={{ padding: '24px', maxWidth: '1300px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '700', color: '#111' }}>
            Campus Resources
          </h1>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '14px' }}>
            {totalElements > 0
              ? `Showing ${resources.length} of ${totalElements} resources`
              : 'Browse and filter available facilities and equipment'}
          </p>
        </div>

        {/* View toggle */}
        <div style={{ display: 'flex', gap: '4px', background: '#f3f4f6', borderRadius: '8px', padding: '3px' }}>
          {[{ mode: 'grid', icon: '⊞' }, { mode: 'list', icon: '☰' }].map(({ mode, icon }) => (
            <button key={mode} onClick={() => setViewMode(mode)} style={{
              padding: '6px 12px', borderRadius: '6px', border: 'none',
              background: viewMode === mode ? '#fff' : 'transparent',
              cursor: 'pointer', fontSize: '16px',
              boxShadow: viewMode === mode ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}>
              {icon}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Filter sidebar */}
        <div style={{ position: 'sticky', top: '20px' }}>
          <ResourceFilter
            filters={filters}
            onChange={(f) => { setFilters(f); setPage(0); }}
            onReset={() => { setFilters({}); setPage(0); }}
          />
          {hasActiveFilters && (
            <div style={{
              marginTop: '10px', padding: '8px 12px',
              background: '#eff6ff', borderRadius: '8px',
              fontSize: '12px', color: '#2563eb',
            }}>
              🔍 Filters active — {resources.length} result{resources.length !== 1 ? 's' : ''} found
            </div>
          )}
        </div>

        {/* Content */}
        <div>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{
                  height: '280px', borderRadius: '12px',
                  background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite',
                }} />
              ))}
            </div>
          ) : resources.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '80px 40px',
              background: '#fff', borderRadius: '16px',
              border: '2px dashed #e5e7eb',
            }}>
              <div style={{ fontSize: '56px', marginBottom: '16px' }}>
                {hasActiveFilters ? '🔍' : '🏛️'}
              </div>
              <h3 style={{ margin: '0 0 8px', color: '#374151' }}>
                {hasActiveFilters ? 'No resources match your filters' : 'No resources yet'}
              </h3>
              <p style={{ margin: '0 0 20px', color: '#9ca3af', fontSize: '14px' }}>
                {hasActiveFilters
                  ? 'Try adjusting or clearing your filters'
                  : 'Resources will appear here once added by an administrator'}
              </p>
              {hasActiveFilters && (
                <button onClick={() => { setFilters({}); setPage(0); }} style={{
                  padding: '10px 20px', borderRadius: '8px',
                  border: '1px solid #e5e7eb', background: '#fff',
                  cursor: 'pointer', fontSize: '14px', color: '#374151',
                }}>
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                  gap: '20px',
                }}>
                  {resources.map(r => <ResourceCard key={r.id} resource={r} />)}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {resources.map(r => (
                    <div key={r.id} onClick={() => navigate(`/resources/${r.id}`)}
                      style={{
                        background: '#fff', border: '1px solid #e5e7eb',
                        borderRadius: '12px', padding: '16px 20px',
                        cursor: 'pointer', display: 'flex',
                        justifyContent: 'space-between', alignItems: 'center',
                        transition: 'box-shadow 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                    >
                      <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                        <div style={{
                          width: '44px', height: '44px', borderRadius: '10px',
                          background: '#f0f4ff', display: 'flex',
                          alignItems: 'center', justifyContent: 'center', fontSize: '22px',
                        }}>
                          {r.type === 'LAB' ? '🔬' : r.type === 'LECTURE_HALL' ? '🏛️' : r.type === 'MEETING_ROOM' ? '📋' : '📷'}
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', color: '#111' }}>{r.name}</div>
                          <div style={{ fontSize: '13px', color: '#6b7280' }}>
                            📍 {r.location} {r.capacity ? `• 👥 ${r.capacity}` : ''} • 🕐 {r.availabilityStart}–{r.availabilityEnd}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                          fontSize: '12px', color: '#6b7280',
                          background: '#f3f4f6', padding: '3px 8px', borderRadius: '6px',
                        }}>
                          {r.type?.replace(/_/g, ' ')}
                        </span>
                        {/* StatusBadge inline */}
                        <span style={{
                          padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                          background: r.status === 'ACTIVE' ? '#d4edda' : r.status === 'OUT_OF_SERVICE' ? '#f8d7da' : '#fff3cd',
                          color: r.status === 'ACTIVE' ? '#155724' : r.status === 'OUT_OF_SERVICE' ? '#721c24' : '#856404',
                        }}>
                          {r.status?.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '32px' }}>
                  <button onClick={() => setPage(0)} disabled={page === 0} style={pageBtn(page === 0)}>«</button>
                  <button onClick={() => setPage(p => p - 1)} disabled={page === 0} style={pageBtn(page === 0)}>‹</button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const pageNum = Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
                    return (
                      <button key={pageNum} onClick={() => setPage(pageNum)} style={{
                        ...pageBtn(false),
                        background: page === pageNum ? '#2563eb' : '#fff',
                        color: page === pageNum ? '#fff' : '#374151',
                        borderColor: page === pageNum ? '#2563eb' : '#e5e7eb',
                        fontWeight: page === pageNum ? '600' : '400',
                      }}>
                        {pageNum + 1}
                      </button>
                    );
                  })}
                  <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1} style={pageBtn(page >= totalPages - 1)}>›</button>
                  <button onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1} style={pageBtn(page >= totalPages - 1)}>»</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function pageBtn(disabled) {
  return {
    padding: '8px 12px', borderRadius: '8px',
    border: '1px solid #e5e7eb', background: '#fff',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.4 : 1, fontSize: '14px', color: '#374151',
  };
}