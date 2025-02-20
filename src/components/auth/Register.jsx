/* eslint-disable no-unused-vars */
import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import loginImage from '../../assets/pictures/tea1.jpg'; // Assuming the path to the image

const Register = () => {
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateFields = () => {
    const newErrors = {};

    if (!/^(078|079|072|073)\d{7}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be 10 digits starting with 078, 079, 072, or 073.';
    }

    if (formData.email === '') {
      newErrors.role = 'Enter valid email.';
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(formData.password)) {
      newErrors.password = 'Password must contain at least 8 characters, including an uppercase letter, a lowercase letter, a number, and a special character.';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateFields();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const dataToSubmit = {
      phone: formData.phone,
      password: formData.password,
      email: formData.email,
    };

    setLoading(true);
    try {
      const response = await axios.post('http://127.0.0.1:8000/register/', dataToSubmit);

      if (response.status === 201) {
        setMessage('Registration successful!');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (error) {
      if (error.response?.data) {
        const backendErrors = error.response.data;
        const errorMessages = {};

        if (backendErrors.phone) {
          errorMessages.phone = backendErrors.phone;
        }
        if (backendErrors.password) {
          errorMessages.password = backendErrors.password;
        }

        setErrors((prev) => ({
          ...prev,
          ...errorMessages,
          form: backendErrors.error || 'An error occurred. Please try again.',
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          form: 'An unexpected error occurred. Please try again.',
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors((prev) => ({ ...prev, [name]: '' }));

    if (name === 'confirmPassword') {
      if (value !== formData.password) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: 'Passwords do not match.',
        }));
      }
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-50">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${loginImage})` }}
      ></div>

      <div className="relative sm:max-w-md max-w-md w-full space-y-8 bg-white bg-opacity-90 rounded-lg shadow-lg p-8 z-10">
        <h2 className="text-center text-2xl font-bold text-gray-900">Create Account</h2>
        <p className="text-center text-sm text-gray-600">Create New Account for Free</p>

        {errors.form && <p className="text-red-500 text-sm">{errors.form}</p>}
        {message && <p className="text-green-500 text-sm">{message}</p>}

        <form className="mt-8 space-y-2" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
              required
            />
            {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
              required
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <div className="relative mt-1">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                className="block w-full rounded-md border border-gray-300 p-2 pr-10 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-700"
                required
              />
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeIcon className="h-5 w-5 text-gray-500" /> : <EyeSlashIcon className="h-5 w-5 text-gray-500" />}
              </span>
            </div>
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <div className="relative mt-1">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                className="block w-full rounded-md border border-gray-300 p-2 pr-10 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-700"
                required
              />
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <EyeIcon className="h-5 w-5 text-gray-500" /> : <EyeSlashIcon className="h-5 w-5 text-gray-500" />}
              </span>
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
          </div>

          <div>
            <button
              type="submit"
              className="w-full bg-green-700 text-white py-2 px-4 rounded-md shadow-sm hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={loading}
            >
              {loading ? <AiOutlineLoading3Quarters className="animate-spin h-5 w-5" /> : 'Sign Up'}
            </button>
          </div>
        </form>

        <div className="mt-3 text-sm text-gray-600">
          Already have an account? <Link to="/login" className="text-green-700 hover:text-black">Log in here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
