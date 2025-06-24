// src/pages/AdvancedSearchPage.js
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Button } from '../components/ui/button';
import { GlobalSearch } from '../components/GlobalSearch';
import { 
  Search, Download, ArrowUpDown, ArrowUp, ArrowDown, 
  Eye, ChevronLeft, ChevronRight, X, Clock, History, Columns, 
  Filter, Database
} from 'lucide-react';

export function AdvancedSearchPage() {
  const [gsuRecords, setGsuRecords] = useState([]);
  const [troyRecords, setTroyRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchColumn, setSearchColumn] = useState('all');
  const [activeTab, setActiveTab] = useState('combined'); // 'combined', 'gsu', or 'troy'
  
  // Pagination state
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
  
  // Advanced filters state

const [advancedFilters, setAdvancedFilters] = useState({
  dateRange: { start: '', end: '' },
  recordType: 'all', // 'all', 'gsu', 'troy'
  personType: 'all', // 'all', 'enslaved', 'seller', 'buyer'
  location: '',
  personName: '',
  transactionType: ''
});
  
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Common columns for both datasets
  const combinedColumns = [
    { key: 'id', label: 'ID' },
    { key: 'recordType', label: 'Record Type' },
    { key: 'personName', label: 'Person Name' },
    { key: 'personRole', label: 'Role' },
    { key: 'date', label: 'Date' },
    { key: 'location', label: 'Location' },
    { key: 'transactionType', label: 'Transaction Type' },
    { key: 'details', label: 'Details' }
  ];


  // Initialize visible columns on component mount
  useEffect(() => {
    const initialVisibleColumns = {};
    combinedColumns.forEach(column => {
      initialVisibleColumns[column.key] = true;
    });
    setVisibleColumns(initialVisibleColumns);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch both dataset records
  const fetchRecords = async () => {
    setLoading(true);
    try {
      // Fetch GSU Records
      const gsuResponse = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query {
              gsuRecords(limit: 1500) {
                deed_state
                deed_county
                deed_date
                seller_firstname
                seller_lastname
                buyer_firstname
                buyer_lastname
                buyer_amount
                deed_link
                Notes
              }
            }
          `
        })
      });

      // Fetch Troy Records
      const troyResponse = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query {
              troyRecords(limit: 7000) {
                rec_number
                enslaved_name
                enslaved_transrole
                enslaver1_name
                trans_loc
                trans_type
                trans_record_date
              }
            }
          `
        })
      });

      const gsuData = await gsuResponse.json();
      const troyData = await troyResponse.json();

      if (gsuData.data && gsuData.data.gsuRecords) {
        setGsuRecords(gsuData.data.gsuRecords);
      }

      if (troyData.data && troyData.data.troyRecords) {
        setTroyRecords(troyData.data.troyRecords);
      }
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // Map GSU records to the common format
  const mappedGsuRecords = gsuRecords.map((record, index) => ({
    id: `GSU-${index}`,
    recordType: 'GSU',
    personName: `${record.seller_firstname || ''} ${record.seller_lastname || ''}`.trim() || 'Unknown Seller',
    personRole: 'Seller',
    date: record.deed_date || 'Unknown',
    location: `${record.deed_county || ''}, ${record.deed_state || ''}`.replace(', ', '') || 'Unknown',
    transactionType: 'Deed/Sale',
    details: record.Notes || '',
    originalRecord: record,
    recordTypeId: 'gsu'
  }));

  // Add buyer entries for GSU records
  const gsuBuyerRecords = gsuRecords.map((record, index) => ({
    id: `GSU-B-${index}`,
    recordType: 'GSU',
    personName: `${record.buyer_firstname || ''} ${record.buyer_lastname || ''}`.trim() || 'Unknown Buyer',
    personRole: 'Buyer',
    date: record.deed_date || 'Unknown',
    location: `${record.deed_county || ''}, ${record.deed_state || ''}`.replace(', ', '') || 'Unknown',
    transactionType: 'Deed/Sale',
    details: record.Notes || '',
    originalRecord: record,
    recordTypeId: 'gsu'
  }));

  // Map Troy records to the common format
  const mappedTroyRecords = troyRecords.map((record, index) => ({
    id: `TROY-${index}`,
    recordType: 'TROY',
    personName: record.enslaved_name || 'Unknown',
    personRole: record.enslaved_transrole || 'Enslaved',
    date: record.trans_record_date || 'Unknown',
    location: record.trans_loc || 'Unknown',
    transactionType: record.trans_type || 'Unknown',
    details: '',
    originalRecord: record,
    recordTypeId: 'troy'
  }));


  // Combine all records
  const allRecords = React.useMemo(() => [
    ...mappedGsuRecords,  // Only include seller records
    ...mappedTroyRecords  // Only include enslaved person records
  ], [mappedGsuRecords, mappedTroyRecords]);

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
    let recordsToSort = [];
    
    // Select which records to display based on active tab
    if (activeTab === 'combined') {
      recordsToSort = [...allRecords];
    } else if (activeTab === 'gsu') {
      recordsToSort = [...mappedGsuRecords, ...gsuBuyerRecords];
    } else if (activeTab === 'troy') {
      recordsToSort = [...mappedTroyRecords];
    }
    
    if (sortConfig.key !== null) {
      recordsToSort.sort((a, b) => {
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
    
    return recordsToSort;
  }, [sortConfig, activeTab, allRecords, mappedGsuRecords, gsuBuyerRecords, mappedTroyRecords]);

  // Apply filters to sorted records

const filteredRecords = sortedRecords.filter(record => {
  // Basic search - enhanced to search deeply through originalRecord
  const matchesSearch = searchTerm ? 
    searchColumn === 'all' 
      ? (
          // Search in mapped fields
          Object.values(record).some(value => 
            typeof value === 'string' && value.toLowerCase().includes(searchTerm.toLowerCase())
          ) || 
          // Deep search in original record
          (record.originalRecord && 
            Object.values(record.originalRecord).some(value => 
              typeof value === 'string' && value.toLowerCase().includes(searchTerm.toLowerCase())
            ))
        )
      : typeof record[searchColumn] === 'string' && record[searchColumn].toLowerCase().includes(searchTerm.toLowerCase())
    : true;

  // Advanced filters
  const matchesRecordType = advancedFilters.recordType === 'all' || 
    record.recordTypeId === advancedFilters.recordType;
  
  const matchesPersonType = advancedFilters.personType === 'all' ||
    (advancedFilters.personType === 'enslaved' && record.personRole === 'Enslaved') ||
    (advancedFilters.personType === 'seller' && record.personRole === 'Seller') ||
    (advancedFilters.personType === 'buyer' && record.personRole === 'Buyer') ||
    (advancedFilters.personType === 'enslaver' && record.personRole === 'Enslaver');
  
  const matchesLocation = !advancedFilters.location || 
    record.location.toLowerCase().includes(advancedFilters.location.toLowerCase());
  
  // New filters
  const matchesPersonName = !advancedFilters.personName ||
    record.personName.toLowerCase().includes(advancedFilters.personName.toLowerCase());
    
  const matchesTransactionType = !advancedFilters.transactionType ||
    record.transactionType.toLowerCase().includes(advancedFilters.transactionType.toLowerCase());
  
  // Date range filtering
  let matchesDateRange = true;
  if (advancedFilters.dateRange.start || advancedFilters.dateRange.end) {
    const recordDate = new Date(record.date);
    const startDate = advancedFilters.dateRange.start ? new Date(advancedFilters.dateRange.start) : null;
    const endDate = advancedFilters.dateRange.end ? new Date(advancedFilters.dateRange.end) : null;
    
    if (startDate && !isNaN(startDate.getTime()) && !isNaN(recordDate.getTime())) {
      matchesDateRange = matchesDateRange && recordDate >= startDate;
    }
    
    if (endDate && !isNaN(endDate.getTime()) && !isNaN(recordDate.getTime())) {
      matchesDateRange = matchesDateRange && recordDate <= endDate;
    }
  }

  return matchesSearch && matchesRecordType && matchesPersonType && 
         matchesLocation && matchesDateRange && matchesPersonName && 
         matchesTransactionType;
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
// Global search handler
const handleGlobalSearch = (term) => {
  setSearchTerm(term);
  setSearchColumn('all');
  setActiveTab('combined');
  setPagination(prev => ({
    ...prev,
    currentPage: 1
  }));
  
  // Add to search history
  if (term.trim()) {
    const newHistoryItem = {
      id: Date.now(),
      term: term,
      column: 'all',
      timestamp: new Date().toLocaleTimeString()
    };
    
    setSearchHistory(prev => [newHistoryItem, ...prev].slice(0, 10));
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
    combinedColumns.forEach(col => {
      allVisible[col.key] = true;
    });
    setVisibleColumns(allVisible);
  };

  // Reset advanced filters

const resetAdvancedFilters = () => {
  setAdvancedFilters({
    dateRange: { start: '', end: '' },
    recordType: 'all',
    personType: 'all',
    location: '',
    personName: '',
    transactionType: ''
  });
};

  // Apply advanced filters
  const applyAdvancedFilters = () => {
    // Filters are already applied through the filteredRecords calculation
    setShowAdvancedFilters(false);
    // Reset to first page when applying filters
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));
  };

  // Calculate visible columns for display
  const visibleColumnsList = combinedColumns.filter(col => visibleColumns[col.key]);

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
    a.download = 'combined-records.csv';
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

  // Render detail view based on record type
  const renderDetailView = () => {
    if (!selectedRecord) return null;
    
    const record = selectedRecord.originalRecord;
    
    if (selectedRecord.recordTypeId === 'gsu') {
      return (
        <div>
          <h3 className="text-lg font-medium mb-3 border-b pb-2">GSU Record Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-b pb-2">
              <div className="text-sm text-gray-500">State</div>
              <div className="font-medium">{record.deed_state || 'Not available'}</div>
            </div>
            <div className="border-b pb-2">
              <div className="text-sm text-gray-500">County</div>
              <div className="font-medium">{record.deed_county || 'Not available'}</div>
            </div>
            <div className="border-b pb-2">
              <div className="text-sm text-gray-500">Date</div>
              <div className="font-medium">{record.deed_date || 'Not available'}</div>
            </div>
            <div className="border-b pb-2">
              <div className="text-sm text-gray-500">Seller Name</div>
              <div className="font-medium">{`${record.seller_firstname || ''} ${record.seller_lastname || ''}`.trim() || 'Not available'}</div>
            </div>
            <div className="border-b pb-2">
              <div className="text-sm text-gray-500">Buyer Name</div>
              <div className="font-medium">{`${record.buyer_firstname || ''} ${record.buyer_lastname || ''}`.trim() || 'Not available'}</div>
            </div>
            <div className="border-b pb-2">
              <div className="text-sm text-gray-500">Amount</div>
              <div className="font-medium">{record.buyer_amount || 'Not available'}</div>
            </div>
            <div className="border-b pb-2">
              <div className="text-sm text-gray-500">Deed Link</div>
              <div className="font-medium">
                {record.deed_link ? (
                  <a 
                    href={record.deed_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    View Deed
                  </a>
                ) : 'Not available'}
              </div>
            </div>
            <div className="border-b pb-2">
              <div className="text-sm text-gray-500">Notes</div>
              <div className="font-medium">{record.Notes || 'Not available'}</div>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div>
          <h3 className="text-lg font-medium mb-3 border-b pb-2">Troy Record Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-b pb-2">
              <div className="text-sm text-gray-500">Record Number</div>
              <div className="font-medium">{record.rec_number || 'Not available'}</div>
            </div>
            <div className="border-b pb-2">
              <div className="text-sm text-gray-500">Enslaved Name</div>
              <div className="font-medium">{record.enslaved_name || 'Not available'}</div>
            </div>
            <div className="border-b pb-2">
              <div className="text-sm text-gray-500">Transaction Role</div>
              <div className="font-medium">{record.enslaved_transrole || 'Not available'}</div>
            </div>
            <div className="border-b pb-2">
              <div className="text-sm text-gray-500">Enslaver Name</div>
              <div className="font-medium">{record.enslaver1_name || 'Not available'}</div>
            </div>
            <div className="border-b pb-2">
              <div className="text-sm text-gray-500">Location</div>
              <div className="font-medium">{record.trans_loc || 'Not available'}</div>
            </div>
            <div className="border-b pb-2">
              <div className="text-sm text-gray-500">Transaction Type</div>
              <div className="font-medium">{record.trans_type || 'Not available'}</div>
            </div>
            <div className="border-b pb-2">
              <div className="text-sm text-gray-500">Record Date</div>
              <div className="font-medium">{record.trans_record_date || 'Not available'}</div>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="max-w-full mx-auto py-8 px-4">
      <GlobalSearch onSearch={handleGlobalSearch} />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Advanced Search ({filteredRecords.length} entries)</CardTitle>
          <div className="flex space-x-2">
            <Button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center"
              variant="outline"
            >
              <Filter className="w-4 h-4 mr-2" />
              Advanced Filters
            </Button>
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
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search records..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                </div>
                <Select
                  value={searchColumn}
                  onChange={(e) => setSearchColumn(e.target.value)}
                  className="w-52"
                >
                  <option value="all">Search All Columns</option>
                  {combinedColumns.map(column => (
                    <option key={column.key} value={column.key}>
                      Search in {column.label} only
                    </option>
                  ))}
                </Select>
                <Button onClick={handleSearch}>Search</Button>
              </div>
            </div>

            {/* Tab selector for record types */}
            <div className="flex border-b">
              <button
                className={`px-4 py-2 font-medium ${activeTab === 'combined' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
                onClick={() => setActiveTab('combined')}
              >
                <Database className="w-4 h-4 inline mr-1" />
                All Records
              </button>
              <button
                className={`px-4 py-2 font-medium ${activeTab === 'gsu' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
                onClick={() => setActiveTab('gsu')}
              >
                GSU Records
              </button>
              <button
                className={`px-4 py-2 font-medium ${activeTab === 'troy' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
                onClick={() => setActiveTab('troy')}
              >
                Troy Records
              </button>
            </div>

            {/* Advanced Filters Dropdown */}
            {/* Advanced Filters Dropdown */}
{showAdvancedFilters && (
  <div className="bg-white border shadow-lg rounded-md p-4">
    <div className="flex justify-between items-center mb-4">
      <h3 className="font-medium">Advanced Filters</h3>
      <div className="space-x-2">
        <Button onClick={resetAdvancedFilters} size="sm" variant="outline">
          Reset
        </Button>
        <Button onClick={() => setShowAdvancedFilters(false)} size="sm" variant="ghost">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium mb-1">Record Type</label>
        <Select
          value={advancedFilters.recordType}
          onChange={(e) => setAdvancedFilters({...advancedFilters, recordType: e.target.value})}
          className="w-full"
        >
          <option value="all">All Records</option>
          <option value="gsu">GSU Records</option>
          <option value="troy">Troy Records</option>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Person Type</label>
        <Select
          value={advancedFilters.personType}
          onChange={(e) => setAdvancedFilters({...advancedFilters, personType: e.target.value})}
          className="w-full"
        >
          <option value="all">All Persons</option>
          <option value="enslaved">Enslaved</option>
          <option value="enslaver">Enslaver</option>
          <option value="seller">Seller</option>
          <option value="buyer">Buyer</option>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Location</label>
        <Input
          placeholder="Enter location..."
          value={advancedFilters.location}
          onChange={(e) => setAdvancedFilters({...advancedFilters, location: e.target.value})}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Date Range</label>
        <div className="flex gap-2">
          <Input
            type="date"
            value={advancedFilters.dateRange.start}
            onChange={(e) => setAdvancedFilters({
              ...advancedFilters, 
              dateRange: {...advancedFilters.dateRange, start: e.target.value}
            })}
            className="w-1/2"
          />
          <Input
            type="date"
            value={advancedFilters.dateRange.end}
            onChange={(e) => setAdvancedFilters({
              ...advancedFilters, 
              dateRange: {...advancedFilters.dateRange, end: e.target.value}
            })}
            className="w-1/2"
          />
        </div>
      </div>
      
      {/* Person Name Filter */}
      <div>
        <label className="block text-sm font-medium mb-1">Person Name</label>
        <Input
          placeholder="Filter by person name..."
          value={advancedFilters.personName || ''}
          onChange={(e) => setAdvancedFilters({...advancedFilters, personName: e.target.value})}
        />
      </div>
      
      {/* Transaction Type Filter */}
      <div>
        <label className="block text-sm font-medium mb-1">Transaction Type</label>
        <Input
          placeholder="Filter by transaction type..."
          value={advancedFilters.transactionType || ''}
          onChange={(e) => setAdvancedFilters({...advancedFilters, transactionType: e.target.value})}
        />
      </div>
    </div>
    <div className="mt-4 flex justify-end">
      <Button onClick={applyAdvancedFilters}>Apply Filters</Button>
    </div>
  </div>
)}
            {/* Column Selector Dropdown */}
            {showColumnSelector && (
              <div className="bg-white border shadow-lg rounded-md p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Column Visibility</h3>
                  <div className="space-x-2">
                    <Button onClick={showAllColumns} size="sm" variant="outline">Show All</Button>
                    <Button onClick={() => setShowColumnSelector(false)} size="sm" variant="ghost">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {combinedColumns.map(column => (
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
                            <span className="text-gray-600">{item.column === 'all' ? 'All Columns' : combinedColumns.find(c => c.key === item.column)?.label}</span>
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
                <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Record Details</h2>
                    <Button onClick={() => setShowDetailView(false)} variant="ghost" className="h-8 w-8 px-2 ">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {renderDetailView()}
                  
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
                      {paginatedRecords.length === 0 ? (
                        <tr>
                          <td colSpan={visibleColumnsList.length + 1} className="px-6 py-4 text-center text-gray-500">
                            No records found
                          </td>
                        </tr>
                      ) : (
                        paginatedRecords.map((record, index) => (
                          <tr key={record.id} className="hover:bg-gray-50">
                            <td className="px-9 py-4 whitespace-nowrap">
                              <Button 
                                onClick={() => showRecordDetails(record)} 
                                size="sm" 
                                variant="ghost"
                                className="h-8 w-8 px-2"
                              >
                                <Eye className="h-4 w-4 text-white-600" />
                              </Button>
                            </td>
                            {visibleColumnsList.map(column => (
                              <td key={`${record.id}-${column.key}`} className="px-6 py-4 whitespace-nowrap">
                                {record[column.key]}
                              </td>
                            ))}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700">
                      Showing {filteredRecords.length > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, filteredRecords.length)} of {filteredRecords.length} records
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
                      Page {pagination.currentPage} of {pagination.totalPages || 1}
                    </div>
                    <Button
                      onClick={() => goToPage(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages || pagination.totalPages === 0}
                      variant="outline"
                      size="sm"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => goToPage(pagination.totalPages)}
                      disabled={pagination.currentPage === pagination.totalPages || pagination.totalPages === 0}
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