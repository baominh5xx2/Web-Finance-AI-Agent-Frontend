'use client';

import Link from "next/link";
import { usePathname } from 'next/navigation';
import './sidebar.css';

export default function Sidebar() {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    return pathname === path ? "active" : "";
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-container">
        <Link
          href="/dashboard"
          className={`sidebar-link ${isActive('/dashboard')}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="sidebar-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="sidebar-text">Dashboard</span>
        </Link>

        <Link
          href="/smart-invest"
          className={`sidebar-link ${isActive('/smart-invest')}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="sidebar-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="sidebar-text">Smart Invest</span>
        </Link>

        <Link
          href="/smart-trade"
          className={`sidebar-link ${isActive('/smart-trade')}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="sidebar-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <span className="sidebar-text">Smart Trade</span>
        </Link>

        <div className="sidebar-divider"></div>

        <Link
          href="/stock-list"
          className={`sidebar-link ${isActive('/stock-list')}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="sidebar-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span className="sidebar-text">Bộ lọc cổ phiếu</span>
        </Link>

        <Link
          href="/portfolio"
          className={`sidebar-link ${isActive('/portfolio')}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="sidebar-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <span className="sidebar-text">Smart Portfolio</span>
        </Link>

        <div className="sidebar-divider"></div>

        <Link
          href="/learning"
          className={`sidebar-link ${isActive('/learning')}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="sidebar-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M12 14l9-5-9-5-9 5 9 5z" />
            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998a12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
          </svg>
          <span className="sidebar-text">E-Learning</span>
        </Link>

        <Link
          href="/blog"
          className={`sidebar-link ${isActive('/blog')}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="sidebar-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          <span className="sidebar-text">Blog</span>
        </Link>

        <div className="sidebar-divider"></div>

        <Link
          href="/support"
          className={`sidebar-link ${isActive('/support')}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="sidebar-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
          <span className="sidebar-text">Hỗ trợ</span>
        </Link>
      </div>
    </aside>
  );
}
