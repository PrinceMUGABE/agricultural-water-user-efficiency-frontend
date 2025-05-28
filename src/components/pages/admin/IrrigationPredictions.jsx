/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-no-undef */
/* eslint-disable no-unused-vars */
import PropTypes from "prop-types";
import React, { useState, useEffect, useRef } from "react";
import {
  Eye,
  Trash2,
  X,
  Download,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/Dialog";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  Filter,
  SlidersHorizontal,
  AlertTriangle,
  Info,
  ArrowDownUp,
  Calendar,
} from "lucide-react";

const AdminManageIrrigationPredictions = () => {
  const [predictions, setPredictions] = useState([]);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [district, setDistrict] = useState("");
  const [createError, setCreateError] = useState("");

  const [crop, setCrop] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [predictionResult, setPredictionResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const downloadRef = useRef(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [filters, setFilters] = useState({
    dateRange: { from: "", to: "" },
    districts: [],
    crops: [],
    soilTypes: [],
    waterRequirementRange: { min: "", max: "" },
    sortBy: "newest",
  });

  // First useEffect for click outside detection
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (downloadRef.current && !downloadRef.current.contains(event.target)) {
        setShowDownloadOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Second useEffect for fetching predictions
  useEffect(() => {
    fetchPredictions();
  }, []);

  // Rows per page options
  const rowsOptions = [5, 10, 30, 50, 100];

  useEffect(() => {
    fetchPredictions();
  }, []);

  // Updated filteredPredictions to handle null values
  const filteredPredictions = predictions.filter((pred) => {
    // Search term filter
    const matchesSearch =
      pred.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pred.created_by?.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      pred.created_by?.phone_number
        ?.toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    // Date range filter
    const createdDate = new Date(pred.created_at);
    const fromDate = filters.dateRange.from
      ? new Date(filters.dateRange.from)
      : null;
    const toDate = filters.dateRange.to ? new Date(filters.dateRange.to) : null;

    const matchesDateRange =
      (!fromDate || createdDate >= fromDate) &&
      (!toDate || createdDate <= toDate);

    // District filter
    const matchesDistrict =
      filters.districts.length === 0 ||
      filters.districts.includes(pred.location);

    // Crop filter
    const matchesCrop =
      filters.crops.length === 0 || filters.crops.includes(pred.predicted_crop);

    // Soil type filter
    const matchesSoilType =
      filters.soilTypes.length === 0 ||
      filters.soilTypes.includes(pred.soil_type);

    // Water requirement filter
    const waterReq = parseFloat(pred.water_requirement) || 0;
    const matchesWaterReq =
      (!filters.waterRequirementRange.min ||
        waterReq >= parseFloat(filters.waterRequirementRange.min)) &&
      (!filters.waterRequirementRange.max ||
        waterReq <= parseFloat(filters.waterRequirementRange.max));

    return (
      matchesSearch &&
      matchesDateRange &&
      matchesDistrict &&
      matchesCrop &&
      matchesSoilType &&
      matchesWaterReq
    );
  });

  const sortedPredictions = [...filteredPredictions].sort((a, b) => {
    switch (filters.sortBy) {
      case "newest":
        return new Date(b.created_at) - new Date(a.created_at);
      case "oldest":
        return new Date(a.created_at) - new Date(b.created_at);
      case "water_high":
        return (
          (parseFloat(b.water_requirement) || 0) -
          (parseFloat(a.water_requirement) || 0)
        );
      case "water_low":
        return (
          (parseFloat(a.water_requirement) || 0) -
          (parseFloat(b.water_requirement) || 0)
        );
      case "location_asc":
        return (a.location || "").localeCompare(b.location || "");
      case "location_desc":
        return (b.location || "").localeCompare(a.location || "");
      default:
        return 0;
    }
  });

  // Calculate pagination based on filtered predictions
  const totalPages = Math.ceil(filteredPredictions.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedPredictions = sortedPredictions.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  // Download functions with filtered data
  const downloadExcel = () => {
    const dataToExport = filteredPredictions.map((p) => ({
      Location: p.location || "N/A",
      Email: p.created_by?.email || "N/A",
      Phone: p.created_by?.phone_number || "N/A",
      Status: p.status || "N/A",
      "Created At": formatDate(p.created_at),
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Predictions");
    XLSX.writeFile(wb, "predictions.xlsx");
  };

  const downloadCSV = () => {
    const headers = ["Location,Email,Phone,Status,Created At\n"];
    const csv = filteredPredictions
      .map((p) =>
        [
          p.location || "N/A",
          p.created_by?.email || "N/A",
          p.created_by?.phone_number || "N/A",
          p.status || "N/A",
          formatDate(p.created_at),
        ].join(",")
      )
      .join("\n");
    const blob = new Blob([headers + csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "predictions.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [["Location", "Email", "Phone", "Status", "Created At"]],
      body: filteredPredictions.map((p) => [
        p.location || "N/A",
        p.created_by?.email || "N/A",
        p.created_by?.phone_number || "N/A",
        p.status || "N/A",
        formatDate(p.created_at),
      ]),
    });
    doc.save("predictions.pdf");
  };

  // List of valid crops
  const validCrops = [
    "Bananas",
    "Beans",
    "Cassava",
    "Coffee",
    "Irish Potatoes",
    "Maize",
    "Rice",
    "Sorghum",
    "Soybeans",
    "Sweet Potatoes",
  ];

  // Add this mapping at the top of your file, after the imports
  const districtCrops = {
    Kayonza: ["Maize", "Beans", "Cassava", "Bananas", "Sweet Potatoes"],
    Kirehe: ["Rice", "Maize", "Beans", "Bananas", "Soybeans"],
    Nyagatare: ["Maize", "Beans", "Sorghum", "Rice", "Soybeans"],
    Bugesera: ["Maize", "Beans", "Cassava", "Rice", "Sweet Potatoes"],
    Gatsibo: ["Maize", "Beans", "Sorghum", "Soybeans", "Sweet Potatoes"],
    Ngoma: ["Rice", "Maize", "Beans", "Cassava", "Sweet Potatoes"],
    Rwamagana: ["Maize", "Beans", "Bananas", "Sweet Potatoes", "Rice"],
    Huye: ["Coffee", "Maize", "Beans", "Sweet Potatoes", "Irish Potatoes"],
    Gisagara: ["Rice", "Maize", "Beans", "Sweet Potatoes", "Cassava"],
    Nyanza: ["Coffee", "Maize", "Beans", "Bananas", "Sweet Potatoes"],
    Nyaruguru: ["Coffee", "Irish Potatoes", "Beans", "Maize", "Sweet Potatoes"],
    Nyamagabe: ["Coffee", "Irish Potatoes", "Beans", "Maize", "Sweet Potatoes"],
    Ruhango: ["Coffee", "Maize", "Beans", "Bananas", "Sweet Potatoes"],
    Muhanga: ["Coffee", "Irish Potatoes", "Beans", "Maize", "Sweet Potatoes"],
    Kamonyi: ["Coffee", "Maize", "Beans", "Bananas", "Sweet Potatoes"],
    Gakenke: ["Coffee", "Irish Potatoes", "Beans", "Maize", "Sweet Potatoes"],
    Musanze: ["Irish Potatoes", "Maize", "Beans", "Sweet Potatoes"],
    Burera: ["Irish Potatoes", "Maize", "Beans", "Sweet Potatoes"],
    Gicumbi: ["Coffee", "Irish Potatoes", "Beans", "Maize", "Sweet Potatoes"],
    Rulindo: ["Coffee", "Irish Potatoes", "Beans", "Maize", "Sweet Potatoes"],
    Nyabihu: ["Irish Potatoes", "Maize", "Beans", "Sweet Potatoes"],
    Rubavu: ["Irish Potatoes", "Maize", "Beans", "Sweet Potatoes"],
    Rutsiro: ["Coffee", "Maize", "Beans", "Sweet Potatoes", "Bananas"],
    Karongi: ["Coffee", "Maize", "Beans", "Sweet Potatoes", "Bananas"],
    Ngororero: ["Coffee", "Maize", "Beans", "Sweet Potatoes", "Irish Potatoes"],
    Nyamasheke: ["Coffee", "Maize", "Beans", "Sweet Potatoes", "Bananas"],
    Rusizi: ["Rice", "Maize", "Beans", "Sweet Potatoes", "Bananas"],
    Kicukiro: ["Maize", "Beans", "Sweet Potatoes", "Bananas"],
    Nyarugenge: ["Maize", "Beans", "Sweet Potatoes", "Bananas"],
    Gasabo: ["Maize", "Beans", "Sweet Potatoes", "Bananas"],
  };

  // Replace the existing handleDistrictChange function with this updated version
  const handleDistrictChange = (e) => {
    const value =
      e.target.value.charAt(0).toUpperCase() +
      e.target.value.slice(1).toLowerCase();
    setDistrict(value);
    // Reset crop when district changes
    setCrop("");
  };

  // Add this new function to get available crops for the selected district
  const getAvailableCrops = () => {
    if (!district || !districtCrops[district]) {
      return [];
    }
    return districtCrops[district];
  };

  const handleCreatePrediction = async (e) => {
    e.preventDefault();
    setCreateError("");
    setIsLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8000/irrigation/predict/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            district,
            crop,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setPredictionResult(data.prediction);
        // Add this line to refresh predictions after creation
        await fetchPredictions();
      } else {
        setCreateError(
          data.error || data.details || "Failed to create prediction"
        );
      }
    } catch (error) {
      setCreateError("Error creating prediction");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, []);



  const fetchPredictions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "http://localhost:8000/irrigation/predictions/",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPredictions(data.predictions || []);
      } else {
        setError("Failed to fetch predictions");
      }
    } catch (err) {
      setError("Error fetching predictions");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleteId(id);
    setIsDeleting(true);
    try {
      const response = await fetch(
        `http://localhost:8000/irrigation/prediction/delete/${id}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        setPredictions((prev) =>
          prev.filter((prediction) => prediction.id !== id)
        );
      } else {
        alert("Failed to delete prediction");
      }
    } catch (error) {
      alert("Error deleting prediction");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const handleViewDetails = (id) => {
    const prediction = predictions.find((pred) => pred.id === id);
    setSelectedPrediction(prediction);
    setShowModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, "0");

    return `${month} ${day}, ${year} ${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  const formatValue = (value) => {
    if (typeof value === "number") {
      return value.toFixed(2);
    }
    return value || "N/A";
  };

  const handleClose = () => {
    setShowCreateModal(false);
    setDistrict("");
    setPredictionResult(null);
    setCreateError("");
  };

  const renderMobileCard = (prediction) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-gray-900">
            {prediction.location || "N/A"}
          </h3>
          <p className="text-sm text-gray-500">
            {prediction.created_by?.email || "N/A"}
          </p>
          <p className="text-sm text-gray-500">
            {prediction.created_by?.phone_number || "N/A"}
          </p>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              prediction.status === "success"
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {prediction.status || "Unknown"}
          </span>
          <p className="text-xs text-gray-500">
            {formatDate(prediction.created_at)}
          </p>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-2">
        <button
          onClick={() => handleViewDetails(prediction.id)}
          className="p-2 text-green-700 hover:text-blue-800 rounded-lg hover:bg-blue-50"
        >
          <Eye className="h-5 w-5" />
        </button>
        <button
          onClick={() => handleDelete(prediction.id)}
          className="p-2 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50"
          disabled={isDeleting && deleteId === prediction.id}
        >
          {isDeleting && deleteId === prediction.id ? (
            <span className="animate-spin">↻</span>
          ) : (
            <Trash2 className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );

  const renderCharts = () => {
    if (predictions.length === 0) return null;

    const temperatureData = predictions.map((p) => ({
      location: p.location || "Unknown",
      temperature: parseFloat(p.temperature) || 0,
    }));

    const humidityData = predictions.map((p) => ({
      location: p.location || "Unknown",
      humidity: parseFloat(p.humidity) || 0,
    }));

    return (
      <div className="space-y-4">
        <div className="bg-white p-4 rounded-lg shadow h-64 border border-gray-100">
          <h3 className="text-sm font-semibold mb-2 text-gray-700">
            Temperature Trends
          </h3>
          <ResponsiveContainer width="100%" height="80%">
            <LineChart data={temperatureData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="location" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name="Temperature (°C)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded-lg shadow h-64 border border-gray-100">
          <h3 className="text-sm font-semibold mb-2 text-gray-700">
            Humidity Trends
          </h3>
          <ResponsiveContainer width="100%" height="80%">
            <LineChart data={humidityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="location" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="humidity"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name="Humidity (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const PredictionSkeleton = () => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 space-y-3 animate-pulse">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <div className="h-4 bg-gray-200 rounded-full w-16"></div>
          <div className="h-3 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
      <div className="flex justify-end space-x-2 pt-2">
        <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
        <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );

  

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
    setIsFilterOpen(false);
  };

  const FilterPanel = ({
    isOpen,
    setIsOpen,
    onApplyFilters, // This is now the handleApplyFilters from parent
    districts,
    crops,
    currentFilters,
  }) => {
    const [dateRange, setDateRange] = useState(currentFilters.dateRange);
    const [selectedDistricts, setSelectedDistricts] = useState(
      currentFilters.districts
    );
    const [selectedCrops, setSelectedCrops] = useState(currentFilters.crops);
    const [selectedSoilTypes, setSelectedSoilTypes] = useState(
      currentFilters.soilTypes
    );
    const [waterRequirementRange, setWaterRequirementRange] = useState(
      currentFilters.waterRequirementRange
    );
    const [sortBy, setSortBy] = useState(currentFilters.sortBy);

    // List of soil types for filtering
    const soilTypes = [
      "Clay",
      "Sandy",
      "Loamy",
      "Silty",
      "Peaty",
      "Chalky",
      "Clay Loam",
      "Sandy Loam",
    ];

    const handleApplyFilters = (newFilters) => {
      setFilters(newFilters);
      setCurrentPage(1); // Reset to first page when filters change
      setIsFilterOpen(false);
    };

    const handleClearFilters = () => {
      setDateRange({ from: "", to: "" });
      setSelectedDistricts([]);
      setSelectedCrops([]);
      setSelectedSoilTypes([]);
      setWaterRequirementRange({ min: "", max: "" });
      setSortBy("newest");
    };

    const toggleDistrict = (district) => {
      setSelectedDistricts((prev) =>
        prev.includes(district)
          ? prev.filter((d) => d !== district)
          : [...prev, district]
      );
    };

    const toggleCrop = (crop) => {
      setSelectedCrops((prev) =>
        prev.includes(crop) ? prev.filter((c) => c !== crop) : [...prev, crop]
      );
    };

    const toggleSoilType = (soilType) => {
      setSelectedSoilTypes((prev) =>
        prev.includes(soilType)
          ? prev.filter((st) => st !== soilType)
          : [...prev, soilType]
      );
    };

    return (
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className={`absolute right-0 top-0 h-full bg-white w-full max-w-md shadow-xl transform transition-transform ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <SlidersHorizontal className="h-5 w-5 mr-2 text-green-600" />
                Advanced Filters
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6">
              {/* Date Range Filter */}
              <div className="space-y-2">
                <h3 className="font-medium text-gray-700 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-green-600" />
                  Date Range
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-black">From</label>
                    <input
                      type="date"
                      value={dateRange.from}
                      onChange={(e) =>
                        setDateRange({ ...dateRange, from: e.target.value })
                      }
                      className="w-full text-black p-2 border rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-black">To</label>
                    <input
                      type="date"
                      value={dateRange.to}
                      onChange={(e) =>
                        setDateRange({ ...dateRange, to: e.target.value })
                      }
                      className="w-full text-black p-2 border rounded-md text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Districts Filter */}
              <div className="space-y-2">
                <h3 className="font-medium text-black">Districts</h3>
                <div className="max-h-36 overflow-y-auto border rounded-md p-2 bg-gray-50">
                  <div className="grid grid-cols-2 gap-2">
                    {Object.keys(districts).map((district) => (
                      <div key={district} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`district-${district}`}
                          checked={selectedDistricts.includes(district)}
                          onChange={() => toggleDistrict(district)}
                          className="mr-2 h-4 w-4 rounded text-green-600 focus:ring-green-500"
                        />
                        <label
                          htmlFor={`district-${district}`}
                          className="text-sm text-gray-700"
                        >
                          {district}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Crops Filter */}
              <div className="space-y-2">
                <h3 className="font-medium text-black">Crops</h3>
                <div className="max-h-36 overflow-y-auto border rounded-md p-2 bg-gray-50">
                  <div className="grid grid-cols-2 gap-2">
                    {crops.map((crop) => (
                      <div key={crop} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`crop-${crop}`}
                          checked={selectedCrops.includes(crop)}
                          onChange={() => toggleCrop(crop)}
                          className="mr-2 h-4 w-4 rounded text-green-600 focus:ring-green-500"
                        />
                        <label htmlFor={`crop-${crop}`} className="text-sm text-gray-700">
                          {crop}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Soil Types Filter */}
              <div className="space-y-2">
                <h3 className="font-medium text-black">Soil Types</h3>
                <div className="max-h-36 overflow-y-auto border rounded-md p-2 bg-gray-50">
                  <div className="grid grid-cols-2 gap-2">
                    {soilTypes.map((soilType) => (
                      <div key={soilType} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`soil-${soilType}`}
                          checked={selectedSoilTypes.includes(soilType)}
                          onChange={() => toggleSoilType(soilType)}
                          className="mr-2 h-4 w-4 rounded text-green-600 focus:ring-green-500"
                        />
                        <label htmlFor={`soil-${soilType}`} className="text-sm text-gray-700">
                          {soilType}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Water Requirement Range */}
              <div className="space-y-2">
                <h3 className="font-medium text-black">
                  Water Requirement (mm/day)
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-black">Min</label>
                    <input
                      type="number"
                      value={waterRequirementRange.min}
                      onChange={(e) =>
                        setWaterRequirementRange({
                          ...waterRequirementRange,
                          min: e.target.value,
                        })
                      }
                      className="w-full p-2 text-gray-700 border rounded-md text-sm"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-black">Max</label>
                    <input
                      type="number"
                      value={waterRequirementRange.max}
                      onChange={(e) =>
                        setWaterRequirementRange({
                          ...waterRequirementRange,
                          max: e.target.value,
                        })
                      }
                      className="w-full text-gray-700 p-2 border rounded-md text-sm"
                      placeholder="100"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Sort Options */}
              <div className="space-y-2">
                <h3 className="font-medium text-black flex items-center">
                  <ArrowDownUp className="h-4 w-4 mr-2 text-green-600" />
                  Sort By
                </h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-2 border rounded-md text-sm text-gray-700"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="water_high">
                    Water Requirement (High to Low)
                  </option>
                  <option value="water_low">
                    Water Requirement (Low to High)
                  </option>
                  <option value="location_asc">Location (A-Z)</option>
                  <option value="location_desc">Location (Z-A)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t mt-4 flex space-x-4">
              <button
                onClick={handleClearFilters}
                className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-800 font-medium"
              >
                Clear Filters
              </button>
              <button
                onClick={() =>
                  onApplyFilters({
                    dateRange,
                    districts: selectedDistricts,
                    crops: selectedCrops,
                    soilTypes: selectedSoilTypes,
                    waterRequirementRange,
                    sortBy,
                  })
                }
                className="flex-1 py-2 bg-green-600 hover:bg-green-700 rounded-md text-white font-medium"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  FilterPanel.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    setIsOpen: PropTypes.func.isRequired,
    onApplyFilters: PropTypes.func.isRequired,
    districts: PropTypes.object.isRequired,
    crops: PropTypes.arrayOf(PropTypes.string).isRequired,
  };

  const StatisticsCards = ({ predictions }) => {
    // Calculate statistics
    const totalPredictions = predictions.length;

    // Get unique districts (filter out null/undefined locations)
    const uniqueDistricts = [
      ...new Set(predictions.map((p) => p.location || "")),
    ].filter((location) => location).length;

    // Calculate average water requirement (handle null/undefined values)
    const avgWaterRequirement =
      predictions.length > 0
        ? (
            predictions.reduce((sum, p) => {
              const value = parseFloat(p.water_requirement) || 0;
              return sum + value;
            }, 0) / predictions.length
          ).toFixed(2)
        : "0.00";

    // Get most common crop with count
    const cropCounts = predictions.reduce((acc, p) => {
      const crop = p.predicted_crop || "Unknown";
      acc[crop] = (acc[crop] || 0) + 1;
      return acc;
    }, {});

    const [mostCommonCrop, cropCount] = Object.entries(cropCounts).sort(
      (a, b) => b[1] - a[1]
    )[0] || ["N/A", 0];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Predictions Card */}
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Total Predictions
              </h3>
              <p className="mt-1 text-2xl font-semibold text-gray-800">
                {totalPredictions}
              </p>
            </div>
            <div className="rounded-full bg-blue-100 p-2">
              <svg
                className="h-6 w-6 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Districts Card */}
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Unique Districts
              </h3>
              <p className="mt-1 text-2xl font-semibold text-gray-800">
                {uniqueDistricts}
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-2">
              <svg
                className="h-6 w-6 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Average Water Requirement Card */}
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-indigo-500 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Avg Water Required
              </h3>
              <p className="mt-1 text-2xl font-semibold text-gray-800">
                {avgWaterRequirement}{" "}
                <span className="text-sm font-normal text-gray-500">
                  mm/day
                </span>
              </p>
            </div>
            <div className="rounded-full bg-indigo-100 p-2">
              <svg
                className="h-6 w-6 text-indigo-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Most Common Crop Card */}
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-amber-500 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Most Common Crop
              </h3>
              <p className="mt-1 text-2xl font-semibold text-gray-800 truncate max-w-[150px]">
                {mostCommonCrop}
              </p>
              <p className="text-xs text-gray-500">{cropCount} predictions</p>
            </div>
            <div className="rounded-full bg-amber-100 p-2">
              <svg
                className="h-6 w-6 text-amber-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  };

  StatisticsCards.propTypes = {
    predictions: PropTypes.arrayOf(
      PropTypes.shape({
        location: PropTypes.string,
        water_requirement: PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.number,
        ]),
        predicted_crop: PropTypes.string,
        // Add other required props if needed
      })
    ).isRequired,
  };

  return (
    <div className="w-full px-12 ml-4">
      <h1 className="text-2xl font-bold mb-6 text-green-700 text-center relative inline-block">
        <span className="relative z-10">
          IRRIGATION STRATEGY PREDICTIONS MANAGEMENT
        </span>
        <span className="absolute bottom-0 left-0 w-full h-1 bg-green-200 rounded-full animate-underline"></span>
      </h1>

      {/* Top Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-2 md:space-y-0">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-gray-600 text-white rounded-md flex items-center space-x-2 hover:bg-green-700"
          >
            <Plus className="h-4 w-4" />
            <span>New Prediction</span>
          </button>

          <div className="relative group">
            <button
              onClick={() => setShowDownloadOptions(!showDownloadOptions)} // Add this line
              className="px-4 py-2 bg-green-600 text-white rounded-md flex items-center space-x-2 hover:bg-gray-700"
            >
              <Download className="h-4 w-4" />
              <span>Download</span>
            </button>
            {showDownloadOptions && (
              <div className="absolute z-10 mt-2 w-48 bg-white rounded-md shadow-lg">
                <div className="py-1">
                  <button
                    onClick={() => {
                      downloadPDF();
                      setShowDownloadOptions(false); // Changed to false to close dropdown after click
                    }}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    Download as PDF
                  </button>
                  <button
                    onClick={() => {
                      downloadExcel();
                      setShowDownloadOptions(false);
                    }}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    Download as Excel
                  </button>
                  <button
                    onClick={() => {
                      downloadCSV();
                      setShowDownloadOptions(false);
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

        <div className="relative w-full md:w-auto flex items-center">
          <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search predictions..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full md:w-64 text-gray-700 pl-10 pr-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            className="px-3 py-2 border-t border-r border-b border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100"
            onClick={() => setIsFilterOpen(true)}
          >
            <Filter className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {!loading && predictions.length > 0 && (
        <StatisticsCards predictions={predictions} />
      )}

      {loading && <p className="text-center text-gray-500">Loading...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!loading && predictions.length > 0 && (
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Table and Chart Wrapper */}
          <div className="flex flex-col lg:flex-row gap-4 w-full">
            {/* Table */}
            <div className="lg:w-2/3">
              {/* Mobile view */}
              <div className="lg:hidden space-y-4">
                {paginatedPredictions.map((prediction) =>
                  renderMobileCard(prediction)
                )}
              </div>

              {/* Desktop view */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-sm">
                  {/* Table Header */}
                  <thead className="bg-gradient-to-r from-green-700 to-green-800">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider rounded-tl-lg">
                        Location
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                        User Contact
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Soil Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Crop & Water Requirement
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Created At
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-white uppercase tracking-wider rounded-tr-lg">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedPredictions.map((prediction) => (
                      <tr
                        key={prediction.id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        {/* Keep existing cells but add better padding */}
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          {prediction.location || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-gray-900">
                              {prediction.created_by?.phone_number || "N/A"}
                            </div>
                            <div className="text-gray-500 text-sm">
                              {prediction.created_by?.email || "N/A"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${
                              prediction.status === "success"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {prediction.soil_type || "Unknown"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-gray-900">
                              {prediction.predicted_crop || "N/A"}
                            </div>
                            <div className="text-gray-500 text-sm">
                              {prediction.water_requirement + " mm/day" ||
                                "N/A"}
                            </div>
                            <div className="text-green-700 text-sm">
                              {prediction.irrigation_strategy || "N/A"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          <span className="text-gray-700">
                            {formatDate(prediction.created_at)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleViewDetails(prediction.id)}
                              className="p-2 text-green-700 hover:text-blue-800 rounded-full hover:bg-blue-50"
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(prediction.id)}
                              className="p-2 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50"
                              disabled={
                                isDeleting && deleteId === prediction.id
                              }
                            >
                              {isDeleting && deleteId === prediction.id ? (
                                <span className="animate-spin">↻</span>
                              ) : (
                                <Trash2 className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Chart */}
            <div className="lg:w-1/3">{renderCharts()}</div>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center mt-4 space-y-2 md:space-y-0">
        <select
          value={rowsPerPage}
          onChange={(e) => {
            setRowsPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="border rounded-md px-2 py-1 text-gray-700"
        >
          {rowsOptions.map((option) => (
            <option key={option} value={option}>
              {option} rows
            </option>
          ))}
        </select>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
          >
            <ChevronLeft className="h-5 w-5 text-blue-700" />
          </button>
          <span className="text-gray-700">
            Page {currentPage} of {Math.max(1, totalPages)}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
            className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
          >
            <ChevronRight className="h-5 w-5 text-blue-700" />
          </button>
        </div>
      </div>

      {/* Create Prediction Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-md rounded-lg bg-white shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-green-900 text-xl font-bold">
              {predictionResult
                ? "Prediction Results"
                : "Create New Prediction"}
            </DialogTitle>
          </DialogHeader>

          {!predictionResult ? (
            <form onSubmit={handleCreatePrediction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  District
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={handleDistrictChange}
                  className="mt-1 text-gray-700 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  disabled={isLoading}
                  placeholder="Enter district name"
                  list="districts"
                />
                <datalist id="districts">
                  {Object.keys(districtCrops).map((dist) => (
                    <option key={dist} value={dist} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Crop
                </label>
                <select
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm 
              focus:border-blue-500 focus:ring-blue-500 text-gray-700
              ${!district && "bg-gray-100 cursor-not-allowed"}`}
                  required
                  disabled={!district || isLoading}
                >
                  <option value="">Select a crop</option>
                  {getAvailableCrops().map((cropOption) => (
                    <option key={cropOption} value={cropOption}>
                      {cropOption}
                    </option>
                  ))}
                </select>
                {!district && (
                  <p className="mt-1 text-sm text-gray-500">
                    Please select a district first
                  </p>
                )}
              </div>

              {createError && (
                <p className="text-red-500 text-sm">{createError}</p>
              )}

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-green-700 rounded-md hover:bg-black disabled:opacity-50"
                  disabled={isLoading || !district || !crop}
                >
                  {isLoading ? "Processing..." : "Create"}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium text-gray-500">
                    Location:
                  </div>
                  <div className="text-sm text-gray-900">
                    {predictionResult.location}
                  </div>

                  <div className="text-sm font-medium text-gray-500">
                    Soil Type:
                  </div>
                  <div className="text-sm text-gray-900">
                    {predictionResult.soil_type}
                  </div>

                  <div className="text-sm font-medium text-gray-500">
                    Submitted Crop:
                  </div>
                  <div className="text-sm text-gray-900">
                    {predictionResult.predicted_crop}
                  </div>

                  <div className="text-sm font-medium text-gray-500">
                    Water Requirement:
                  </div>
                  <div className="text-sm text-gray-900">
                    {predictionResult.water_requirement} mm/day
                  </div>

                  <div className="text-sm font-medium text-gray-500">
                    Irrigation Strategy:
                  </div>
                  <div className="text-sm text-gray-900">
                    {predictionResult.irrigation_strategy}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-700 rounded-md hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-4xl h-full overflow-y-auto bg-white rounded-lg shadow-xl">
          <div className="sticky top-0 bg-white p-4 border-b border-gray-200 z-10 mt-16">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Prediction Details
              </DialogTitle>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {selectedPrediction && (
            <div className="p-6 space-y-6 mt-24">
              {/* Location Information */}
              <div className="bg-gray-50 p-4 rounded-lg py-12">
                <h3 className="font-semibold mb-3 text-gray-900">
                  Location Information
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-medium text-blue-600">
                      {selectedPrediction.location}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Coordinates</p>
                    <p className="font-medium text-blue-600">
                      {formatValue(selectedPrediction.latitude)},{" "}
                      {formatValue(selectedPrediction.longitude)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Elevation</p>
                    <p className="font-medium text-blue-600">
                      {formatValue(selectedPrediction.elevation)} m
                    </p>
                  </div>
                </div>
              </div>

              {/* Weather Conditions */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 text-gray-900">
                  Weather Conditions
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Temperature</p>
                    <p className="font-medium text-blue-600">
                      {formatValue(selectedPrediction.temperature)}°C
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Humidity</p>
                    <p className="font-medium text-blue-600">
                      {formatValue(selectedPrediction.humidity)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Wind Speed</p>
                    <p className="font-medium text-blue-600">
                      {formatValue(selectedPrediction.wind_speed)} m/s
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Rainfall</p>
                    <p className="font-medium text-blue-600">
                      {formatValue(selectedPrediction.rainfall)} mm
                    </p>
                  </div>
                </div>
              </div>

              {/* Soil Properties */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 text-gray-900">
                  Soil Properties
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Soil Type</p>
                    <p className="font-medium text-blue-600">
                      {selectedPrediction.soil_type}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">pH</p>
                    <p className="font-medium text-blue-600">
                      {formatValue(selectedPrediction.ph)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      Water Holding Capacity
                    </p>
                    <p className="font-medium text-blue-600">
                      {formatValue(selectedPrediction.water_holding_capacity)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      Electrical Conductivity
                    </p>
                    <p className="font-medium text-blue-600">
                      {formatValue(selectedPrediction.electrical_conductivity)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Nutrients */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 text-gray-900">
                  Soil Nutrients
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Nitrogen</p>
                    <p className="font-medium text-blue-600">
                      {formatValue(selectedPrediction.nitrogen)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phosphorus</p>
                    <p className="font-medium text-blue-600">
                      {formatValue(selectedPrediction.phosphorus)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Potassium</p>
                    <p className="font-medium text-blue-600">
                      {formatValue(selectedPrediction.potassium)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Zinc</p>
                    <p className="font-medium text-blue-600">
                      {formatValue(selectedPrediction.zinc)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Predictions */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 text-gray-900">
                  Predictions & Recommendations
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Predicted Crop</p>
                    <p className="font-medium text-blue-600">
                      {selectedPrediction.predicted_crop}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Water Requirement</p>
                    <p className="font-medium text-blue-600">
                      {formatValue(selectedPrediction.water_requirement)} mm/day
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Irrigation Strategy</p>
                    <p className="font-medium text-blue-600">
                      {selectedPrediction.irrigation_strategy}
                    </p>
                  </div>
                </div>
              </div>
              {/* User Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 text-blue-700">
                  User Information
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Phone Number</p>
                    <p className="font-medium text-blue-700">
                      {selectedPrediction.created_by?.phone_number}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-blue-700">
                      {selectedPrediction.created_by?.email}
                    </p>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Created At</p>
                    <p className="font-medium text-blue-700">
                      {formatDate(selectedPrediction.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add this right before the final closing </div> */}
      <FilterPanel
        isOpen={isFilterOpen}
        setIsOpen={setIsFilterOpen}
        onApplyFilters={handleApplyFilters}
        districts={districtCrops}
        crops={validCrops}
        currentFilters={filters}
      />
    </div>
  );
};

export default AdminManageIrrigationPredictions;
