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

const Sidebar = () => {
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
    <div className="gradient-bg-5 w-64 shadow-lg">
      <div className="p-6 border-b border-accent">
        <div className="flex items-center space-x-3">
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