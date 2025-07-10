import { useEffect, useState } from "react";

const useDarkMode = () => {
  // Initialize state properly
  const [darkMode, setDarkMode] = useState(() => {
    // Check both localStorage and system preference
    const saved = localStorage.getItem('darkMode');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return saved ? saved === 'true' : systemPrefersDark;
  });

  useEffect(() => {
    // Apply class immediately
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Save to localStorage
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return [darkMode, toggleDarkMode];
};

export default useDarkMode;