import Image from "next/image";
import React from "react";
import Banner from "../../../public/banner2.png";

function Banner2() {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between px-6 md:px-16 py-20 bg-white">
      {/* Left Content */}
      <div className="md:w-2/5 text-center  pl-13 md:text-left">
        <h2 className="text-3xl md:text-4xl font-bold text-teal-700">
          You Have Lots Of Reasons To Choose Us
        </h2>
        <p className="text-gray-600 mt-4 text-lg">
          We offer advanced care, expert professionals, and a compassionate approach—giving you every reason to choose us.
        </p>
        <button className="mt-6 px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition">
          Get Started
        </button>
      </div>

      {/* Right Content */}
      <div className="md:w-3/5 flex justify-center mt-10 md:mt-0">
        {/* Doctor Image */}
        <Image
          src={Banner}
          alt="banner img"
          className="w-full max-w-lg rounded-lg shadow-lg"
        />
      </div>
    </div>
  );
}

export default Banner2;
