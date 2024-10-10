/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable import/no-default-export */

/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useEffect, useRef, useState } from 'react'

export interface TokenInfo {
  id: string
  denom: string
  displayName: string
  decimalPlaces: number
  imageURL?: string
  symbol?: string
}

interface CustomTokenSelectProps {
  options: TokenInfo[]
  selectedOption: TokenInfo | undefined
  onOptionChange: (option: TokenInfo) => void
}

const CustomTokenSelect: React.FC<CustomTokenSelectProps> = ({ options, selectedOption, onOptionChange }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleOptionClick = (option: TokenInfo) => {
    onOptionChange(option)
    setIsOpen(false)
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="relative w-64" ref={dropdownRef}>
      <button
        className="py-2 pr-2 pl-3 ml-2 w-full text-base leading-5 text-left bg-zinc-900 rounded-md border-2 border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <div className="flex flex-row justify-between">
          {selectedOption ? (
            <div className="flex items-center">
              {selectedOption.imageURL && (
                <img
                  alt={selectedOption.displayName}
                  className="mr-2 w-6 h-6 rounded-full"
                  src={selectedOption.imageURL}
                />
              )}
              {selectedOption.displayName}
            </div>
          ) : (
            'Select a token'
          )}
          <svg
            className={`w-5 h-5 mt-1 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              clipRule="evenodd"
              d="M10 12a1 1 0 01-.707-.293l-4-4a1 1 0 011.414-1.414L10 9.586l3.293-3.293a1 1 0 111.414 1.414l-4 4A1 1 0 0110 12z"
              fillRule="evenodd"
            />
          </svg>
        </div>
      </button>

      {isOpen && (
        <ul className="overflow-auto absolute z-10 py-1 mt-1 ml-2 w-full max-h-60 text-base bg-zinc-900 rounded-md focus:outline-none ring-1 ring-black ring-opacity-5 shadow-lg sm:text-md">
          {options
            .sort((a, b) => a.displayName.localeCompare(b.displayName))
            .map((option) => (
              <li
                key={option.id}
                className="relative py-2 pr-9 pl-3 hover:text-white hover:bg-indigo-600 rounded-sm cursor-pointer select-none"
                onClick={() => handleOptionClick(option)}
              >
                <div className="flex items-center">
                  {option.imageURL && (
                    <img alt={option.displayName} className="mr-2 w-6 h-6 rounded-full" src={option.imageURL} />
                  )}
                  <span className="block font-normal truncate">{option.displayName}</span>
                </div>
              </li>
            ))}
        </ul>
      )}
    </div>
  )
}

export default CustomTokenSelect
