import React, { useState, useEffect, useCallback } from 'react';
import { getResources } from '../api/resourceApi';
import ResourceCard from '../components/resources/ResourceCard';
import ResourceFilter from '../components/resources/ResourceFilter';

export default function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});

  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, page, size: 12 };
      Object.keys(params).forEach(k => { if (!params[k] && params[k] !== 0) delete params[k]; });
      const res = await getResources(params);
      setResources(res.data.data.content);
      setTotalPages(res.data.data.totalPages);
    } catch (err) {
      console.error('Failed to load resources', err);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { fetchResources(); }, [fetchResources]);

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '700' }}>Campus Resources</h1>
          <p style={{ margin: '4px 0 0', color: '#666', fontSize: '14px' }}>
            Browse and filter available facilities and equipment
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px', alignItems: 'start' }}>
        <ResourceFilter
          filters={filters}
          onChange={(f) => { setFilters(f); setPage(0); }}
          onReset={() => { setFilters({}); setPage(0); }}
        />

        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>
              Loading resources...
            </div>
          ) : resources.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
              <p>No resources found. Try adjusting your filters.</p>
            </div>
          ) : (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '20px',
              }}>
                {resources.map(r => <ResourceCard key={r.id} resource={r} />)}
              </div>

              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '32px' }}>
                  <button onClick={() => setPage(p => p - 1)} disabled={page === 0}
                    style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #ddd', cursor: 'pointer' }}>
                    Previous
                  </button>
                  <span style={{ padding: '8px 16px', fontSize: '14px', color: '#555' }}>
                    Page {page + 1} of {totalPages}
                  </span>
                  <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}
                    style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #ddd', cursor: 'pointer' }}>
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}