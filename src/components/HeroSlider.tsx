import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const slides = [
  {
    id: 1,
    image: 'https://images.pexels.com/photos/16216609/pexels-photo-16216609.jpeg',
    titleEn: 'High Protein Formula',
    titleAr: 'تركيبة عالية البروتين',
    subtitleEn: 'Build lean muscle mass with our premium whey protein',
    subtitleAr: 'ابني الكتلة العضلية الخالية من الدهون مع بروتين الواي المميز',
    bgGradient: 'from-primary via-accent to-highlight'
  },
  {
    id: 2,
    image: 'https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
    titleEn: 'Pre-Workout Energy',
    titleAr: 'طاقة ما قبل التمرين',
    subtitleEn: 'Explosive energy and focus for maximum performance',
    subtitleAr: 'طاقة انفجارية وتركيز للأداء الأقصى',
    bgGradient: 'from-accent via-highlight to-primary'
  },
  {
    id: 3,
    image: 'https://images.pexels.com/photos/2294361/pexels-photo-2294361.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
    titleEn: 'Recovery & Repair',
    titleAr: 'الإستشفاء والإصلاح',
    subtitleEn: 'Advanced recovery formulas for faster muscle repair',
    subtitleAr: 'تركيبات إستشفاء متطورة لإصلاح أسرع للعضلات',
    bgGradient: 'from-highlight via-primary to-accent'
  }
];

export const HeroSlider: React.FC = () => {
  const { t, language } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with animated gradient and image */}
      <div className={`absolute inset-0 bg-gradient-to-br ${slides[currentSlide].bgGradient} opacity-10 transition-all duration-1000`}></div>
      <img
        src={slides[currentSlide].image}
        alt="Hero Slide"
        className="absolute inset-0 w-full h-full object-cover object-center opacity-60 transition-all duration-1000 z-0"
        style={{ pointerEvents: 'none' }}
      />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto slide-in">
          {/* Brand Logo */}
          <div className="mb-8 float-animation">
            <h1 className="text-6xl md:text-8xl font-bold text-shine mb-2">
              {t('brandName')}
            </h1>
            <p className="text-xl md:text-2xl text-accent font-semibold">
              {t('brandSlogan')}
            </p>
          </div>

          {/* Slide Content */}
          <div className="mb-12 transition-all duration-500 ease-in-out">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
              {language === 'ar' ? slides[currentSlide].titleAr : slides[currentSlide].titleEn}
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {language === 'ar' ? slides[currentSlide].subtitleAr : slides[currentSlide].subtitleEn}
            </p>
            <button
              className="btn-glow text-lg px-8 py-4"
              onClick={() => {
                const section = document.getElementById('menu');
                if (section) {
                  section.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              {t('shopNow')}
            </button>
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center space-x-3">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'bg-gradient-primary scale-125 shadow-glow'
                    : 'bg-muted-foreground hover:bg-accent'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/20 rounded-full blur-xl float-animation"></div>
        <div className="absolute top-1/2 -right-10 w-60 h-60 bg-accent/20 rounded-full blur-xl float-animation" style={{ animationDelay: '1s' }}></div>
        <div className="absolute -bottom-10 left-1/2 w-50 h-50 bg-highlight/20 rounded-full blur-xl float-animation" style={{ animationDelay: '2s' }}></div>
      </div>
    </section>
  );
};