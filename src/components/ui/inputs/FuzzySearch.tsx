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
        const trimmed = searchTerm.trim();
        if (trimmed === '') {
            setResults([]);
            return;
        }

        const keywords = trimmed.toLowerCase().split(/\s+/);
        
        const filteredResults = items.filter(item => {
            const mergedText = searchKeys
                .map(key => {
                    const value = item[key];
                    if (typeof value === 'string') return value;
                    if (Array.isArray(value)) return value.join(' ');
                    return '';
                })
                .join(' ')
                .toLowerCase();

            return keywords.every(keyword => mergedText.includes(keyword));
        });

        setResults(filteredResults);
    }, [searchTerm, items, searchKeys]);

    const handleSelect = (item: T) => {
        onSelect(item);
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
                    className="h-10 w-full pl-10 pr-8 bg-accent-400 rounded-md shadow-brand outline-none focus:ring-2 ring-accent-600 transition-all text-gray-700 placeholder:text-gray-500"
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
                <ul className="absolute z-10 top-10 mt-2 w-full max-h-60 overflow-y-auto bg-accent-500 backdrop-blur-sm rounded-md shadow-lg transition-colors duration-300">
                    {results.map((item, index) => (
                        <li key={index} className=' h-14'>
                            <button
                                onClick={() => handleSelect(item)}
                                className="h-full w-full text-left px-4 py-2 hover:bg-accent-600"
                            >
                                {displayRender(item)}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            {searchTerm && isFocused && results.length === 0 &&
                <ul className="absolute z-10 top-10 mt-2 w-full max-h-60 overflow-y-auto bg-accent-500 backdrop-blur-sm rounded-md shadow-lg transition-colors duration-300">
                    <li className='h-14' >
                        <p className='h-full w-full text-left px-4 py-2 text-gray-700'>
                            無符合結果
                        </p>
                    </li>
                </ul>
            }
            <div style={{ height: ((searchTerm && isFocused) ? Math.max(results.length, 1) * 3.5 + 0.3 : 0) + "rem" }} ></div>
        </div>
    );
}