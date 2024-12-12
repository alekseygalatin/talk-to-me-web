import { ArrowLeft, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
    openSidebar: () => void;
  }

const Header: React.FC<HeaderProps> = ({ openSidebar }) => {

    const navigate = useNavigate();
    
    return (
        <header 
            className='flex items-center justify-between p-3 sm:p-4 w-full bg-white dark:bg-gray-800 shadow-md z-20'
            style={{
            paddingTop: `calc(env(safe-area-inset-top) + 0.75rem)`,
            }}
        >
            <div className="flex items-center gap-2 sm:gap-3">
            <button
                onClick={() => navigate('/select-partner')}
                className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <div>
                <h1 className='text-lg sm:text-xl font-semibold text-gray-900 dark:text-white'>Talk And Learn</h1>
                <p className='text-xs sm:text-sm text-gray-500 dark:text-gray-400'>Language Teacher</p>
            </div>
            </div>
            <button
                onClick={ openSidebar }
                className='p-1.5 sm:p-2 rounded-lg transition-colors hover:bg-gray-100 text-gray-600 dark:hover:bg-gray-700 text-gray-300'
            >
            <Settings className="w-5 h-5" />
            </button>
        </header>
    );
  } 

  export default Header;