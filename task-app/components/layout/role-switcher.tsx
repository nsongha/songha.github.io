'use client';

import React from 'react';
import { useUserStore } from '@/lib/stores/user-store';
import { User } from '@/lib/types';

export const RoleSwitcher: React.FC = () => {
  const { currentUser, switchRole } = useUserStore();

  const roles: { value: User['role']; label: string; icon: string }[] = [
    { value: 'admin', label: 'Admin', icon: '👑' },
    { value: 'manager', label: 'Manager', icon: '👨‍💼' },
    { value: 'member', label: 'Member', icon: '👤' },
  ];

  return (
    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1">
      {roles.map((role) => (
        <button
          key={role.value}
          onClick={() => switchRole(role.value)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
            currentUser.role === role.value
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <span className="mr-1">{role.icon}</span>
          {role.label}
        </button>
      ))}
    </div>
  );
};
