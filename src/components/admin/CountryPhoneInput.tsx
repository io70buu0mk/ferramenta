import React, { useState } from "react";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { countries } from "@/utils/countries";

interface CountryPhoneInputProps {
  country: any;
  setCountry: (c: any) => void;
  phoneRaw: string;
  setPhoneRaw: (v: string) => void;
  disabled?: boolean;
}

export function CountryPhoneInput({ country, setCountry, phoneRaw, setPhoneRaw, disabled = false }: CountryPhoneInputProps) {
  const [search, setSearch] = useState("");
  const filtered = countries.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.dial.includes(search) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="flex items-center gap-2 w-full">
      <Select value={country.code} onValueChange={code => setCountry(countries.find(c => c.code === code)!)} disabled={disabled}>
        <SelectTrigger className={`w-40 min-w-[140px] bg-white/90 border border-neutral-300 shadow-sm ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
          <span className="flex items-center gap-2">
            <span className="text-xl">{country.flag}</span>
            <span className="font-medium">{country.dial}</span>
          </span>
        </SelectTrigger>
        {!disabled && (
          <SelectContent className="max-h-72 overflow-y-auto bg-white/95 border border-neutral-200 shadow-lg rounded-md">
            <div className="sticky top-0 z-10 bg-white/95 px-2 py-2 border-b border-neutral-100">
              <input
                type="text"
                className="w-full border rounded px-2 py-1 text-sm"
                placeholder="Cerca paese o prefisso"
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoFocus
              />
            </div>
            {filtered.map(c => (
              <SelectItem key={c.code} value={c.code} className="flex items-center gap-2 px-2 py-2 hover:bg-amber-50 transition-all">
                <span className="text-xl mr-2">{c.flag}</span>
                <span className="flex-1 font-medium text-neutral-800">{c.name}</span>
                <span className="text-xs text-neutral-500">{c.dial}</span>
              </SelectItem>
            ))}
          </SelectContent>
        )}
      </Select>
      <input
        type="tel"
        className={`flex-1 border rounded px-3 py-2 text-base bg-white/90 shadow-sm ${disabled ? 'opacity-60 pointer-events-none' : ''}`}
        placeholder="Numero di telefono"
        value={phoneRaw}
        onChange={e => setPhoneRaw(e.target.value.replace(/[^0-9]/g, ""))}
        maxLength={15}
        disabled={disabled}
      />
    </div>
  );
}
