"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Logo from "../../../public/logo.png";
import { Menu, X } from "lucide-react";
import nookies from "nookies";


export default  function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [patientToken, setPatientToken] = useState<string | null>(null);

  useEffect(() => {
    const cookies = nookies.get();
    const token = cookies.patientToken || null;
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
          <Link href="" className="text-gray-800 hover:text-teal-600">
            About Us
          </Link>
        </div>

        <div className="hidden md:block">
          { patientToken ? (
            <Link href="/profile" className="bg-gray-300 px-4 py-2 rounded-full">
              Profile
            </Link>
          ) : (
            <Link
              href="/login"
              className="bg-teal-600 text-white px-6 py-2 mr-12 rounded-full hover:bg-teal-700"
            >
              Login
            </Link>
          )}
        </div>

        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
}
