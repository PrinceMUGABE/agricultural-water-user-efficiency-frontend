/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { FaUsers, FaUserCircle, FaSignOutAlt } from "react-icons/fa";
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
    { id: 1, name: "Dashboard", path: "/admin", icon: <MdDashboard /> },
    { id: 2, name: "Users", path: "/admin/users", icon: <FaUsers /> },
    { id: 3, name: "Predictions", path: "/admin/predictions", icon: <BsEvStationFill /> },
    { id: 4, name: "Profile", path: `/admin/profile/${userId}`, icon: <FaUserCircle /> },
  ];

  return (
    <div className="w-8 md:w-56 fixed left-0 top-0 z-10 h-screen bg-green-900 shadow-md overflow-y-auto mr-12">
      {/* Sidebar Logo */}
      <div className="mb-8 flex justify-center md:block">
        <img src={Logo} alt="Logo" className="ml-8 w-10 md:w-20 py-6" />
      </div>

      {/* Sidebar Links */}
      <ul className="mt-6 space-y-6">
        {Sidebar_Links.map((link, index) => (
          <li key={index} className="relative">
            <div
              className={`font-medium rounded-md py-2 px-5 hover:bg-gray-100 hover:text-indigo-500 ${
                activeLink === index ? "bg-indigo-100 text-indigo-500" : ""
              }`}
              onClick={() => handleLinkClick(index)}
            >
              <div className="flex items-center justify-between">
                <Link
                  to={link.path || "#"}
                  className="flex items-center justify-center md:justify-start md:space-x-5"
                >
                  <span className="text-indigo-500">{link.icon}</span>
                  {/* Show text only on medium and larger screens */}
                  <span className="text-sm text-white hover:text-blue-700 md:flex hidden">
                    {link.name}
                  </span>
                </Link>
              </div>
            </div>
          </li>
        ))}

        {/* Logout Button */}
        <li className="relative">
          <div
            className="font-medium rounded-md py-2 px-5 hover:bg-gray-100 hover:text-indigo-500"
            onClick={handleLogout}
          >
            <div className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center justify-center md:justify-start md:space-x-5">
                <span className="text-indigo-500">
                  <FaSignOutAlt />
                </span>
                {/* Show text only on medium and larger screens */}
                <span className="text-sm text-white hover:text-blue-700 md:flex hidden">
                  Logout
                </span>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
