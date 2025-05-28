/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import loginImage from "../../assets/pictures/logo.png";
import { X } from 'lucide-react';
import { 
  FaUserCircle, 
  FaUsers, 
  FaSignOutAlt, 
  FaHome,
  FaChartLine,
  FaComments,
  FaUser
} from "react-icons/fa";
import { MdDashboard, MdFeedback } from "react-icons/md";
import { BsEvStationFill } from "react-icons/bs";
import { Menu } from "lucide-react";

function UserLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState({ predictions: [] });
  const [notificationCount, setNotificationCount] = useState(0);
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = () => {
    setIsMenuOpen(false);
    localStorage.removeItem("userData");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleHome = () => {
    setIsMenuOpen(false);
    navigate("/");
  };

  const userData = JSON.parse(localStorage.getItem('userData')) || {};
  const userId = userData.id || '';

  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchAllData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const predictionsRes = await Promise.all([
          fetch('http://127.0.0.1:8000/irrigation/my-predictions/', { headers }).then(res => res.json()),
        ]);

        const today = new Date();
        const todayPredictions = predictionsRes?.predictions?.filter(prediction => 
          isSameDay(new Date(prediction.created_at), today)
        ) || [];

        setNotifications({ predictions: todayPredictions });
        setNotificationCount(todayPredictions.length);
      } catch (error) {
        console.error('Error fetching data:', error);
        if (error.status === 401) {
          handleLogout();
        }
      }
    };

    fetchAllData();

    const userData = JSON.parse(localStorage.getItem("userData"));
    if (userData?.phone) {
      setPhone(userData.phone);
    }
  }, []);

  const isSameDay = (date1, date2) => {
    return date1.toDateString() === date2.toDateString();
  };

  const handleLinkClick = (path) => {
    setIsMenuOpen(false);
    window.location.href = path;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 overflow-x-auto">
      {/* Navigation */}
      <nav className="bg-green-700 shadow-lg sticky top-0 z-50">
        <div className="max-w-[2000px] mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <img src={loginImage} alt="Driver Logo" className="h-10 w-10 rounded-full cursor-pointer" onClick={handleHome} />
            </div>

            {/* Mobile menu button */}
            <button
              onClick={toggleMenu}
              className="md:hidden inline-flex items-center justify-center p-2 text-white"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-4">
              <button
                onClick={() => handleLinkClick('/user')}
                className="px-4 py-2 text-white hover:bg-green-600 rounded-md flex items-center space-x-2 transition-colors duration-200"
              >
                <FaHome className="text-xl" />
                <span>Home</span>
              </button>
              
              <button
                onClick={() => handleLinkClick('/user/predictions')}
                className="px-4 py-2 text-white hover:bg-green-600 rounded-md flex items-center space-x-2 transition-colors duration-200"
              >
                <FaChartLine className="text-xl" />
                <span>Predictions</span>
              </button>

              <button
                onClick={() => handleLinkClick('/user/feedbacks')}
                className="px-4 py-2 text-white hover:bg-green-600 rounded-md flex items-center space-x-2 transition-colors duration-200"
              >
                <MdFeedback className="text-xl" />
                <span>Feedback</span>
              </button>

              <button
                onClick={() => handleLinkClick(`/user/profile/${userId}`)}
                className="px-4 py-2 text-white hover:bg-green-600 rounded-md flex items-center space-x-2 transition-colors duration-200"
              >
                <FaUser className="text-xl" />
                <span>Profile</span>
              </button>
              
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-white hover:bg-red-600 rounded-md flex items-center space-x-2 transition-colors duration-200"
              >
                <FaSignOutAlt className="text-xl" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation - Left Side */}
        <div
          className={`${
            isMenuOpen ? 'block' : 'hidden'
          } md:hidden fixed inset-y-0 left-0 w-64 bg-green-700 shadow-lg transform transition-transform duration-300 ease-in-out ${
            isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Close button */}
          <button
            onClick={() => setIsMenuOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-green-200"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="flex flex-col pt-16 space-y-1">
            <button
              onClick={() => handleLinkClick('/user')}
              className="px-6 py-3 text-sm font-medium text-white hover:bg-green-600 text-left flex items-center space-x-2 transition-colors duration-200"
            >
              <FaHome className="text-lg" />
              <span>Home</span>
            </button>
            
            <button
              onClick={() => handleLinkClick('/user/predictions')}
              className="px-6 py-3 text-sm font-medium text-white hover:bg-green-600 text-left flex items-center space-x-2 transition-colors duration-200"
            >
              <FaChartLine className="text-lg" />
              <span>Predictions</span>
            </button>

            <button
              onClick={() => handleLinkClick('/user/feedbacks')}
              className="px-6 py-3 text-sm font-medium text-white hover:bg-green-600 text-left flex items-center space-x-2 transition-colors duration-200"
            >
              <MdFeedback className="text-lg" />
              <span>Feedback</span>
            </button>
            
            <button
              onClick={() => handleLinkClick(`/user/profile/${userId}`)}
              className="px-6 py-3 text-sm font-medium text-white hover:bg-green-600 text-left flex items-center space-x-2 transition-colors duration-200"
            >
              <FaUser className="text-lg" />
              <span>Profile</span>
            </button>
            
            <button
              onClick={handleLogout}
              className="px-6 py-3 text-sm font-medium text-white hover:bg-red-600 text-left flex items-center space-x-2 transition-colors duration-200"
            >
              <FaSignOutAlt className="text-lg" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 w-full max-w-[2000px] mx-auto px-4 py-6 overflow-y-auto">
        <main className="w-full bg-white rounded-lg shadow-md">
          <Outlet />
        </main>
      </div>

      {/* Notifications Modal */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-green-700">Today Notifications</h2>
              <button 
                onClick={() => setShowNotifications(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Prediction Notifications */}
              <div className="border-b pb-2">
                <h3 className="font-semibold text-lg mb-2 text-blue-700">Prediction Expenses ({notifications.predictions.length})</h3>
                {notifications.predictions.map((prediction, index) => (
                  <div key={index} className="text-sm text-gray-600 mb-1">
                    {prediction.district} - {prediction.status}
                  </div>
                ))}
                {notifications.predictions.length === 0 && (
                  <p className="text-sm text-gray-500">No new predictions today</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserLayout;