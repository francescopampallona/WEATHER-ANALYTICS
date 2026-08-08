import React, { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export interface ColumnDef<T> {
  key: string;
  header: string;
  accessor: (item: T) => number | string | null | undefined;
  format?: (val: any, item: T) => string;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  defaultSortKey?: string;
  defaultSortDir?: 'asc' | 'desc';
  keyExtractor: (item: T, index: number) => string | number;
}

export function DataTable<T>({
  data,
  columns,
  defaultSortKey,
  defaultSortDir = 'desc',
  keyExtractor,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(defaultSortKey || columns[0]?.key || null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>(defaultSortDir);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortKey) return 0;
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return 0;

    const valA = col.accessor(a);
    const valB = col.accessor(b);

    if (valA === null || valA === undefined) return 1;
    if (valB === null || valB === undefined) return -1;

    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortDir === 'asc' ? valA - valB : valB - valA;
    }

    const strA = String(valA);
    const strB = String(valB);
    return sortDir === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
  });

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 uppercase font-semibold">
            <tr>
              {columns.map((col) => {
                const isSorted = sortKey === col.key;
                const alignment = col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left';
                return (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className={`px-3 py-2.5 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 select-none ${alignment}`}
                  >
                    <div className={`inline-flex items-center space-x-1 ${col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'}`}>
                      <span>{col.header}</span>
                      {isSorted ? (
                        sortDir === 'asc' ? (
                          <ArrowUp className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <ArrowDown className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-300 dark:text-slate-600" />
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-slate-800 dark:text-slate-200 font-mono text-[11px]">
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-6 text-center text-slate-400 font-sans">
                  No weather records available
                </td>
              </tr>
            ) : (
              sortedData.map((item, idx) => (
                <tr
                  key={keyExtractor(item, idx)}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors"
                >
                  {columns.map((col) => {
                    const rawVal = col.accessor(item);
                    const formatted = col.format ? col.format(rawVal, item) : rawVal !== null && rawVal !== undefined ? String(rawVal) : 'N/A';
                    const alignment = col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left';
                    return (
                      <th key={col.key} className={`px-3 py-2 font-normal whitespace-nowrap ${alignment}`}>
                        {formatted}
                      </th>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
