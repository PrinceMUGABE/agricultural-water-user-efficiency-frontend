/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faDownload,
  faSearch,
  faComment,
  faChartPie,
  faPlus,
  faStar,
  faEye,
  faFilter,
  faSort,
  faSortUp,
  faSortDown,
  faCalendarAlt,
  faUser,
  faMapMarkerAlt,
  faSeedling,
} from "@fortawesome/free-solid-svg-icons";
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
} from "recharts";

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
        <div className="p-4 text-red-800 bg-red-100 rounded-lg border border-red-200">
          <h3 className="font-semibold">Something went wrong</h3>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function User_Manage_Feedbacks() {
  const [feedbackData, setFeedbackData] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [feedbacksPerPage, setFeedbacksPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [downloadMenuVisible, setDownloadMenuVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [commentToView, setCommentToView] = useState("");
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const navigate = useNavigate();

  // New states for enhanced filtering and sorting
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [filterConfig, setFilterConfig] = useState({
    rating: [],
    dateRange: { start: "", end: "" },
    prediction: "",
    crop: "",
  });
  const [activeFilters, setActiveFilters] = useState(0);
  const [summaryStats, setSummaryStats] = useState({
    averageRating: 0,
    totalFeedbacks: 0,
    highestRated: null,
    lowestRated: null,
  });

  const COLORS = ["#EF4444", "#10B981", "#F59E0B", "#8B5CF6", "#06B6D4"];
  const BASE_URL = "http://127.0.0.1:8000/feedback/";
  const PREDICTIONS_URL = "http://127.0.0.1:8000/irrigation/my-predictions/";
  const token = localStorage.getItem("token");

  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    const accessToken = storedUserData
      ? JSON.parse(storedUserData).access_token
      : null;
    if (!accessToken) {
      navigate("/login");
      return;
    }
    handleFetch();
    fetchPredictions();
  }, [navigate]);

  useEffect(() => {
    if (feedbackData.length > 0) {
      calculateSummaryStats();
    }
  }, [feedbackData]);

  const calculateSummaryStats = () => {
    const totalRating = feedbackData.reduce(
      (sum, feedback) => sum + feedback.rating,
      0
    );
    const average = totalRating / feedbackData.length;

    // Find highest and lowest rated feedback
    let highest = feedbackData[0];
    let lowest = feedbackData[0];

    feedbackData.forEach((feedback) => {
      if (feedback.rating > highest.rating) highest = feedback;
      if (feedback.rating < lowest.rating) lowest = feedback;
    });

    setSummaryStats({
      averageRating: average.toFixed(1),
      totalFeedbacks: feedbackData.length,
      highestRated: highest,
      lowestRated: lowest,
    });
  };

  const handleFetch = async () => {
    try {
      const res = await axios.get(`${BASE_URL}my-feedbacks/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeedbackData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching feedbacks:", err);
    }
  };

  const fetchPredictions = async () => {
    try {
      const res = await axios.get(PREDICTIONS_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Predictions data:", res.data);
      // Extract predictions array from the response
      const predictionsArray = res.data?.predictions || [];
      setPredictions(Array.isArray(predictionsArray) ? predictionsArray : []);
    } catch (err) {
      console.error("Error fetching predictions:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Do you want to delete this feedback?")) return;
    try {
      await axios.delete(`${BASE_URL}delete/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await handleFetch();
      setMessage("Feedback deleted successfully");
      setMessageType("success");
      setCurrentPage(1);
    } catch (err) {
      setMessage(err.response?.data.message || "An error occurred");
      setMessageType("error");
    }
  };

  const handleDownload = {
    PDF: () => {
      const doc = new jsPDF();
      doc.autoTable({ html: "#feedback-table" });
      doc.save("prediction_feedbacks.pdf");
    },
    Excel: () => {
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(feedbackData),
        "Feedbacks"
      );
      XLSX.writeFile(workbook, "prediction_feedbacks.xlsx");
    },
    CSV: () => {
      const csvContent =
        "data:text/csv;charset=utf-8," +
        Object.keys(feedbackData[0]).join(",") +
        "\n" +
        feedbackData.map((row) => Object.values(row).join(",")).join("\n");
      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute("download", "prediction_feedbacks.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    },
  };

  const handleAddUpdateFeedback = async (e) => {
    e.preventDefault();
    try {
      const feedbackData = {
        rating: parseInt(e.target.rating.value),
        comment: e.target.comment.value,
        prediction: e.target.prediction.value,
      };

      if (currentFeedback) {
        // Update existing feedback
        await axios.put(
          `${BASE_URL}update/${currentFeedback.id}/`,
          feedbackData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setMessage("Feedback updated successfully");
      } else {
        // Create new feedback
        await axios.post(`${BASE_URL}create/`, feedbackData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setMessage("Feedback created successfully");
      }

      handleFetch();
      setIsModalOpen(false);
      setCurrentFeedback(null);
      setMessageType("success");
    } catch (err) {
      setMessage(err.response?.data.error || "An error occurred");
      setMessageType("error");
    }
  };

  const openModal = (feedback = null) => {
    setCurrentFeedback(feedback);
    setIsModalOpen(true);
  };

  const openCommentModal = (comment) => {
    setCommentToView(comment);
    setIsCommentModalOpen(true);
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <FontAwesomeIcon
          key={i}
          icon={faStar}
          className={i < rating ? "text-yellow-500" : "text-gray-300"}
        />
      );
    }
    return <div className="flex space-x-1">{stars}</div>;
  };

  // Function to get prediction display text
  const getPredictionDisplayText = (prediction) => {
    if (!prediction) return "Select Prediction";
    return `${prediction.location} - ${prediction.predicted_crop} (pH: ${prediction.ph?.toFixed(1)}, Temp: ${prediction.temperature}°C)`;
  };

  // Function to find prediction by ID
  const findPredictionById = (id) => {
    return predictions.find(pred => pred.id === parseInt(id));
  };

  // Sorting functions
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (column) => {
    if (sortConfig.key !== column) {
      return <FontAwesomeIcon icon={faSort} className="ml-1 text-gray-400" />;
    }
    return sortConfig.direction === "ascending" ? (
      <FontAwesomeIcon icon={faSortUp} className="ml-1 text-blue-600" />
    ) : (
      <FontAwesomeIcon icon={faSortDown} className="ml-1 text-blue-600" />
    );
  };

  // Filtering functions
  const handleFilterChange = (field, value) => {
    setFilterConfig((prev) => {
      const newConfig = { ...prev };

      if (field === "rating") {
        // Toggle rating in the array
        if (newConfig.rating.includes(value)) {
          newConfig.rating = newConfig.rating.filter((r) => r !== value);
        } else {
          newConfig.rating = [...newConfig.rating, value];
        }
      } else if (field === "dateRange") {
        newConfig.dateRange = { ...newConfig.dateRange, ...value };
      } else {
        newConfig[field] = value;
      }

      // Calculate active filters
      let activeCount = 0;
      if (newConfig.rating.length > 0) activeCount++;
      if (newConfig.dateRange.start || newConfig.dateRange.end) activeCount++;
      if (newConfig.prediction) activeCount++;
      if (newConfig.crop) activeCount++;

      setActiveFilters(activeCount);
      return newConfig;
    });
  };

  const resetFilters = () => {
    setFilterConfig({
      rating: [],
      dateRange: { start: "", end: "" },
      prediction: "",
      crop: "",
    });
    setActiveFilters(0);
  };

  // Apply filters and sorting
  const applyFiltersAndSort = (data) => {
    // First apply search filter
    let filteredData = data.filter((feedback) =>
      [
        feedback.comment,
        feedback.rating?.toString(),
        feedback.created_by?.phone_number,
        feedback.created_by?.email,
      ].some((field) =>
        field?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

    // Apply specific filters
    if (filterConfig.rating.length > 0) {
      filteredData = filteredData.filter((feedback) =>
        filterConfig.rating.includes(feedback.rating)
      );
    }

    if (filterConfig.dateRange.start) {
      const startDate = new Date(filterConfig.dateRange.start);
      filteredData = filteredData.filter(
        (feedback) => new Date(feedback.created_at) >= startDate
      );
    }

    if (filterConfig.dateRange.end) {
      const endDate = new Date(filterConfig.dateRange.end);
      endDate.setHours(23, 59, 59);
      filteredData = filteredData.filter(
        (feedback) => new Date(feedback.created_at) <= endDate
      );
    }

    if (filterConfig.prediction) {
      filteredData = filteredData.filter(
        (feedback) =>
          feedback.prediction &&
          feedback.prediction.id === parseInt(filterConfig.prediction)
      );
    }

    if (filterConfig.crop) {
      filteredData = filteredData.filter(
        (feedback) =>
          feedback.prediction &&
          feedback.prediction.predicted_crop.toLowerCase().includes(filterConfig.crop.toLowerCase())
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      filteredData.sort((a, b) => {
        let aValue, bValue;

        // Handle nested properties
        if (sortConfig.key === "user") {
          aValue = a.created_by ? a.created_by.phone_number : "";
          bValue = b.created_by ? b.created_by.phone_number : "";
        } else if (sortConfig.key === "prediction") {
          aValue = a.prediction ? a.prediction.location : "";
          bValue = b.prediction ? b.prediction.location : "";
        } else if (sortConfig.key === "crop") {
          aValue = a.prediction ? a.prediction.predicted_crop : "";
          bValue = b.prediction ? b.prediction.predicted_crop : "";
        } else {
          aValue = a[sortConfig.key];
          bValue = b[sortConfig.key];
        }

        if (sortConfig.direction === "ascending") {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    return filteredData;
  };

  const filteredData = applyFiltersAndSort(feedbackData);
  const totalPages = Math.ceil(filteredData.length / feedbacksPerPage);

  const currentFeedbacks = filteredData.slice(
    (currentPage - 1) * feedbacksPerPage,
    currentPage * feedbacksPerPage
  );

  const renderCharts = () => {
    if (!feedbackData.length) return null;

    // Rating distribution
    const ratingDistribution = [1, 2, 3, 4, 5].map((rating) => ({
      name: `${rating} Star${rating > 1 ? "s" : ""}`,
      value: feedbackData.filter((feedback) => feedback.rating === rating)
        .length,
    }));

    // Average rating by crop
    const cropRatings = {};
    feedbackData.forEach((feedback) => {
      if (feedback.prediction) {
        const cropName = feedback.prediction.predicted_crop;
        if (!cropRatings[cropName]) {
          cropRatings[cropName] = { total: 0, count: 0 };
        }
        cropRatings[cropName].total += feedback.rating;
        cropRatings[cropName].count += 1;
      }
    });

    const cropData = Object.entries(cropRatings)
      .map(([name, data]) => ({
        name: name.length > 15 ? name.substring(0, 12) + "..." : name,
        fullName: name,
        rating: (data.total / data.count).toFixed(1),
        count: data.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return (
      <div className="w-full lg:w-1/3 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-xs uppercase font-semibold text-gray-500 mb-1">
              Average Rating
            </h3>
            <div className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">
                {summaryStats.averageRating}
              </span>
              <div className="ml-2">
                {renderStars(Math.round(summaryStats.averageRating))}
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-xs uppercase font-semibold text-gray-500 mb-1">
              Total Feedbacks
            </h3>
            <span className="text-2xl font-bold text-blue-600">
              {summaryStats.totalFeedbacks}
            </span>
          </div>
        </div>

        <ErrorBoundary>
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 h-72">
            <h3 className="text-sm font-semibold mb-4 text-blue-600 flex items-center">
              <FontAwesomeIcon icon={faStar} className="mr-2" />
              Rating Distribution
            </h3>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={ratingDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={{
                    position: "outside",
                    offset: 10,
                    fill: "#374151",
                  }}
                >
                  {ratingDistribution.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderColor: "#d1d5db",
                    color: "#374151",
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  wrapperStyle={{ color: "#374151" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ErrorBoundary>

        <ErrorBoundary>
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 h-80">
            <h3 className="text-sm font-semibold mb-4 text-blue-600 flex items-center">
              <FontAwesomeIcon icon={faSeedling} className="mr-2" />
              Top Crops by Feedback (Avg Rating)
            </h3>
            <ResponsiveContainer>
              <BarChart data={cropData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  type="number"
                  domain={[0, 5]}
                  tick={{ fontSize: 12, fill: "#374151" }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#374151" }}
                  width={120}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderColor: "#d1d5db",
                    color: "#374151",
                  }}
                  formatter={(value, name, props) => {
                    return [
                      `Rating: ${value} (${props.payload.count} reviews)`,
                      props.payload.fullName,
                    ];
                  }}
                />
                <Bar
                  dataKey="rating"
                  fill="#10B981"
                  name="Avg Rating"
                  label={{
                    position: "right",
                    fill: "#374151",
                    fontSize: 12,
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ErrorBoundary>
      </div>
    );
  };

  const renderFilterPanel = () => {
    // Get unique crops from predictions
    const uniqueCrops = [...new Set(predictions.map(p => p.predicted_crop))];

    return (
      <div
        className={`bg-white p-4 rounded-lg shadow-md border border-gray-200 mb-4 ${
          isFilterPanelOpen ? "block" : "hidden"
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Rating filters */}
          <div>
            <h4 className="text-gray-700 font-semibold mb-2 flex items-center">
              <FontAwesomeIcon icon={faStar} className="mr-2 text-yellow-500" />
              Rating
            </h4>
            <div className="flex flex-wrap gap-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleFilterChange("rating", rating)}
                  className={`px-3 py-1 rounded-full flex items-center transition-colors ${
                    filterConfig.rating.includes(rating)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {rating}{" "}
                  <FontAwesomeIcon
                    icon={faStar}
                    className="ml-1 text-yellow-500"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Date range */}
          <div>
            <h4 className="text-gray-700 font-semibold mb-2 flex items-center">
              <FontAwesomeIcon
                icon={faCalendarAlt}
                className="mr-2 text-blue-500"
              />
              Date Range
            </h4>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-500 block mb-1">From</label>
                <input
                  type="date"
                  value={filterConfig.dateRange.start}
                  onChange={(e) =>
                    handleFilterChange("dateRange", { start: e.target.value })
                  }
                  className="w-full p-2 bg-white border border-gray-300 rounded text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">To</label>
                <input
                  type="date"
                  value={filterConfig.dateRange.end}
                  onChange={(e) =>
                    handleFilterChange("dateRange", { end: e.target.value })
                  }
                  className="w-full p-2 bg-white border border-gray-300 rounded text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Prediction filter */}
          <div>
            <h4 className="text-gray-700 font-semibold mb-2 flex items-center">
              <FontAwesomeIcon
                icon={faMapMarkerAlt}
                className="mr-2 text-green-500"
              />
              Prediction
            </h4>
            <select
              value={filterConfig.prediction}
              onChange={(e) => handleFilterChange("prediction", e.target.value)}
              className="w-full p-2 bg-white border border-gray-300 rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Predictions</option>
              {predictions.map((prediction) => (
                <option key={prediction.id} value={prediction.id}>
                  {prediction.location} - {prediction.predicted_crop}
                </option>
              ))}
            </select>
          </div>

          {/* Crop filter */}
          <div>
            <h4 className="text-gray-700 font-semibold mb-2 flex items-center">
              <FontAwesomeIcon
                icon={faSeedling}
                className="mr-2 text-green-600"
              />
              Crop Type
            </h4>
            <select
              value={filterConfig.crop}
              onChange={(e) => handleFilterChange("crop", e.target.value)}
              className="w-full p-2 bg-white border border-gray-300 rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Crops</option>
              {uniqueCrops.map((crop) => (
                <option key={crop} value={crop}>
                  {crop}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition w-full border border-gray-300"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderModal = () => {
    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center ${
          isModalOpen ? "visible" : "invisible"
        }`}
      >
        <div
          className={`fixed inset-0 bg-black opacity-50 ${
            isModalOpen ? "block" : "hidden"
          }`}
          onClick={() => setIsModalOpen(false)}
        ></div>
        <div className="bg-white rounded-lg shadow-xl p-6 z-50 w-full max-w-md border border-gray-200">
          <h2 className="text-xl font-bold mb-4 text-blue-600">
            {currentFeedback ? "Update Feedback" : "Add New Feedback"}
          </h2>
          <form onSubmit={handleAddUpdateFeedback}>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Rating (1-5)</label>
                <div className="flex items-center space-x-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FontAwesomeIcon
                      key={star}
                      icon={faStar}
                      className="text-2xl text-yellow-500"
                    />
                  ))}
                </div>
                <select
                  name="rating"
                  defaultValue={currentFeedback?.rating || 5}
                  required
                  className="w-full p-2 bg-white border border-gray-300 rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>1 Star</option>
                  <option value={2}>2 Stars</option>
                  <option value={3}>3 Stars</option>
                  <option value={4}>4 Stars</option>
                  <option value={5}>5 Stars</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Prediction</label>
                <select
                  name="prediction"
                  defaultValue={currentFeedback?.prediction?.id || ""}
                  required
                  className="w-full p-2 bg-white border border-gray-300 rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Prediction</option>
                  {predictions.map((prediction) => (
                    <option key={prediction.id} value={prediction.id}>
                      {getPredictionDisplayText(prediction)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Comment</label>
                <textarea
                  name="comment"
                  defaultValue={currentFeedback?.comment || ""}
                  required
                  rows={4}
                  className="w-full p-2 bg-white border border-gray-300 rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Share your feedback about this prediction..."
                ></textarea>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 border border-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {currentFeedback ? "Update" : "Add"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderCommentModal = () => {
    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center ${
          isCommentModalOpen ? "visible" : "invisible"
        }`}
      >
        <div
          className={`fixed inset-0 bg-black opacity-50 ${
            isCommentModalOpen ? "block" : "hidden"
          }`}
          onClick={() => setIsCommentModalOpen(false)}
        ></div>
        <div className="bg-white rounded-lg shadow-xl p-6 z-50 w-full max-w-2xl border border-gray-200 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-blue-600">
              <FontAwesomeIcon icon={faComment} className="mr-2" />
              Full Comment
            </h2>
            <button
              onClick={() => setIsCommentModalOpen(false)}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ×
            </button>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {commentToView}
            </p>
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={() => setIsCommentModalOpen(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const renderPageNumbers = () => {
      const pageNumbers = [];
      const maxVisiblePages = 5;
      
      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) {
            pageNumbers.push(i);
          }
          pageNumbers.push('...');
          pageNumbers.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
          pageNumbers.push(1);
          pageNumbers.push('...');
          for (let i = totalPages - 3; i <= totalPages; i++) {
            pageNumbers.push(i);
          }
        } else {
          pageNumbers.push(1);
          pageNumbers.push('...');
          for (let i = currentPage - 1; i <= currentPage + 1; i++) {
            pageNumbers.push(i);
          }
          pageNumbers.push('...');
          pageNumbers.push(totalPages);
        }
      }
      
      return pageNumbers;
    };

    return (
      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 space-y-4 sm:space-y-0">
        <div className="text-sm text-gray-600">
          Showing {(currentPage - 1) * feedbacksPerPage + 1} to{' '}
          {Math.min(currentPage * feedbacksPerPage, filteredData.length)} of{' '}
          {filteredData.length} entries
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-2 rounded border ${
              currentPage === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
            }`}
          >
            Previous
          </button>
          
          {renderPageNumbers().map((number, index) => (
            <button
              key={index}
              onClick={() => typeof number === 'number' && paginate(number)}
              disabled={number === '...'}
              className={`px-3 py-2 rounded border ${
                number === currentPage
                  ? "bg-blue-600 text-white border-blue-600"
                  : number === '...'
                  ? "bg-white text-gray-400 cursor-default border-gray-300"
                  : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
              }`}
            >
              {number}
            </button>
          ))}
          
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-2 rounded border ${
              currentPage === totalPages
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  const renderFeedbackTable = () => {
    return (
      <div className="w-full lg:w-2/3">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          {/* Table Header with Controls */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <h2 className="text-xl font-bold text-blue-600 flex items-center">
                <FontAwesomeIcon icon={faComment} className="mr-2" />
                Prediction Feedbacks Management
                {activeFilters > 0 && (
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {activeFilters} filter{activeFilters > 1 ? 's' : ''} active
                  </span>
                )}
              </h2>
              
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <button
                  onClick={() => openModal()}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center"
                >
                  <FontAwesomeIcon icon={faPlus} className="mr-2" />
                  Add Feedback
                </button>
                
                <button
                  onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                  className={`px-4 py-2 rounded flex items-center justify-center border ${
                    isFilterPanelOpen || activeFilters > 0
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <FontAwesomeIcon icon={faFilter} className="mr-2" />
                  Filters
                </button>
                
                <div className="relative">
                  <button
                    onClick={() => setDownloadMenuVisible(!downloadMenuVisible)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center"
                  >
                    <FontAwesomeIcon icon={faDownload} className="mr-2" />
                    Export
                  </button>
                  {downloadMenuVisible && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            handleDownload.PDF();
                            setDownloadMenuVisible(false);
                          }}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          Download as PDF
                        </button>
                        <button
                          onClick={() => {
                            handleDownload.Excel();
                            setDownloadMenuVisible(false);
                          }}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          Download as Excel
                        </button>
                        <button
                          onClick={() => {
                            handleDownload.CSV();
                            setDownloadMenuVisible(false);
                          }}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          Download as CSV
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="mt-4">
              <div className="relative">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search feedbacks by comment, rating, user..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {renderFilterPanel()}

          {/* Message Display */}
          {message && (
            <div className={`p-4 border-b ${
              messageType === "success" 
                ? "bg-green-50 text-green-800 border-green-200" 
                : "bg-red-50 text-red-800 border-red-200"
            }`}>
              <div className="flex justify-between items-center">
                <span>{message}</span>
                <button
                  onClick={() => setMessage("")}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table id="feedback-table" className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => requestSort("id")}
                      className="flex items-center hover:text-gray-700"
                    >
                      ID {getSortIcon("id")}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => requestSort("rating")}
                      className="flex items-center hover:text-gray-700"
                    >
                      Rating {getSortIcon("rating")}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Comment
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => requestSort("prediction")}
                      className="flex items-center hover:text-gray-700"
                    >
                      Prediction {getSortIcon("prediction")}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => requestSort("crop")}
                      className="flex items-center hover:text-gray-700"
                    >
                      Crop {getSortIcon("crop")}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => requestSort("user")}
                      className="flex items-center hover:text-gray-700"
                    >
                      User {getSortIcon("user")}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => requestSort("created_at")}
                      className="flex items-center hover:text-gray-700"
                    >
                      Date {getSortIcon("created_at")}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentFeedbacks.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <FontAwesomeIcon icon={faComment} className="text-4xl text-gray-300 mb-2" />
                        <p>No feedbacks found</p>
                        {searchQuery && (
                          <p className="text-sm mt-1">
                            Try adjusting your search or filters
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentFeedbacks.map((feedback) => (
                    <tr key={feedback.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{feedback.id}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {renderStars(feedback.rating)}
                          <span className="ml-2 text-sm text-gray-600">
                            ({feedback.rating}/5)
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 max-w-xs">
                        <div className="truncate">
                          {feedback.comment?.length > 50 ? (
                            <>
                              {feedback.comment.substring(0, 50)}...
                              <button
                                onClick={() => openCommentModal(feedback.comment)}
                                className="ml-2 text-blue-600 hover:text-blue-800 text-xs"
                              >
                                <FontAwesomeIcon icon={faEye} className="mr-1" />
                                View More
                              </button>
                            </>
                          ) : (
                            feedback.comment
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {feedback.prediction ? (
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1 text-green-500" />
                              {feedback.prediction.location}
                            </div>
                            <div className="text-xs text-gray-500">
                              pH: {feedback.prediction.ph?.toFixed(1)} | 
                              Temp: {feedback.prediction.temperature}°C
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {feedback.prediction ? (
                          <div className="flex items-center">
                            <FontAwesomeIcon icon={faSeedling} className="mr-1 text-green-600" />
                            {feedback.prediction.predicted_crop}
                          </div>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {feedback.created_by ? (
                          <div className="space-y-1">
                            <div className="flex items-center">
                              <FontAwesomeIcon icon={faUser} className="mr-1 text-blue-500" />
                              {feedback.created_by.phone_number}
                            </div>
                            {feedback.created_by.email && (
                              <div className="text-xs text-gray-500">
                                {feedback.created_by.email}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <FontAwesomeIcon icon={faCalendarAlt} className="mr-1 text-gray-400" />
                          {new Date(feedback.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(feedback.created_at).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openModal(feedback)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100"
                            title="Edit Feedback"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                            onClick={() => handleDelete(feedback.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100"
                            title="Delete Feedback"
                          >
                            <FontAwesomeIcon icon={faTrash} />
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
          {renderPagination()}

          {/* Items per page selector */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">Show:</label>
                <select
                  value={feedbacksPerPage}
                  onChange={(e) => {
                    setFeedbacksPerPage(parseInt(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-sm text-gray-600">entries per page</span>
              </div>
              
              <div className="text-sm text-gray-600">
                Total: {filteredData.length} feedback{filteredData.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 py-8 bg-gray-100 min-h-screen">
        <div className="flex flex-col lg:flex-row gap-6">
          {renderFeedbackTable()}
          {renderCharts()}
        </div>
        
        {renderModal()}
        {renderCommentModal()}
      </div>
    </ErrorBoundary>
  );
}

export default User_Manage_Feedbacks;