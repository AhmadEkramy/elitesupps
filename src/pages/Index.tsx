import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { HeroSlider } from "@/components/HeroSlider";
import { OffersSection } from "@/components/OffersSection";
import { MenuSection } from "@/components/MenuSection";
import { AboutSection } from "@/components/AboutSection";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { AdminLogin } from "@/components/AdminLogin";
import { AdminDashboard } from "@/components/AdminDashboard";
import { Cart } from "@/components/Cart";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

const Index = () => {
  const navigate = useNavigate();
  const [showAdmin, setShowAdmin] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { isAdminAuthenticated, loading } = useAdminAuth();

  const handleAdminClick = () => {
    setShowAdmin(true);
  };

  const handleBackToSite = () => {
    setShowAdmin(false);
  };

  const handleNavClick = (section: string) => {
    console.log('Navigation clicked:', section);
    
    if (section === 'cart') {
      setIsCartOpen(true);
      return;
    }
    
    // Handle other navigation
    if (section === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (section === 'offers') {
      document.getElementById('offers')?.scrollIntoView({ behavior: 'smooth' });
    } else if (section === 'menu') {
      document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
    } else if (section === 'about') {
      document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
    } else if (section === 'contact') {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCartClose = () => {
    setIsCartOpen(false);
  };

  const handleCheckout = () => {
    // Close cart and navigate to checkout page
    setIsCartOpen(false);
    navigate('/checkout');
  };

  // Show loading while checking auth state
  if (loading && showAdmin) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show admin login if admin section is requested but not authenticated
  if (showAdmin && !isAdminAuthenticated) {
    return <AdminLogin onBack={handleBackToSite} />;
  }

  // Show admin dashboard if authenticated
  if (showAdmin && isAdminAuthenticated) {
    return <AdminDashboard onClose={handleBackToSite} />;
  }

  // Show main site
  return (
    <div className="min-h-screen">
      <Header onNavClick={handleNavClick} />
      <HeroSlider />
      <OffersSection />
      <MenuSection />
      <AboutSection />
      <ContactSection />
      <Footer onAdminClick={handleAdminClick} />
      <WhatsAppFloat />
      
      {/* Cart Component */}
      <Cart 
        isOpen={isCartOpen} 
        onClose={handleCartClose} 
        onCheckout={handleCheckout} 
      />
    </div>
  );
};

export default Index;
