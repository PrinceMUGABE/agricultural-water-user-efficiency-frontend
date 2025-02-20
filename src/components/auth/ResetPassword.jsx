/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import loginImage from "../../assets/pictures/tea2.png";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    phone: '',
    new_password: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getCsrfToken = () => {
    let csrfToken = null;
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      if (cookie.trim().startsWith('csrftoken=')) {
        csrfToken = cookie.trim().split('=')[1];
        break;
      }
    }
    return csrfToken;
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^(078|079|072|073)\d{7}$/;
    return phoneRegex.test(phone) && phone.length === 10;
  };

  const validatePassword = (password) => {
    const minLength = 5;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);

    return password.length >= minLength && hasSpecialChar && hasUppercase && hasLowercase && hasNumber;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    if (!validatePhone(formData.phone)) {
      setIsLoading(false);
      setError('Phone number must be exactly 10 digits and start with 078, 079, 072, or 073.');
      return;
    }

    if (!validatePassword(formData.new_password)) {
      setIsLoading(false);
      setError('Password must be at least 5 characters long, contain a special character, an uppercase letter, a lowercase letter, and a number.');
      return;
    }

    const csrfToken = getCsrfToken();
    try {
      const response = await axios.post('http://127.0.0.1:8000/forget_password/', formData, {
        headers: {
          'X-CSRFToken': csrfToken,
        },
      });

      setIsLoading(false);

      if (response.data.message === "Password reset successfully. A confirmation has been sent to your email.") {
        setMessage('Password reset successfully. Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError('An unexpected response was received.');
      }
    } catch (error) {
      setIsLoading(false);
      if (error.response) {
        if (error.response.status === 404) {
          setError('Phone number not found.');
        } else if (error.response.data && error.response.data.error) {
          setError(error.response.data.error);
        } else {
          setError('An error occurred. Please try again.');
        }
      } else if (error.request) {
        setError('No response from server. Please check your connection.');
      } else {
        setError('Error setting up the request. Please try again.');
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div
      className="flex justify-center items-center min-h-screen bg-cover bg-center"
      style={{
        backgroundImage: `url(${loginImage})`,
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="absolute inset-0 bg-black opacity-50"></div> {/* Dark overlay */}
      <div className="relative z-10 max-w-sm w-full space-y-8 bg-white rounded-lg shadow-lg p-8 mx-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Reset Password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your phone number and new password to reset your account.
          </p>
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {message && <div className="text-green-500 text-sm">{message}</div>}
        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
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
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              New Password
            </label>
            <input
              id="password"
              name="new_password"
              type="password"
              value={formData.new_password}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
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
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
              ) : (
                "Reset Password"
              )}
            </button>
          </div>
        </form>
        <div className="text-center">
          <Link
            to="/login"
            className="text-sm text-green-700 hover:text-black"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
