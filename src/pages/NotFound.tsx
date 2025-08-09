import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-2">
      <div className="text-center w-full max-w-md mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">404</h1>
        <p className="text-lg sm:text-xl text-gray-600 mb-4">Oops! Pagina non trovata</p>
        <a href="/" className="text-blue-500 hover:text-blue-700 underline text-base">Torna alla Home</a>
      </div>
    </div>
  );
};

export default NotFound;
