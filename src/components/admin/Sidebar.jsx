/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { 
  FaUsers, 
  FaUserCircle, 
  FaSignOutAlt, 
  FaChartLine,
  FaUser
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { BsEvStationFill } from "react-icons/bs";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../../assets/pictures/logo.png";

function Sidebar() {
  const [activeLink, setActiveLink] = useState(null);
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");

  // Retrieve user data from local storage
  const userData = JSON.parse(localStorage.getItem("userData")) || {};
  const userId = userData.id || ""; // Fallback to an empty string if no id is found

  useEffect(() => {
    // Retrieve user data from localStorage
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (userData && userData.phone) {
      setPhone(userData.phone);
    }
    console.log("Retrieved user data:", userData);
  }, []);

  const handleLinkClick = (index) => {
    setActiveLink(index);
  };

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem("userData");
    localStorage.removeItem("token");

    // Redirect to the login page
    navigate("/");
  };

  const Sidebar_Links = [
    { 
      id: 1, 
      name: "Dashboard", 
      path: "/admin", 
      icon: <MdDashboard className="text-xl" />
    },
    { 
      id: 2, 
      name: "Users", 
      path: "/admin/users", 
      icon: <FaUsers className="text-xl" />
    },
    { 
      id: 3, 
      name: "Predictions", 
      path: "/admin/predictions", 
      icon: <FaChartLine className="text-xl" />
    },
    { 
      id: 4, 
      name: "Profile", 
      path: `/admin/profile/${userId}`, 
      icon: <FaUser className="text-xl" />
    },
  ];

  return (
    <div className="h-screen bg-gray-800 text-white w-16 md:w-64 transition-all duration-300 flex flex-col">
      {/* Sidebar Logo */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-center md:justify-start">
          <img 
            src={Logo} 
            alt="Logo" 
            className="w-8 h-8 md:w-10 md:h-10"
          />
          <span className="hidden md:block ml-3 text-lg font-semibold">
            Admin Panel
          </span>
        </div>
      </div>

      {/* Sidebar Links */}
      <div className="flex-1 py-4">
        {Sidebar_Links.map((link, index) => (
          <div key={link.id} className="px-2 mb-2">
            <Link
              to={link.path}
              className={`flex items-center justify-center md:justify-start p-3 rounded-lg transition-colors duration-200 hover:bg-gray-700 ${
                activeLink === index ? "bg-blue-600" : ""
              }`}
              onClick={() => handleLinkClick(index)}
            >
              <div className="flex items-center justify-center w-6">
                {link.icon}
              </div>
              {/* Show text only on medium and larger screens */}
              <span className="hidden md:block ml-3 text-sm font-medium">
                {link.name}
              </span>
            </Link>
          </div>
        ))}

        {/* Logout Button */}
        <div className="px-2 mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center md:justify-start w-full p-3 rounded-lg transition-colors duration-200 hover:bg-red-600 text-red-300 hover:text-white"
          >
            <div className="flex items-center justify-center w-6">
              <FaSignOutAlt className="text-xl" />
            </div>
            {/* Show text only on medium and larger screens */}
            <span className="hidden md:block ml-3 text-sm font-medium">
              Logout
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;