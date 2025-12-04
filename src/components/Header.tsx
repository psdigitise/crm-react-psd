// import React, { useState } from 'react';
// import {
//   Plus,
//   RefreshCw,
//   Filter,
//   ArrowUpDown,
//   Columns,
//   MoreHorizontal,
//   Search,
//   List,
//   Grid,
//   Menu,
//   X,
//   Settings
// } from 'lucide-react';
// import { useTheme } from './ThemeProvider';

// interface FilterState {
//   status: string[];
//   territory: string[];
//   industry: string[];
//   assignedTo: string[];
// }

// interface ColumnConfig {
//   key: string;
//   label: string;
//   visible: boolean;
//   sortable: boolean;
// }

// interface HeaderProps {
//   title: string;
//   subtitle?: string;
//   onRefresh: () => void;
//   onFilter: () => void;
//   onSort: () => void;
//   onColumns: () => void;
//   onCreate: () => void;
//   searchValue: string;
//   onSearchChange: (value: string) => void;
//   viewMode: 'list' | 'grid';
//   onViewModeChange: (mode: 'list' | 'grid') => void;
//   onMenuToggle?: () => void;
//   // New props for dynamic functionality
//   showFilters?: boolean;
//   onShowFiltersChange?: (show: boolean) => void;
//   filters?: FilterState;
//   onFilterChange?: (filterType: keyof FilterState, value: string) => void;
//   onClearFilters?: () => void;
//   filterOptions?: {
//     status: string[];
//     territory: string[];
//     industry: string[];
//     assignedTo: string[];
//   };
//   columns?: ColumnConfig[];
//   onToggleColumn?: (columnKey: string) => void;
//   showColumnSettings?: boolean;
//   onShowColumnSettingsChange?: (show: boolean) => void;
//   sortField?: string;
//   sortDirection?: 'asc' | 'desc';
//   onSortChange?: (field: string) => void;
// }

// export function Header({
//   title,
//   subtitle,
//   onRefresh,
//   onFilter,
//   onSort,
//   onColumns,
//   onCreate,
//   searchValue,
//   onSearchChange,
//   viewMode,
//   onViewModeChange,
//   onMenuToggle,
//   showFilters = false,
//   onShowFiltersChange,
//   filters,
//   onFilterChange,
//   onClearFilters,
//   filterOptions,
//   columns,
//   onToggleColumn,
//   showColumnSettings = false,
//   onShowColumnSettingsChange,
//   sortField,
//   sortDirection,
//   onSortChange
// }: HeaderProps) {
//   const { theme } = useTheme();

//   const FilterDropdown = ({ 
//     title, 
//     options, 
//     selected, 
//     onChange 
//   }: { 
//     title: string; 
//     options: string[]; 
//     selected: string[]; 
//     onChange: (value: string) => void;
//   }) => (
//     <div className="space-y-2">
//       <h4 className={`font-medium ${theme === 'dark' ? 'text-black' : 'text-gray-900'}`}>{title}</h4>
//       <div className="space-y-1 max-h-32 overflow-y-auto">
//         {options.map(option => (
//           <label key={option} className="flex items-center space-x-2 text-sm">
//             <input
//               type="checkbox"
//               checked={selected.includes(option)}
//               onChange={() => onChange(option)}
//               className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//             />
//             <span className={theme === 'dark' ? 'text-black' : 'text-gray-700'}>{option}</span>
//           </label>
//         ))}
//       </div>
//     </div>
//   );

//   const handleFilterClick = () => {
//     if (onShowFiltersChange) {
//       onShowFiltersChange(!showFilters);
//     } else {
//       onFilter();
//     }
//   };

//   const handleColumnsClick = () => {
//     if (onShowColumnSettingsChange) {
//       onShowColumnSettingsChange(!showColumnSettings);
//     } else {
//       onColumns();
//     }
//   };

//   const activeFiltersCount = filters ? Object.values(filters).reduce((sum, arr) => sum + arr.length, 0) : 0;

//   return (
//     <div className={`${
//       theme === 'dark' 
//         ? 'bg-gradient-to-r from-dark-secondary to-dark-tertiary border-purple-500/30' 
//         : 'bg-white border-gray-200'
//     } border-b px-4 sm:px-6 py-4`}>
//       {/* Title Row */}
//       <div className="flex items-center justify-between mb-4">
//         <div className="flex items-center space-x-3">
//           {/* Mobile Menu Button */}
//           {onMenuToggle && (
//             <button
//               onClick={onMenuToggle}
//               className={`p-2 rounded-lg transition-colors lg:hidden ${
//                 theme === 'dark' ? 'hover:bg-purple-800/50' : 'hover:bg-gray-100'
//               }`}
//             >
//               <Menu className={`w-5 h-5 ${theme === 'dark' ? 'text-black' : 'text-gray-600'}`} />
//             </button>
//           )}
          
//           <div className="flex items-center space-x-2">
//             <h1 className={`text-xl sm:text-2xl font-semibold ${
//               theme === 'dark' ? 'text-black' : 'text-gray-900'
//             }`}>{title}</h1>
//             {subtitle && (
//               <>
//                 <span className={`${theme === 'dark' ? 'text-gray-500' : 'text-black'} hidden sm:inline`}>/</span>
//                 <span className={`${theme === 'dark' ? 'text-black' : 'text-gray-600'} hidden sm:inline`}>{subtitle}</span>
//               </>
//             )}
//           </div>
//         </div>
        
//         <button
//           onClick={onCreate}
//           className={`${
//             theme === 'dark' 
//               ? 'bg-purplebg hover:bg-purple-700' 
//               : 'bg-gray-900 hover:bg-gray-800'
//           } text-black px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center space-x-2`}
//         >
//           <Plus className="w-4 h-4" />
//           <span className="hidden sm:inline">Create</span>
//         </button>
//       </div>

//       {/* Controls Row */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//         {/* Search */}
//         <div className="relative flex-1 max-w-md">
//           <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
//             theme === 'dark' ? 'text-black' : 'text-gray-500'
//           }`} />
//           <input
//             type="text"
//             placeholder="Search..."
//             value={searchValue}
//             onChange={(e) => onSearchChange(e.target.value)}
//             className={`pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full ${
//               theme === 'dark' 
//                 ? 'bg-white-31 text-black border-transparent placeholder-gray-600' 
//                 : 'border-gray-300 placeholder-gray-500'
//             }`}
//           />
//         </div>

//         <div className="flex items-center space-x-2 overflow-x-auto">
//           <div className={`flex border rounded-lg overflow-hidden flex-shrink-0 ${
//             theme === 'dark' ? 'border-purple-500/30' : 'border-gray-300'
//           }`}>
//           </div>

//           {/* Filter */}
//           <div className="relative flex-shrink-0">
//             {showFilters && filters && filterOptions && onFilterChange && onClearFilters && (
//               <div className={`absolute top-full right-0 mt-2 w-80 rounded-lg shadow-lg z-10 p-4 ${
//                 theme === 'dark' 
//                   ? 'bg-dark-accent border border-purple-500/30' 
//                   : 'bg-white border border-gray-200'
//               }`}>
//                 <div className="flex items-center justify-between mb-4">
//                   <h3 className={`font-semibold ${theme === 'dark' ? 'text-black' : 'text-gray-900'}`}>Filters</h3>
//                   <div className="flex items-center space-x-2">
//                     <button
//                       onClick={onClearFilters}
//                       className={`text-sm ${
//                         theme === 'dark' ? 'text-black hover:text-black' : 'text-gray-500 hover:text-gray-700'
//                       }`}
//                     >
//                       Clear All
//                     </button>
//                     <button
//                       onClick={() => onShowFiltersChange && onShowFiltersChange(false)}
//                       className={theme === 'dark' ? 'text-black hover:text-black' : 'text-black hover:text-gray-600'}
//                     >
//                       <X className="w-4 h-4" />
//                     </button>
//                   </div>
//                 </div>
                
//                 <div className="space-y-4">
//                   <FilterDropdown
//                     title="Status"
//                     options={filterOptions.status}
//                     selected={filters.status}
//                     onChange={(value) => onFilterChange('status', value)}
//                   />
                  
//                   {filterOptions.territory.length > 0 && (
//                     <FilterDropdown
//                       title="Territory"
//                       options={filterOptions.territory}
//                       selected={filters.territory}
//                       onChange={(value) => onFilterChange('territory', value)}
//                     />
//                   )}
                  
//                   {filterOptions.industry.length > 0 && (
//                     <FilterDropdown
//                       title="Industry"
//                       options={filterOptions.industry}
//                       selected={filters.industry}
//                       onChange={(value) => onFilterChange('industry', value)}
//                     />
//                   )}
                  
//                   <FilterDropdown
//                     title="Assigned To"
//                     options={filterOptions.assignedTo}
//                     selected={filters.assignedTo}
//                     onChange={(value) => onFilterChange('assignedTo', value)}
//                   />
//                 </div>
//               </div>
//             )}
//           </div>
//           {/* Columns */}
//           <div className="relative flex-shrink-0">
//             {showColumnSettings && columns && onToggleColumn && (
//               <div className={`absolute top-full right-0 mt-2 w-64 rounded-lg shadow-lg z-10 p-4 ${
//                 theme === 'dark' 
//                   ? 'bg-dark-accent border border-purple-500/30' 
//                   : 'bg-white border border-gray-200'
//               }`}>
//                 <div className="flex items-center justify-between mb-4">
//                   <h3 className={`font-semibold ${theme === 'dark' ? 'text-black' : 'text-gray-900'}`}>Manage Columns</h3>
//                   <button
//                     onClick={() => onShowColumnSettingsChange && onShowColumnSettingsChange(false)}
//                     className={theme === 'dark' ? 'text-black hover:text-black' : 'text-black hover:text-gray-600'}
//                   >
//                     <X className="w-4 h-4" />
//                   </button>
//                 </div>
                
//                 <div className="space-y-2">
//                   {columns.map(column => (
//                     <label key={column.key} className="flex items-center space-x-2 text-sm">
//                       <input
//                         type="checkbox"
//                         checked={column.visible}
//                         onChange={() => onToggleColumn(column.key)}
//                         className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                       />
//                       <span className={theme === 'dark' ? 'text-black' : 'text-gray-700'}>{column.label}</span>
//                     </label>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//           {/* More */}
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useState } from 'react';
import {
  Plus,
  RefreshCw,
  Filter,
  ArrowUpDown,
  Columns,
  MoreHorizontal,
  Search,
  List,
  Grid,
  Menu,
  X,
  Settings
} from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface FilterState {
  status: string[];
  territory: string[];
  industry: string[];
  assignedTo: string[];
}

interface ColumnConfig {
  key: string;
  label: string;
  visible: boolean;
  sortable: boolean;
}

interface HeaderProps {
  title: string;
  subtitle?: string;
  onRefresh: () => void;
  onFilter: () => void;
  onSort: () => void;
  onColumns: () => void;
  onCreate?: () => void; // Made optional
  searchValue: string;
  onSearchChange: (value: string) => void;
  viewMode: 'list' | 'grid';
  onViewModeChange: (mode: 'list' | 'grid') => void;
  onMenuToggle?: () => void;
  // New props for dynamic functionality
  showFilters?: boolean;
  onShowFiltersChange?: (show: boolean) => void;
  filters?: FilterState;
  onFilterChange?: (filterType: keyof FilterState, value: string) => void;
  onClearFilters?: () => void;
  filterOptions?: {
    status: string[];
    territory: string[];
    industry: string[];
    assignedTo: string[];
  };
  columns?: ColumnConfig[];
  onToggleColumn?: (columnKey: string) => void;
  showColumnSettings?: boolean;
  onShowColumnSettingsChange?: (show: boolean) => void;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  onSortChange?: (field: string) => void;
}

export function Header({
  title,
  subtitle,
  onRefresh,
  onFilter,
  onSort,
  onColumns,
  onCreate, // Now optional
  searchValue,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onMenuToggle,
  showFilters = false,
  onShowFiltersChange,
  filters,
  onFilterChange,
  onClearFilters,
  filterOptions,
  columns,
  onToggleColumn,
  showColumnSettings = false,
  onShowColumnSettingsChange,
  sortField,
  sortDirection,
  onSortChange
}: HeaderProps) {
  const { theme } = useTheme();

  const FilterDropdown = ({ 
    title, 
    options, 
    selected, 
    onChange 
  }: { 
    title: string; 
    options: string[]; 
    selected: string[]; 
    onChange: (value: string) => void;
  }) => (
    <div className="space-y-2">
      <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{title}</h4>
      <div className="space-y-1 max-h-32 overflow-y-auto">
        {options.map(option => (
          <label key={option} className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => onChange(option)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className={theme === 'dark' ? 'text-white' : 'text-gray-700'}>{option}</span>
          </label>
        ))}
      </div>
    </div>
  );

  const handleFilterClick = () => {
    if (onShowFiltersChange) {
      onShowFiltersChange(!showFilters);
    } else {
      onFilter();
    }
  };

  const handleColumnsClick = () => {
    if (onShowColumnSettingsChange) {
      onShowColumnSettingsChange(!showColumnSettings);
    } else {
      onColumns();
    }
  };

  const activeFiltersCount = filters ? Object.values(filters).reduce((sum, arr) => sum + arr.length, 0) : 0;

  return (
    <div className={`${
      theme === 'dark' 
        ? 'bg-gradient-to-r from-dark-secondary to-dark-tertiary border-purple-500/30' 
        : 'bg-white border-gray-200'
    } border-b px-4 sm:px-6 py-4`}>
      {/* Title Row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {/* Mobile Menu Button */}
          {onMenuToggle && (
            <button
              onClick={onMenuToggle}
              className={`p-2 rounded-lg transition-colors lg:hidden ${
                theme === 'dark' ? 'hover:bg-purple-800/50' : 'hover:bg-gray-100'
              }`}
            >
              <Menu className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`} />
            </button>
          )}
          
          <div className="flex items-center space-x-2">
            <h1 className={`text-xl sm:text-2xl font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>{title}</h1>
            {subtitle && (
              <>
                <span className={`${theme === 'dark' ? 'text-gray-500' : 'text-black'} hidden sm:inline`}>/</span>
                <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-600'} hidden sm:inline`}>{subtitle}</span>
              </>
            )}
          </div>
        </div>
        
        {/* Only render Create button if onCreate is provided */}
        {onCreate && (
          <button
            onClick={onCreate}
            className={`${
              theme === 'dark' 
                ? 'bg-purplebg hover:bg-purple-700' 
                : 'bg-gray-900 hover:bg-gray-800'
            } text-white px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center space-x-2`}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Create</span>
          </button>
        )}
      </div>

      {/* Controls Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-500'
          }`} />
          <input
            type="text"
            placeholder="Search..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`pl-10 pr-4 py-2 border rounded-lg focus:ring-2 placeholder:text-white  focus:border-transparent w-full ${
              theme === 'dark' 
                ? 'bg-white-31 text-white border-transparent placeholder:!text-white ' 
                : 'border-gray-300  placeholder:!text-black'
            }`}
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto">
          <div className={`flex border rounded-lg overflow-hidden flex-shrink-0 ${
            theme === 'dark' ? 'border-purple-500/30' : 'border-gray-300'
          }`}>
          </div>

          {/* Filter */}
          <div className="relative flex-shrink-0">
            {showFilters && filters && filterOptions && onFilterChange && onClearFilters && (
              <div className={`absolute top-full right-0 mt-2 w-80 rounded-lg shadow-lg z-10 p-4 ${
                theme === 'dark' 
                  ? 'bg-dark-accent border border-purple-500/30' 
                  : 'bg-white border border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Filters</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={onClearFilters}
                      className={`text-sm ${
                        theme === 'dark' ? 'text-white hover:text-white' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Clear All
                    </button>
                    <button
                      onClick={() => onShowFiltersChange && onShowFiltersChange(false)}
                      className={theme === 'dark' ? 'text-white hover:text-white' : 'text-white hover:text-gray-600'}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <FilterDropdown
                    title="Status"
                    options={filterOptions.status}
                    selected={filters.status}
                    onChange={(value) => onFilterChange('status', value)}
                  />
                  
                  {filterOptions.territory.length > 0 && (
                    <FilterDropdown
                      title="Territory"
                      options={filterOptions.territory}
                      selected={filters.territory}
                      onChange={(value) => onFilterChange('territory', value)}
                    />
                  )}
                  
                  {filterOptions.industry.length > 0 && (
                    <FilterDropdown
                      title="Industry"
                      options={filterOptions.industry}
                      selected={filters.industry}
                      onChange={(value) => onFilterChange('industry', value)}
                    />
                  )}
                  
                  <FilterDropdown
                    title="Assigned To"
                    options={filterOptions.assignedTo}
                    selected={filters.assignedTo}
                    onChange={(value) => onFilterChange('assignedTo', value)}
                  />
                </div>
              </div>
            )}
          </div>
          {/* Columns */}
          <div className="relative flex-shrink-0">
            {showColumnSettings && columns && onToggleColumn && (
              <div className={`absolute top-full right-0 mt-2 w-64 rounded-lg shadow-lg z-10 p-4 ${
                theme === 'dark' 
                  ? 'bg-dark-accent border border-purple-500/30' 
                  : 'bg-white border border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Manage Columns</h3>
                  <button
                    onClick={() => onShowColumnSettingsChange && onShowColumnSettingsChange(false)}
                   className={`p-1 rounded ${theme === 'dark'
                      ? 'text-gray-400 hover:text-white'
                      : 'text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-2">
                  {columns.map(column => (
                    <label key={column.key} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={column.visible}
                        onChange={() => onToggleColumn(column.key)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className={theme === 'dark' ? 'text-white' : 'text-gray-700'}>{column.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* More */}
        </div>
      </div>
    </div>
  );
}