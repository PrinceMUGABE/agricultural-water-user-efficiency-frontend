/* eslint-disable no-unused-vars */
// Navbar.jsx
import React, { useState } from "react";
import { HiMenuAlt3, HiMenuAlt1 } from "react-icons/hi";
import ResponsiveMenu from "./ResponsiveMenu";
import Logo from "../../assets/pictures/logo.png";
import { Link, useNavigate } from "react-router-dom";

export const MenuLinks = [
  { id: 1, name: "Home", link: "/#home" },
  { id: 2, name: "About", link: "/#about" },
  { id: 3, name: "Services", link: "/#service" },
  { id: 4, name: "Contact", link: "/#contact" },
  { id: 5, name: "Partners", link: "/#partner" },
];

const Navbar = () => {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setShowMenu(!showMenu);

  const handleLoginClick = () => navigate("/login");

  return (
    <div className="fixed top-0 left-0 right-0 z-10 w-full bg-white text-black">
      <div className="container py-3 md:py-2">
        <div className="flex justify-between items-center">
          {/* Logo section */}
          <a href="#home" className="flex items-center gap-3 bg-white p-1 rounded">
            <img src={Logo} alt="Logo" className="w-24" />
            <span className="text-2xl sm:text-3xl font-semibold">AWUEP</span>
          </a>
          
          {/* Desktop view Navigation */}
          <nav className="hidden md:block">
            <ul className="flex items-center gap-8">
              {MenuLinks.map(({ id, name, link }) => (
                <li key={id} className="py-4">
                  <a
                    href={link}
                    className="text-lg font-medium hover:text-green-700 py-2 hover:border-b-2 hover:border-black transition-colors duration-500"
                  >
                    {name}
                  </a>
                </li>
              ))}
              {/* Login Button */}
              <li className="py-4">
                <button
                  onClick={handleLoginClick}
                  className="bg-green-700 text-white py-2 px-4 rounded hover:bg-black transition-colors duration-300"
                >
                  Login
                </button>
              </li>
            </ul>
          </nav>

          {/* Mobile view Drawer */}
          <div className="flex items-center gap-4 md:hidden">
            {showMenu ? (
              <HiMenuAlt1
                onClick={toggleMenu}
                className="cursor-pointer transition-all"
                size={30}
              />
            ) : (
              <HiMenuAlt3
                onClick={toggleMenu}
                className="cursor-pointer transition-all"
                size={30}
              />
            )}
          </div>
        </div>
      </div>
      <ResponsiveMenu showMenu={showMenu} setShowMenu={setShowMenu} />
    </div>
  );
};

export default Navbar;
