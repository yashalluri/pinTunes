'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { IconHome, IconMusic, IconFileText, IconLogout, IconUser } from '@tabler/icons-react';
import { motion } from 'framer-motion';

const links = [
  { label: 'Feed', href: '/dashboard/feed', icon: <IconHome size={20} /> },
  { label: 'Playlist', href: '/dashboard/playlist', icon: <IconMusic size={20} /> },
  { label: 'Posts', href: '/dashboard/posts', icon: <IconFileText size={20} /> },
  { label: 'Logout', href: '/', icon: <IconLogout size={20} /> },
];

export default function Sidebar() {
  return (
    <motion.div
      className="flex flex-col justify-between bg-gray-900 text-white h-screen w-64 p-6 shadow-lg"
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Project Name */}
      <div className="text-center text-2xl font-bold mb-8 tracking-wide">
        PINTUNES
      </div>

      {/* Navigation Links */}
      <nav className="space-y-4">
        {links.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-800 transition"
          >
            {link.icon}
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>

      {/* User Profile Section */}
      <div className="mt-auto text-center">
        <img
          src="/default-profile.png"
          alt="User Profile"
          className="w-16 h-16 rounded-full mx-auto mb-2 border-2 border-purple-500"
        />
        <p className="text-sm font-medium">John Doe</p>
        <button className="text-purple-400 hover:text-purple-500 mt-2 text-sm">
          Edit Profile
        </button>
      </div>
    </motion.div>
  );
}
