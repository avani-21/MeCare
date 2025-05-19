"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Logo from "../../../public/logo.png"
import { Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { logOut } from "@/lib/api/admin/login";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  let router=useRouter()

 const handleLogout=async ()=>{
     let response=await logOut()
          router.replace("/admin_login")
 }


  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 flex justify-between items-center py-4 ">
        
        {/* Logo */}
        <Link href="/"  className="flex items-center space-x-3">
          <Image src={Logo} alt="MeCare Logo" width={180} height={60} />
        </Link>


        {/* Login Button */}
        <div className="hidden md:block">
          <Link href="/login" className="bg-teal-600 text-white px-6 py-2 mr-12 rounded-full hover:bg-teal-700" onClick={handleLogout}>
            Logout
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden focus:outline-none">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
}
