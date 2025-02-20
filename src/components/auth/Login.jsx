/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/20/solid";
import axios from "axios";
import loginImage from "../../assets/pictures/tea1.jpg";

const Login = () => {
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validatePhone = (phone) => {
    const phoneRegex = /^(078|072|079|073)\d{7}$/;
    return phoneRegex.test(phone);
  };

  const validatePassword = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isValidLength = password.length >= 8;

    return (
      hasUpperCase &&
      hasLowerCase &&
      hasDigit &&
      hasSpecialChar &&
      isValidLength
    );
  };

  const handlePhoneChange = (e) => {
    const newPhone = e.target.value;
    setPhone(newPhone);

    if (newPhone && !validatePhone(newPhone)) {
      setError(
        "Phone number must be 10 digits and start with 078, 072, 079, or 073."
      );
    } else {
      setError("");
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    if (!validatePhone(phone)) {
      setError(
        "Phone number must be 10 digits and start with 078, 072, 079, or 073."
      );
      return;
    }

    if (!validatePassword(password)) {
      setError(
        "Password must be at least 8 characters long, and include at least one uppercase letter, one lowercase letter, one digit, and one special character."
      );
      return;
    }

    setIsLoading(true);

    axios
      .post(
        "http://127.0.0.1:8000/login/",
        { phone, password },
        { headers: { "Content-Type": "application/json" } }
      )
      .then((res) => {
        setIsLoading(false);

        if (res.data) {
          const user = {
            id: res.data.id,
            role: res.data.role,
            email: res.data.email,
            created_at: res.data.created_at,
            phone: res.data.phone_number,
            refresh_token: res.data.token.refresh,
            access_token: res.data.token.access,
          };

          localStorage.setItem("userData", JSON.stringify(user));
          localStorage.setItem("token", res.data.token.access);

          if (user.role.trim().toLowerCase() === "admin") {
            navigate("/admin");
          } else if (user.role.trim().toLowerCase() === "user") {
            navigate("/user");
          } else {
            console.log("Unknown user role. Please contact support.");
          }
        } else {
          console.log("No data received from the API.");
        }
      })
      .catch((error) => {
        setIsLoading(false);
        console.error(
          "Error during login:",
          error.response || error.message || error
        );
        setError("Invalid phone number or password.");
      });
  };

  return (
    <div className="relative flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 px-4 sm:px-6 lg:px-8">
      {/* Background Image and Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-50"
        style={{ backgroundImage: `url(${loginImage})` }}
      ></div>

      <div className="max-w-md w-full space-y-8 bg-white bg-opacity-90 rounded-lg shadow-lg p-8 z-10">
        <div className="text-center">
          <h2 className="mt-2 text-2xl font-bold text-gray-900">
            Login to Your Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your credentials to access the system.
          </p>
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <form className="mt-6 space-y-6" onSubmit={handleLogin}>
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700"
            >
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              type="text"
              value={phone}
              onChange={handlePhoneChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-700"
              required
            />
          </div>

          <Link
            to="/passwordreset"
            className="text-sm text-green-700 hover:text-black text-end"
          >
            Forgot your password?
          </Link>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="relative mt-1">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block text-gray-700 w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
              <span
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </span>
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-700 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  ></path>
                </svg>
              ) : (
                "Sign In"
              )}
            </button>
          </div>
        </form>

        <div className="mt-3 text-sm text-gray-600">
          Do not have an account?{" "}
          <Link to="/signup" className="text-green-700 hover:text-black">
            Signup here
          </Link>
        </div>

        <div className="text-start">
          <Link to="/" className="text-sm text-green-700 hover:text-black">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
