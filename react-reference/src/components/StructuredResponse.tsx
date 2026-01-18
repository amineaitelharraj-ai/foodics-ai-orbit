import { useState } from 'react';
import { CheckCircle, XCircle, List, Plus, Pencil, Trash2, BarChart3, ChevronLeft, ChevronRight, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Pagination {
  page: number;
  per_page?: number;
  total: number;
  total_pages: number;
}

interface ChartConfig {
  title?: string;
  x_axis?: string;
  y_axis?: string;
  label_key?: string;
  value_key?: string;
}

interface WriteResult {
  display_type?: 'table' | 'bar_chart' | 'line_chart' | 'pie_chart' | 'cards' | 'text';
  entity?: string;
  op?: string;
  ok?: boolean;
  note?: string;
  data?: Record<string, any>[];
  chart_config?: ChartConfig;
  pagination?: Pagination;
  context?: string | null;
}

interface StructuredResponseProps {
  data: {
    summary: string;
    agent: string;
    ok: boolean;
    type?: string;
    entity?: string;
    result?: WriteResult[];
  };
}

const CHART_COLORS = ['#5D34FF', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const formatLabel = (key: string) => {
  return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

const formatValue = (value: any, key: string): string => {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'number') {
    if (key.includes('price') || key.includes('spent') || key.includes('revenue') || key.includes('cost') || key === 'value') {
      return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return value.toLocaleString();
  }
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return new Date(value).toLocaleDateString();
  }
  return String(value);
};

const inferColumns = (data: Record<string, any>[]) => {
  if (!data || data.length === 0) return [];
  
  const firstItem = data[0];
  const columns: { key: string; label: string }[] = [];
  const preferred = ['name', 'sku', 'price', 'status', 'reference', 'total_spent', 'total_orders', 'revenue', 'date', 'orders'];
  const hidden = ['id', 'name_localized', 'created_at', 'updated_at', 'deleted_at'];

  preferred.forEach(key => {
    if (key in firstItem && !hidden.includes(key)) {
      columns.push({ key, label: formatLabel(key) });
    }
  });

  Object.keys(firstItem).forEach(key => {
    if (!preferred.includes(key) && !hidden.includes(key) && !columns.find(c => c.key === key)) {
      columns.push({ key, label: formatLabel(key) });
    }
  });

  return columns.slice(0, 6);
};

const getOpIcon = (op: string) => {
  switch (op?.toUpperCase()) {
    case 'LIST': return <List className="w-4 h-4" />;
    case 'CREATE': return <Plus className="w-4 h-4" />;
    case 'UPDATE': return <Pencil className="w-4 h-4" />;
    case 'DELETE': return <Trash2 className="w-4 h-4" />;
    case 'REPORT': return <BarChart3 className="w-4 h-4" />;
    default: return <List className="w-4 h-4" />;
  }
};

function DataTable({ data, pagination, title }: { data: Record<string, any>[]; pagination?: Pagination; title?: string }) {
  const [page, setPage] = useState(1);
  const columns = inferColumns(data);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const displayData = data.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  if (columns.length === 0) return null;

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {title && (
        <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</span>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              {columns.map(col => (
                <th key={col.key} className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayData.map((row, i) => (
              <tr key={i} className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                {columns.map(col => (
                  <td key={col.key} className="px-3 py-2 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    {col.key === 'status' ? (
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        row[col.key] === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' :
                        row[col.key] === 'deleted' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {row[col.key]}
                      </span>
                    ) : formatValue(row[col.key], col.key)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(totalPages > 1 || pagination) && (
        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {pagination ? `Page ${pagination.page} of ${pagination.total_pages} (${pagination.total} total)` : 
              `Showing ${(page - 1) * itemsPerPage + 1}-${Math.min(page * itemsPerPage, data.length)} of ${data.length}`}
          </span>
          <div className="flex gap-1">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))} 
              disabled={page === 1}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
              disabled={page === totalPages}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function LineChartDisplay({ data, config }: { data: Record<string, any>[]; config?: ChartConfig }) {
  const xAxis = config?.x_axis || Object.keys(data[0] || {})[0];
  const yAxis = config?.y_axis || Object.keys(data[0] || {})[1];

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      {config?.title && <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">{config.title}</h4>}
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xAxis} className="text-xs" />
          <YAxis className="text-xs" />
          <Tooltip />
          <Line type="monotone" dataKey={yAxis} stroke={CHART_COLORS[0]} strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function BarChartDisplay({ data, config }: { data: Record<string, any>[]; config?: ChartConfig }) {
  const xAxis = config?.x_axis || Object.keys(data[0] || {})[0];
  const yAxis = config?.y_axis || Object.keys(data[0] || {})[1];

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      {config?.title && <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">{config.title}</h4>}
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xAxis} className="text-xs" />
          <YAxis className="text-xs" />
          <Tooltip />
          <Bar dataKey={yAxis} fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function PieChartDisplay({ data, config }: { data: Record<string, any>[]; config?: ChartConfig }) {
  const labelKey = config?.label_key || config?.x_axis || Object.keys(data[0] || {})[0];
  const valueKey = config?.value_key || config?.y_axis || Object.keys(data[0] || {})[1];

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      {config?.title && <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">{config.title}</h4>}
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} dataKey={valueKey} nameKey={labelKey} cx="50%" cy="50%" outerRadius={70} label>
            {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function MetricCards({ data, title }: { data: Record<string, any>[]; title?: string }) {
  return (
    <div className="space-y-3">
      {title && <h4 className="font-medium text-gray-800 dark:text-gray-200">{title}</h4>}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {data.map((item, i) => (
          <div key={i} className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800/50">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{item.metric || item.label}</div>
            <div className="text-xl font-bold text-gray-800 dark:text-gray-200">
              {typeof item.value === 'number' ? formatValue(item.value, 'value') : item.value}
            </div>
            {item.change !== undefined && (
              <div className={`flex items-center gap-1 text-xs mt-1 ${item.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {item.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {item.change >= 0 ? '+' : ''}{item.change}%
                {item.period && <span className="text-gray-400 ml-1">{item.period}</span>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function StructuredResponse({ data }: StructuredResponseProps) {
  const { summary, agent, ok, type, result } = data;

  return (
    <div className="space-y-3">
      <div className={`flex items-start gap-3 p-3 rounded-lg ${
        ok 
          ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
          : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
      }`}>
        <div className={`mt-0.5 ${ok ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {ok ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded ${
              agent === 'menu' 
                ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' 
                : 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
            }`}>
              {agent === 'menu' ? 'Menu' : 'Analytics'}
            </span>
            {type && <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">{getOpIcon(type)}</span>}
          </div>
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{summary}</p>
        </div>
      </div>

      {result?.map((r, i) => {
        if (!r.ok && r.context) {
          return (
            <div key={i} className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                <p className="text-sm text-amber-800 dark:text-amber-200">{r.context}</p>
              </div>
            </div>
          );
        }

        const displayType = r.display_type || 'table';

        switch (displayType) {
          case 'table':
            return r.data && r.data.length > 0 ? (
              <DataTable key={i} data={r.data} pagination={r.pagination} title={r.note} />
            ) : null;

          case 'line_chart':
            return r.data && r.data.length > 0 ? (
              <LineChartDisplay key={i} data={r.data} config={r.chart_config} />
            ) : null;

          case 'bar_chart':
            return r.data && r.data.length > 0 ? (
              <BarChartDisplay key={i} data={r.data} config={r.chart_config} />
            ) : null;

          case 'pie_chart':
            return r.data && r.data.length > 0 ? (
              <PieChartDisplay key={i} data={r.data} config={r.chart_config} />
            ) : null;

          case 'cards':
            return r.data && r.data.length > 0 ? (
              <MetricCards key={i} data={r.data} title={r.note} />
            ) : null;

          case 'text':
          default:
            return r.note ? (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{r.note}</span>
              </div>
            ) : null;
        }
      })}
    </div>
  );
}
