import { useState, useEffect, useRef } from 'react';
import { Database, Calendar, FileText, Loader2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'react-toastify';
import { getAllData } from '../services/api';
import type { DataItem } from '../services/api';

export default function DataListing() {
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchData(false);
    }
  }, []);

  const fetchData = async (showToast = true) => {
    try {
      setLoading(true);
      setError('');
      const result = await getAllData();
      // Ensure result is an array
      const dataArray = Array.isArray(result) ? result : [];
      setData(dataArray);
      if (showToast && dataArray.length > 0) {
        toast.info(`📊 Loaded ${dataArray.length} upload${dataArray.length > 1 ? 's' : ''}`);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch data';
      setError(errorMsg);
      setData([]); // Reset to empty array on error
      if (showToast) {
        toast.error(`❌ ${errorMsg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-10 h-10 text-pink-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-3 max-w-2xl mx-auto">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-red-900">Error loading data</p>
          <p className="text-xs text-red-700 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl p-12 border border-slate-200 shadow-lg max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl mb-6">
          <Database className="w-10 h-10 text-pink-600" />
        </div>
        <p className="text-slate-900 text-xl font-semibold mb-2">No data uploaded yet</p>
        <p className="text-slate-500">Upload a PDF to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/20">
            <Database className="w-5 h-5 text-white" />
          </div>
          Extracted Data ({Array.isArray(data) ? data.length : 0})
        </h3>
        <button
          onClick={() => fetchData(true)}
          className="text-sm text-slate-700 bg-white hover:bg-slate-50 px-5 py-2.5 rounded-xl font-semibold cursor-pointer transition-all border border-slate-200 shadow-sm flex items-center gap-2"
        >
          🔄 Refresh
        </button>
      </div>

      {Array.isArray(data) && data.map((item) => (
        <div
          key={item.id}
          className="bg-slate-800 rounded-2xl shadow-lg overflow-hidden border border-slate-700"
        >
          <div
            className="p-5 hover:bg-slate-750 transition-colors cursor-pointer"
            onClick={() => toggleExpand(item.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="flex-shrink-0 w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-slate-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-semibold text-white truncate mb-2">
                    {item.original_name}
                  </h4>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(item.uploaded_at)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5" />
                      {item.row_count} rows
                    </span>
                  </div>
                </div>
              </div>
              <button className="flex-shrink-0 p-2 text-slate-400 hover:text-white cursor-pointer transition-colors">
                {expandedId === item.id ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {expandedId === item.id && item.rows.length > 0 && (
            <div className="border-t border-slate-700 p-5 bg-slate-900/50">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      {Object.keys(item.rows[0]).map((header, idx) => (
                        <th
                          key={idx}
                          className="text-left py-3 px-4 font-semibold text-slate-200 bg-slate-800/50 first:rounded-tl-xl last:rounded-tr-xl"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {item.rows.map((row, rowIdx) => (
                      <tr
                        key={rowIdx}
                        className="border-b border-slate-700/50 last:border-0 hover:bg-slate-800/30 transition-colors"
                      >
                        {Object.values(row).map((cell, cellIdx) => (
                          <td
                            key={cellIdx}
                            className="py-3 px-4 text-slate-300"
                          >
                            {cell ?? '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
