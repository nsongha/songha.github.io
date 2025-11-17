import { create } from 'zustand';
import { User } from '@/lib/types';
import { mockUsers } from '@/lib/utils/mock-data';

interface UserStore {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role: User['role']) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  currentUser: mockUsers[1], // Default to Manager

  setCurrentUser: (user) => set({ currentUser: user }),

  switchRole: (role) => set((state) => {
    // Find a user with this role from mock data
    const user = mockUsers.find((u) => u.role === role);
    return { currentUser: user || state.currentUser };
  }),
}));
