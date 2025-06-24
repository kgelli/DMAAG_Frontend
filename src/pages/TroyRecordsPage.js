// src/pages/TroyRecordsPage.js
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Button } from '../components/ui/button';
import { 
  Search, Download, BarChart2, ArrowUpDown, ArrowUp, ArrowDown, 
  Eye, ChevronLeft, ChevronRight, X, Clock, History, Columns
} from 'lucide-react';
import TroyDashboard from '../components/TroyDashboard';

export function TroyRecordsPage({ showDashboard, setShowDashboard }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchColumn, setSearchColumn] = useState('all');
  
  // Pagination state (replacing infinite scroll)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 25,
    totalPages: 1
  });
  
  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState({});
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  
  // Search history state
  const [searchHistory, setSearchHistory] = useState([]);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  
  // Record detail view state
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDetailView, setShowDetailView] = useState(false);
  
  // Column sorting state
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
  });

  // Define column structure for the table
  const columns = [
    { key: 'rec_number', label: 'Record #' },
    { key: 'enslaved_name', label: 'Enslaved Name' },
    { key: 'enslaved_transrole', label: 'Trans Role' },
    { key: 'enslaved_color', label: 'Color' },
    { key: 'enslaved_genagedesc', label: 'Gen Age Desc' },
    { key: 'enslaved_age', label: 'Age' },
    { key: 'enslaved_decage', label: 'Dec Age' },
    { key: 'enslaved_est_birth', label: 'Est Birth' },
    { key: 'enslaved_est_death', label: 'Est Death' },
    { key: 'enslaved_occ', label: 'Occupation' },
    { key: 'enslaved_health', label: 'Health' },
    { key: 'enslaved_unkchild', label: 'Unknown Child' },
    { key: 'enslaved_famno', label: 'Family No' },
    { key: 'enslaved_famrel', label: 'Family Relation' },
    { key: 'enslaver_business', label: 'Enslaver Business' },
    { key: 'enslaver_businessrole', label: 'Business Role' },
    { key: 'enslaver_businessloc', label: 'Business Location' },
    { key: 'enslaver1_name', label: 'Enslaver 1 Name' },
    { key: 'enslaver1_trans_role', label: 'Enslaver 1 Role' },
    { key: 'enslaver1_loc', label: 'Enslaver 1 Location' },
    { key: 'enslaver2_name', label: 'Enslaver 2 Name' },
    { key: 'enslaver2_trans_role', label: 'Enslaver 2 Role' },
    { key: 'enslaver2_loc', label: 'Enslaver 2 Location' },
    { key: 'enslaver3_name', label: 'Enslaver 3 Name' },
    { key: 'enslaver3_trans_role', label: 'Enslaver 3 Role' },
    { key: 'enslaver3_loc', label: 'Enslaver 3 Location' },
    { key: 'enslaver4_name', label: 'Enslaver 4 Name' },
    { key: 'enslaver4_trans_role', label: 'Enslaver 4 Role' },
    { key: 'enslaver4_loc', label: 'Enslaver 4 Location' },
    { key: 'enslaver5_name', label: 'Enslaver 5 Name' },
    { key: 'enslaver5_trans_role', label: 'Enslaver 5 Role' },
    { key: 'enslaver5_loc', label: 'Enslaver 5 Location' },
    { key: 'enslaver6_name', label: 'Enslaver 6 Name' },
    { key: 'enslaver6_trans_role', label: 'Enslaver 6 Role' },
    { key: 'enslaver6_loc', label: 'Enslaver 6 Location' },
    { key: 'enslaver7_name', label: 'Enslaver 7 Name' },
    { key: 'enslaver7_trans_role', label: 'Enslaver 7 Role' },
    { key: 'enslaver7_loc', label: 'Enslaver 7 Location' },
    { key: 'trans_id', label: 'Trans ID' },
    { key: 'trans_loc', label: 'Location' },
    { key: 'trans_type', label: 'Type' },
    { key: 'trans_record_date', label: 'Record Date' },
    { key: 'trans_begin_date', label: 'Begin Date' },
    { key: 'trans_end_date', label: 'End Date' },
    { key: 'transindv_value', label: 'Individual Value' },
    { key: 'transgrp_value', label: 'Group Value' }
  ];

  // Initialize visible columns on component mount
  useEffect(() => {
    const initialVisibleColumns = {};
    // Default to showing first 10 columns
    columns.forEach((column, index) => {
      initialVisibleColumns[column.key] = index < 10;
    });
    setVisibleColumns(initialVisibleColumns);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTroyRecords = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query {
              troyRecords(limit: 7000) {
                rec_number
                enslaved_name
                enslaved_transrole
                enslaved_color
                enslaved_genagedesc
                enslaved_age
                enslaved_decage
                enslaved_est_birth
                enslaved_est_death
                enslaved_occ
                enslaved_health
                enslaved_unkchild
                enslaved_famno
                enslaved_famrel
                enslaver_business
                enslaver_businessrole
                enslaver_businessloc
                enslaver1_name
                enslaver1_trans_role
                enslaver1_loc
                enslaver2_name
                enslaver2_trans_role
                enslaver2_loc
                enslaver3_name
                enslaver3_trans_role
                enslaver3_loc
                enslaver4_name
                enslaver4_trans_role
                enslaver4_loc
                enslaver5_name
                enslaver5_trans_role
                enslaver5_loc
                enslaver6_name
                enslaver6_trans_role
                enslaver6_loc
                enslaver7_name
                enslaver7_trans_role
                enslaver7_loc
                trans_id
                trans_loc
                trans_type
                trans_record_date
                trans_begin_date
                trans_end_date
                transindv_value
                transgrp_value
              }
            }
          `
        })
      });

      const data = await response.json();
      if (data.data && data.data.troyRecords) {
        setRecords(data.data.troyRecords);
      }
    } catch (error) {
      console.error('Error fetching Troy records:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTroyRecords();
  }, []);

  // Function to handle column sorting
  const requestSort = (key) => {
    let direction = 'asc';
    
    // If already sorting by this key, toggle direction
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key, direction });
  };

  // Apply sorting to records
  const sortedRecords = React.useMemo(() => {
    let sortableRecords = [...records];
    
    if (sortConfig.key !== null) {
      sortableRecords.sort((a, b) => {
        // Handle null values
        if (a[sortConfig.key] === null) return sortConfig.direction === 'asc' ? -1 : 1;
        if (b[sortConfig.key] === null) return sortConfig.direction === 'asc' ? 1 : -1;
        
        // String comparison for most fields
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return sortableRecords;
  }, [records, sortConfig]);

  // Apply filters - just search
  const filteredRecords = sortedRecords.filter(record => {
    // Column-specific search or search across all columns
    const matchesSearch = searchTerm ? 
      searchColumn === 'all' 
        ? Object.values(record).some(value => 
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
          )
        : String(record[searchColumn] || '').toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    return matchesSearch;
  });

  // Update total pages when filtered records change
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      totalPages: Math.ceil(filteredRecords.length / prev.itemsPerPage)
    }));
  }, [filteredRecords]);

  // Function to handle search with history tracking
  const handleSearch = () => {
    if (searchTerm.trim()) {
      // Add to search history
      const newHistoryItem = {
        id: Date.now(),
        term: searchTerm,
        column: searchColumn,
        timestamp: new Date().toLocaleTimeString()
      };
      
      // Prepend to history and limit to last 10 searches
      setSearchHistory(prev => [newHistoryItem, ...prev].slice(0, 10));
      
      // Reset to first page when searching
      setPagination(prev => ({
        ...prev,
        currentPage: 1
      }));
    }
  };

  // Apply a saved search from history
  const applyHistoryItem = (historyItem) => {
    setSearchTerm(historyItem.term);
    setSearchColumn(historyItem.column);
    // Reset to first page
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));
    setShowSearchHistory(false);
  };

  // Clear a history item
  const clearHistoryItem = (id) => {
    setSearchHistory(prev => prev.filter(item => item.id !== id));
  };

  // Clear all history
  const clearAllHistory = () => {
    setSearchHistory([]);
  };

  // Handle column visibility toggle
  const toggleColumnVisibility = (columnKey) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }));
  };

  // Show all columns
  const showAllColumns = () => {
    const allVisible = {};
    columns.forEach(col => {
      allVisible[col.key] = true;
    });
    setVisibleColumns(allVisible);
  };

  // Show essential columns only
  const showEssentialColumns = () => {
    const essentialVisible = {};
    columns.forEach(col => {
      essentialVisible[col.key] = false;
    });
    
    // Set essential columns
    [
      'rec_number', 
      'enslaved_name', 
      'enslaved_transrole', 
      'enslaved_color', 
      'enslaved_age',
      'enslaver1_name',
      'trans_type',
      'trans_record_date'
    ].forEach(key => {
      essentialVisible[key] = true;
    });
    
    setVisibleColumns(essentialVisible);
  };

  // Calculate visible columns for display
  const visibleColumnsList = columns.filter(col => visibleColumns[col.key]);

  // Handle pagination
  const goToPage = (page) => {
    setPagination(prev => ({
      ...prev,
      currentPage: Math.max(1, Math.min(page, prev.totalPages))
    }));
  };

  // Handle records per page change
  const handleRecordsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value);
    setPagination(prev => ({
      ...prev,
      itemsPerPage: newItemsPerPage,
      totalPages: Math.ceil(filteredRecords.length / newItemsPerPage),
      currentPage: 1 // Reset to first page when changing items per page
    }));
  };

  // Show details for a specific record
  const showRecordDetails = (record) => {
    setSelectedRecord(record);
    setShowDetailView(true);
  };

  // Calculate records to display based on pagination
  const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
  const endIndex = startIndex + pagination.itemsPerPage;
  const paginatedRecords = filteredRecords.slice(startIndex, endIndex);

  // Export data functionality
  const exportData = () => {
    // Get only the columns that are currently visible
    const visibleKeys = Object.keys(visibleColumns).filter(key => visibleColumns[key]);
    
    const csv = [
      visibleKeys.join(','),
      ...filteredRecords.map(record => 
        visibleKeys.map(key => `"${record[key] || ''}""`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'troy-records.csv';
    a.click();
  };

  // Function to get sort icon for column headers
  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="w-4 h-4 ml-1" /> 
      : <ArrowDown className="w-4 h-4 ml-1" />;
  };

  return (
    <div className="max-w-full mx-auto py-8 px-4">
      {/* Show Dashboard if enabled */}
      {showDashboard && (
        <div className="mb-8">
          <TroyDashboard />
        </div>
      )}
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Troy Records ({filteredRecords.length} entries)</CardTitle>
          <div className="flex space-x-2">
            <Button
              onClick={() => setShowColumnSelector(!showColumnSelector)}
              className="flex items-center"
              variant="outline"
            >
              <Columns className="w-4 h-4 mr-2" />
              Columns
            </Button>
            <Button
              onClick={() => setShowSearchHistory(!showSearchHistory)}
              className="flex items-center"
              variant="outline"
            >
              <History className="w-4 h-4 mr-2" />
              History
            </Button>
            <Button
              onClick={() => setShowDashboard(!showDashboard)}
              className="flex items-center"
              variant={showDashboard ? "secondary" : "default"}
            >
              <BarChart2 className="w-4 h-4 mr-2" />
              {showDashboard ? 'Hide' : 'Show'} Dashboard
            </Button>
            <Button onClick={exportData} className="flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {/* Search Section */}
            <div className="flex gap-4 flex-wrap">
              <div className="flex flex-1 gap-2 min-w-[200px]">
                <div className="relative w-full flex items-center">
                  <div className="absolute left-3">
                    <Search className="text-gray-400 h-5 w-5" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Search records..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10 w-full"
                  />
                  <div className="absolute right-0">
                    <Select
                      value={searchColumn}
                      onChange={(e) => setSearchColumn(e.target.value)}
                      className="border-l"
                    >
                      <option value="all">Search All Columns</option>
                      {columns.map(column => (
                        <option key={column.key} value={column.key}>
                          {column.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
                <Button 
                  onClick={handleSearch}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Search
                </Button>
              </div>
            </div>

            {/* Column Selector Dropdown */}
            {showColumnSelector && (
              <div className="bg-white border shadow-lg rounded-md p-4 max-h-80 overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Column Visibility</h3>
                  <div className="space-x-2">
                    <Button onClick={showAllColumns} size="sm" variant="outline">Show All</Button>
                    <Button onClick={showEssentialColumns} size="sm" variant="outline">Show Essential</Button>
                    <Button onClick={() => setShowColumnSelector(false)} size="sm" variant="ghost">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {columns.map(column => (
                    <div key={column.key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`col-${column.key}`}
                        checked={visibleColumns[column.key] || false}
                        onChange={() => toggleColumnVisibility(column.key)}
                      />
                      <label htmlFor={`col-${column.key}`} className="cursor-pointer">
                        {column.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search History Dropdown */}
            {showSearchHistory && (
              <div className="bg-white border shadow-lg rounded-md p-4 max-h-80 overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Recent Searches</h3>
                  <div className="space-x-2">
                    <Button onClick={clearAllHistory} size="sm" variant="outline" disabled={searchHistory.length === 0}>
                      Clear All
                    </Button>
                    <Button onClick={() => setShowSearchHistory(false)} size="sm" variant="ghost">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {searchHistory.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No recent searches</p>
                ) : (
                  <ul className="space-y-2">
                    {searchHistory.map(item => (
                      <li key={item.id} className="border-b pb-2 flex justify-between items-center">
                        <div>
                          <button 
                            onClick={() => applyHistoryItem(item)}
                            className="text-blue-600 hover:underline flex items-center"
                          >
                            <span className="font-medium">{item.term}</span>
                            <span className="mx-2 text-gray-400">in</span>
                            <span className="text-gray-600">{item.column === 'all' ? 'All Columns' : columns.find(c => c.key === item.column)?.label}</span>
                          </button>
                          <div className="text-xs text-gray-400 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {item.timestamp}
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => clearHistoryItem(item.id)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Record Detail View Modal */}
            {showDetailView && selectedRecord && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Record Details</h2>
                    <Button onClick={() => setShowDetailView(false)} size="sm" variant="ghost">
                        <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Group related fields together */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3 border-b pb-2">Enslaved Person Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {columns
                        .filter(col => col.key.startsWith('enslaved_'))
                        .map(column => (
                          <div key={column.key} className="border-b pb-2">
                            <div className="text-sm text-gray-500">{column.label}</div>
                            <div className="font-medium">
                              {selectedRecord[column.key] || <span className="text-gray-400">Not available</span>}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3 border-b pb-2">Enslaver Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {columns
                        .filter(col => col.key.startsWith('enslaver'))
                        .map(column => (
                          <div key={column.key} className="border-b pb-2">
                            <div className="text-sm text-gray-500">{column.label}</div>
                            <div className="font-medium">
                              {selectedRecord[column.key] || <span className="text-gray-400">Not available</span>}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3 border-b pb-2">Transaction Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {columns
                        .filter(col => col.key.startsWith('trans_') || col.key === 'rec_number')
                        .map(column => (
                          <div key={column.key} className="border-b pb-2">
                            <div className="text-sm text-gray-500">{column.label}</div>
                            <div className="font-medium">
                              {selectedRecord[column.key] || <span className="text-gray-400">Not available</span>}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <Button onClick={() => setShowDetailView(false)}>Close</Button>
                  </div>
                </div>
              </div>
            )}

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : (
              <div>
                <div className="overflow-x-auto border rounded-md">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                        {visibleColumnsList.map(column => (
                          <th 
                            key={column.key}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => requestSort(column.key)}
                          >
                            <div className="flex items-center">
                              {column.label}
                              {getSortIcon(column.key)}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedRecords.map((record, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                            <td className="px-9 py-4 whitespace-nowrap">
                              <Button 
                                onClick={() => showRecordDetails(record)} 
                                size="sm" 
                                variant="ghost"
                                cclassName="!w-8 !h-8 !p-0 !flex !items-center !justify-center !min-w-0"
                              >
                                <Eye className="h-4 w-4 text-white-600" />
                              </Button>
                            </td>

                          {visibleColumnsList.map(column => (
                            <td key={`${index}-${column.key}`} className="px-6 py-4 whitespace-nowrap">
                              {record[column.key]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700">
                      Showing {startIndex + 1} to {Math.min(endIndex, filteredRecords.length)} of {filteredRecords.length} records
                    </span>
                    <Select
                      value={pagination.itemsPerPage}
                      onChange={handleRecordsPerPageChange}
                      className="w-20 text-sm"
                    >
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                    </Select>
                    <span className="text-sm text-gray-700">per page</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => goToPage(1)}
                      disabled={pagination.currentPage === 1}
                      variant="outline"
                      size="sm"
                    >
                      First
                    </Button>
                    <Button
                      onClick={() => goToPage(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                      variant="outline"
                      size="sm"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-sm">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </div>
                    <Button
                      onClick={() => goToPage(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages}
                      variant="outline"
                      size="sm"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => goToPage(pagination.totalPages)}
                      disabled={pagination.currentPage === pagination.totalPages}
                      variant="outline"
                      size="sm"
                    >
                      Last
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}