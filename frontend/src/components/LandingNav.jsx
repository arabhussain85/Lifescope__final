import { useState, useEffect } from 'react';
import { Menu, Bell, User, Sun, Moon, Home } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ darkMode, handleThemeToggle }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg'
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left section */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            
            <div 
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <Home className={`h-6 w-6 ${
                darkMode ? 'text-purple-400' : 'text-blue-600'
              }`} />
              <span className={`text-2xl font-bold ${
                darkMode 
                  ? 'bg-gradient-to-r from-blue-400 to-purple-500' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600'
              } bg-clip-text text-transparent`}>
                LifeScope
              </span>
            </div>
          </div>

          {/* Center section - Desktop */}
          <div className="hidden lg:flex items-center space-x-6">
            <div
              onClick={() => navigate('/dashboard')}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Dashboard
            </div>
            <div
              onClick={() => navigate('/roles')}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Roles
            </div>
            <div
              onClick={() => navigate('/goals')}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Goals
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleThemeToggle}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              {darkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              <Bell className="h-5 w-5" />
            </Button>

            <div onClick={() => navigate('/profile')} className="cursor-pointer">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <div
                onClick={() => navigate('/dashboard')}
                className="block px-3 py-2 rounded-md text-base font-medium text-black dark:text-white bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
              >
                Dashboard
              </div>
              <div
                onClick={() => navigate('/roles')}
                className="block px-3 py-2 rounded-md text-base font-medium text-black dark:text-white bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
              >
                Roles
              </div>
              <div
                onClick={() => navigate('/goals')}
                className="block px-3 py-2 rounded-md text-base font-medium text-black dark:text-white bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
              >
                Goals
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
export default Navbar;
