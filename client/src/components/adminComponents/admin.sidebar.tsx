"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Logo from "../../../public/logo.png";
import { Menu, X, Home, Calendar, User, MessageSquare,ClipboardList} from "lucide-react";
import { usePathname } from "next/navigation";
import { logOut } from "@/lib/api/admin/login";
import { useRouter } from "next/navigation";

interface NavbarLayoutProps {
  children?: React.ReactNode;
}

export default function AdminNavbar({ children }: NavbarLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  let router=useRouter()

  const handleLogout=async ()=>{
      let response=await logOut()
      router.replace('/admin_login')
      
  }

  const menuItems = [
    { name: "Dashboard", icon: <Home size={20} />, href: "/admin_dashboard" },
    { name: "List Doctor", icon: <Calendar size={20} />, href: "/admin/doctors" },
    { name: "Register Doctor", icon: <User size={20} />, href: "/doctor_register" },
    { name: "Patient Directory", icon: <ClipboardList size={20} />, href: "/admin/patient_directory" },
    { name: "Appointments", icon: <MessageSquare size={20} />, href: "/manag_appointments" },

  ];

  return (
    <div className="flex h-screen">
      {/* Sidebar - Fixed on the left */}
      <aside className={`bg-white w-64 p-4 shadow-lg fixed h-full z-50 transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        <div className="flex justify-between items-center">
          <Image src={Logo} alt="MeCare Logo" width={150} height={50} />
          <button className="md:hidden" onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>
        <nav className="mt-6">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-3 mb-4 rounded-lg transition-colors ${
                pathname === item.href ? "bg-teal-600 text-white" : "hover:bg-teal-100"
              }`}
            >
              {item.icon}
              <span className="ml-3">{item.name}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-64">
        {/* Top Navbar - Fixed at the top */}
        <nav className="bg-white shadow-md px-4 py-4 flex items-center justify-between md:justify-end fixed top-0 w-full md:w-[calc(100%-16rem)] md:left-64 h-16 z-50">
          <button className="md:hidden" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <Menu size={24} />
          </button>
          <Link href="/login" className="bg-teal-600 text-white px-6 py-2 rounded-full hover:bg-teal-700" onClick={handleLogout}>
            Logout
          </Link>
        </nav>

        {/* Page Content */}
        <div className="flex-1 p-6 mt-16 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
