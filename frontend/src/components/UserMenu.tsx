'use client';
import { useTranslation } from 'react-i18next';
import { User as UserIcon, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/DropdownMenu';
import { Avatar, AvatarFallback } from './ui/Avatar';
import { Button } from './ui/Button';

interface UserMenuProps {
  onProfileOpen: (tab: 'personal' | 'security') => void;
}

export default function UserMenu({ onProfileOpen }: UserMenuProps) {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  const userInitial =
    user?.name?.charAt(0) || user?.username?.charAt(0) || user?.email?.charAt(0) || 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto p-1.5 px-2 gap-2 hover:bg-accent group">
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarFallback className="bg-primary text-primary-foreground font-bold rounded-lg group-hover:scale-105 transition-transform">
              {userInitial.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:flex flex-col items-start text-left">
            <span className="text-xs font-bold leading-none">
              {user?.name || t('common.user')}
            </span>
            <span className="text-[10px] text-muted-foreground leading-tight">
              {user?.username ? `@${user.username}` : user?.email || t('common.account')}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </Button>
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
          className="text-destructive focus:text-destructive focus:bg-destructive/10"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t('common.logout')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
