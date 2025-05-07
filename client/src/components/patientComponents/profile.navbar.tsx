'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

const ProfileNav = () => {
  const pathname = usePathname()

  // Determine the active tab based on pathname
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
    { name: 'Messages', href: '/profile/messages' },
    { name: 'Logout', href: '#', isLogout: true }
  ]

  return (
    <nav className="mt-6 flex justify-center mb-4">
      <div className="flex rounded-lg bg-gray-100 p-1">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`
              px-4 py-2 text-center min-w-[120px] transition-colors duration-200
              rounded-md whitespace-nowrap
              ${activeTab === item.name
                ? 'bg-teal-600 text-white shadow-md'
                : item.isLogout
                ? 'text-red-500 hover:bg-red-50'
                : 'text-gray-700 hover:bg-gray-200'}
            `}
          >
            {item.name}
          </Link>
        ))}
      </div>
    </nav>
  )
}

export default ProfileNav
