
import { useState, useEffect, useCallback } from 'react';

export const useScrollNavigation = () => {
  const [scrollY, setScrollY] = useState(0);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [isHeaderManuallyOpen, setIsHeaderManuallyOpen] = useState(false);

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    setScrollY(currentScrollY);
    
    // Collassa l'header quando si scrolla giù
    if (currentScrollY > 100 && !isHeaderManuallyOpen) {
      setIsHeaderCollapsed(true);
    } else if (currentScrollY <= 50) {
      setIsHeaderCollapsed(false);
      setIsHeaderManuallyOpen(false);
    }

    // Calcola la sezione corrente in base alla posizione di scroll
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollProgress = currentScrollY / (documentHeight - windowHeight);
    
    // 5 sezioni: Inizio, Servizi, Prodotti, Chi siamo, Contatti
    const sectionIndex = Math.floor(scrollProgress * 4);
    setCurrentSection(Math.min(sectionIndex, 4));
  }, [isHeaderManuallyOpen]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const toggleHeader = () => {
    if (isHeaderCollapsed) {
      setIsHeaderManuallyOpen(true);
      setIsHeaderCollapsed(false);
    } else {
      setIsHeaderManuallyOpen(false);
      setIsHeaderCollapsed(true);
    }
  };

  return {
    scrollY,
    isHeaderCollapsed,
    currentSection,
    isHeaderManuallyOpen,
    toggleHeader
  };
};
