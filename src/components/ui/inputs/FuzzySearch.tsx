import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

interface FuzzySearchProps<T> {
    items: T[];
    searchKeys: (keyof T)[];
    onSelect: (item: T) => void;
    displayRender: (item: T) => React.ReactNode;
    placeholder?: string;
    className?: string;
}

export default function FuzzySearch<T>({
    items,
    searchKeys,
    onSelect,
    displayRender,
    placeholder = "搜尋...",
    className = ''
}: FuzzySearchProps<T>) {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<T[]>([]);
    const [isFocused, setIsFocused] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setResults([]);
            return;
        }

        const lowerCaseSearchTerm = searchTerm.toLowerCase();

        const filteredResults = items.filter(item => {
            return searchKeys.some(key => {
                const value = item[key];
                if (typeof value === 'string') {
                    return value.toLowerCase().includes(lowerCaseSearchTerm);
                }
                return false;
            });
        });

        setResults(filteredResults);
    }, [searchTerm, items, searchKeys]);

    const handleSelect = (item: T) => {
        onSelect(item);
        setSearchTerm('');
        setIsFocused(false);
        searchInputRef.current?.blur();
    };

    return (
        <div className={`relative ${className}`}>
            <div className="relative flex items-center">
                <input
                    ref={searchInputRef}
                    type="text"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                    className="h-10 w-full pl-10 pr-8 bg-accent-400 rounded-md shadow-brand outline-none focus:ring-2 ring-accent-600 transition-all"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                {searchTerm && (
                    <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5"
                        aria-label="清除搜尋"
                    >
                        <X className="w-4 h-4 text-gray-600" />
                    </button>
                )}
            </div>

            {isFocused && results.length > 0 && (
                <ul className="absolute z-10 top-full mt-2 w-full max-h-60 overflow-y-auto bg-white/90 backdrop-blur-sm rounded-md shadow-lg border border-gray-200">
                    {results.map((item, index) => (
                        <li key={index}>
                            <button
                                onMouseDown={() => handleSelect(item)}
                                className="w-full text-left px-4 py-2 hover:bg-accent-200"
                            >
                                {displayRender(item)}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}