"use client";
import Image from "next/image";
import React from "react";
import { useRouter } from "next/navigation"; // Updated import for Next.js 13+
import Banner1 from "../../../public/bannerImage.png";

function Banner() {
  const router = useRouter();

  const handleBookAppointment = () => {
    router.push("/doctors");
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between px-6 md:px-16 py-30 bg-white ">
      {/* Left Content */}
      <div className="md:w-1/2 text-center md:text-left ml-4 md:ml-14">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
          Providing Quality{" "}
          <span className="text-teal-600">Healthcare</span> For A <br />
          <span className="text-lime-600">Brighter</span> And{" "}
          <span className="text-lime-600">Healthy</span> Future
        </h2>
        <p className="text-gray-600 mt-4 text-lg">
          At our hospital, we are dedicated to providing exceptional medical
          care to our patients and their families. Our experienced team of
          medical professionals, cutting-edge technology, and compassionate
          approach make us a leader in the healthcare industry.
        </p>
        <button 
          className="mt-6 px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition"
          onClick={handleBookAppointment}
        >
          Book Appointments
        </button>
      </div>

      {/* Right Content */}
      <div className="md:w-1/2 relative flex justify-center mt-10 md:mt-0">
        {/* Doctor Image */}
        <Image
          src={Banner1}
          alt="banner img"
          className="relative z-10 w-100 h-100 md:w-80"
        />
      </div>
    </div>
  );
}

export default Banner;