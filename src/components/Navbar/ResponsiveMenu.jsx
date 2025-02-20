/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
// ResponsiveMenu.jsx
import React from "react";
import { MenuLinks } from "./Navbar";

const ResponsiveMenu = ({ showMenu, setShowMenu }) => {
  const handleLinkClick = (e) => {
    setShowMenu(false); // Close the menu when a link is clicked
  };

  const handleLinkedInClick = (e) => {
    e.preventDefault(); // Prevent React Router from trying to handle this
    setShowMenu(false); // Close the menu
    window.open('https://www.linkedin.com/in/mugabe-prince-2b377621b/', '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className={`${
        showMenu ? "left-0" : "-left-[100%]"
      } fixed bottom-0 top-0 z-20 flex h-screen w-[75%] flex-col justify-between bg-green-700 text-white px-8 pb-6 pt-16 transition-all duration-200 md:hidden rounded-r-xl shadow-md`}
    >
      <div className="card">
        <nav className="mt-12 ">
          <ul className="space-y-4 text-xl">
            {MenuLinks.map((data) => (
              <li key={data.name}>
                <a 
                  href={data.link} 
                  className="mb-5 inline-block"
                  onClick={handleLinkClick}
                >
                  {data.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="footer mt-8">
        <h1>
          By{" "}
          <a 
            href="https://www.linkedin.com/in/mugabe-prince-2b377621b/"
            onClick={handleLinkedInClick}
            className="hover:text-gray-300 underline"
          >
            Nicole UWIKUNDA
          </a>
        </h1>
      </div>
    </div>
  );
};

export default ResponsiveMenu;