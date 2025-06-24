import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import {
  BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import Papa from 'papaparse';
import _ from 'lodash';

export function GsuDashboard() {
  // State Management
  const [dashboardData, setDashboardData] = useState({
    transactionsByYear: [],
    countyStats: [],
    sellerStats: [],
    buyerStats: [],
    adminGuardianStats: [],
    totalTransactions: 0,
    totalValue: 0,
    averageValue: 0,
    totalAcreage: 0
  });
  const [activeView, setActiveView] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data Loading and Processing
  useEffect(() => {
    async function loadAndProcessData() {
        try {
          console.log('Loading CSV data...');
          // Use fetch instead of window.fs
          const response = await fetch('/gsurecords.csv');
          const csvText = await response.text();
          
          // Parse CSV
          const parsed = Papa.parse(csvText, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: (results) => {
              console.log('Parse complete:', {
                totalRecords: results.data.length,
                fields: results.meta.fields
              });
            }
          });

        if (!parsed.data || parsed.data.length === 0) {
          throw new Error('No data found in CSV');
        }

        const parsedData = parsed.data;
        console.log('Processing', parsedData.length, 'records');

        // Step 3: Process Data for Different Views

        // Yearly Analysis
        const yearlyData = _.chain(parsedData)
          .groupBy(record => new Date(record.deed_date).getFullYear())
          .map((records, year) => ({
            year: parseInt(year),
            transactions: records.length,
            totalValue: _.sumBy(records, 'buyer_amount') || 0,
            
            totalAcres: _.sumBy(records, 'buyerpurchased_acres') || 0,
            uniqueSellers: _.uniqBy(records, r => `${r.seller_firstname} ${r.seller_lastname}`).length,
            uniqueBuyers: _.uniqBy(records, r => `${r.buyer_firstname} ${r.buyer_lastname}`).length
          }))
          .sortBy('year')
          .value()
          .filter(item => !isNaN(item.year));

        // County Analysis
        const countyStats = _.chain(parsedData)
          .groupBy('deed_county')
          .map((records, county) => ({
            name: county || 'Unknown',
            transactions: records.length,
            value: _.sumBy(records, 'buyer_amount') || 0,
            totalValue: _.sumBy(records, 'buyer_amount') || 0,
            averageValue: _.meanBy(records, 'buyer_amount') || 0,
            totalAcres: _.sumBy(records, 'buyerpurchased_acres') || 0,
            uniqueBuyers: _.uniqBy(records, r => `${r.buyer_firstname} ${r.buyer_lastname}`).length,
            uniqueSellers: _.uniqBy(records, r => `${r.seller_firstname} ${r.seller_lastname}`).length
          }))
          .value()
          .filter(item => item.name !== 'Unknown');

        // Buyer Analysis
        const buyerStats = _.chain(parsedData)
          .groupBy(r => `${r.buyer_firstname} ${r.buyer_lastname}`)
          .map((records, name) => ({
            name,
            transactions: records.length,
            totalValue: _.sumBy(records, 'buyer_amount') || 0,
            totalAcres: _.sumBy(records, 'buyerpurchased_acres') || 0,
            counties: _.uniq(records.map(r => r.deed_county)).length
          }))
          .filter(buyer => buyer.name && buyer.name.trim() !== '')
          .sortBy(r => -r.totalValue)
          .take(10)
          .value();

        // Seller Analysis
        const sellerStats = _.chain(parsedData)
          .groupBy(r => `${r.seller_firstname} ${r.seller_lastname}`)
          .map((records, name) => ({
            name,
            transactions: records.length,
            totalValue: _.sumBy(records, 'buyer_amount') || 0,
            totalAcres: _.sumBy(records, 'buyerpurchased_acres') || 0,
            counties: _.uniq(records.map(r => r.deed_county)).length
          }))
          .filter(seller => seller.name && seller.name.trim() !== '')
          .sortBy(r => -r.totalValue)
          .take(10)
          .value();

        // Administrator/Guardian Analysis
        const adminStats = _.chain(parsedData)
          .filter(r => r.seller_administrator_guardian === 'Yes Guardian' || 
                      r.seller_administrator_guardian === 'Yes Administrator')
          .groupBy(r => `${r.seller_administrator_guardian_firstname} ${r.seller_administrator_guardian_lastname}`)
          .map((records, name) => ({
            name,
            transactions: records.length,
            totalValue: _.sumBy(records, 'buyer_amount') || 0,
            role: records[0].seller_administrator_guardian
          }))
          .filter(admin => admin.name && admin.name.trim() !== '')
          .sortBy(r => -r.transactions)
          .value();

        // Overall Statistics
        const totalTransactions = parsedData.length;
        const totalValue = _.sumBy(parsedData, record => {
            const amount = parseFloat(record.buyer_amount);
            return isNaN(amount) ? 0 : amount;
          }) || 0;
          
          const totalAcreage = _.sumBy(parsedData, record => {
            const acres = parseFloat(record.buyerpurchased_acres);
            return isNaN(acres) ? 0 : acres;
          }) || 0;
          
          const averageValue = totalTransactions > 0 ? totalValue / totalTransactions : 0;

        // Update Dashboard Data
        setDashboardData({
          transactionsByYear: yearlyData,
          countyStats,
          buyerStats,
          sellerStats,
          adminGuardianStats: adminStats,
          totalTransactions,
          totalValue,
          averageValue,
          totalAcreage
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
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

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

  // Data Validation
  if (!dashboardData.transactionsByYear.length) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-gray-600">No data available to display</div>
        </div>
      </div>
    );
  }

  // HERE IS THE MODIFIED RETURN STATEMENT WITH PROPER WRAPPING
  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">GSU Records Dashboard</h1>
        <Link to="/visualization" className="text-blue-600 hover:text-blue-800 flex items-center">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Visualizations
        </Link>
      </div>
      
      <div className="space-y-6 p-6 bg-gray-50 rounded-lg shadow">
        {/* Navigation */}
        <div className="flex gap-2 flex-wrap">
          {['overview', 'counties', 'people', 'timeline'].map((view) => (
            <Button
              key={view}
              onClick={() => setActiveView(view)}
              variant={activeView === view ? "default" : "outline"}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </Button>
          ))}
        </div>

        {/* Summary Stats - Always visible */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* First card - Total Transactions */}
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold opacity-90">Total Transactions</h3>
              <p className="text-3xl font-bold mt-2">
                {dashboardData.totalTransactions.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          {/* Second card - Total Value with hover tooltip */}
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

          {/* Third card - Average Transaction */}
          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold opacity-90">Average Transaction</h3>
              <p className="text-3xl font-bold mt-2">
                ${Math.round(dashboardData.averageValue).toLocaleString()}
              </p>
            </CardContent>
          </Card>

          {/* Fourth card - Total Acreage */}
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold opacity-90">Total Acreage</h3>
              <p className="text-3xl font-bold mt-2">
                {Math.round(dashboardData.totalAcreage).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {activeView === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Transaction Timeline */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Transaction Timeline Overview</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dashboardData.transactionsByYear}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="transactions"
                      name="Transactions"
                      stroke="#3b82f6"
                      fill="#93c5fd"
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="totalValue"
                      name="Total Value ($)"
                      stroke="#10b981"
                      fill="#6ee7b7"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Buyers Overview */}
            {/* Bottom Row - Top Buyers and Additional Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Top Buyers by Value</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboardData.buyerStats.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-15} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="totalValue" name="Total Value ($)" fill="#3b82f6" />
                    <Bar dataKey="transactions" name="Transactions" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* New Card - Transaction Value Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Value Distribution Analysis</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dashboardData.sellerStats.slice(0, 5)}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-15} textAnchor="end" height={60} />
                    <YAxis yAxisId="left" orientation="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="totalValue" name="Total Value ($)" fill="#8b5cf6" />
                    <Bar yAxisId="right" dataKey="totalAcres" name="Total Acres" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}
        
        {activeView === 'counties' && (
          <div className="grid grid-cols-1 gap-6">
            {/* County Transaction Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>County Transaction Analysis</CardTitle>
              </CardHeader>
              <CardContent className="h-[600px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={dashboardData.countyStats}
                    margin={{ top: 20, right: 30, left: 20, bottom: 120 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end"
                      height={80}
                      interval={0}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      wrapperStyle={{ paddingTop: '10px' }}
                    />
                    <Bar yAxisId="left" dataKey="totalValue" name="Total Value ($)" fill="#3b82f6">
                      {dashboardData.countyStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                    <Bar yAxisId="right" dataKey="transactions" name="Number of Transactions" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* County Statistics Table */}
            
          </div>
        )}       

        {activeView === 'people' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Buyer Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Top Buyers Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Buyer Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Transactions
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Value
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Acres
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Counties
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dashboardData.buyerStats.map((buyer, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap">{buyer.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{buyer.transactions}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            ${buyer.totalValue.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {Math.round(buyer.totalAcres).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{buyer.counties}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Seller Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Top Sellers Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Seller Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Transactions
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Value
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Acres
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Counties
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dashboardData.sellerStats.map((seller, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap">{seller.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{seller.transactions}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            ${seller.totalValue.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {Math.round(seller.totalAcres).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{seller.counties}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeView === 'timeline' && (
          <div className="grid grid-cols-1 gap-6">
            {/* Detailed Timeline View */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Transaction Timeline</CardTitle>
              </CardHeader>
              <CardContent className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dashboardData.transactionsByYear}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="uniqueSellers"
                      name="Unique Sellers"
                      stroke="#3b82f6"
                      fill="#93c5fd"
                    />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="uniqueBuyers"
                      name="Unique Buyers"
                      stroke="#10b981"
                      fill="#6ee7b7"
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="totalAcres"
                      name="Total Acres"
                      stroke="#f59e0b"
                      fill="#fcd34d"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}