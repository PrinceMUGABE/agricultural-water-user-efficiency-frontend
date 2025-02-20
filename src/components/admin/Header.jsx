/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { FaUserCircle, FaUsers, FaSignOutAlt } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { BsEvStationFill } from "react-icons/bs";
import { X, Menu } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../../assets/pictures/logo.png";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();

  // Retrieve user data from local storage
  const userData = JSON.parse(localStorage.getItem("userData")) || {};
  const userId = userData.id || "";

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (userData && userData.phone) {
      setPhone(userData.phone);
    }
  }, []);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("userData");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const Navbar_Links = [
    { id: 1, name: "Dashboard", path: "/admin", icon: <MdDashboard className="text-xl" /> },
    { id: 2, name: "Users", path: "/admin/users", icon: <FaUsers className="text-xl" /> },
    { id: 3, name: "Predictions", path: "/admin/predictions", icon: <BsEvStationFill className="text-xl" /> },
    { id: 4, name: "Profile", path: `/admin/profile/${userId}`, icon: <FaUserCircle className="text-xl" /> },
  ];

  return (
    <nav className="bg-green-900 shadow-lg py-4">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <img src={Logo} alt="Logo" className="h-12 w-auto" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-between space-x-8">
            {Navbar_Links.map((link) => (
              <Link
                key={link.id}
                to={link.path}
                className="text-white hover:text-blue-200 flex items-center space-x-2"
              >
                <span>{link.icon}</span>
                <span>{link.name}</span>
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="text-white hover:text-blue-200 flex items-center space-x-2"
            >
              <FaSignOutAlt className="text-xl" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-blue-200 focus:outline-none"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-green-900 transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b border-green-800">
          <h2 className="text-white text-lg font-semibold">Menu</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white hover:text-blue-200 focus:outline-none"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="flex flex-col space-y-4 p-4">
          {Navbar_Links.map((link) => (
            <Link
              key={link.id}
              to={link.path}
              className="text-white hover:text-blue-200 flex items-center space-x-3 p-2 rounded-md hover:bg-green-800"
              onClick={() => setIsOpen(false)}
            >
              <span>{link.icon}</span>
              <span>{link.name}</span>
            </Link>
          ))}
          <button
            onClick={() => {
              handleLogout();
              setIsOpen(false);
            }}
            className="text-white hover:text-blue-200 flex items-center space-x-3 p-2 rounded-md hover:bg-green-800"
          >
            <FaSignOutAlt className="text-xl" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Overlay for mobile menu */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </nav>
  );
};

export default Header;