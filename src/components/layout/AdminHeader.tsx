import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Menu, Upload, Circle } from 'lucide-react';

interface AdminHeaderProps {
  onMenuClick?: () => void;
  hasDrafts?: boolean;
}

const pageTitles: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/sections': 'Sections',
  '/admin/projects': 'Projects',
  '/admin/appearance': 'Appearance',
  '/admin/settings': 'Settings',
};

const AdminHeader: React.FC<AdminHeaderProps> = ({ onMenuClick, hasDrafts = true }) => {
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  const pageTitle = pageTitles[location.pathname] || 'Dashboard';

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4 lg:px-6">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-4 w-4" />
        </Button>

        <h1 className="text-lg font-medium">{pageTitle}</h1>

        {/* Draft status indicator */}
        {hasDrafts && (
          <div className="flex items-center gap-1.5 rounded-full bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning">
            <Circle className="h-2 w-2 fill-current" />
            Draft
          </div>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* Publish button */}
        <Button size="sm" className="h-8 gap-1.5 px-3">
          <Upload className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Publish</span>
        </Button>
      </div>
    </header>
  );
};

export default AdminHeader;
