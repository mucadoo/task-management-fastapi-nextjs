'use client';

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { User as UserIcon, LogOut, Settings, ChevronDown } from "lucide-react";
import { api } from "../lib/api";
import { User } from "../types/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/DropdownMenu";

interface UserMenuProps {
  onProfileOpen: (tab: 'personal' | 'security') => void;
  onLogout: () => void;
}

export default function UserMenu({ onProfileOpen, onLogout }: UserMenuProps) {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    api.getMe()
      .then(setUser)
      .catch(() => {
        // Fallback or handle error silently as it's just for the UI decoration
      });
  }, []);

  const userInitial = user?.name?.charAt(0) || user?.email?.charAt(0) || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-warm-100 dark:hover:bg-white/5 transition-all cursor-pointer group focus:outline-none">
          <div className="w-8 h-8 flex items-center justify-center bg-brand-500 text-white font-bold rounded-lg shadow-sm group-hover:scale-105 transition-transform">
            {userInitial.toUpperCase()}
          </div>
          <div className="hidden sm:flex flex-col items-start mr-1">
            <span className="text-xs font-bold text-warm-900 dark:text-gray-100 leading-none">
              {user?.name || t('common.user')}
            </span>
            <span className="text-[10px] text-warm-500 dark:text-gray-500 leading-tight">
              {user?.email || t('common.account')}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 text-warm-400 group-hover:text-warm-600 transition-colors" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-warm-900 dark:text-gray-100">{user?.name}</p>
            <p className="text-xs leading-none text-warm-500">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onProfileOpen('personal')} className="gap-2">
          <UserIcon className="h-4 w-4" />
          <span>{t('common.profile')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onProfileOpen('security')} className="gap-2">
          <Settings className="h-4 w-4" />
          <span>{t('profile.security')}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={onLogout} 
          className="gap-2 text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/10"
        >
          <LogOut className="h-4 w-4" />
          <span>{t('common.logout')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
