/* eslint-disable no-unused-vars */
import React from "react";
import hero from "../../assets/pictures/tea2.png";

const Hero = () => {
  const handleGetStarted = () => {
    // Navigate to the /login route
    window.location.href = "/login";
  };

  return (
    <div
      className="bg-gradient-to-b from-gray-100 to-gray-200 pt-36 relative"
      id="home"
      style={{
        backgroundImage: `url(${hero})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh", // Ensures the background covers the full height
      }}
    >
      {/* Optional overlay to improve text readability */}
      <div className="absolute inset-0 bg-black/40 px-4"></div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 place-items-center px-16 ml-8 mt-16">
        {/* Text section with enhanced visibility */}
        <h1
          data-aos="fade-up"
          className="text-4xl sm:text-5xl font-bold text-white leading-tight"
        >
          Enhancing Agricultural Sustainability with{" "}
          <span className="text-black extrabold">
            Agricultural Water Use Efficiency Platform
          </span>
        </h1>{" "}
        <br />
        <p
          data-aos="fade-up"
          data-aos-delay="300"
          className="text-white text-lg leading-relaxed py-4"
        >
          Our platform leverages data-driven insights to optimize irrigation,
          improve water efficiency, and promote sustainable farming practices.
          Empowering farmers to make informed decisions for better yields and
          resource conservation.
        </p>{" "}
        <br />
        <div data-aos="fade-up" data-aos-delay="400" className="pt-4 mb-8">
          <div
            data-aos="fade-up"
            data-aos-delay="900"
            data-aos-offset="0"
            className="text-center mt-8"
          >
            <button
              onClick={handleGetStarted}
              className="primary-btn bg-white text-black hover:bg-gray-700 hover:text-white"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
