import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export const AboutSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="about" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 slide-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 text-shine">
            {t('aboutTitle')}
          </h2>
          <div className="w-24 h-1 bg-gradient-primary mx-auto mb-8"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="slide-in">
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              {t('aboutP1')}
            </p>
          </div>

          <div className="slide-in" style={{ animationDelay: '0.2s' }}>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              {t('aboutP2')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
