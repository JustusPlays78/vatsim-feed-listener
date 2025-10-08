import React, { useState, useMemo, memo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface Column<T> {
  key: string;
  header: string;
  accessor: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  cellClassName?: string;
}

export interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T, index: number) => string | number;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: string[]; // Keys to search in
  sortable?: boolean;
  className?: string;
  emptyMessage?: string;
  isLoading?: boolean;
  onRowClick?: (item: T) => void;
  rowClassName?: (item: T) => string;
}

type SortDirection = 'asc' | 'desc' | null;

export function Table<T>({
  data,
  columns,
  keyExtractor,
  searchable = false,
  searchPlaceholder = 'Search...',
  searchKeys = [],
  sortable = true,
  className,
  emptyMessage = 'No data available',
  isLoading = false,
  onRowClick,
  rowClassName,
}: TableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filtering
  const filteredData = useMemo(() => {
    if (!searchable || !searchQuery.trim()) return data;

    const query = searchQuery.toLowerCase();
    return data.filter((item) => {
      return searchKeys.some((key) => {
        const value = (item as any)[key];
        return value?.toString().toLowerCase().includes(query);
      });
    });
  }, [data, searchQuery, searchable, searchKeys]);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return filteredData;

    const column = columns.find((col) => col.key === sortColumn);
    if (!column) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = column.accessor(a);
      const bValue = column.accessor(b);

      // Handle null/undefined
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      // Convert to string for comparison
      const aStr = String(aValue);
      const bStr = String(bValue);

      // Try numeric comparison first
      const aNum = Number(aStr);
      const bNum = Number(bStr);

      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
      }

      // String comparison
      return sortDirection === 'asc'
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }, [filteredData, sortColumn, sortDirection, columns]);

  const handleSort = (columnKey: string) => {
    const column = columns.find((col) => col.key === columnKey);
    if (!sortable || !column?.sortable) return;

    if (sortColumn === columnKey) {
      // Cycle: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortColumn(null);
      }
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (columnKey: string) => {
    if (sortColumn !== columnKey) {
      return <ChevronsUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4 text-blue-600" />
    ) : (
      <ChevronDown className="w-4 h-4 text-blue-600" />
    );
  };

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Search Bar */}
      {searchable && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full">
          {/* Header */}
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  onClick={() => handleSort(column.key)}
                  style={{ width: column.width }}
                  className={cn(
                    'px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    column.align !== 'center' &&
                      column.align !== 'right' &&
                      'text-left',
                    sortable &&
                      column.sortable &&
                      'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none'
                  )}
                >
                  <div className="flex items-center gap-2 justify-between">
                    <span>{column.header}</span>
                    {sortable && column.sortable && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Loading...
                    </p>
                  </div>
                </td>
              </tr>
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    {emptyMessage}
                  </p>
                </td>
              </tr>
            ) : (
              sortedData.map((item, index) => (
                <tr
                  key={keyExtractor(item, index)}
                  onClick={() => onRowClick?.(item)}
                  className={cn(
                    'transition-colors duration-150',
                    onRowClick &&
                      'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800',
                    rowClassName?.(item)
                  )}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        'px-6 py-4 text-sm text-gray-900 dark:text-gray-100',
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right',
                        column.cellClassName
                      )}
                    >
                      {column.accessor(item)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      {searchable && searchQuery && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing {sortedData.length} of {data.length} results
        </div>
      )}
    </div>
  );
}

// Memoized TableRow component for better performance
const TableRow = memo(
  <T,>({
    item,
    columns,
    onClick,
    className,
  }: {
    item: T;
    columns: Column<T>[];
    onClick?: () => void;
    className?: string;
  }) => (
    <tr onClick={onClick} className={className}>
      {columns.map((column) => (
        <td
          key={column.key}
          className={cn(
            'px-6 py-4 text-sm text-gray-900 dark:text-gray-100',
            column.align === 'center' && 'text-center',
            column.align === 'right' && 'text-right',
            column.cellClassName
          )}
        >
          {column.accessor(item)}
        </td>
      ))}
    </tr>
  )
);

TableRow.displayName = 'TableRow';
