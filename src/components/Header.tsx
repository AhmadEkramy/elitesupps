import React, { useState, useEffect } from 'react';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onNavClick: (section: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavClick }) => {
  const { language, setLanguage, t } = useLanguage();
  const { getTotalItems } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { key: 'home', label: t('home') },
    { key: 'offers', label: t('offers') },
    { key: 'menu', label: t('menu') },
    { key: 'about', label: t('about') },
    { key: 'contact', label: t('contact') }
  ];

  const handleNavClick = (section: string) => {
    onNavClick(section);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-background/95 backdrop-blur-md shadow-lg' 
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="text-xl font-bold text-shine">
              {t('brandName')}
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => handleNavClick(item.key)}
                className="relative text-foreground hover:text-primary transition-colors duration-300 font-medium group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-primary transition-all duration-300 group-hover:w-full"></span>
              </button>
            ))}
          </nav>

          {/* Right Side - Language Toggle, Cart, Mobile Menu */}
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <div className="flex items-center bg-secondary rounded-lg p-1">
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-300 ${
                  language === 'en'
                    ? 'bg-gradient-primary text-black shadow-md'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('ar')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-300 ${
                  language === 'ar'
                    ? 'bg-gradient-primary text-black shadow-md'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                AR
              </button>
            </div>

            {/* Cart Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleNavClick('cart')}
              className="relative hover:bg-gradient-primary hover:text-black hover:border-transparent transition-all duration-300"
            >
              <ShoppingCart className="w-4 h-4" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                  {getTotalItems()}
                </span>
              )}
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden hover:bg-gradient-primary hover:text-black hover:border-transparent transition-all duration-300"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-border">
            <nav className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleNavClick(item.key)}
                  className="text-left text-foreground hover:text-primary transition-colors duration-300 font-medium py-2"
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};