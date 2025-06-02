import {
  BellIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';

export default function Header() {
  return (
    <div className="flex items-center justify-between px-4 md:px-6 py-3 bg-white border-b shadow-sm">
      {/* Left - Logo */}
      <div className="flex items-center space-x-2">
        <div className="bg-blue-600 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center text-sm">
          Q
        </div>
        <span className="text-lg md:text-xl font-semibold text-gray-800">
          QuDemo
        </span>
      </div>

      {/* Right - Icons */}
      <div className="flex items-center gap-4 md:gap-6">
        {/* Optionally hide some icons on smaller screens */}
        <QuestionMarkCircleIcon className="w-5 h-5 md:w-6 md:h-6 text-gray-500 cursor-pointer hover:text-gray-700 hidden sm:block" />
        <BellIcon className="w-5 h-5 md:w-6 md:h-6 text-gray-500 cursor-pointer hover:text-gray-700" />
        <Cog6ToothIcon className="w-5 h-5 md:w-6 md:h-6 text-gray-500 cursor-pointer hover:text-gray-700 hidden sm:block" />
        
        {/* Avatar */}
        <div className="w-8 h-8 bg-gray-300 rounded-full cursor-pointer hover:ring-2 ring-blue-500 flex items-center justify-center text-white font-semibold text-sm">
          A
        </div>
      </div>
    </div>
  );
}
