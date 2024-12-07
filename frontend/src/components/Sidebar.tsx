import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  ChatBubbleLeftRightIcon, 
  DocumentTextIcon, 
  BriefcaseIcon 
} from '@heroicons/react/24/outline';

interface SidebarItem {
  name: string;
  path: string;
  icon: React.ElementType;
}

const sidebarItems: SidebarItem[] = [
  { 
    name: 'Dashboard', 
    path: '/dashboard', 
    icon: HomeIcon 
  },
  { 
    name: 'Interview Chat', 
    path: '/chat', 
    icon: ChatBubbleLeftRightIcon 
  },
  { 
    name: 'Prep Plan', 
    path: '/prep-plan', 
    icon: DocumentTextIcon 
  },
  { 
    name: 'Job Roles', 
    path: '/job-roles', 
    icon: BriefcaseIcon 
  },
];

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="w-64 h-screen bg-white text-gray-800 fixed left-0 top-0 z-50 shadow-lg border-r">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-blue-600">Interview Prep</h1>
      </div>
      
      <nav className="mt-6">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <div
              key={item.path}
              className={`
                flex items-center px-6 py-3 cursor-pointer transition-colors duration-200
                ${isActive 
                  ? 'bg-blue-50 text-blue-600 font-semibold' 
                  : 'hover:bg-gray-50 text-gray-600 hover:text-blue-600'}
              `}
              onClick={() => navigate(item.path)}
            >
              <Icon className={`w-6 h-6 mr-4 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
              <span className="text-md">{item.name}</span>
            </div>
          );
        })}
      </nav>
      
      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-100 rounded-full mr-4 flex items-center justify-center">
            <span className="text-blue-600 font-bold">U</span>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-800">User Name</div>
            <div className="text-xs text-gray-500">user@example.com</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
