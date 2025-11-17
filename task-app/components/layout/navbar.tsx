'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { RoleSwitcher } from './role-switcher';
import { useUserStore } from '@/lib/stores/user-store';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { currentUser } = useUserStore();

  // Navigation items based on role
  const getNavItems = () => {
    const baseItems = [
      { href: '/dashboard', label: 'Dashboard', icon: '📊', roles: ['admin', 'manager'] },
      { href: '/tasks', label: 'Tasks', icon: '✓', roles: ['manager'] },
      { href: '/my-tasks', label: 'My Tasks', icon: '📋', roles: ['member'] },
      { href: '/daily-report', label: 'Daily Report', icon: '📝', roles: ['manager', 'member'] },
    ];

    return baseItems.filter((item) => item.roles.includes(currentUser.role));
  };

  const navItems = getNavItems();

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center">
            <span className="text-2xl font-bold text-blue-600">TaskFlow</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? 'primary' : 'ghost'}
                    size="md"
                    className={isActive ? '' : 'text-gray-700'}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Right side: Role Switcher + User Info */}
          <div className="flex items-center gap-4">
            <RoleSwitcher />
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                <p className="text-xs text-gray-500">{currentUser.email}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                {currentUser.name.charAt(0)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
