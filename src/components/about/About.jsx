/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import AboutImg from '../../assets/pictures/beans.png';
import image2 from '../../assets/pictures/cassava.jpg';
import image3 from '../../assets/pictures/coffee.jpg';
import image4 from '../../assets/pictures/cassava2.png';
import image5 from '../../assets/pictures/imag1.jpg';
import image6 from '../../assets/pictures/imag2.jpeg';
import image8 from '../../assets/pictures/imag4.jpg';
import image9 from '../../assets/pictures/irish potatoes.jpg';
import image10 from '../../assets/pictures/irish potatoes3.jpg';
import image11 from '../../assets/pictures/irish potatoes2.png';

function About() {
    // Array of images
    const images = [
        AboutImg,
        image2,
        image3,
        image4,
        image5,
        image6,
        image8,
        image9,
        image10,
        image11
    ];

    // State to keep track of the current image index
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // useEffect hook to change the image every 3 seconds
    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 3000); // 3000 ms = 3 seconds

        // Cleanup interval on component unmount
        return () => clearInterval(intervalId);
    }, []);

    return (
        <section id="about" className="py-10 bg-slate-100 dark:text-white">
            <div className='bg-gray-300 mt-2 py-2'>
                <h2
                    data-aos="fade-up"
                    className="text-center text-4xl font-bold mb-10 text-black dark:text-black py-2"
                >
                    About Us
                </h2>
            </div>
            
            <main className="container mx-auto flex flex-col items-center justify-center">

                <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center p-4 md:p-8 bg-white rounded-lg shadow-lg">
                    <div data-aos="fade-right">
                        <img
                            src={images[currentImageIndex]} // Display image based on the current index
                            alt="No image"
                            className="w-full h-80 object-cover rounded-lg"
                        />
                    </div>
                    <div data-aos="fade-left" className="flex flex-col gap-4">
                        <div className="p-4 border-l-4 border-gray-700">
                            <h3 className="text-2xl font-semibold mb-2 text-black">Who We Are</h3>
                            <p className="text-sm dark:text-slate-800">
                                We are an innovative platform dedicated to enhancing agricultural water use efficiency. 
                                By leveraging advanced data analytics and real-time recommendations, we empower farmers to adopt sustainable practices 
                                that optimize irrigation, improve water conservation, and boost crop yields.
                            </p>
                        </div>
                        <div className="p-4 border-l-4 border-gray-700">
                            <h3 className="text-2xl font-semibold mb-2 text-black">Vision</h3>
                            <p className="text-sm dark:text-slate-800">
                                Our vision is to revolutionize agriculture by fostering sustainability and resource efficiency. 
                                We aim to become a global leader in agricultural water management, helping to ensure a more sustainable future 
                                for farming communities and the planet.
                            </p>
                        </div>
                        <div className="p-4 border-l-4 border-gray-700">
                            <h3 className="text-2xl font-semibold mb-2 text-black">Mission</h3>
                            <p className="text-sm dark:text-slate-800">
                                Our mission is to provide actionable insights and tools to farmers, enabling them to make informed decisions that enhance 
                                water efficiency and agricultural productivity. We are committed to delivering innovative, data-driven solutions that 
                                support sustainable farming and resource stewardship.
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        </section>
    );
}

export default About;
