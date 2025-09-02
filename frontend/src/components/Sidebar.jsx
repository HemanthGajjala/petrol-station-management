import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Package, 
  BarChart3, 
  MessageSquare,
  Fuel,
  Database,
  Receipt,
  CreditCard,
  TrendingUp
} from 'lucide-react';

const Sidebar = ({ isMobileOpen = false, onMobileClose }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/daily-entry', icon: FileText, label: 'Daily Entry' },
    { path: '/procurement', icon: Package, label: 'Procurement' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/business-intelligence', icon: TrendingUp, label: 'Business Intelligence' },
    { path: '/hpcl-ledger', icon: Receipt, label: 'HPCL & Daily Ledger' },
    { path: '/customer-credit', icon: CreditCard, label: 'Customer Credit' },
    { path: '/all-data', icon: Database, label: 'All Data' },
    { path: '/ai-chat', icon: MessageSquare, label: 'AI Chat' },
  ];

  // ... rest of the component remains the same
  return (
    <div className={`
      gradient-bg-5 w-64 shadow-lg
      fixed lg:static inset-y-0 left-0 z-30
      transform ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} 
      lg:transform-none transition-transform duration-300 ease-in-out
    `}>
      <div className="p-6 border-b border-accent">
        <div className="flex items-center space-x-3">
          {/* Mobile close button - SAFE: only shows on mobile */}
          <button
            onClick={onMobileClose}
            className="lg:hidden p-1 rounded-md text-background hover:bg-primary hover:bg-opacity-10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <Fuel className="h-8 w-8" style={{ color: '#D4915D' }} />
          <div>
            <h2 className="text-lg font-bold" style={{ color: '#EEEDE4' }}>Petrol Station</h2>
            <p className="text-sm" style={{ color: '#CAB3A0' }}>Management System</p>
          </div>
        </div>
      </div>
      
      <nav className="mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onMobileClose} // SAFE: close sidebar on mobile when link clicked
              className={`flex items-center px-6 py-3 text-sm font-medium transition-colors duration-200 ${
                isActive
                  ? 'bg-secondary text-primary border-r-4 border-orange-warm'
                  : 'text-background hover:bg-primary hover:text-background'
              }`}
            >
              <Icon className="h-5 w-5 mr-3" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;