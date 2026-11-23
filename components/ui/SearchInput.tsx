import React from "react";
import { Search } from "lucide-react";

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearchSubmit?: (query: string) => void;
  buttonText?: string;
  className?: string;
}

export function SearchInput({
  placeholder = "Search topics, constitutional articles, treaties, or keywords...",
  buttonText = "Search PYQs",
  className = "",
  defaultValue,
  name = "q",
  ...props
}: SearchInputProps) {
  return (
    <form
      action="/pyqs"
      method="GET"
      className={`flex items-center w-full rounded-2xl border border-[#E7DDD4] bg-white p-1.5 shadow-xs transition focus-within:border-[#C69A4A] focus-within:ring-3 focus-within:ring-[#C69A4A]/20 ${className}`}
    >
      <div className="pl-3 pr-2 text-[#786B68]">
        <Search className="h-5 w-5 text-[#C69A4A]" />
      </div>
      <input
        type="text"
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        aria-label="Search previous year questions"
        className="w-full bg-transparent px-2 py-2 text-sm text-[#261B1E] placeholder:text-[#786B68] focus:outline-none min-h-[40px]"
        {...props}
      />
      <button
        type="submit"
        className="shrink-0 rounded-xl bg-[#741A2B] px-4 sm:px-5 py-2 text-sm font-bold text-white shadow-xs hover:bg-[#5E1422] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C69A4A] min-h-[40px]"
      >
        {buttonText}
      </button>
    </form>
  );
}
