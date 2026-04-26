'use client';
import { useTranslation } from 'react-i18next';
import { User as UserIcon, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { Avatar } from './ui/Avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/DropdownMenu';

interface UserMenuProps {
  onProfileOpen: (tab: 'personal' | 'security') => void;
}

export default function UserMenu({ onProfileOpen }: UserMenuProps) {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-warm-100 dark:hover:bg-white/5 transition-colors group">
          <Avatar 
            name={user?.name} 
            username={user?.username} 
            email={user?.email} 
            className="group-hover:scale-105 transition-transform" 
          />
          <div className="hidden sm:flex flex-col items-start text-left">
            <span className="text-xs font-bold text-warm-900 dark:text-gray-100 leading-none">
              {user?.name || t('common.user')}
            </span>
            <span className="text-[10px] text-warm-500 dark:text-gray-500 leading-tight">
              {user?.username ? `@${user.username}` : user?.email || t('common.account')}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 text-warm-400 group-hover:text-warm-900 dark:group-hover:text-gray-100 transition-colors" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.username ? `@${user.username}` : user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onProfileOpen('personal')}>
          <UserIcon className="mr-2 h-4 w-4" />
          <span>{t('common.profile')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onProfileOpen('security')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>{t('profile.security')}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/10"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t('common.logout')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
