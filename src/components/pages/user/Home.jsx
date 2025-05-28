/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, ChartBar, Activity } from "lucide-react";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  LineChart,
  BarChart,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Area,
  AreaChart,
  Label,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
} from "recharts";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

const BASE_URL = "http://127.0.0.1:8000";

function UserHome() {
  const navigate = useNavigate();

  // State Management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState([]);
  const [predictionsData, setPredictionsData] = useState([]);
  const [analyticsData, setAnalyticsData] = useState({
    waterUsage: [],
    soilHealth: {},
    weatherImpact: {},
    efficiency: {},
  });

  // Chart Data State
  const [chartData, setChartData] = useState({
    histogram: { labels: [], datasets: [] },
    doughnut: { labels: [], datasets: [] },
    waterfall: { labels: [], datasets: [] },
  });

  // Transform analytics data for charts
  const transformAnalyticsData = () => {
    console.log("🔄 Transforming analytics data for charts...");

    // Transform water usage data
    const waterUsageData = (analyticsData.waterUsage || []).map((item) => ({
      date: new Date(item.month).toLocaleDateString(),
      usage: parseFloat(item.avg_water_requirement) || 0,
      count: item.prediction_count || 0,
    }));

    // Transform soil health data
    const soilHealthData = [
      { name: "Nitrogen", value: analyticsData.soilHealth.avg_nitrogen },
      { name: "Phosphorus", value: analyticsData.soilHealth.avg_phosphorus },
      { name: "Potassium", value: analyticsData.soilHealth.avg_potassium },
      { name: "pH", value: analyticsData.soilHealth.avg_ph },
      { name: "Zinc", value: analyticsData.soilHealth.avg_zinc },
      { name: "EC", value: analyticsData.soilHealth.avg_ec },
    ].filter((item) => item.value != null);

    // Transform weather data
    const weatherData = [
      {
        name: "Temperature",
        value: analyticsData.weatherImpact.avg_temp || 0,
      },
      {
        name: "Humidity",
        value: analyticsData.weatherImpact.avg_humidity || 0,
      },
      {
        name: "Rainfall",
        value: analyticsData.weatherImpact.avg_rainfall || 0,
      },
      {
        name: "Wind Speed",
        value: analyticsData.weatherImpact.avg_wind_speed || 0,
      },
    ].filter((item) => item.value !== null && !isNaN(item.value));

    // Transform efficiency data - Use the score property directly
    const performanceData = [
      {
        name: "Water Usage",
        score: analyticsData.efficiency?.water_usage_score || 0,
      },
      {
        name: "Soil Health",
        score: analyticsData.efficiency?.soil_health_score || 0,
      },
      {
        name: "Sustainability",
        score: analyticsData.efficiency?.sustainability_score || 0,
      },
    ].filter((item) => item.score !== null && !isNaN(item.score));

    console.log("Performance Data: ", performanceData);

    // Remove the efficiencyData from the return since it's not used
    return { waterUsageData, soilHealthData, weatherData, performanceData };
  };

  // Fetch Data
  useEffect(() => {
    const fetchAllData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      try {
        // Fetch basic data
        const [usersRes, predictionsRes] = await Promise.all([
          fetch(`${BASE_URL}/users/`, { headers }),
          fetch(`${BASE_URL}/irrigation/my-predictions/`, { headers }),
        ]);

        const [usersData, predictionsData] = await Promise.all([
          usersRes.json(),
          predictionsRes.json(),
        ]);

        // Fetch analytics data
        const analyticsEndpoints = {
          waterUsage: "irrigation/analytics/water-usage/user/",
          soilHealth: "irrigation/analytics/soil-health/user/",
          weatherImpact: "irrigation/analytics/weather-impact/user/",
          efficiency: "irrigation/analytics/efficiency/user/",
        };

        const analyticsRequests = Object.entries(analyticsEndpoints).map(
          ([key, endpoint]) =>
            fetch(`${BASE_URL}/${endpoint}`, { headers })
              .then((res) => res.json())
              .then((data) => {
                console.log(`${key} response:`, data); // Debug log
                return data;
              })
              .catch((error) => {
                console.error(`Error fetching ${key}:`, error);
                return null;
              })
        );

        const analyticsResponses = await Promise.all(analyticsRequests);

        // Process and set data with proper null checks
        setUserData(usersData.users || []);
        setPredictionsData(predictionsData.predictions || []);
        setAnalyticsData({
          waterUsage: analyticsResponses[0]?.water_usage_trends || [],
          soilHealth: analyticsResponses[1]?.soil_metrics || {},
          weatherImpact: analyticsResponses[2]?.weather_metrics || {},
          efficiency: analyticsResponses[3]?.efficiency_metrics || {},
        });

        // Process chart data
        processChartData(
          usersData.users || [],
          predictionsData.predictions || []
        );
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [navigate]);

  console.log("Found Users: ", userData);

  // Process Chart Data with error handling
  const processChartData = (users, predictions) => {
    try {
      // Get unique dates for user registrations and predictions separately
      const userDates = [...new Set(
        users.map(user => new Date(user.created_at).toISOString().split('T')[0])
      )].sort();
  
      const predictionDates = [...new Set(
        predictions.map(pred => new Date(pred.created_at).toISOString().split('T')[0])
      )].sort();
  
      // Take last 5 days for each
      const lastUserDays = userDates.slice(-5);
      const lastPredictionDays = predictionDates.slice(-5);
  
      const roles = ['admin', 'user'];
  
      // Process user registration data by role and date (for histogram)
      const usersByRole = roles.reduce((acc, role) => {
        acc[role] = lastUserDays.map(date => 
          users.filter(user => 
            user.role === role && 
            new Date(user.created_at).toISOString().split('T')[0] === date
          ).length
        );
        return acc;
      }, {});
  
      // Calculate total users by role for doughnut chart
      const roleCounts = users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {});
  
      // Format dates for display
      const displayUserDates = lastUserDays.map(date => {
        const displayDate = new Date(date);
        return displayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      });
  
      const displayPredictionDates = lastPredictionDays.map(date => {
        const displayDate = new Date(date);
        return displayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      });
  
      // Create a map of user IDs to roles for quicker lookup
      const userRoleMap = users.reduce((acc, user) => {
        acc[user.id] = user.role;
        return acc;
      }, {});
  
      // Process predictions data by role and date
      const predictionsByRole = roles.reduce((acc, role) => {
        acc[role] = lastPredictionDays.map(date => 
          predictions.filter(pred => {
            const predDate = new Date(pred.created_at).toISOString().split('T')[0];
            const userRole = userRoleMap[pred.created_by?.id];
            return userRole === role && predDate === date;
          }).length
        );
        return acc;
      }, {});
  
      // Create datasets for the line chart
      const predictionDatasets = roles.map((role, index) => ({
        label: `${role.charAt(0).toUpperCase() + role.slice(1)} Predictions`,
        data: predictionsByRole[role],
        backgroundColor: COLORS[index],
        borderColor: COLORS[index],
        borderWidth: 2,
        fill: false,
      }));
  
      // Debug logging
      console.log('Chart Processing Debug:', {
        userDates: lastUserDays,
        predictionDates: lastPredictionDays,
        displayUserDates,
        displayPredictionDates,
        usersByRole,
        roleCounts,
        predictionsByRole,
        predictionDatasets
      });
  
      setChartData({
        histogram: {
          labels: displayUserDates,
          datasets: roles.map((role, index) => ({
            label: role.charAt(0).toUpperCase() + role.slice(1),
            data: usersByRole[role],
            backgroundColor: COLORS[index],
            borderColor: COLORS[index],
            borderWidth: 1,
          })),
        },
        doughnut: {
          labels: roles.map(role => role.charAt(0).toUpperCase() + role.slice(1)),
          datasets: [{
            data: roles.map(role => roleCounts[role] || 0),
            backgroundColor: COLORS.slice(0, roles.length),
            borderColor: COLORS.slice(0, roles.length),
            borderWidth: 1,
          }],
        },
        waterfall: {
          labels: displayPredictionDates,
          datasets: predictionDatasets,
        },
      });
    } catch (error) {
      console.error('Error processing chart data:', error);
      setError('Error processing chart data');
    }
  };

  const chartOptions = {
    // Basic chart configuration
    responsive: true,
    maintainAspectRatio: false,

    // Plugin configurations
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
        },
      },
      tooltip: {
        enabled: true,
        mode: "index",
        intersect: false,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        titleColor: "#1f2937",
        bodyColor: "#4b5563",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 6,
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.parsed.y}`;
          },
          title: function (tooltipItems) {
            return tooltipItems[0].label;
          },
        },
      },
    },

    // Axis configurations
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: "rgba(0,0,0,0.1)",
          drawBorder: false,
        },
        ticks: {
          stepSize: 1,
          precision: 0,
          font: {
            size: 11,
          },
          padding: 8,
        },
        border: {
          display: false,
        },
      },
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 11,
          },
          padding: 8,
        },
        border: {
          display: false,
        },
      },
    },

    // Element styling
    elements: {
      line: {
        tension: 0.4,
        borderWidth: 2,
        fill: true,
        backgroundColor: "rgba(59, 130, 246, 0.1)", // Light blue with opacity
      },
      point: {
        radius: 4,
        hitRadius: 10,
        hoverRadius: 6,
        borderWidth: 2,
        hoverBorderWidth: 2,
        backgroundColor: "white",
      },
      bar: {
        borderRadius: 4,
        borderSkipped: false,
      },
    },

    // Hover configuration
    hover: {
      mode: "nearest",
      intersect: true,
      animationDuration: 150,
    },

    // Animation configuration
    animation: {
      duration: 1000,
      easing: "easeInOutQuart",
    },
  };

  // Specific options for doughnut chart
  const doughnutOptions = {
    ...chartOptions,
    cutout: "70%",
    plugins: {
      ...chartOptions.plugins,
      tooltip: {
        ...chartOptions.plugins.tooltip,
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.raw || 0;
            return `${label}: ${value} users`;
          },
        },
      },
      legend: {
        ...chartOptions.plugins.legend,
        position: "bottom",
      },
    },
    elements: {
      arc: {
        borderWidth: 2,
        borderColor: "white",
      },
    },
  };

  if (loading) {
    return (
      <div className="mt-20 p-6 flex items-center justify-center">
        <div className="text-lg font-semibold text-gray-600">
          Loading dashboard data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-20 p-6 flex items-center justify-center">
        <div className="text-lg font-semibold text-red-600">Error: {error}</div>
      </div>
    );
  }

  const { waterUsageData, soilHealthData, weatherData, performanceData } =
    transformAnalyticsData();

    return (
      <div className="p-6 space-y-6">
        <h1 className="text-blue-950 font-extrabold text-center text-4xl mb-8">
          Analytics Dashboard
        </h1>
    
        {/* Summary Cards */}
        {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
       

        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm">Total Predictions</p>
              <h3 className="text-white text-2xl font-bold">
                {predictionsData.length}
              </h3>
              <p className="text-emerald-100 text-xs mt-2">
                Generated predictions
              </p>
            </div>
            <ChartBar className="h-12 w-12 text-white opacity-75" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm">Today Activity</p>
              <h3 className="text-white text-2xl font-bold">
                {
                  predictionsData.filter(
                    (p) =>
                      new Date(p.created_at).toDateString() ===
                      new Date().toDateString()
                  ).length
                }
              </h3>
              <p className="text-purple-100 text-xs mt-2">New predictions</p>
            </div>
            <Activity className="h-12 w-12 text-white opacity-75" />
          </div>
        </div>
      </div>
    
   
    
        {/* Analytics Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Water Usage Trends */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-black">
              Water Usage Trends
            </h3>
            <div className="h-64 py-4">
              <p className="text-sm text-gray-600 mb-4">
                Displays average water requirements over time. Higher peaks indicate increased irrigation needs during specific periods.
              </p>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={waterUsageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date">
                    <Label value="Date" offset={0} position="insideBottom" />
                  </XAxis>
                  <YAxis>
                    <Label value="Usage" angle={-90} position="insideLeft" />
                  </YAxis>
                  <RechartsTooltip />
                  <Area
                    type="monotone"
                    dataKey="usage"
                    stroke="#8884d8"
                    fill="#00C49F"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
    
          {/* Soil Health Metrics */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-black">
              Soil Health Metrics
            </h3>
            <div className="h-64 md:h-80 py-2">
              <p className="text-sm text-gray-600 mb-4">
                Shows distribution of soil nutrients and properties. Each segment represents different soil parameters, helping identify potential deficiencies.
              </p>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={soilHealthData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy={window.innerWidth >= 768 ? "50%" : "40%"}
                    outerRadius={window.innerWidth >= 768 ? 80 : 60}
                    labelLine={false}
                  >
                    {soilHealthData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value) => `${value.toFixed(2)}`} />
                  <RechartsLegend
                    layout={window.innerWidth >= 768 ? "vertical" : "horizontal"}
                    align={window.innerWidth >= 768 ? "right" : "center"}
                    verticalAlign={window.innerWidth >= 768 ? "middle" : "bottom"}
                    wrapperStyle={{
                      paddingTop: window.innerWidth >= 768 ? 0 : "20px",
                      fontSize: "12px",
                    }}
                    formatter={(value, entry, index) => {
                      return `${value}: ${soilHealthData[index]?.value.toFixed(2)}`;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
    
          {/* Weather Impact */}
          <div className="bg-white p-6 rounded-lg shadow-md py-16">
            <h3 className="text-lg font-semibold mb-4 text-black">
              Weather Impact
            </h3>
            <div className="h-64">
              <p className="text-sm text-gray-600 mb-4">
                Compares different weather parameters affecting crop growth. Helps understand environmental conditions influence on irrigation needs.
              </p>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weatherData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={60}>
                    <Label value="Weather Parameters" offset={0} position="insideBottom" />
                  </XAxis>
                  <YAxis>
                    <Label value="Impact %" angle={-90} position="insideLeft" />
                  </YAxis>
                  <RechartsTooltip />
                  <Area
                    type="monotone"
                    dataKey="value"
                    fill="#FF8042"
                    stroke="#8884d8"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
    
          {/* Performance Metrics */}
          <div className="bg-white p-6 rounded-lg shadow-md py-16">
            <h3 className="text-lg font-semibold mb-4 text-black">
              Performance Metrics
            </h3>
            <div className="h-64 mb-4 mt-16">
              <p className="text-sm text-gray-600 mb-4">
                Tracks performance scores across different aspects of irrigation management. Higher values indicate better efficiency in resource utilization.
              </p>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={60}>
                    <Label value="Metrics" offset={0} position="insideBottom" />
                  </XAxis>
                  <YAxis domain={[0, 100]}>
                    <Label value="Efficiency Score (%)" angle={-90} position="insideLeft" />
                  </YAxis>
                  <RechartsTooltip />
                  <RechartsLegend />
                  <Area
                    type="monotone"
                    dataKey="score"
                    fill="#82ca9d"
                    stroke="#8884d8"
                    fillOpacity={0.6}
                    name="Efficiency Score (%)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
    
        {/* Recent Predictions Table */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-green-700">
            Recent Predictions
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Water Requirement
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Suggested Crop
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Irrigation Strategy
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {predictionsData.slice(0, 5).map((prediction, index) => (
                  <tr
                    key={prediction.id || index}
                    className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(prediction.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {prediction.location || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {prediction.water_requirement || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {prediction.predicted_crop || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          prediction.status === "success"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {prediction.irrigation_strategy || "Unknown"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
    
}




export default UserHome;
