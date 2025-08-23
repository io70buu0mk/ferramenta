import React, { useState, useRef, useEffect } from "react";

interface Option {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({ options, value, onChange, placeholder, className }) => {
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      // 220px è l'altezza massima della dropdown
      setDropUp(spaceBelow < 220 && spaceAbove > spaceBelow);
    }
  }, [open]);

  return (
    <div ref={ref} className={`relative w-full ${className || ""}`}>
      <button
        ref={btnRef}
        type="button"
        className="w-full rounded-2xl border-2 border-yellow-300 bg-white p-4 shadow-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-500 transition-all duration-200 text-gray-900 text-base flex justify-between items-center outline-none hover:border-yellow-400"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{options.find(opt => opt.value === value)?.label || placeholder || "Seleziona"}</span>
        <svg className="w-5 h-5 ml-2 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <ul
          className={`absolute left-0 right-0 z-50 bg-white rounded-2xl shadow-2xl border-2 border-yellow-200 py-2 max-h-56 overflow-auto animate-fadeIn ${dropUp ? 'bottom-full mb-2' : 'mt-2'}`}
          role="listbox"
        >
          {options.map(opt => (
            <li
              key={opt.value}
              className={`px-5 py-3 cursor-pointer text-base transition-all duration-150 hover:bg-yellow-100 ${value === opt.value ? "bg-yellow-200 font-bold text-yellow-700" : "text-gray-700"}`}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              role="option"
              aria-selected={value === opt.value}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
