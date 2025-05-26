'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { logOut } from '@/lib/api/patient/patient' 
import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'

const ProfileNav = () => {
  const pathname = usePathname()
  const router = useRouter()
    const [patientToken, setPatientToken] = useState<string>("");

  const getActiveTab = () => {
    if (pathname.includes('/profile/mange_account')) return 'Manage account'
    if (pathname.includes('/profile/my_appointments')) return 'My appointments'
    if (pathname.includes('/profile/messages')) return 'Messages'
    if (pathname.includes('/profile/prescription')) return 'Prescription'
    return ''
  }

  const activeTab = getActiveTab()

  const navItems = [
    { name: 'Manage account', href: '/profile/mange_account' },
    { name: 'My appointments', href: '/profile/my_appointments' },
    { name: 'Messages', href: '/profile/message' },
    { name: 'Logout', href: '#', isLogout: true }
  ]

  const handleLogout = async () => {
    const res = await logOut()
    if (res?.status === 200) {
      router.replace('/login')
    } else {
      alert('Logout failed. Please try again.')
    }
  }

  
  useEffect(() => {
    const token= localStorage.getItem("patientToken");
    if(token){
 setPatientToken(token);
    }
   
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  return (
    <nav className="mt-6 flex justify-center mb-4">
      <div className="flex rounded-lg bg-gray-100 p-1">
        {navItems.map((item) =>
          item.isLogout ? (
            <button
              key={item.name}
              onClick={handleLogout}
              className={`
                px-4 py-2 text-center min-w-[120px] transition-colors duration-200
                rounded-md whitespace-nowrap
                text-red-500 hover:bg-red-50
              `}
            >
              {item.name}
            </button>
          ) : (
            <Link
              key={item.name}
              href={item.href}
              className={`
                px-4 py-2 text-center min-w-[120px] transition-colors duration-200
                rounded-md whitespace-nowrap
                ${activeTab === item.name
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-200'}
              `}
            >
              {item.name}
            </Link>
          )
        )}
      </div>
    </nav>
  )
}

export default ProfileNav
