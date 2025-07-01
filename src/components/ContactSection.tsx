import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { MessageCircle, Mail, MapPin } from 'lucide-react';

export const ContactSection: React.FC = () => {
  const { t } = useLanguage();

  const contactMethods = [
    {
      icon: MessageCircle,
      title: t('contactWhatsApp'),
      value: '+201016407640',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      href: 'https://wa.me/201016407640'
    },
    {
      icon: Mail,
      title: t('contactEmail'),
      value: 'elitesupps101@gmail.com',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      href: 'mailto:elitesupps101@gmail.com'
    },
    {
      icon: MapPin,
      title: t('contactLocation'),
      value: 'Dakahlia, Egypt',
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      href: '#'
    }
  ];

  return (
    <section id="contact" className="py-20 bg-gradient-hero">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 slide-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 text-shine">
            {t('contactTitle')}
          </h2>
          <div className="w-24 h-1 bg-gradient-primary mx-auto mb-8"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {contactMethods.map((method, index) => {
            const IconComponent = method.icon;
            
            return (
              <div 
                key={method.title}
                className="slide-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <a
                  href={method.href}
                  target={method.href.startsWith('http') ? '_blank' : '_self'}
                  rel={method.href.startsWith('http') ? 'noopener noreferrer' : ''}
                  className="block card-glow text-center p-8 transition-all duration-300 hover:scale-105 group"
                >
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${method.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className={`w-8 h-8 ${method.color}`} />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2 text-foreground">
                    {method.title}
                  </h3>
                  
                  <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                    {method.value}
                  </p>
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
