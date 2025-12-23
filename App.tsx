import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import { ApiResponse, ColisItem } from './types';

const PAGE_SIZE = 100;

const formatValue = (value: unknown) => {
  if (value === undefined || value === null || value === '') {
    return '—';
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
};

const App: React.FC = () => {
  const [items, setItems] = useState<ColisItem[]>([]);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);

  const fetchPage = async (targetPage: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/colis?page=${targetPage}`);
      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload.message || 'Failed to fetch orders.');
      }
      const payload: ApiResponse = await response.json();
      setItems(payload.items || []);
      setPage(payload.page);
      setPageSize(payload.pageSize || PAGE_SIZE);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPage(page);
  }, []);

  const statusOptions = useMemo(() => {
    const options = new Set<string>();
    items.forEach((item) => {
      if (item.etat) {
        options.add(item.etat);
      }
    });
    return Array.from(options).sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    const lowerSearch = searchTerm.trim().toLowerCase();
    return items.filter((item) => {
      const matchesStatus = statusFilter ? item.etat === statusFilter : true;
      const matchesSearch = lowerSearch
        ? (item.code || '').toLowerCase().includes(lowerSearch)
        : true;
      return matchesStatus && matchesSearch;
    });
  }, [items, searchTerm, statusFilter]);

  const extraColumns = useMemo(() => {
    const columns = new Set<string>();
    items.forEach((item) => {
      if (item.extra) {
        Object.keys(item.extra).forEach((key) => {
          columns.add(key);
        });
      }
    });
    return Array.from(columns).sort();
  }, [items]);

  const handleRefresh = () => {
    fetchPage(page);
  };

  const handlePrev = () => {
    if (page > 1) {
      fetchPage(page - 1);
    }
  };

  const handleNext = () => {
    fetchPage(page + 1);
  };

  const hasNext = items.length === pageSize;

  return (
    <div className="app">
      <header className="app__header">
        <div>
          <p className="app__eyebrow">Vita Zen</p>
          <h1>Colissimo Orders Dashboard</h1>
          <p className="app__subtext">Track, filter, and search your Colissimo colis in real time.</p>
        </div>
        <button className="button button--secondary" onClick={handleRefresh} disabled={isLoading}>
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </header>

      <section className="app__controls">
        <div className="control">
          <label htmlFor="statusFilter">Status (Etat)</label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="">All statuses</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <div className="control">
          <label htmlFor="search">Search by code</label>
          <input
            id="search"
            type="search"
            placeholder="Search code..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
        <div className="pagination">
          <button className="button button--ghost" onClick={handlePrev} disabled={page <= 1 || isLoading}>
            Prev
          </button>
          <span>Page {page}</span>
          <button className="button button--ghost" onClick={handleNext} disabled={!hasNext || isLoading}>
            Next
          </button>
        </div>
      </section>

      {error && <div className="alert">{error}</div>}

      <section className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Etat</th>
              <th>Client</th>
              <th>Montant</th>
              <th>Tel</th>
              <th>Adresse</th>
              <th>Poids</th>
              {extraColumns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 && !isLoading && (
              <tr>
                <td colSpan={7 + extraColumns.length} className="empty">
                  No orders found for the current filters.
                </td>
              </tr>
            )}
            {filteredItems.map((item) => (
              <tr key={`${item.code}-${item.etat}-${item.client}`}>
                <td className="highlight">{formatValue(item.code)}</td>
                <td className="highlight">{formatValue(item.etat)}</td>
                <td>{formatValue(item.client)}</td>
                <td>{formatValue(item.montant)}</td>
                <td>{formatValue(item.tel)}</td>
                <td>{formatValue(item.adresse)}</td>
                <td>{formatValue(item.poids)}</td>
                {extraColumns.map((column) => (
                  <td key={`${item.code}-${column}`}>{formatValue(item.extra?.[column])}</td>
                ))}
              </tr>
            ))}
            {isLoading && (
              <tr>
                <td colSpan={7 + extraColumns.length} className="loading">
                  Loading Colissimo orders...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default App;
