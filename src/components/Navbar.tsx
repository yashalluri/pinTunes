'use client';

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-gray-800 bg-opacity-50 p-4 z-10">
      <ul className="flex justify-center space-x-4">
        <li>
          <Link href="/dashboard" className="hover:text-purple-500">
            Feed
          </Link>
        </li>
        <li>
          <Link href="/dashboard/chat" className="hover:text-purple-500">
            Chat
          </Link>
        </li>
        <li>
          <Link href="/dashboard/posts" className="hover:text-purple-500">
            Posts
          </Link>
        </li>
      </ul>
    </nav>
  );
} 