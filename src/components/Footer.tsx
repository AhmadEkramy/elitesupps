import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

interface FooterProps {
  onAdminClick: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onAdminClick }) => {
  const { t, language } = useLanguage();

  return (
    <footer className="bg-footer text-footer-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img src="/logo.jpg" alt="Logo" className="w-24 h-12 object-contain bg-white" />
              <div className="text-xl font-bold text-primary">
                {t('brandName')}
              </div>
            </div>
            <p className="text-footer-foreground/80">
              {t('brandSlogan')}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-primary">Quick Links</h3>
            <div className="space-y-2">
              <a href="#home" className="block hover:text-primary transition-colors">
                {t('home')}
              </a>
              <a href="#offers" className="block hover:text-primary transition-colors">
                {t('offers')}
              </a>
              <a href="#menu" className="block hover:text-primary transition-colors">
                {t('menu')}
              </a>
              <a href="#about" className="block hover:text-primary transition-colors">
                {t('about')}
              </a>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-primary">Categories</h3>
            <div className="space-y-2">
              <div className="hover:text-primary transition-colors cursor-pointer">
                {t('protein')}
              </div>
              <div className="hover:text-primary transition-colors cursor-pointer">
                {t('creatine')}
              </div>
              <div className="hover:text-primary transition-colors cursor-pointer">
                {t('energyProducts')}
              </div>
              <div className="hover:text-primary transition-colors cursor-pointer">
                {t('vitamins')}
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-primary">{t('contact')}</h3>
            <div className="space-y-2 text-footer-foreground/80">
              <div>📧 elitesupps101@gmail.com</div>
              <div>📱 +201016407640</div>
              <div>📍 Dakahlia, Egypt</div>
            </div>
            
            {/* Admin Access Button */}
            <div className="pt-4">
              <Button 
                onClick={onAdminClick}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg px-6 py-3 text-base shadow-lg transition-colors duration-200 flex items-center gap-2"
              >
                <Settings className="w-4 h-4 mr-2" />
                Admin Access
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-footer-foreground/20 mt-8 pt-8 text-center">
          <p className="text-footer-foreground/60">
            © 2024 Elite Supps. All rights reserved. | Powered by Elite Performance
          </p>
        </div>
      </div>
    </footer>
  );
};
