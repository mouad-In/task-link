import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  LayoutDashboard, 
  ListTodo, 
  Briefcase, 
  MessageSquare, 
  Star, 
  Settings, 
  Users,
  BarChart3,
  Map
} from 'lucide-react';

const Sidebar = ({ isOpen }) => {
  const { user } = useSelector((state) => state.auth);

  const clientLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/tasks', icon: ListTodo, label: 'My Tasks' },
    { to: '/tasks/create', icon: Briefcase, label: 'Create Task' },
    { to: '/messages', icon: MessageSquare, label: 'Messages' },
    { to: '/profile/:id', icon: Star, label: 'Reviews' },
  ];

  const workerLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/tasks', icon: ListTodo, label: 'Browse Tasks' },
    { to: '/my-tasks', icon: Briefcase, label: 'My Tasks' },
    { to: '/messages', icon: MessageSquare, label: 'Messages' },
    { to: '/profile/:id', icon: Star, label: 'Reviews' },
  ];

  const adminLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/tasks', icon: ListTodo, label: 'Tasks' },
    { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/messages', icon: MessageSquare, label: 'Messages' },
  ];

  const getLinks = () => {
    switch (user?.role) {
      case 'client':
        return clientLinks;
      case 'worker':
        return workerLinks;
      case 'admin':
        return adminLinks;
      default:
        return clientLinks;
    }
  };

  return (
    <aside
      className={`fixed left-0 top-16 h-screen bg-white shadow-lg transition-transform duration-300 z-40 border-r border-gray-200 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } w-64`}
    >
      <div className="flex flex-col h-full">
        {/* User Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.firstName}`}
              alt={user?.firstName}
              className="w-10 h-10 rounded-full border-2 border-fuchsia-500/50"
            />
            <div>
              <p className="font-medium text-gray-800">{user?.firstName} {user?.lastName}</p>
              <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {getLinks().map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow-lg shadow-fuchsia-500/30'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <link.icon size={20} />
              <span>{link.label}</span>
            </NavLink>
          ))}

          {/* Map Link */}
          <NavLink
            to="/map"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow-lg shadow-fuchsia-500/30'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <Map size={20} />
            <span>Task Map</span>
          </NavLink>
        </nav>

        {/* Settings */}
        <div className="p-4 border-t border-gray-200">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow-lg shadow-fuchsia-500/30'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <Settings size={20} />
            <span>Settings</span>
          </NavLink>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

