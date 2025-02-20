/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import axios from 'axios';

const Contact = () => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        names: '',
        email: '',
        subject: '',
        description: ''
    });
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({
        names: '',
        email: '',
        subject: '',
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        validateField(e.target.name, e.target.value);
    };

    const validateField = (name, value) => {
        let error = '';
        if (name === 'names' || name === 'subject') {
            if (/[^a-zA-Z\s]/.test(value)) {
                error = 'No numbers or special characters allowed';
            } else if (!value.trim()) {
                error = 'This field is required';
            }
        } else if (name === 'email') {
            if (!value.endsWith('@gmail.com')) {
                error = 'Email must end with @gmail.com';
            } else if (!value.trim()) {
                error = 'This field is required';
            }
        }
        setErrors(prevErrors => ({
            ...prevErrors,
            [name]: error
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const hasErrors = Object.values(errors).some((error) => error);
        const hasEmptyFields = Object.values(formData).some((field) => !field.trim());
        
        if (hasErrors || hasEmptyFields) {
            setMessage('Please fix the errors and fill in all required fields.');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('http://127.0.0.1:8000/contact/', formData);
            if (response.status === 200) {
                setMessage('Message sent successfully');
                setFormData({
                    names: '',
                    email: '',
                    subject: '',
                    description: ''
                });
            }
        } catch (error) {
            if (error.response) {
                setMessage(error.response.data.error || 'Failed to send message');
            } else {
                setMessage('Failed to send message');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className='bg-white pb-16' id="contact">
            <div className="container bg-white">
                <h2 data-aos="fade-up" className='text-headingColor font-[700] text-[2.5rem] mb-8 text-center text-black'>
                    Get in touch
                </h2>
                <div className='md:flex justify-center items-center'>
                    <div data-aos="fade-left" className='w-full mt-8 md:mt-0 md:w-1/2 sm:h-[450px] lg:flex items-center bg-gray-300 px-4 lg:px-8 py-8 rounded-lg'>
                        <form className='w-full' onSubmit={handleSubmit}>
                            {message && (
                                <div className={`mb-5 text-${message.includes('success') ? 'green' : 'red'}-500`}>
                                    {message}
                                </div>
                            )}
                            
                            <div className="mb-5">
                                <input
                                    type="text"
                                    name="names"
                                    value={formData.names}
                                    onChange={handleChange}
                                    placeholder='Enter your name'
                                    className='w-full p-3 focus:outline-none rounded-[5px] text-gray-700'
                                />
                                {errors.names && <p className="text-red-500 text-sm">{errors.names}</p>}
                            </div>

                            <div className="mb-5">
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder='your email @gmail.com'
                                    className='w-full p-3 focus:outline-none rounded-[5px] text-gray-700'
                                />
                                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                            </div>

                            <div className="mb-5">
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    placeholder='Subject'
                                    className='w-full p-3 focus:outline-none rounded-[5px] text-gray-700'
                                />
                                {errors.subject && <p className="text-red-500 text-sm">{errors.subject}</p>}
                            </div>

                            <div className="mb-5">
                                <textarea
                                    rows={3}
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder='Write your message'
                                    className='w-full p-3 focus:outline-none rounded-[5px] text-gray-700'
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className='flex items-center justify-center gap-1 w-full p-3 focus:outline-none rounded-[5px] bg-green-700 text-white hover:bg-black hover:text-white ease-linear duration-150 disabled:opacity-50'
                            >
                                {loading ? (
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <>
                                        <i className="ri-mail-send-line text-2xl"></i>
                                        Send Message
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;