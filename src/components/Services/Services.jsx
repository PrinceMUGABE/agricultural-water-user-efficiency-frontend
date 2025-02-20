/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { Droplet, CloudRain, Sprout, ChevronLeft, ChevronRight } from "lucide-react";

const servicesData = [
  {
    name: "Crop Prediction",
    icon: <Sprout className="w-8 h-8 text-black" />,
    link: "#",
    description: "Accurately predict the best crop for your soil and climate conditions using advanced analytics, ensuring optimized yields and profitability.",
    aosDelay: "0",
  },
  {
    name: "Water Requirement Analysis",
    icon: <CloudRain className="w-8 h-8 text-black" />,
    link: "#",
    description: "Get precise insights into water needs for your crops, enabling efficient irrigation practices and conservation of water resources.",
    aosDelay: "300",
  },
  {
    name: "Irrigation Strategy Recommendations",
    icon: <Droplet className="w-8 h-8 text-black" />,
    link: "#",
    description: "Receive tailored irrigation strategies to enhance water use efficiency, improve crop health, and minimize resource wastage.",
    aosDelay: "500",
  },
];

const Services = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const servicesPerPage = 3;

  const indexOfLastService = currentPage * servicesPerPage;
  const indexOfFirstService = indexOfLastService - servicesPerPage;
  const currentServices = servicesData.slice(indexOfFirstService, indexOfLastService);
  const totalPages = Math.ceil(servicesData.length / servicesPerPage);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const drag = startX - e.pageX;
    if (Math.abs(drag) > 50) {
      if (drag > 0 && currentPage < totalPages) {
        setCurrentPage((prev) => prev + 1);
      } else if (drag < 0 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }
      setIsDragging(false);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleGetStarted = () => {
    window.location.href = "/login";
  };

  return (
    <section id="service">
      <div className="bg-gray-100 dark:text-white py-12 sm:grid sm:place-items-center">
        <div className="container">
          <div className="pb-12 text-center space-y-3">
            <div className="bg-gray-300 py-2 mt-2">
              <h1 data-aos="fade-up" className="text-3xl font-semibold sm:text-3xl text-black dark:text-black">
                Explore Our Services
              </h1>
            </div>
          </div>

          <div
            className="relative"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 transition-all duration-300">
              {currentServices.map((service) => (
                <div
                  key={service.name}
                  data-aos="fade-up"
                  data-aos-delay={service.aosDelay}
                  className="card space-y-3 sm:space-y-4 p-4"
                >
                  <div>{service.icon}</div>
                  <h1 className="text-lg font-semibold text-black">{service.name}</h1>
                  <p className="text-gray-600 dark:text-gray-400">{service.description}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-end items-center space-x-4 mt-8">
              <button
                onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                className={`p-2 rounded-full ${currentPage === 1 ? "text-gray-300" : "text-green-700 hover:bg-gray-200"}`}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                className={`p-2 rounded-full ${currentPage === totalPages ? "text-gray-300" : "text-green-700 hover:bg-gray-200"}`}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div
            data-aos="fade-up"
            data-aos-delay="900"
            data-aos-offset="0"
            className="text-center mt-8"
          >
            <button
              onClick={handleGetStarted}
              className="primary-btn bg-green-950 hover:bg-gray-700 hover:text-white"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
