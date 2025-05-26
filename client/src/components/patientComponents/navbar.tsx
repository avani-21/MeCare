"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Logo from "../../../public/logo.png";
import { Menu, X, ChevronDown, User, Stethoscope, Lock } from "lucide-react"; // Added icons
import Cookies from "js-cookie";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginDropdownOpen, setIsLoginDropdownOpen] = useState(false);
  const [patientToken, setPatientToken] = useState<string | null>(null);


  useEffect(() => {
    let tokentoken=Cookies.get("patientToken")
    console.log("token",tokentoken)
     const token =localStorage.getItem("patientId")
    setPatientToken(token);
  }, []);

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 flex justify-between items-center py-4">
        <Link href="/" className="flex items-center space-x-3">
          <Image src={Logo} alt="MeCare Logo" width={180} height={60} />
        </Link>

        <div className="hidden md:flex space-x-10">
          <Link href="/" className="text-gray-800 hover:text-teal-600">
            Home
          </Link>
          <Link href="/doctors" className="text-gray-800 hover:text-teal-600">
            Doctors
          </Link>
          <Link href="/about_us" className="text-gray-800 hover:text-teal-600">
            About Us
          </Link>
        </div>

        <div className="hidden md:block">
          {patientToken ? (
            <Link
              href="/profile"
              className="bg-teal-600 text-white px-6 py-2 rounded-full hover:bg-teal-700"
            >
              Profile
            </Link>
          ) : (
            <div className="relative">
              <button
                onClick={() => setIsLoginDropdownOpen(!isLoginDropdownOpen)}
                className="bg-teal-600 text-white px-6 py-2 rounded-full hover:bg-teal-700 flex items-center"
              >
                Login <ChevronDown size={16} className="ml-1" />
              </button>
              {isLoginDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-10 border border-gray-100">
                
                  <Link
                    href="/login"
                    className="flex items-center px-4 py-3 text-gray-800 hover:bg-teal-50"
                    onClick={() => setIsLoginDropdownOpen(false)}
                  >
                    <User size={16} className="mr-2 text-teal-600" />
                    <span>Login as User</span>
                  </Link>
                 
                  <Link
                    href="/doctor/send_otp"
                    className="flex items-center px-4 py-3 text-gray-800 hover:bg-teal-50"
                    onClick={() => setIsLoginDropdownOpen(false)}
                  >
                    <Stethoscope size={16} className="mr-2 text-teal-600" />
                    <span>Login as Doctor</span>
                  </Link>
    
                  <Link
                    href="/admin_login" 
                    className="flex items-center px-4 py-3 text-gray-800 hover:bg-teal-50 rounded-b-md"
                    onClick={() => setIsLoginDropdownOpen(false)}
                  >
                    <Lock size={16} className="mr-2 text-teal-600" />
                    <span>Admin Login</span>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
  <div className="md:hidden mt-4 space-y-2">
    <Link href="/" className="block text-gray-800 hover:text-teal-600">
      Home
    </Link>
    <Link href="/doctors" className="block text-gray-800 hover:text-teal-600">
      Doctors
    </Link>
    <Link href="/about_us" className="block text-gray-800 hover:text-teal-600">
      About Us
    </Link>
    {patientToken ? (
      <Link
        href="/profile"
        className="block text-teal-600 font-semibold mt-2"
      >
        Profile
      </Link>
    ) : (
      <div className="space-y-2">
        <Link href="/login" className="block text-gray-800 hover:text-teal-600">
          Login as User
        </Link>
        <Link href="/doctor/send_otp" className="block text-gray-800 hover:text-teal-600">
          Login as Doctor
        </Link>
        <Link href="/admin_login" className="block text-gray-800 hover:text-teal-600">
          Admin Login
        </Link>
      </div>
    )}
  </div>
)}

    </nav>
  );
}