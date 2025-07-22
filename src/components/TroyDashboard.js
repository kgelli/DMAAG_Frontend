import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import Papa from 'papaparse';
import _ from 'lodash';

export default function TroyDashboard() {
  // State Management
  const [dashboardData, setDashboardData] = useState({
    transactionsByYear: [],
    transactionsByMonth: [],
    locationStats: [],
    enslavedStats: [],
    enslaverStats: [],
    transactionTypeStats: [],
    priceRangeStats: {
      sales: { min: 0, max: 0, avg: 0, count: 0 },
      hires: { min: 0, max: 0, avg: 0, count: 0 },
      distributions: { min: 0, max: 0, avg: 0, count: 0 }
    },
    demographicStats: {
      gender: [],
      age: [],
      occupation: []
    },
    totalRecords: 0,
    totalValue: 0,
    averageValue: 0,
    uniqueLocations: 0
  });
  const [activeView, setActiveView] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data Loading and Processing
  useEffect(() => {
    async function loadAndProcessData() {
      try {
        console.log('Loading Troy CSV data...');
        const response = await fetch('/troyrecords.csv');
        const csvText = await response.text();
        
        // Parse CSV
        const parsed = Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true
        });

        if (!parsed.data || parsed.data.length === 0) {
          throw new Error('No data found in CSV');
        }

        const parsedData = parsed.data;
        console.log('Processing', parsedData.length, 'records');

        const extractYear = (dateStr) => {
          if (!dateStr) return null;
          // Handle format like [18320000] or 18320000
          const cleanDate = dateStr.toString().replace(/[[\]]/g, '');
          // Extract first 4 digits as year
          const year = parseInt(cleanDate.substring(0, 4));
          return isNaN(year) ? null : year;
        };
        
        // Process Data for Different Views
        
        // Yearly Analysis
        const yearlyData = _.chain(parsedData)
          .groupBy(record => {
            const date = record.trans_record_date ? 
              extractYear(record.trans_record_date) : null;
            return date;
          })
          .map((records, year) => ({
            year: parseInt(year),
            transactions: records.length,
            totalValue: _.sumBy(records, r => parseFloat(r.transindv_value) || 0),
            uniqueEnslaved: _.uniqBy(records, 'enslaved_name').length,
            uniqueEnslavers: _.uniqBy(records, 'enslaver1_name').length
          }))
          .sortBy('year')
          .value()
          .filter(item => !isNaN(item.year));

        // Monthly Transaction Analysis
        const extractMonth = (dateStr) => {
          if (!dateStr) return null;
          const cleanDate = dateStr.toString().replace(/[[\]]/g, '');
          const month = parseInt(cleanDate.substring(4, 6));
          return isNaN(month) ? null : month;
        };
        
        const monthlyData = _.chain(parsedData)
          .filter(record => record.trans_record_date)
          .map(record => {
            const year = extractYear(record.trans_record_date);
            const month = extractMonth(record.trans_record_date);
            return {
              ...record,
              year,
              month
            };
          })
          .filter(r => r.year && r.month)
          .groupBy(record => `${record.year}-${record.month}`)
          .map((records, yearMonth) => {
            const [year, month] = yearMonth.split('-').map(Number);
            return {
              yearMonth,
              year,
              month,
              monthName: new Date(year, month - 1, 1).toLocaleString('default', { month: 'long' }),
              transactions: records.length,
              salesCount: records.filter(r => r.trans_type?.toLowerCase().includes('sale')).length,
              hiresCount: records.filter(r => {
                const type = r.trans_type?.toLowerCase();
                return type && (type.includes('hire') || type.includes('employment'));
              }).length,
              distributionsCount: records.filter(r => r.trans_type?.toLowerCase().includes('distribution')).length,
              totalValue: _.sumBy(records, r => parseFloat(r.transindv_value) || 0)
            };
          })
          .sortBy(['year', 'month'])
          .value();

        

        // Location Analysis
        const locationStats = _.chain(parsedData)
          .groupBy('trans_loc')
          .map((records, location) => ({
            name: location || 'Unknown',
            transactions: records.length,
            totalValue: _.sumBy(records, r => parseFloat(r.transindv_value) || 0),
            uniqueEnslaved: _.uniqBy(records, 'enslaved_name').length,
            uniqueEnslavers: _.uniqBy(records, 'enslaver1_name').length
          }))
          .value()
          .filter(item => item.name !== 'Unknown' && item.name !== 'null');

        // Transaction Type Analysis
        const transactionTypeStats = _.chain(parsedData)
          .groupBy('trans_type')
          .map((records, type) => ({
            name: type || 'Unknown',
            count: records.length,
            totalValue: _.sumBy(records, r => parseFloat(r.transindv_value) || 0)
          }))
          .value()
          .filter(item => item.name !== 'Unknown' && item.name !== 'null');

        // Price Ranges Analysis
        const salesRecords = parsedData.filter(r => r.trans_type?.toLowerCase().includes('sale') && parseFloat(r.transindv_value) > 0);
        const hiresRecords = parsedData.filter(r => {
          const type = r.trans_type?.toLowerCase();
          return type && (type.includes('hire') || type.includes('employment')) &&
                parseFloat(r.transindv_value) > 0;
        });        
        const distributionsRecords = parsedData.filter(r => r.trans_type?.toLowerCase().includes('distribution') && parseFloat(r.transindv_value) > 0);

        const calculatePriceStats = records => {
          if (records.length === 0) return { min: 0, max: 0, avg: 0, count: 0 };
          const values = records.map(r => parseFloat(r.transindv_value)).filter(v => !isNaN(v) && v > 0);
          return {
            min: _.min(values) || 0,
            max: _.max(values) || 0,
            avg: _.mean(values) || 0,
            count: values.length
          };
        };

        const priceRangeStats = {
          sales: calculatePriceStats(salesRecords),
          hires: calculatePriceStats(hiresRecords),
          distributions: calculatePriceStats(distributionsRecords)
        };

        // Demographic Analysis
        // Gender Demographics (based on descriptions)
        const genderDemographics = _.chain(parsedData)
          .filter(r => r.enslaved_name)
          .map(record => {
            let gender = 'Unknown';
            const description = record.enslaved_genagedesc || '';
            
            // Simple gender determination logic based on descriptions
            if (description.toLowerCase().includes('woman') || 
                description.toLowerCase().includes('female') || 
                description.toLowerCase().includes('girl') ||
                description.toLowerCase().includes('wife') ||
                description.toLowerCase().includes('mother')) {
              gender = 'Female';
            } else if (description.toLowerCase().includes('man') || 
                      description.toLowerCase().includes('male') || 
                      description.toLowerCase().includes('boy') ||
                      description.toLowerCase().includes('husband') ||
                      description.toLowerCase().includes('father')) {
              gender = 'Male';
            }
            
            return {
              ...record,
              gender
            };
          })
          .groupBy('gender')
          .map((records, gender) => ({
            name: gender,
            count: records.length,
            value: _.sumBy(records, r => parseFloat(r.transindv_value) || 0)
          }))
          .value();

        // Age Demographics
        const ageDemographics = _.chain(parsedData)
          .filter(r => r.enslaved_name)
          .map(record => {
            let ageCategory = 'Unknown';
            const description = record.enslaved_genagedesc || '';
            const age = parseInt(record.enslaved_age);
            
            // Categorize by age
            if (!isNaN(age)) {
              if (age < 16) ageCategory = 'Child';
              else if (age < 50) ageCategory = 'Adult';
              else ageCategory = 'Elderly';
            } else if (description.toLowerCase().includes('child') || 
                       description.toLowerCase().includes('boy') || 
                       description.toLowerCase().includes('girl') ||
                       description.toLowerCase().includes('infant')) {
              ageCategory = 'Child';
            } else if (description.toLowerCase().includes('elderly') ||
                      description.toLowerCase().includes('old')) {
              ageCategory = 'Elderly';
            } else if (description.toLowerCase().includes('adult') ||
                      description.toLowerCase().includes('man') ||
                      description.toLowerCase().includes('woman')) {
              ageCategory = 'Adult';
            }
            
            return {
              ...record,
              ageCategory
            };
          })
          .groupBy('ageCategory')
          .map((records, category) => ({
            name: category,
            count: records.length,
            value: _.sumBy(records, r => parseFloat(r.transindv_value) || 0)
          }))
          .value();

        // Occupation Demographics
        const occupationDemographics = _.chain(parsedData)
          .filter(r => r.enslaved_occ && r.enslaved_occ !== 'null')
          .groupBy('enslaved_occ')
          .map((records, occupation) => ({
            name: occupation,
            count: records.length,
            value: _.sumBy(records, r => parseFloat(r.transindv_value) || 0)
          }))
          .filter(occ => occ.count > 5) // Only include occupations with significant records
          .sortBy(occ => -occ.count)
          .value();

        const allEnslavedFrequency = _.chain(parsedData)
          .groupBy('enslaved_name')
          .map((records, name) => ({
            name,
            transactions: records.length,
            totalValue: _.sumBy(records, r => parseFloat(r.transindv_value) || 0),
          }))
          .filter(person => person.name && person.name.trim() !== '' && person.name !== 'null')
          .value();

        const allEnslaverFrequency = _.chain(parsedData)
          .groupBy('enslaver1_name')
          .map((records, name) => ({
            name,
            transactions: records.length,
            totalValue: _.sumBy(records, r => parseFloat(r.transindv_value) || 0),
          }))
          .filter(enslaver => enslaver.name && enslaver.name.trim() !== '' && enslaver.name !== 'null')
          .value();

        // Calculate total unique counts (BEFORE filtering to top 10)
        const totalUniqueEnslaved = _.chain(parsedData)
          .filter(person => person.enslaved_name && person.enslaved_name.trim() !== '' && person.enslaved_name !== 'null')
          .uniqBy('enslaved_name')
          .value().length;

        const totalUniqueEnslavers = _.chain(parsedData)
          .filter(enslaver => enslaver.enslaver1_name && enslaver.enslaver1_name.trim() !== '' && enslaver.enslaver1_name !== 'null')
          .uniqBy('enslaver1_name')
          .value().length;

        // Enslaved Persons Analysis
        const enslavedStats = _.chain(parsedData)
          .groupBy('enslaved_name')
          .map((records, name) => ({
            name,
            transactions: records.length,
            totalValue: _.sumBy(records, r => parseFloat(r.transindv_value) || 0),
            roles: _.uniq(records.map(r => r.enslaved_transrole))
          }))
          .filter(person => person.name && person.name.trim() !== '' && person.name !== 'null')
          .sortBy(r => -r.transactions)
          .take(20)
          .value();

        // Enslaver Analysis
        const enslaverStats = _.chain(parsedData)
          .groupBy('enslaver1_name')
          .map((records, name) => ({
            name,
            transactions: records.length,
            totalValue: _.sumBy(records, r => parseFloat(r.transindv_value) || 0),
            locations: _.uniq(records.map(r => r.enslaver1_loc))
          }))
          .filter(enslaver => enslaver.name && enslaver.name.trim() !== '' && enslaver.name !== 'null')
          .sortBy(r => -r.transactions)
          .take(20)
          .value();

        // Overall Statistics
        const totalRecords = parsedData.length;
        const totalValue = _.sumBy(parsedData, record => parseFloat(record.transindv_value) || 0);
        const averageValue = totalRecords > 0 ? totalValue / totalRecords : 0;
        const uniqueLocations = _.uniq(parsedData.map(r => r.trans_loc))
          .filter(loc => loc && loc !== 'null').length;

        // Update Dashboard Data
        setDashboardData({
          transactionsByYear: yearlyData,
          transactionsByMonth: monthlyData,
          locationStats,
          enslavedStats,
          enslaverStats,
          allEnslavedFrequency,
          allEnslaverFrequency,
          totalUniqueEnslaved,    
          totalUniqueEnslavers,
          transactionTypeStats,
          priceRangeStats,
          demographicStats: {
            gender: genderDemographics,
            age: ageDemographics,
            occupation: occupationDemographics
          },
          totalRecords,
          totalValue,
          averageValue,
          uniqueLocations
        });

        setLoading(false);
      } catch (error) {
        console.error('Error processing data:', error);
        setError(error.message || 'Error loading dashboard data');
        setLoading(false);
      }
    }

    loadAndProcessData();
  }, []);

  // Utility Functions
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 shadow-lg rounded-lg border">
          <p className="font-semibold">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {
                entry.name.includes('Value') 
                  ? `$${entry.value.toLocaleString()}`
                  : entry.value.toLocaleString()
              }
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Loading State
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Troy Records Dashboard</h1>
        <Link to="/visualization" className="text-blue-600 hover:text-blue-800 flex items-center">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Visualizations
        </Link>
      </div>
      
      <div className="space-y-6 p-6 bg-gray-50 rounded-lg shadow">
        {/* Navigation */}
        <div className="flex gap-2 flex-wrap">
          {['overview', 'prices', 'demographics', 'seasonal', 'monthly', 'locations', 'people'].map((view) => (
            <Button
              key={view}
              onClick={() => setActiveView(view)}
              variant={activeView === view ? "default" : "outline"}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </Button>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold opacity-90">Total Records</h3>
              <p className="text-3xl font-bold mt-2">
                {dashboardData.totalRecords.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white relative group">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold opacity-90">Total Value</h3>
              <p className="text-3xl font-bold mt-2">
                ${Math.round(dashboardData.totalValue).toLocaleString()}
              </p>
              <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-90 text-white p-4 rounded-lg -right-4 top-full mt-2 w-72 z-10 shadow-xl">
                <p className="text-sm mb-2">Modern Equivalent Value:</p>
                <p className="text-2xl font-bold">${Math.round(dashboardData.totalValue * 36.82).toLocaleString()}</p>
                <p className="text-xs mt-2 opacity-75">
                  Based on the historical conversion rate from 1800s to 2024
                  (1 USD from 1800s ≈ 36.82 USD today)
                </p>
                <div className="absolute -top-2 right-8 w-4 h-4 bg-black bg-opacity-90 transform rotate-45"></div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold opacity-90">Average Value</h3>
              <p className="text-3xl font-bold mt-2">
                ${Math.round(dashboardData.averageValue).toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold opacity-90">Unique Locations</h3>
              <p className="text-3xl font-bold mt-2">
                {dashboardData.uniqueLocations.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

{/* Overview View */}
        {activeView === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Transaction Types Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction Types Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dashboardData.transactionTypeStats.filter(item => item.count > 0)}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      innerRadius={40}
                      labelLine={false}
                      label={({ name, percent }) => percent > 0.05 ? `${name}\n${(percent * 100).toFixed(1)}%` : ''}
                    >
                      {dashboardData.transactionTypeStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => value.toLocaleString()} />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Locations by Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Top Locations by Activity</CardTitle>
              </CardHeader>
              <CardContent className="h-[450px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={_.orderBy(dashboardData.locationStats, 'transactions', 'desc').slice(0, 10)}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={100}
                      interval={0}
                      fontSize={10}
                    />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ paddingTop: '15px' }} />
                    <Bar dataKey="transactions" name="Transactions" fill="#3b82f6" />
                    <Bar dataKey="uniqueEnslaved" name="Unique Enslaved Persons" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Demographics Overview */}
            <Card className="col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle>Demographic Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Gender Distribution */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-4 text-center">Gender Distribution</h3>
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={dashboardData.demographicStats.gender
                            .filter(g => g.count > 0)
                            .map(g => ({
                              ...g,
                              name: g.name === 'Unknown' ? 'Unknown' : g.name
                            }))}
                          dataKey="count"
                          nameKey="name"
                          cx="50%"
                          cy="45%"
                          outerRadius={75}
                          innerRadius={45}
                          labelLine={false}
                          label={({ percent }) => percent > 0.08 ? `\n${(percent * 100).toFixed(1)}%` : ''}
                        >
                          {dashboardData.demographicStats.gender.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Age Categories */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-4 text-center">Age Categories</h3>
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={dashboardData.demographicStats.age
                            .filter(a => a.count > 0)
                            .map(a => ({
                              ...a,
                              name: a.name === 'Unknown' ? 'Unknown' : a.name
                            }))}
                          dataKey="count"
                          nameKey="name"
                          cx="50%"
                          cy="45%"
                          outerRadius={75}
                          innerRadius={45}
                          labelLine={false}
                          label={({ percent }) => percent > 0.08 ? `\n${(percent * 100).toFixed(1)}%` : ''}
                        >
                          {dashboardData.demographicStats.age.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Transaction Values by Type */}
                  <div className="bg-amber-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-4 text-center">Avg. Values by Transaction Type</h3>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart 
                        data={[
                          { name: 'Sales', value: dashboardData.priceRangeStats.sales.avg },
                          { name: 'Hires', value: dashboardData.priceRangeStats.hires.avg },
                          { name: 'Distributions', value: dashboardData.priceRangeStats.distributions.avg }
                        ].filter(item => item.value > 0)}
                        margin={{ top: 30, right: 55, left: 15, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                         <XAxis dataKey="name" />
                        <YAxis 
                          fontSize={10}
                          label={{ value: 'Avg. Value ($)', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip 
                          formatter={(value) => [`${Math.round(value).toLocaleString()}`, 'Average Value']}
                        />
                        <Legend wrapperStyle={{ paddingTop: '15px' }} />
                        <Bar dataKey="value" name="Avg. Value ($)" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Prices View */}
        {activeView === 'prices' && (
          <div className="grid grid-cols-1 gap-6">
            {/* Price Ranges by Transaction Type */}
            <Card>
              <CardHeader>
                <CardTitle>Price Analysis by Transaction Type</CardTitle>
              </CardHeader>
              <CardContent className="h-[450px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={[
                      { 
                        name: 'Sales', 
                        min: dashboardData.priceRangeStats.sales.min,
                        max: dashboardData.priceRangeStats.sales.max,
                        avg: dashboardData.priceRangeStats.sales.avg,
                        count: dashboardData.priceRangeStats.sales.count
                      },
                      { 
                        name: 'Hires', 
                        min: dashboardData.priceRangeStats.hires.min,
                        max: dashboardData.priceRangeStats.hires.max,
                        avg: dashboardData.priceRangeStats.hires.avg,
                        count: dashboardData.priceRangeStats.hires.count
                      },
                      { 
                        name: 'Distributions', 
                        min: dashboardData.priceRangeStats.distributions.min,
                        max: dashboardData.priceRangeStats.distributions.max,
                        avg: dashboardData.priceRangeStats.distributions.avg,
                        count: dashboardData.priceRangeStats.distributions.count
                      }
                    ].filter(item => item.count > 0)}
                    margin={{ top: 20, right: 50, left: 50, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" label={{ value: 'Price ($)', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" label={{ value: 'Count', angle: 90, position: 'insideRight' }} />
                    <Tooltip 
                      formatter={(value, name) => [
                        name.includes('count') ? value.toLocaleString() : `${Math.round(value).toLocaleString()}`,
                        name
                      ]}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="min" name="Minimum Value ($)" fill="#10b981" />
                    <Bar yAxisId="left" dataKey="avg" name="Average Value ($)" fill="#3b82f6" />
                    <Bar yAxisId="left" dataKey="max" name="Maximum Value ($)" fill="#f59e0b" />
                    <Bar yAxisId="right" dataKey="count" name="Number of Transactions" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Detailed Price Statistics Table */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Price Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min. Value</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Value</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max. Value</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">Sales</td>
                        <td className="px-6 py-4 whitespace-nowrap">{dashboardData.priceRangeStats.sales.count.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">${Math.round(dashboardData.priceRangeStats.sales.min).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">${Math.round(dashboardData.priceRangeStats.sales.avg).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">${Math.round(dashboardData.priceRangeStats.sales.max).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">${Math.round(dashboardData.priceRangeStats.sales.avg * dashboardData.priceRangeStats.sales.count).toLocaleString()}</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap font-medium">Hires</td>
                        <td className="px-6 py-4 whitespace-nowrap">{dashboardData.priceRangeStats.hires.count.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">${Math.round(dashboardData.priceRangeStats.hires.min).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">${Math.round(dashboardData.priceRangeStats.hires.avg).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">${Math.round(dashboardData.priceRangeStats.hires.max).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">${Math.round(dashboardData.priceRangeStats.hires.avg * dashboardData.priceRangeStats.hires.count).toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">Distributions</td>
                        <td className="px-6 py-4 whitespace-nowrap">{dashboardData.priceRangeStats.distributions.count.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">${Math.round(dashboardData.priceRangeStats.distributions.min).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">${Math.round(dashboardData.priceRangeStats.distributions.avg).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">${Math.round(dashboardData.priceRangeStats.distributions.max).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">${Math.round(dashboardData.priceRangeStats.distributions.avg * dashboardData.priceRangeStats.distributions.count).toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Price Comparison Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Price Distribution by Gender */}
              <Card>
                <CardHeader>
                  <CardTitle>Average Values by Gender</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={dashboardData.demographicStats.gender
                        .filter(item => item.count > 0 && item.name !== 'Unknown')
                        .map(item => ({ 
                          name: item.name, 
                          avgValue: item.count > 0 ? Math.round(item.value / item.count) : 0,
                          count: item.count
                        }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" orientation="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip 
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white p-3 shadow-lg rounded border">
                                <p className="font-semibold">{label}</p>
                                {payload.map((entry, index) => (
                                  <p key={index} style={{ color: entry.color }}>
                                    {entry.dataKey === 'avgValue' ? 'Average Value' : 'Count'}: {
                                      entry.dataKey === 'avgValue' ? `$${entry.value.toLocaleString()}` : entry.value.toLocaleString()
                                    }
                                  </p>
                                ))}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="avgValue" name="Average Value ($)" fill="#3b82f6" />
                      <Bar yAxisId="right" dataKey="count" name="Count" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Price Distribution by Age */}
              <Card>
                <CardHeader>
                  <CardTitle>Average Values by Age Category</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={dashboardData.demographicStats.age
                        .filter(item => item.count > 0 && item.name !== 'Unknown')
                        .map(item => ({ 
                          name: item.name, 
                          avgValue: item.count > 0 ? Math.round(item.value / item.count) : 0,
                          count: item.count
                        }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" orientation="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-4 shadow-lg rounded-lg border">
                              <p className="font-semibold mb-2">{label} Age Category</p>
                              {payload.map((entry, index) => (
                                <p key={index} style={{ color: entry.color }} className="text-sm">
                                  {entry.dataKey === 'avgValue' ? 'Average Value' : 'Count'}: {
                                    entry.dataKey === 'avgValue' 
                                      ? `$${Math.round(entry.value).toLocaleString()}` 
                                      : entry.value.toLocaleString()
                                  }
                                </p>
                              ))}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                      <Legend />
                      <Bar yAxisId="left" dataKey="avgValue" name="Average Value ($)" fill="#f59e0b" />
                      <Bar yAxisId="right" dataKey="count" name="Count" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Price Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Price Analysis Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-800 text-lg mb-2">Sales Transactions</h3>
                    <p className="text-blue-700 mb-2">
                      Sales represent permanent ownership transfers and typically command the highest values.
                      The wide range between minimum and maximum values reflects factors such as:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-blue-700 text-sm">
                      <li>Age and physical condition of enslaved persons</li>
                      <li>Specialized skills and occupations</li>
                      <li>Market conditions at time of sale</li>
                      <li>Family relationships and potential separations</li>
                    </ul>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-lg">
                    <h3 className="font-medium text-amber-800 text-lg mb-2">Hire Transactions</h3>
                    <p className="text-amber-700 mb-2">
                      Hire transactions (labeled as 'hire' or 'employment') represent temporary labor contracts, typically for one year.
                      Lower values reflect the temporary nature but show consistent demand for:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-amber-700 text-sm">
                      <li>Seasonal agricultural work</li>
                      <li>Skilled trades and domestic service</li>
                      <li>Urban employment opportunities</li>
                      <li>Flexibility in labor allocation</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800 text-lg mb-2">Economic Context</h3>
                  <p className="text-gray-700">
                    The price differentials reveal the harsh economic reality of slavery in antebellum Georgia. 
                    Values were determined by perceived productivity potential, with demographic factors like 
                    gender and age playing crucial roles in determining an enslaved person's monetary worth. 
                    These transactions represent not just economic exchanges but the commodification of human lives 
                    within a system that reduced people to their labor value.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

{/* Demographics View */}
        {activeView === 'demographics' && (
          <div className="grid grid-cols-1 gap-6">
            {/* Gender Demographics */}
            <Card>
              <CardHeader>
                <CardTitle>Gender Demographics Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Gender Distribution Chart */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-4 text-center text-blue-800">Gender Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={dashboardData.demographicStats.gender.filter(g => g.count > 0)}
                          dataKey="count"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          innerRadius={40}
                          labelLine={false}
                          label={({ name, percent }) => percent > 0.05 ? `${name}\n${(percent * 100).toFixed(1)}%` : ''}
                        >
                          {dashboardData.demographicStats.gender.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => value.toLocaleString()} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Gender Statistics and Methodology */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium mb-3">Gender Classification Methodology</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Gender classification is based on descriptive text analysis in historical records. 
                        Our algorithm identifies gender markers in the enslaved person descriptions:
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-pink-100 p-2 rounded">
                          <strong>Female indicators:</strong> woman, female, girl, wife, mother, daughter
                        </div>
                        <div className="bg-blue-100 p-2 rounded">
                          <strong>Male indicators:</strong> man, male, boy, husband, father, son
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Gender</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Count</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">%</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Avg. Value</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {dashboardData.demographicStats.gender.map((gender, index) => {
                            const total = dashboardData.demographicStats.gender.reduce((sum, g) => sum + g.count, 0);
                            const percentage = total > 0 ? ((gender.count / total) * 100).toFixed(1) : 0;
                            return (
                              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="px-4 py-2 whitespace-nowrap font-medium">{gender.name}</td>
                                <td className="px-4 py-2 whitespace-nowrap">{gender.count.toLocaleString()}</td>
                                <td className="px-4 py-2 whitespace-nowrap">{percentage}%</td>
                                <td className="px-4 py-2 whitespace-nowrap">${gender.count > 0 ? Math.round(gender.value / gender.count).toLocaleString() : 0}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Age Demographics */}
            <Card>
              <CardHeader>
                <CardTitle>Age Demographics Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Age Distribution Chart */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-4 text-center text-green-800">Age Category Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={dashboardData.demographicStats.age.filter(a => a.count > 0)}
                          dataKey="count"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          innerRadius={40}
                          labelLine={false}
                          label={({ name, percent }) => percent > 0.05 ? `${name}\n${(percent * 100).toFixed(1)}%` : ''}
                        >
                          {dashboardData.demographicStats.age.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => value.toLocaleString()} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Age Statistics and Methodology */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium mb-3">Age Classification System</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Age categories combine numeric age data with descriptive text analysis:
                      </p>
                      <div className="space-y-2 text-xs">
                        <div className="bg-yellow-100 p-2 rounded">
                          <strong>Child (Under 16):</strong> Numeric age &lt;16, or descriptions: "child," "boy," "girl," "infant"
                        </div>
                        <div className="bg-blue-100 p-2 rounded">
                          <strong>Adult (16-49):</strong> Numeric age 16-49, or descriptions: "adult," "man," "woman"
                        </div>
                        <div className="bg-purple-100 p-2 rounded">
                          <strong>Elderly (50+):</strong> Numeric age 50+, or descriptions: "elderly," "old"
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Age Category</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Count</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">%</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Avg. Value</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {dashboardData.demographicStats.age.map((age, index) => {
                            const total = dashboardData.demographicStats.age.reduce((sum, a) => sum + a.count, 0);
                            const percentage = total > 0 ? ((age.count / total) * 100).toFixed(1) : 0;
                            return (
                              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="px-4 py-2 whitespace-nowrap font-medium">{age.name}</td>
                                <td className="px-4 py-2 whitespace-nowrap">{age.count.toLocaleString()}</td>
                                <td className="px-4 py-2 whitespace-nowrap">{percentage}%</td>
                                <td className="px-4 py-2 whitespace-nowrap">${age.count > 0 ? Math.round(age.value / age.count).toLocaleString() : 0}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Occupation Demographics */}
             <Card>
              <CardHeader>
                <CardTitle>Occupation Analysis</CardTitle>
                <p className="text-sm text-gray-500">Showing occupations with 5+ recorded instances</p>
              </CardHeader>
              <CardContent className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={dashboardData.demographicStats.occupation.slice(0, 15).map(item => ({
                      ...item,
                      avgValue: item.count > 0 ? Math.round(item.value / item.count) : 0
                    }))} // Top 15 occupations with calculated average
                    margin={{ top: 20, right: 60, left: 20, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      height={40}
                      interval={0}
                      fontSize={12}
                    />
                    <YAxis yAxisId="left" orientation="left" label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" label={{ value: 'Avg. Value ($)', angle: 90, position: 'insideRight' }} />
                    <Tooltip 
                      formatter={(value, name) => [
                        name.includes('Value') ? `${value.toLocaleString()}` : value.toLocaleString(),
                        name
                      ]}
                    />
                    <Legend />
                    <Bar 
                      yAxisId="left" 
                      dataKey="count" 
                      name="Number of Records" 
                      fill="#3b82f6" 
                    />
                    <Bar 
                      yAxisId="right" 
                      dataKey="avgValue" 
                      name="Average Value ($)" 
                      fill="#10b981" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Demographic Value Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gender Value Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle>Value Differences by Gender</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={dashboardData.demographicStats.gender
                        .filter(g => g.count > 0 && g.name !== 'Unknown')
                        .map(g => ({
                          name: g.name,
                          avgValue: Math.round(g.value / g.count),
                          count: g.count
                        }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                      <Bar dataKey="avgValue" name="Average Value ($)" fill="#ec4899" />
                      <Legend wrapperStyle={{ paddingTop: '15px' }} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Age Value Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle>Value Differences by Age</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={dashboardData.demographicStats.age
                        .filter(a => a.count > 0 && a.name !== 'Unknown')
                        .map(a => ({
                          name: a.name,
                          avgValue: Math.round(a.value / a.count),
                          count: a.count
                        }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                      <Legend wrapperStyle={{ paddingTop: '15px' }} />
                      <Bar dataKey="avgValue" name="Average Value ($)" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Demographic Analysis Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Demographic Analysis Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-pink-50 p-4 rounded-lg">
                    <h3 className="font-medium text-pink-800 text-lg mb-2">Gender Patterns</h3>
                    <p className="text-pink-700 text-sm">
                      The gender distribution in Troy's records reflects the broader patterns of slavery, 
                      where both men and women were subjected to the slave trade. Value differences between 
                      genders often reflected societal perceptions of labor capacity and reproductive potential, 
                      representing the dehumanizing economic calculations of the slavery system.
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-800 text-lg mb-2">Age Demographics</h3>
                    <p className="text-blue-700 text-sm">
                      Age patterns reveal the cruel reality that enslaved persons of all ages were subject to 
                      commercial transactions. Adults typically commanded higher values due to perceived peak 
                      productivity, while children represented "future investment." The presence of elderly 
                      enslaved persons in records often relates to family groupings or estate distributions.
                    </p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-medium text-green-800 text-lg mb-2">Occupational Skills</h3>
                    <p className="text-green-700 text-sm">
                      Recorded occupations highlight the diverse skills enslaved persons possessed and how 
                      these abilities were commodified. Skilled trades often commanded premium values, 
                      demonstrating how human expertise and knowledge were appropriated within the slavery 
                      system. Many enslaved persons developed and maintained crucial skills despite their bondage.
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 bg-gray-100 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800 text-lg mb-2">Historical Context</h3>
                  <p className="text-gray-700 text-sm">
                    These demographic patterns reflect the systematic nature of slavery in antebellum Georgia. 
                    The detailed recording of personal characteristics demonstrates how enslaved persons were 
                    assessed and valued as property. Understanding these patterns helps illuminate both the 
                    human tragedy of slavery and the resistance, skills, and dignity that enslaved persons 
                    maintained despite the dehumanizing system they faced. Each statistic represents real 
                    individuals whose lives were impacted by these transactions.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Monthly View */}
        {activeView === 'monthly' && (
          <div className="grid grid-cols-1 gap-6">
            {/* Monthly Transaction Volume Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Transaction Volume Trends</CardTitle>
                <p className="text-sm text-gray-500">Transaction patterns throughout the year showing seasonal variations</p>
              </CardHeader>
              <CardContent className="h-[450px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={_.chain(dashboardData.transactionsByMonth)
                      .groupBy('month')
                      .map((monthRecords, month) => ({
                        month: parseInt(month),
                        monthName: new Date(2000, month - 1, 1).toLocaleString('default', { month: 'short' }),
                        avgTransactions: _.meanBy(monthRecords, 'transactions'),
                        avgSales: _.meanBy(monthRecords, 'salesCount'),
                        avgHires: _.meanBy(monthRecords, 'hiresCount'),
                        avgDistributions: _.meanBy(monthRecords, 'distributionsCount'),
                        totalRecords: monthRecords.length
                      }))
                      .sortBy('month')
                      .value()}
                    margin={{ top: 20, right: 50, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="monthName" />
                    <YAxis label={{ value: 'Average Transactions', angle: -90, position: 'insideLeft' }} />
                    <Tooltip 
                      formatter={(value, name) => [
                        Math.round(value).toLocaleString(),
                        name
                      ]}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="avgTransactions" 
                      name="Total Transactions" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="avgSales" 
                      name="Sales" 
                      stroke="#10b981" 
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="avgHires" 
                      name="Hires" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="avgDistributions" 
                      name="Distributions" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Monthly Transaction Types Stacked */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Transaction Types Distribution</CardTitle>
                <p className="text-sm text-gray-500">
                  Stacked view showing composition of transaction types by month
                </p>
              </CardHeader>
              <CardContent className="h-[400px]">
                {(() => {
                  const monthlyTransactionTypeData = _.chain(dashboardData.transactionsByMonth)
                    .groupBy('month')
                    .map((records, month) => {
                      const monthNum = parseInt(month);
                      return {
                        monthNum,
                        month: new Date(2000, monthNum - 1).toLocaleString('default', { month: 'short' }),
                        sales: _.sumBy(records, 'salesCount'),
                        hires: _.sumBy(records, 'hiresCount'),
                        distributions: _.sumBy(records, 'distributionsCount'),
                      };
                    })
                    .sortBy('monthNum') 
                    .value();

                  return (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={monthlyTransactionTypeData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis
                          label={{
                            value: 'Number of Transactions',
                            angle: -90,
                            position: 'insideLeft',
                            offset: 10,
                            style: { textAnchor: 'middle', fill: '#4B5563', fontSize: 12 }
                          }}
                        />
                        <Tooltip formatter={(value) => value.toLocaleString()} />
                        <Legend />
                        <Bar dataKey="sales" stackId="a" fill="#10b981" name="Sales" />
                        <Bar dataKey="hires" stackId="a" fill="#f59e0b" name="Hires" />
                        <Bar dataKey="distributions" stackId="a" fill="#ef4444" name="Distributions" />
                      </BarChart>
                    </ResponsiveContainer>
                  );
                })()}
              </CardContent>
            </Card>


            {/* Monthly Value Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Transaction Values</CardTitle>
                <p className="text-sm text-gray-500">Average transaction values and total value by month</p>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={_.chain(dashboardData.transactionsByMonth)
                      .groupBy('month')
                      .map((monthRecords, month) => ({
                        month: parseInt(month),
                        monthName: new Date(2000, month - 1, 1).toLocaleString('default', { month: 'short' }),
                        totalValue: _.sumBy(monthRecords, 'totalValue'),
                        totalTransactions: _.sumBy(monthRecords, 'transactions'),
                        avgPerTransaction: _.meanBy(monthRecords, record => 
                          record.transactions > 0 ? record.totalValue / record.transactions : 0
                        )
                      }))
                      .sortBy('month')
                      .value()}
                    margin={{ top: 20, right: 50, left: 50, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="monthName" />
                    <YAxis yAxisId="left" orientation="left" label={{ value: 'Total Monthly Value ($)', angle: -90, position: 'insideLeft', offset: -20 }} />
                    <YAxis yAxisId="right" orientation="right" label={{ value: 'Avg. Per Transaction ($)', angle: 90, position: 'insideRight' }} />
                    <Tooltip 
                      formatter={(value, name) => [
                        `$${Math.round(value).toLocaleString()}`,
                        name
                      ]}
                    />
                    <Legend />
                    <Bar 
                      yAxisId="left" 
                      dataKey="totalValue" 
                      name="Total Monthly Value ($)" 
                      fill="#3b82f6" 
                    />
                    <Bar 
                      yAxisId="right" 
                      dataKey="avgPerTransaction" 
                      name="Average Per Transaction ($)" 
                      fill="#8b5cf6" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Seasonal Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Seasonal Transaction Patterns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  {/* Winter (Dec-Feb) */}
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <h3 className="text-blue-800 font-medium text-lg mb-2">Winter</h3>
                    <p className="text-blue-600 text-sm mb-2">Dec - Feb</p>
                    <div className="bg-white rounded p-2">
                      <ResponsiveContainer width="100%" height={150}>
                        <PieChart>
                          <Pie
                            data={(() => {
                              const winterMonths = [12, 1, 2];
                              const winterData = _.chain(dashboardData.transactionsByMonth)
                                .filter(record => winterMonths.includes(record.month))
                                .value();
                              return [
                                { name: 'Sales', value: _.sumBy(winterData, 'salesCount') },
                                { name: 'Hires', value: _.sumBy(winterData, 'hiresCount') },
                                { name: 'Distributions', value: _.sumBy(winterData, 'distributionsCount') }
                              ].filter(item => item.value > 0);
                            })()}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={60}
                            innerRadius={20}
                          >
                            {[0, 1, 2].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-blue-700 mt-2">
                      Peak hiring season with year-end contracts
                    </p>
                  </div>
                  
                  {/* Spring (Mar-May) */}
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <h3 className="text-green-800 font-medium text-lg mb-2">Spring</h3>
                    <p className="text-green-600 text-sm mb-2">Mar - May</p>
                    <div className="bg-white rounded p-2">
                      <ResponsiveContainer width="100%" height={150}>
                        <PieChart>
                          <Pie
                            data={(() => {
                              const springMonths = [3, 4, 5];
                              const springData = _.chain(dashboardData.transactionsByMonth)
                                .filter(record => springMonths.includes(record.month))
                                .value();
                              return [
                                { name: 'Sales', value: _.sumBy(springData, 'salesCount') },
                                { name: 'Hires', value: _.sumBy(springData, 'hiresCount') },
                                { name: 'Distributions', value: _.sumBy(springData, 'distributionsCount') }
                              ].filter(item => item.value > 0);
                            })()}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={60}
                            innerRadius={20}
                          >
                            {[0, 1, 2].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-green-700 mt-2">
                      Estate settlements and planting season adjustments
                    </p>
                  </div>
                  
                  {/* Summer (Jun-Aug) */}
                  <div className="bg-yellow-50 rounded-lg p-4 text-center">
                    <h3 className="text-yellow-800 font-medium text-lg mb-2">Summer</h3>
                    <p className="text-yellow-600 text-sm mb-2">Jun - Aug</p>
                    <div className="bg-white rounded p-2">
                      <ResponsiveContainer width="100%" height={150}>
                        <PieChart>
                          <Pie
                            data={(() => {
                              const summerMonths = [6, 7, 8];
                              const summerData = _.chain(dashboardData.transactionsByMonth)
                                .filter(record => summerMonths.includes(record.month))
                                .value();
                              return [
                                { name: 'Sales', value: _.sumBy(summerData, 'salesCount') },
                                { name: 'Hires', value: _.sumBy(summerData, 'hiresCount') },
                                { name: 'Distributions', value: _.sumBy(summerData, 'distributionsCount') }
                              ].filter(item => item.value > 0);
                            })()}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={60}
                            innerRadius={20}
                          >
                            {[0, 1, 2].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-yellow-700 mt-2">
                      Pre-harvest labor acquisitions and sales
                    </p>
                  </div>
                  
                  {/* Fall (Sep-Nov) */}
                  <div className="bg-orange-50 rounded-lg p-4 text-center">
                    <h3 className="text-orange-800 font-medium text-lg mb-2">Fall</h3>
                    <p className="text-orange-600 text-sm mb-2">Sep - Nov</p>
                    <div className="bg-white rounded p-2">
                      <ResponsiveContainer width="100%" height={150}>
                        <PieChart>
                          <Pie
                            data={(() => {
                              const fallMonths = [9, 10, 11];
                              const fallData = _.chain(dashboardData.transactionsByMonth)
                                .filter(record => fallMonths.includes(record.month))
                                .value();
                              return [
                                { name: 'Sales', value: _.sumBy(fallData, 'salesCount') },
                                { name: 'Hires', value: _.sumBy(fallData, 'hiresCount') },
                                { name: 'Distributions', value: _.sumBy(fallData, 'distributionsCount') }
                              ].filter(item => item.value > 0);
                            })()}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={60}
                            innerRadius={20}
                          >
                            {[0, 1, 2].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-orange-700 mt-2">
                      Post-harvest period with mixed transaction types
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Analysis Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Pattern Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-800 text-lg mb-3">Agricultural Calendar Influence</h3>
                    <div className="space-y-2 text-blue-700 text-sm">
                      <p><strong>Winter (Dec-Feb):</strong> Peak hiring activity as plantation owners secured labor for the coming agricultural year. Annual contracts typically began in January.</p>
                      <p><strong>Spring (Mar-May):</strong> Estate distributions peaked as winter deaths resulted in property settlements. Planting season adjustments also occurred.</p>
                      <p><strong>Summer (Jun-Aug):</strong> Strategic sales increased as planters prepared for harvest labor demands. Higher transaction values reflected premium pricing.</p>
                      <p><strong>Fall (Sep-Nov):</strong> Lower overall activity as harvest work took precedence over market transactions.</p>
                    </div>
                  </div>
                  
                  <div className="bg-amber-50 p-4 rounded-lg">
                    <h3 className="font-medium text-amber-800 text-lg mb-3">Economic and Legal Factors</h3>
                    <div className="space-y-2 text-amber-700 text-sm">
                      <p><strong>Quarterly Settlements:</strong> Many transactions aligned with traditional quarter days when financial obligations were settled.</p>
                      <p><strong>Tax Considerations:</strong> Year-end sales often reflected tax planning and annual financial adjustments.</p>
                      <p><strong>Credit Cycles:</strong> Hiring transactions peaked when annual labor contracts renewed, reflecting credit and cash flow patterns.</p>
                      <p><strong>Legal Calendar:</strong> Court sessions and estate settlements influenced the timing of property transfers and distributions.</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 bg-indigo-50 p-4 rounded-lg">
                  <h3 className="font-medium text-indigo-800 text-lg mb-2">Historical Significance</h3>
                  <p className="text-indigo-700 text-sm">
                    The monthly transaction patterns reveal how deeply the commodification of enslaved persons was embedded 
                    in the broader economic rhythms of antebellum Georgia. These patterns were not random but followed 
                    predictable cycles tied to agricultural seasons, financial calendars, and legal frameworks. Understanding 
                    these temporal patterns helps illuminate how the slavery system operated as an integral part of the 
                    region's economic infrastructure, affecting the lives of thousands of enslaved individuals whose 
                    movements and labor were planned according to these cyclical demands.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
{/* Seasonal View */}
        {activeView === 'seasonal' && (
          <div className="grid grid-cols-1 gap-6">
            {/* Seasonal Transaction Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Seasonal Distribution of Transactions</CardTitle>
                <p className="text-sm text-gray-500">Aggregated patterns across multiple years showing seasonal variations</p>
              </CardHeader>
              <CardContent className="h-[450px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={(() => {
                      // Create seasonal aggregation from monthly data
                      const seasonalData = _.chain(dashboardData.transactionsByMonth)
                        .groupBy(record => {
                          if ([12, 1, 2].includes(record.month)) return 'Winter';
                          if ([3, 4, 5].includes(record.month)) return 'Spring';
                          if ([6, 7, 8].includes(record.month)) return 'Summer';
                          if ([9, 10, 11].includes(record.month)) return 'Fall';
                          return 'Unknown';
                        })
                        .map((records, season) => ({
                          season,
                          totalTransactions: _.sumBy(records, 'transactions'),
                          salesCount: _.sumBy(records, 'salesCount'),
                          hiresCount: _.sumBy(records, 'hiresCount'),
                          distributionsCount: _.sumBy(records, 'distributionsCount'),
                          totalValue: _.sumBy(records, 'totalValue'),
                          avgValue: _.meanBy(records, 'totalValue')
                        }))
                        .filter(item => item.season !== 'Unknown')
                        .sortBy(item => ['Winter', 'Spring', 'Summer', 'Fall'].indexOf(item.season))
                        .value();
                      
                      return seasonalData;
                    })()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="season" />
                    <YAxis label={{ value: 'Number of Transactions', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value) => value.toLocaleString()} />
                    <Legend />
                    <Bar 
                      dataKey="salesCount" 
                      name="Sales" 
                      stackId="a"
                      fill="#10b981" 
                    />
                    <Bar 
                      dataKey="hiresCount" 
                      name="Hires" 
                      stackId="a"
                      fill="#f59e0b" 
                    />
                    <Bar 
                      dataKey="distributionsCount" 
                      name="Distributions" 
                      stackId="a"
                      fill="#ef4444" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Seasonal Value Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Seasonal Value Analysis</CardTitle>
                <p className="text-sm text-gray-500">Average transaction values and total value by season</p>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={(() => {
                      const seasonalData = _.chain(dashboardData.transactionsByMonth)
                        .groupBy(record => {
                          if ([12, 1, 2].includes(record.month)) return 'Winter';
                          if ([3, 4, 5].includes(record.month)) return 'Spring';
                          if ([6, 7, 8].includes(record.month)) return 'Summer';
                          if ([9, 10, 11].includes(record.month)) return 'Fall';
                          return 'Unknown';
                        })
                        .map((records, season) => ({
                          season,
                          avgSeasonalValue: _.meanBy(records, 'totalValue'),
                          totalValue: _.sumBy(records, 'totalValue'),
                          avgPerTransaction: _.sumBy(records, 'totalValue') / _.sumBy(records, 'transactions')
                        }))
                        .filter(item => item.season !== 'Unknown')
                        .sortBy(item => ['Winter', 'Spring', 'Summer', 'Fall'].indexOf(item.season))
                        .value();
                      
                      return seasonalData;
                    })()}
                    margin={{ top: 20, right: 50, left: 50, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="season" />
                    <YAxis yAxisId="left" orientation="left" label={{ value: 'Total Value ($)', angle: -90, position: 'insideLeft', offset: -10 }} />
                    <YAxis yAxisId="right" orientation="right" label={{ value: 'Avg. Per Transaction ($)', angle: 90, position: 'insideRight' }} />
                    <Tooltip 
                      formatter={(value, name) => [
                        `$${Math.round(value).toLocaleString()}`,
                        name
                      ]}
                    />
                    <Legend />
                    <Bar 
                      yAxisId="left" 
                      dataKey="totalValue" 
                      name="Total Seasonal Value ($)" 
                      fill="#3b82f6" 
                    />
                    <Bar 
                      yAxisId="right" 
                      dataKey="avgPerTransaction" 
                      name="Average Per Transaction ($)" 
                      fill="#8b5cf6" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Detailed Seasonal Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Seasonal Transaction Patterns</CardTitle>
                <p className="text-sm text-gray-500">Detailed breakdown of transaction types across seasons</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  {/* Winter Analysis */}
                  <div className="bg-blue-50 rounded-lg p-4 shadow-sm">
                    <h3 className="text-blue-800 font-medium text-lg mb-3 text-center">
                      ❄️ Winter<br/><span className="text-sm">(Dec-Feb)</span>
                    </h3>
                    <div className="relative h-48 mb-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={(() => {
                              const winterData = _.chain(dashboardData.transactionsByMonth)
                                .filter(record => [12, 1, 2].includes(record.month))
                                .value();
                              return [
                                { name: 'Sales', value: _.sumBy(winterData, 'salesCount'), color: '#10b981' },
                                { name: 'Hires', value: _.sumBy(winterData, 'hiresCount'), color: '#f59e0b' },
                                { name: 'Distributions', value: _.sumBy(winterData, 'distributionsCount'), color: '#ef4444' }
                              ].filter(item => item.value > 0);
                            })()}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={70}
                            innerRadius={25}
                            labelLine={false}
                            label={({ percent }) => percent > 10 ? `${(percent).toFixed(0)}%` : ''}
                          >
                            {[0, 1, 2].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2 text-blue-700 text-xs">
                      <p><strong>Peak Hiring Season:</strong> Annual labor contracts typically began in January</p>
                      <p><strong>Financial Planning:</strong> Year-end settlements and tax considerations</p>
                      <p><strong>Weather Impact:</strong> Indoor work and planning for spring planting</p>
                    </div>
                  </div>
                  
                  {/* Spring Analysis */}
                  <div className="bg-green-50 rounded-lg p-4 shadow-sm">
                    <h3 className="text-green-800 font-medium text-lg mb-3 text-center">
                      🌱 Spring<br/><span className="text-sm">(Mar-May)</span>
                    </h3>
                    <div className="relative h-48 mb-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={(() => {
                              const springData = _.chain(dashboardData.transactionsByMonth)
                                .filter(record => [3, 4, 5].includes(record.month))
                                .value();
                              return [
                                { name: 'Sales', value: _.sumBy(springData, 'salesCount'), color: '#10b981' },
                                { name: 'Hires', value: _.sumBy(springData, 'hiresCount'), color: '#f59e0b' },
                                { name: 'Distributions', value: _.sumBy(springData, 'distributionsCount'), color: '#ef4444' }
                              ].filter(item => item.value > 0);
                            })()}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={70}
                            innerRadius={25}
                            labelLine={false}
                            label={({ percent }) => percent > 10 ? `${(percent).toFixed(0)}%` : ''}
                          >
                            {[0, 1, 2].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2 text-green-700 text-xs">
                      <p><strong>Estate Settlements:</strong> Peak distribution activity following winter deaths</p>
                      <p><strong>Planting Season:</strong> Labor adjustments for agricultural needs</p>
                      <p><strong>Legal Activity:</strong> Court sessions and property transfers</p>
                    </div>
                  </div>
                  
                  {/* Summer Analysis */}
                  <div className="bg-yellow-50 rounded-lg p-4 shadow-sm">
                    <h3 className="text-yellow-800 font-medium text-lg mb-3 text-center">
                      ☀️ Summer<br/><span className="text-sm">(Jun-Aug)</span>
                    </h3>
                    <div className="relative h-48 mb-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={(() => {
                              const summerData = _.chain(dashboardData.transactionsByMonth)
                                .filter(record => [6, 7, 8].includes(record.month))
                                .value();
                              return [
                                { name: 'Sales', value: _.sumBy(summerData, 'salesCount'), color: '#10b981' },
                                { name: 'Hires', value: _.sumBy(summerData, 'hiresCount'), color: '#f59e0b' },
                                { name: 'Distributions', value: _.sumBy(summerData, 'distributionsCount'), color: '#ef4444' }
                              ].filter(item => item.value > 0);
                            })()}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={70}
                            innerRadius={25}
                            labelLine={false}
                            label={({ percent }) => percent > 10 ? `${(percent).toFixed(0)}%` : ''}
                          >
                            {[0, 1, 2].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2 text-yellow-700 text-xs">
                      <p><strong>Pre-Harvest Sales:</strong> Strategic acquisitions for harvest labor</p>
                      <p><strong>Premium Pricing:</strong> Higher values as demand increased</p>
                      <p><strong>Plantation Preparation:</strong> Positioning for peak agricultural season</p>
                    </div>
                  </div>
                  
                  {/* Fall Analysis */}
                  <div className="bg-orange-50 rounded-lg p-4 shadow-sm">
                    <h3 className="text-orange-800 font-medium text-lg mb-3 text-center">
                      🍂 Fall<br/><span className="text-sm">(Sep-Nov)</span>
                    </h3>
                    <div className="relative h-48 mb-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={(() => {
                              const fallData = _.chain(dashboardData.transactionsByMonth)
                                .filter(record => [9, 10, 11].includes(record.month))
                                .value();
                              return [
                                { name: 'Sales', value: _.sumBy(fallData, 'salesCount'), color: '#10b981' },
                                { name: 'Hires', value: _.sumBy(fallData, 'hiresCount'), color: '#f59e0b' },
                                { name: 'Distributions', value: _.sumBy(fallData, 'distributionsCount'), color: '#ef4444' }
                              ].filter(item => item.value > 0);
                            })()}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={70}
                            innerRadius={25}
                            labelLine={false}
                            label={({ percent }) => percent > 10 ? `${(percent).toFixed(0)}%` : ''}
                          >
                            {[0, 1, 2].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2 text-orange-700 text-xs">
                      <p><strong>Harvest Focus:</strong> Lower transaction volume during peak work period</p>
                      <p><strong>Post-Harvest Adjustments:</strong> Mixed transaction types</p>
                      <p><strong>Preparation for Winter:</strong> Planning for next year's contracts</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seasonal Statistics Table */}
            <Card>
              <CardHeader>
                <CardTitle>Seasonal Statistics Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Season</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Transactions</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hires</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distributions</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Per Transaction</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(() => {
                        const seasonalStats = _.chain(dashboardData.transactionsByMonth)
                          .groupBy(record => {
                            if ([12, 1, 2].includes(record.month)) return 'Winter';
                            if ([3, 4, 5].includes(record.month)) return 'Spring';
                            if ([6, 7, 8].includes(record.month)) return 'Summer';
                            if ([9, 10, 11].includes(record.month)) return 'Fall';
                            return 'Unknown';
                          })
                          .map((records, season) => ({
                            season,
                            totalTransactions: _.sumBy(records, 'transactions'),
                            salesCount: _.sumBy(records, 'salesCount'),
                            hiresCount: _.sumBy(records, 'hiresCount'),
                            distributionsCount: _.sumBy(records, 'distributionsCount'),
                            totalValue: _.sumBy(records, 'totalValue'),
                            avgPerTransaction: _.sumBy(records, 'totalValue') / _.sumBy(records, 'transactions')
                          }))
                          .filter(item => item.season !== 'Unknown')
                          .sortBy(item => ['Winter', 'Spring', 'Summer', 'Fall'].indexOf(item.season))
                          .value();
                        
                        return seasonalStats;
                      })().map((season, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap font-medium">{season.season}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{season.totalTransactions.toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{season.salesCount.toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{season.hiresCount.toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{season.distributionsCount.toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap">${Math.round(season.totalValue).toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap">${Math.round(season.avgPerTransaction || 0).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Seasonal Economic Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Seasonal Economic Patterns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-indigo-50 p-5 rounded-lg shadow-sm">
                    <h3 className="font-medium text-indigo-900 text-lg mb-3">Agricultural Calendar Integration</h3>
                    <p className="text-indigo-800 mb-4">
                      The seasonal patterns reveal how transactions of enslaved persons were deeply integrated 
                      with Georgia's agricultural cycles. Each season brought distinct economic pressures and 
                      opportunities that shaped the timing and nature of these human transactions.
                    </p>
                    
                    <div className="space-y-3">
                      <div className="bg-white bg-opacity-50 p-3 rounded">
                        <h4 className="font-medium text-indigo-900 mb-1">Winter Planning</h4>
                        <p className="text-indigo-800 text-sm">
                          Peak hiring activity as plantation owners secured labor for the coming year. 
                          Annual contracts and financial planning dominated this period.
                        </p>
                      </div>
                      <div className="bg-white bg-opacity-50 p-3 rounded">
                        <h4 className="font-medium text-indigo-900 mb-1">Spring Adjustments</h4>
                        <p className="text-indigo-800 text-sm">
                          Estate distributions and legal settlements peaked as communities dealt with 
                          winter deaths and prepared for planting season.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-emerald-50 p-5 rounded-lg shadow-sm">
                    <h3 className="font-medium text-emerald-900 text-lg mb-3">Market Dynamics</h3>
                    <p className="text-emerald-800 mb-4">
                      Seasonal value fluctuations demonstrate how market forces and agricultural demands 
                      influenced the pricing and timing of transactions involving enslaved persons.
                    </p>
                    
                    <div className="space-y-3">
                      <div className="bg-white bg-opacity-50 p-3 rounded">
                        <h4 className="font-medium text-emerald-900 mb-1">Summer Premiums</h4>
                        <p className="text-emerald-800 text-sm">
                          Higher transaction values in summer reflected premium pricing as planters 
                          competed for labor before harvest season.
                        </p>
                      </div>
                      <div className="bg-white bg-opacity-50 p-3 rounded">
                        <h4 className="font-medium text-emerald-900 mb-1">Fall Consolidation</h4>
                        <p className="text-emerald-800 text-sm">
                          Lower activity during harvest reflected the focus on agricultural work, 
                          with transactions often delayed until post-harvest.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 bg-gray-100 p-5 rounded-lg shadow-sm">
                  <h3 className="font-medium text-gray-800 text-lg mb-3">Historical Context and Human Impact</h3>
                  <p className="text-gray-700 text-sm">
                    These seasonal patterns represent more than economic data—they reveal the systematic nature 
                    of slavery's integration into Southern society. The predictable timing of transactions shows 
                    how enslaved persons' lives were planned and disrupted according to agricultural and financial 
                    calendars. Families were separated, individuals were relocated, and life trajectories were 
                    altered based on seasonal economic demands. Understanding these patterns helps illuminate both 
                    the economic structure of slavery and its profound human costs, as enslaved persons experienced 
                    heightened uncertainty and family disruption during peak transaction seasons.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

{/* Locations View */}
        {activeView === 'locations' && (
          <div className="grid grid-cols-1 gap-6">
            {/* Top Locations Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution of Transactions</CardTitle>
                <p className="text-sm text-gray-500">Transaction activity across different locations in Georgia</p>
              </CardHeader>
              <CardContent className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={_.orderBy(dashboardData.locationStats, 'transactions', 'desc').slice(0, 15)}
                    margin={{ top: 20, right: 80, left: 60, bottom: 35 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      height={45}
                      interval={0}
                      fontSize={12}
                    />
                    <YAxis 
                      yAxisId="left" 
                      orientation="left" 
                      label={{ value: 'Transactions', angle: -90, position: 'insideLeft' }}
                      fontSize={10}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right" 
                      label={{ value: 'Total Value ($)', angle: 90, position: 'insideRight', offset: 0 }}
                      fontSize={10}
                    />
                    <Tooltip 
                      formatter={(value, name) => [
                        name.includes('Value') ? `$${value.toLocaleString()}` : value.toLocaleString(),
                        name
                      ]}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar 
                      yAxisId="left" 
                      dataKey="transactions" 
                      name="Number of Transactions" 
                      fill="#3b82f6" 
                    />
                    <Bar 
                      yAxisId="right" 
                      dataKey="totalValue" 
                      name="Total Value ($)" 
                      fill="#10b981" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Location Activity Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Locations by Transaction Volume */}
              <Card>
                <CardHeader>
                  <CardTitle>Most Active Locations</CardTitle>
                  <p className="text-sm text-gray-500">Locations with highest transaction volumes</p>
                </CardHeader>
                <CardContent className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={_.orderBy(dashboardData.locationStats, 'transactions', 'desc')
                          .slice(0, 8)
                          .map(location => ({
                            name: location.name.length > 28 ? location.name.substring(0, 28) + '...' : location.name,
                            value: location.transactions,
                            fullName: location.name
                          }))}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        innerRadius={40}
                        labelLine={false}
                        label={({ name, percent }) => percent > 5 ? `${name}\n${(percent * 100).toFixed(1)}%` : ''}
                      >
                        {dashboardData.locationStats.slice(0, 8).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => value.toLocaleString()}
                        labelFormatter={(label, payload) => {
                          const item = payload && payload[0] && payload[0].payload;
                          return item ? item.fullName : label;
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Average Transaction Value by Location */}
              <Card>
                <CardHeader>
                  <CardTitle>Average Transaction Values</CardTitle>
                  <p className="text-sm text-gray-500">Locations with highest average transaction values</p>
                </CardHeader>
                <CardContent className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={_.chain(dashboardData.locationStats)
                        .filter(location => location.transactions >= 5) // Only locations with significant activity
                        .map(location => ({
                          name: location.name.length > 15 ? location.name.substring(0, 13) + '...' : location.name,
                          avgValue: location.transactions > 0 ? Math.round(location.totalValue / location.transactions) : 0,
                          transactions: location.transactions,
                          fullName: location.name
                        }))
                        .orderBy('avgValue', 'desc')
                        .slice(0, 10)
                        .value()}
                      margin={{ top: 20, right: 50, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-35} 
                        textAnchor="end"
                        height={70}
                        interval={0}
                        fontSize={10}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => `$${value.toLocaleString()}`}
                        labelFormatter={(label, payload) => {
                          const item = payload && payload[0] && payload[0].payload;
                          return item ? item.fullName : label;
                        }}
                      />
                      <Legend />
                      <Bar dataKey="avgValue" name="Average Value ($)" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Location Network Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Location Network Analysis
                  <div className="relative group">
                    <div className="h-4 w-4 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold cursor-help">
                      i
                    </div>
                    <div className="absolute z-20 invisible group-hover:visible bg-gray-900 text-white text-xs rounded py-2 px-3 -top-2 left-6 min-w-max shadow-lg whitespace-nowrap">
                      <div className="text-center text-base mb-2">
                        <strong>Network Density Explained:</strong><br/>
                        <span className="text-xs">FORMULA: (UNIQUE ENSLAVED + UNIQUE ENSLAVERS) ÷ TRANSACTIONS</span>
                      </div>
                      • <strong>High density (&gt;1.5):</strong> Hub location with diverse participants<br/>
                      • <strong>Medium density (1.0-1.5):</strong> Mixed trading relationships<br/>
                      • <strong>Low density (&lt;1.0):</strong> Concentrated, repeat traders
                    </div>
                  </div>
                </CardTitle>
                <p className="text-sm text-gray-500">Understanding the interconnected nature of transaction locations</p>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={_.chain(dashboardData.locationStats)
                      .filter(location => location.transactions >= 3)
                      .map(location => ({
                        name: location.name.length > 28 ? location.name.substring(0, 28) + '...' : location.name,
                        uniqueEnslaved: location.uniqueEnslaved,
                        uniqueEnslavers: location.uniqueEnslavers,
                        transactions: location.transactions,
                        density: location.transactions > 0 ? (location.uniqueEnslaved + location.uniqueEnslavers) / location.transactions : 0,
                        fullName: location.name
                      }))
                      .orderBy('transactions', 'desc')
                      .slice(0, 12)
                      .value()}
                    margin={{ top: 20, right: 50, left: 20, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      height={40}
                      interval={0}
                      fontSize={12}
                    />
                    <YAxis yAxisId="left" orientation="left" label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" label={{ value: 'Network Density', angle: 90, position: 'insideRight' }} />
                    <Tooltip 
                      formatter={(value, name) => [
                        name.includes('density') ? value.toFixed(2) : value.toLocaleString(),
                        name
                      ]}
                      labelFormatter={(label, payload) => {
                        const item = payload && payload[0] && payload[0].payload;
                        return item ? item.fullName : label;
                      }}
                    />
                    <Legend />
                    <Bar 
                      yAxisId="left" 
                      dataKey="uniqueEnslaved" 
                      name="Unique Enslaved Persons" 
                      fill="#8b5cf6" 
                    />
                    <Bar 
                      yAxisId="left" 
                      dataKey="uniqueEnslavers" 
                      name="Unique Enslavers" 
                      fill="#ec4899" 
                    />
                    <Bar 
                      yAxisId="right" 
                      dataKey="density" 
                      name="Network Density" 
                      fill="#06b6d4" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Detailed Location Statistics Table */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Location Statistics</CardTitle>
                <p className="text-sm text-gray-500">Comprehensive data for all transaction locations</p>
              </CardHeader>
              <CardContent className="max-h-[600px] overflow-y-auto">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transactions</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Value</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unique Enslaved</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unique Enslavers</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity Level</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {_.orderBy(dashboardData.locationStats, ['transactions'], ['desc'])
                        .map((location, index) => {
                          const avgValue = location.transactions > 0 ? location.totalValue / location.transactions : 0;
                          const activityLevel = location.transactions >= 50 ? 'High' : 
                                              location.transactions >= 20 ? 'Medium' : 
                                              location.transactions >= 5 ? 'Low' : 'Minimal';
                          const activityColor = activityLevel === 'High' ? 'text-green-600 bg-green-100' :
                                               activityLevel === 'Medium' ? 'text-yellow-600 bg-yellow-100' :
                                               activityLevel === 'Low' ? 'text-orange-600 bg-orange-100' :
                                               'text-gray-600 bg-gray-100';
                          
                          return (
                            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {index + 1}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap font-medium text-sm">
                                <div className="max-w-xs truncate" title={location.name}>
                                  {location.name}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {location.transactions.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                ${Math.round(location.totalValue).toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                ${Math.round(avgValue).toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {location.uniqueEnslaved.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {location.uniqueEnslavers.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${activityColor}`}>
                                  {activityLevel}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Location-based Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Geographic Analysis Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-5 rounded-lg shadow-sm">
                    <h3 className="font-medium text-blue-800 text-lg mb-3">Urban vs. Rural Patterns</h3>
                    <p className="text-blue-700 text-sm mb-3">
                      The geographic distribution reveals distinct patterns between urban centers and rural areas 
                      in Troy. Urban locations typically show higher transaction frequency but varied value ranges, 
                      reflecting diverse economic activities from domestic service to skilled trades.
                    </p>
                    <div className="bg-white bg-opacity-60 p-3 rounded text-xs">
                      <strong>Key Observations:</strong>
                      <ul className="list-disc pl-4 mt-1 space-y-1">
                        <li>Central Troy locations show consistent transaction activity</li>
                        <li>Rural plantation areas have fewer but higher-value transactions</li>
                        <li>Transportation routes (roads, rivers) correlate with activity levels</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-5 rounded-lg shadow-sm">
                    <h3 className="font-medium text-green-800 text-lg mb-3">Economic Networks</h3>
                    <p className="text-green-700 text-sm mb-3">
                      Location data reveals interconnected economic networks where certain areas served as 
                      transaction hubs. These hubs connected rural producers with urban markets and facilitated 
                      the movement of enslaved persons across the region.
                    </p>
                    <div className="bg-white bg-opacity-60 p-3 rounded text-xs">
                      <strong>Network Characteristics:</strong>
                      <ul className="list-disc pl-4 mt-1 space-y-1">
                        <li>Some locations served multiple enslavers and markets</li>
                        <li>High-density areas indicate established trading relationships</li>
                        <li>Geographic clusters suggest community-based transaction patterns</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 bg-amber-50 p-5 rounded-lg shadow-sm">
                  <h3 className="font-medium text-amber-800 text-lg mb-3">Historical Geographic Context</h3>
                  <p className="text-amber-700 text-sm mb-3">
                    The spatial distribution of transactions reflects the broader geographic and economic development 
                    of Georgia State during the antebellum period. Transportation infrastructure, agricultural suitability, 
                    and settlement patterns all influenced where and how transactions occurred.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white bg-opacity-60 p-3 rounded">
                      <h4 className="font-medium text-amber-800 mb-2">Transportation Influence</h4>
                      <p className="text-amber-700 text-xs">
                        Locations near major roads and waterways show higher transaction volumes, reflecting 
                        the importance of transportation in facilitating the movement of enslaved persons 
                        and connecting rural areas to regional markets.
                      </p>
                    </div>
                    <div className="bg-white bg-opacity-60 p-3 rounded">
                      <h4 className="font-medium text-amber-800 mb-2">Settlement Patterns</h4>
                      <p className="text-amber-700 text-xs">
                        The concentration of transactions in certain areas reflects established communities 
                        and economic relationships. These patterns show how slavery was embedded in the 
                        geographic and social fabric of the region.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 bg-gray-100 p-5 rounded-lg shadow-sm">
                  <h3 className="font-medium text-gray-800 text-lg mb-3">Human Geography of Slavery</h3>
                  <p className="text-gray-700 text-sm">
                    Beyond economic data, these location patterns represent the human geography of slavery - 
                    the places where enslaved persons lived, worked, and were separated from families. Each 
                    location represents communities where enslaved individuals built relationships, developed 
                    skills, and maintained cultural practices despite the constraints of bondage. Understanding 
                    the geographic distribution helps illuminate how slavery shaped the physical and social 
                    landscape of Georgia State, creating networks of control and resistance that extended across 
                    the entire region.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

{/* People View */}
        {activeView === 'people' && (
          <div className="grid grid-cols-1 gap-6">
            {/* Overview Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold opacity-90">Total Enslaved Persons</h3>
                  <p className="text-3xl font-bold mt-2">
                    {dashboardData.totalUniqueEnslaved ? 
                      dashboardData.totalUniqueEnslaved.toLocaleString() : 
                      'Loading...'}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold opacity-90">Total Enslavers</h3>
                  <p className="text-3xl font-bold mt-2">
                    {dashboardData.totalUniqueEnslavers ? 
                      dashboardData.totalUniqueEnslavers.toLocaleString() : 
                      'Loading...'}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold opacity-90">Most Transactions</h3>
                  <p className="text-xl font-bold mt-2">
                    {dashboardData.allEnslavedFrequency && dashboardData.allEnslavedFrequency.length > 0 ? 
                      _.maxBy(dashboardData.allEnslavedFrequency.filter(p => 
                                                                        p.name && 
                                                                        p.name.toLowerCase() !== 'unnamed' && 
                                                                        p.name.toLowerCase() !== 'unknown' &&
                                                                        p.name.trim() !== ''
                                                                      ), 
                                                                      'transactions'
                                                                    )?.name || 'N/A' : 'Loading...'}
                  </p>
                  <p className="text-sm opacity-75">
                    {dashboardData.allEnslavedFrequency && dashboardData.allEnslavedFrequency.length > 0 ? 
                     `${_.maxBy(dashboardData.allEnslavedFrequency.filter(p => 
                                                                          p.name && 
                                                                          p.name.toLowerCase() !== 'unnamed' && 
                                                                          p.name.toLowerCase() !== 'unknown' &&
                                                                          p.name.trim() !== ''
                                                                        ), 'transactions')?.transactions || 0} transactions` : ''}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold opacity-90">Highest Value</h3>
                  <p className="text-xl font-bold mt-2">
                    {dashboardData.allEnslavedFrequency && dashboardData.allEnslavedFrequency.length > 0 ? 
                      _.maxBy(dashboardData.allEnslavedFrequency, 'totalValue')?.name || 'N/A' : 
                      'Loading...'}
                  </p>
                  <p className="text-sm opacity-75">
                    {dashboardData.allEnslavedFrequency && dashboardData.allEnslavedFrequency.length > 0 ? 
                      `$${_.maxBy(dashboardData.allEnslavedFrequency, 'totalValue')?.totalValue?.toLocaleString() || 0}` : ''}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* People Analysis Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Enslaved Persons by Transaction Volume */}
              <Card>
                <CardHeader>
                  <CardTitle>Most Frequently Recorded Enslaved Persons</CardTitle>
                  <p className="text-sm text-gray-500">Individuals appearing in multiple transaction records</p>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={dashboardData.enslavedStats.slice(0, 10)}
                      margin={{ top: 20, right: 50, left: 20, bottom: 30 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-35} 
                        textAnchor="end"
                        height={80}
                        interval={0}
                        fontSize={10}
                      />
                      <YAxis yAxisId="left" orientation="left" label={{ value: 'Transactions', angle: -90, position: 'insideLeft' }} />
                      <YAxis yAxisId="right" orientation="right" label={{ value: 'Total Value ($)', angle: 90, position: 'insideRight', offset: -10 }} />
                      <Tooltip 
                        formatter={(value, name) => [
                          name.includes('Value') ? `$${value.toLocaleString()}` : value.toLocaleString(),
                          name
                        ]}
                      />
                      <Legend />
                      <Bar 
                        yAxisId="left" 
                        dataKey="transactions" 
                        name="Number of Transactions" 
                        fill="#8b5cf6" 
                      />
                      <Bar 
                        yAxisId="right" 
                        dataKey="totalValue" 
                        name="Total Value ($)" 
                        fill="#10b981" 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top Enslavers by Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Most Active Enslavers</CardTitle>
                  <p className="text-sm text-gray-500">Individuals with highest transaction volumes</p>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={dashboardData.enslaverStats.slice(0, 10)}
                      margin={{ top: 20, right: 50, left: 20, bottom: 30 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-35} 
                        textAnchor="end"
                        height={80}
                        interval={0}
                        fontSize={10}
                      />
                      <YAxis yAxisId="left" orientation="left" label={{ value: 'Transactions', angle: -90, position: 'insideLeft' }} />
                      <YAxis yAxisId="right" orientation="right" label={{ value: 'Total Value ($)', angle: 90, position: 'insideRight', offset: -10 }} />
                      <Tooltip 
                        formatter={(value, name) => [
                          name.includes('Value') ? `$${value.toLocaleString()}` : value.toLocaleString(),
                          name
                        ]}
                      />
                      <Legend />
                      <Bar 
                        yAxisId="left" 
                        dataKey="transactions" 
                        name="Number of Transactions" 
                        fill="#ef4444" 
                      />
                      <Bar 
                        yAxisId="right" 
                        dataKey="totalValue" 
                        name="Total Value ($)" 
                        fill="#f59e0b" 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Transaction Frequency Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction Activity Level Analysis</CardTitle>
                <p className="text-sm text-gray-500">Distribution of individuals by transaction activity levels</p>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={(() => {
                      // Get all people (enslaved + enslavers) from the full dataset, not just top 10
                      const allEnslavedFrequency = dashboardData.allEnslavedFrequency || [];
                      const allEnslaverFrequency = dashboardData.allEnslaverFrequency || [];
                      
                      const frequencyData = [
                        {
                          category: 'Single Transaction',
                          enslaved: allEnslavedFrequency.filter(p => p.transactions === 1).length,
                          enslavers: allEnslaverFrequency.filter(p => p.transactions === 1).length
                        },
                        {
                          category: 'Low Activity (2-5)',
                          enslaved: allEnslavedFrequency.filter(p => p.transactions >= 2 && p.transactions <= 5).length,
                          enslavers: allEnslaverFrequency.filter(p => p.transactions >= 2 && p.transactions <= 5).length
                        },
                        {
                          category: 'High Activity (6+)',
                          enslaved: allEnslavedFrequency.filter(p => p.transactions >= 6).length,
                          enslavers: allEnslaverFrequency.filter(p => p.transactions >= 6).length
                        }
                      ];
                      
                      return frequencyData;
                    })()}
                    margin={{ top: 30, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="category" 
                      height={30}
                      fontSize={11}
                    />
                    <YAxis label={{ value: 'No. of Individuals', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ paddingTop: '0px' }} />
                    <Bar 
                      dataKey="enslaved" 
                      name="Enslaved Persons" 
                      stackId="a"
                      fill="#8b5cf6" 
                    />
                    <Bar 
                      dataKey="enslavers" 
                      name="Enslavers" 
                      stackId="a"
                      fill="#ef4444" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Detailed People Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Enslaved Persons Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Enslaved Persons Records</CardTitle>
                  <p className="text-sm text-gray-500">Top individuals by transaction frequency</p>
                </CardHeader>
                <CardContent>
                  <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f9fafb', zIndex: 10 }}>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ backgroundColor: '#f9fafb' }}>Rank</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ backgroundColor: '#f9fafb' }}>Name</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ backgroundColor: '#f9fafb' }}>Transactions</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ backgroundColor: '#f9fafb' }}>Total Value</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ backgroundColor: '#f9fafb' }}>Avg. Value</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ backgroundColor: '#f9fafb' }}>Roles</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {/*{dashboardData.enslavedStats.filter(p => 
                                                            p.name && 
                                                            p.name.toLowerCase() !== 'unnamed' && 
                                                            p.name.toLowerCase() !== 'unknown' &&
                                                            p.name.trim() !== ''
                                                          )*/}
                        {dashboardData.enslavedStats.filter(p => 
                                                            p.name && 
                                                            p.name.toLowerCase() !== 'unnamed' && 
                                                            p.name.toLowerCase() !== 'unknown' &&
                                                            p.name.trim() !== ''
                                                          ).slice(0, 20).map((person, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {index + 1}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="max-w-32 truncate" title={person.name}>
                                {person.name}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                              {person.transactions}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                              ${person.totalValue.toLocaleString()}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                              ${person.transactions > 0 ? Math.round(person.totalValue / person.transactions).toLocaleString() : 0}
                            </td>
                            <td className="px-4 py-4 text-sm">
                              <div className="max-w-200 whitespace-nowrap overflow-hidden text-ellipsis" title={person.roles.join(', ')}>
                                {person.roles.join(', ')}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Enslavers Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Enslavers Records</CardTitle>
                  <p className="text-sm text-gray-500">Top individuals by transaction frequency</p>
                </CardHeader>
                <CardContent>
                  <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f9fafb', zIndex: 10 }}>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ backgroundColor: '#f9fafb' }}>Rank</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ backgroundColor: '#f9fafb' }}>Name</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ backgroundColor: '#f9fafb' }}>Transactions</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ backgroundColor: '#f9fafb' }}>Total Value</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ backgroundColor: '#f9fafb' }}>Avg. Value</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ backgroundColor: '#f9fafb' }}>Locations</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {dashboardData.enslaverStats.slice(0, 20).map((enslaver, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {index + 1}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="max-w-32 truncate" title={enslaver.name}>
                                {enslaver.name}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                              {enslaver.transactions}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                              ${enslaver.totalValue.toLocaleString()}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                              ${enslaver.transactions > 0 ? Math.round(enslaver.totalValue / enslaver.transactions).toLocaleString() : 0}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                              {enslaver.locations.length}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>



            {/* People Analysis Insights */}
            <Card>
              <CardHeader>
                <CardTitle>People Analysis Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-purple-50 p-5 rounded-lg shadow-sm">
                    <h3 className="font-medium text-purple-800 text-lg mb-3">Enslaved Persons in Records</h3>
                    <p className="text-purple-700 text-sm mb-3">
                      The frequency of individuals appearing in multiple transaction records reveals patterns 
                      of repeated sale, hire, and transfer. Some enslaved persons appear in numerous transactions, 
                      indicating either high demand for their skills or unfortunate circumstances leading to 
                      repeated sales.
                    </p>
                    <div className="bg-white bg-opacity-60 p-3 rounded text-xs">
                      <strong>Key Patterns:</strong>
                      <ul className="list-disc pl-4 mt-1 space-y-1">
                        <li>Multiple transactions may indicate skilled individuals</li>
                        <li>Repeated sales could reflect financial distress of owners</li>
                        <li>Family groups sometimes appear together in records</li>
                        <li>Some individuals show progression from child to adult in records</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 p-5 rounded-lg shadow-sm">
                    <h3 className="font-medium text-red-800 text-lg mb-3">Enslaver Activity Patterns</h3>
                    <p className="text-red-700 text-sm mb-3">
                      The distribution of enslaver activity shows the concentration of slave ownership and 
                      trading in Georgia State. Some individuals engaged in extensive trading activities, 
                      while others appear in only occasional transactions, often related to estate settlements 
                      or family transfers.
                    </p>
                    <div className="bg-white bg-opacity-60 p-3 rounded text-xs">
                      <strong>Activity Types:</strong>
                      <ul className="list-disc pl-4 mt-1 space-y-1">
                        <li>Professional traders with numerous transactions</li>
                        <li>Plantation owners with occasional sales/purchases</li>
                        <li>Estate executors handling inheritance distributions</li>
                        <li>Urban residents engaging in domestic hiring</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 bg-indigo-50 p-5 rounded-lg shadow-sm">
                  <h3 className="font-medium text-indigo-800 text-lg mb-3">Network Analysis</h3>
                  <p className="text-indigo-700 text-sm mb-3">
                    The transaction frequency data reveals the social and economic networks that facilitated 
                    the slave trade in Georgia State. Highly active individuals often served as intermediaries 
                    or brokers, connecting buyers and sellers across the region.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white bg-opacity-60 p-3 rounded">
                      <h4 className="font-medium text-indigo-800 mb-2">Transaction Hubs</h4>
                      <p className="text-indigo-700 text-xs">
                        Individuals with numerous transactions often served as central nodes in trading 
                        networks, facilitating connections between rural producers and urban markets, 
                        or specializing in particular types of transactions like annual hires.
                      </p>
                    </div>
                    <div className="bg-white bg-opacity-60 p-3 rounded">
                      <h4 className="font-medium text-indigo-800 mb-2">Community Connections</h4>
                      <p className="text-indigo-700 text-xs">
                        The frequency patterns show how slavery created complex webs of relationships 
                        within communities, with some families and individuals repeatedly connected 
                        through transactions involving enslaved persons.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 bg-gray-100 p-5 rounded-lg shadow-sm">
                  <h3 className="font-medium text-gray-800 text-lg mb-3">Human Stories Behind the Data</h3>
                  <p className="text-gray-700 text-sm">
                    Each name in these records represents a real person whose life was affected by the slave trade. 
                    For enslaved persons, multiple transactions often meant family separations, forced relocations, 
                    and disrupted communities. For some, repeated appearances might indicate specialized skills that 
                    made them valuable in the marketplace - a cruel irony where human talent increased vulnerability 
                    to sale. Understanding these individual patterns helps us move beyond aggregate statistics to 
                    recognize the personal experiences of those caught in the slave trade system. The data reveals 
                    not just economic transactions, but human stories of resilience, loss, and survival in the 
                    face of systemic oppression.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}