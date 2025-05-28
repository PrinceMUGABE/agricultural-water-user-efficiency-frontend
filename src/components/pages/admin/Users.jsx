/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Users as UsersIcon, 
  UserCheck, 
  Shield, 
  Download, 
  Search, 
  Edit, 
  Trash2, 
  Filter,
  Calendar,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Eye,
  MoreVertical
} from "lucide-react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar,
  Area,
  AreaChart
} from 'recharts';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-red-600 bg-red-50 rounded-xl border border-red-200">
          <h3 className="font-semibold text-lg">Something went wrong</h3>
          <p className="text-sm text-red-500 mt-1">Please refresh the page to continue</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function Users() {
  const [userData, setUserData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [downloadMenuVisible, setDownloadMenuVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
  const token = localStorage.getItem('token');
  const BASE_URL = "http://127.0.0.1:8000/";

  useEffect(() => {
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${BASE_URL}users/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Response data:", response.data);
      
      // Handle the nested structure where users are under 'users' key
      let usersArray = [];
      
      if (response.data && response.data.users && Array.isArray(response.data.users)) {
        // Data is in format: { users: [...] }
        usersArray = response.data.users;
      } else if (Array.isArray(response.data)) {
        // Data is directly an array
        usersArray = response.data;
      } else if (response.data && typeof response.data === 'object') {
        // Data is an object, try to extract values
        usersArray = Object.values(response.data);
      }

      setUserData(usersArray);
      
      if (!usersArray.length) {
        setMessage("No users found");
        setMessageType("info");
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setMessage("Failed to load users");
      setMessageType("error");
      setLoading(false);
    }
  };

  fetchUsers();
}, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    
    try {
      const response = await fetch(`${BASE_URL}delete/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
      
      setUserData(prev => prev.filter(user => user.id !== id));
      setMessage("User deleted successfully");
      setMessageType("success");
    } catch (error) {
      console.error('Error deleting user:', error);
      setMessage("Failed to delete user");
      setMessageType("error");
    }
    
    setTimeout(() => setMessage(""), 3000);
  };

  const handleDownload = {
    PDF: () => {
      setMessage("PDF download started");
      setMessageType("success");
      setTimeout(() => setMessage(""), 3000);
    },
    Excel: () => {
      setMessage("Excel download started");
      setMessageType("success");
      setTimeout(() => setMessage(""), 3000);
    },
    CSV: () => {
      setMessage("CSV download started");
      setMessageType("success");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const getRoleDisplayName = role => ({
    admin: "Administrator",
    user: "User"
  }[role] || role);

  const getRoleIcon = role => {
    switch(role) {
      case 'admin': return <Shield className="w-4 h-4 text-red-500" />;
      case 'user': return <UserCheck className="w-4 h-4 text-blue-500" />;
      default: return <UsersIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleColor = role => ({
    admin: "bg-red-100 text-red-800 border-red-200",
    user: "bg-gray-100 text-gray-800 border-gray-200"
  }[role] || "bg-gray-100 text-gray-800 border-gray-200");

  const getStatsCards = () => {
    const roleStats = userData.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    const totalUsers = userData.length;
    const recentUsers = userData.filter(user => 
      new Date(user.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;

    return [
      {
        title: "Total Users",
        value: totalUsers,
        icon: <UsersIcon className="w-6 h-6 text-blue-500" />,
        color: "bg-blue-500",
        change: "+12%"
      },
      {
        title: "Administrators",
        value: roleStats.admin || 0,
        icon: <Shield className="w-6 h-6 text-red-500" />,
        color: "bg-red-500",
        change: "+5%"
      },
      {
        title: "New This Week",
        value: recentUsers,
        icon: <TrendingUp className="w-6 h-6 text-purple-500" />,
        color: "bg-purple-500",
        change: "+25%"
      }
    ];
  };

  const renderCharts = () => {
    if (loading) {
      return (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-64 animate-pulse"></div>
          ))}
        </div>
      );
    }

    if (!userData.length) return null;

    const roleData = Object.entries(
      userData.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {})
    ).map(([role, value]) => ({ 
      name: getRoleDisplayName(role), 
      value,
      color: COLORS[Object.keys(userData.reduce((acc, user) => {
        acc[user.role] = true;
        return acc;
      }, {})).indexOf(role)]
    }));

    const monthlyData = userData.reduce((acc, user) => {
      const month = new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      acc[month] = acc[month] || { month, total: 0, admin: 0, user: 0 };
      acc[month].total += 1;
      acc[month][user.role] += 1;
      return acc;
    }, {});

    const growthData = Object.values(monthlyData).sort((a, b) => 
      new Date(a.month + '/01') - new Date(b.month + '/01')
    );

    return (
      <div className="space-y-6">
        {/* Role Distribution Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Role Distribution</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Eye className="w-4 h-4" />
              <span>Overview</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={roleData} 
                  dataKey="value" 
                  nameKey="name" 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={80}
                  innerRadius={40}
                  paddingAngle={5}
                >
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  wrapperStyle={{ paddingTop: '20px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Growth Trend Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">User Growth Trend</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <TrendingUp className="w-4 h-4" />
              <span>Monthly</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#3B82F6" 
                  fillOpacity={1} 
                  fill="url(#colorTotal)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Role Breakdown Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Role Breakdown by Month</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Filter className="w-4 h-4" />
              <span>Detailed</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Bar dataKey="admin" stackId="a" fill="#EF4444" name="Admin" />
                <Bar dataKey="user" stackId="a" fill="#6B7280" name="User" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  // Filter and sort data
  const filteredData = userData
    .filter(user => {
      const matchesSearch = [user.phone_number, user.role, user.email]
        .some(field => field?.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesRole = selectedRole === "all" || user.role === selectedRole;
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      const multiplier = sortOrder === 'asc' ? 1 : -1;
      
      if (sortBy === 'created_at') {
        return (new Date(aVal) - new Date(bVal)) * multiplier;
      }
      return aVal.localeCompare(bVal) * multiplier;
    });

  const totalPages = Math.ceil(filteredData.length / usersPerPage);
  const currentUsers = filteredData.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="mb-8 px-6 pt-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
          <p className="text-gray-600">Manage and monitor all users in your system</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mx-6 mb-6 p-4 rounded-xl border-l-4 ${
            messageType === "success" 
              ? "bg-green-50 border-green-400 text-green-700" 
              : messageType === "error"
                ? "bg-red-50 border-red-400 text-red-700"
                : "bg-blue-50 border-blue-400 text-blue-700"
          }`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {messageType === "success" ? "✅" : messageType === "error" ? "❌" : "ℹ️"}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 px-6 w-full">
          {getStatsCards().map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-xs text-green-600 mt-1">{stat.change} from last month</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="px-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full">
            {/* Main Table Section */}
            <div className="xl:col-span-2 space-y-6 w-full">
              {/* Controls */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                      />
                    </div>

                    {/* Role Filter */}
                    <select
                      value={selectedRole}
                      onChange={e => setSelectedRole(e.target.value)}
                      className="px-4 py-2 text-gray-500 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Roles</option>
                      <option value="admin">Administrators</option>
                      <option value="user">Users</option>
                    </select>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <button
                        onClick={() => setDownloadMenuVisible(!downloadMenuVisible)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </button>
                      {downloadMenuVisible && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                          <div className="py-1">
                            {Object.keys(handleDownload).map(format => (
                              <button
                                key={format}
                                onClick={() => {
                                  handleDownload[format]();
                                  setDownloadMenuVisible(false);
                                }}
                                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                              >
                                Export as {format}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Users</h3>
                    <span className="text-sm text-gray-500">
                      {filteredData.length} total users
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          #
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                          onClick={() => {
                            setSortBy('email');
                            setSortOrder(sortBy === 'email' && sortOrder === 'asc' ? 'desc' : 'asc');
                          }}
                        >
                          User Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                          onClick={() => {
                            setSortBy('created_at');
                            setSortOrder(sortBy === 'created_at' && sortOrder === 'desc' ? 'asc' : 'desc');
                          }}
                        >
                          Joined
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentUsers.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                            <UsersIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-lg font-medium">No users found</p>
                            <p className="text-sm">Try adjusting your search or filter criteria</p>
                          </td>
                        </tr>
                      ) : (
                        currentUsers.map((user, index) => (
                          <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {(currentPage - 1) * usersPerPage + index + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="space-y-1">
                                <div className="flex items-center text-sm font-medium text-gray-900">
                                  <Mail className="w-4 h-4 text-gray-400 mr-2" />
                                  {user.email}
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <Phone className="w-4 h-4 text-gray-400 mr-2" />
                                  {user.phone_number}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                                <span className="mr-2">{getRoleIcon(user.role)}</span>
                                {getRoleDisplayName(user.role)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center text-sm text-gray-600">
                                <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                                {new Date(user.created_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-3">
                                <Link 
                                  to={`/admin/editUser/${user.id}`} 
                                  className="text-blue-600 hover:text-blue-900 transition-colors"
                                  title="Edit user"
                                >
                                  <Edit className="w-4 h-4" />
                                </Link>
                                <button 
                                  onClick={() => handleDelete(user.id)} 
                                  className="text-red-600 hover:text-red-900 transition-colors"
                                  title="Delete user"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-700">Rows per page:</span>
                      <select
                        value={usersPerPage}
                        onChange={e => {
                          setUsersPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {[5, 10, 25, 50].map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-700">
                        Showing {Math.min((currentPage - 1) * usersPerPage + 1, filteredData.length)} to{' '}
                        {Math.min(currentPage * usersPerPage, filteredData.length)} of {filteredData.length} results
                      </span>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                            return (
                              <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                  currentPage === pageNum
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                        </div>
                        
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="xl:col-span-1 w-full">
              {renderCharts()}
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default Users;