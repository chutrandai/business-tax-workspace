import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ShoppingCart,
  FileText,
  BarChart3,
  Settings,
  Users,
  LogOut,
  ChevronLeft,
  Menu,
  Bell,
  Search,
  User,
  TrendingUp,
  TrendingDown,
  Loader2
} from 'lucide-react';
import { dashboardApi } from '../api/dashboardApi';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'orders', label: 'Đơn hàng', icon: ShoppingCart },
  { id: 'reports', label: 'Báo cáo', icon: FileText },
  { id: 'statistics', label: 'Thống kê', icon: BarChart3 },
  { id: 'users', label: 'Người dùng', icon: Users },
  { id: 'settings', label: 'Cài đặt', icon: Settings },
];

const Sidebar = ({ isCollapsed, setIsCollapsed, activeMenu, setActiveMenu }) => {
  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-full bg-gradient-to-b from-slate-900 to-slate-800 z-40 flex flex-col"
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700/50">
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-white font-bold text-lg whitespace-nowrap"
          >
            Business Tax
          </motion.span>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
        >
          {isCollapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveMenu(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                      : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-slate-700/50">
        <button
          onClick={() => {
            localStorage.removeItem('accessToken');
            window.location.href = '/login';
          }}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="whitespace-nowrap"
            >
              Đăng xuất
            </motion.span>
          )}
        </button>
      </div>
    </motion.aside>
  );
};

const Header = ({ title, isSidebarCollapsed }) => (
  <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-6">
    <div className="flex items-center gap-4">
      <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
    </div>

    <div className="flex items-center gap-4">
      {/* Search */}
      <div className="relative hidden md:block">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Tìm kiếm..."
          className="pl-10 pr-4 py-2 bg-slate-100/80 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all w-64"
        />
      </div>

      {/* Notifications */}
      <button className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors">
        <Bell className="w-5 h-5" />
        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
      </button>

      {/* User */}
      <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
        <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-slate-800">Admin User</p>
          <p className="text-xs text-slate-500">admin@business.com</p>
        </div>
      </div>
    </div>
  </header>
);

const DashboardContent = ({ activeMenu, stats, isLoading }) => {
  const contentMap = {
    dashboard: {
      title: 'Dashboard',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-pulse">
                <div className="w-12 h-12 bg-slate-200 rounded-xl mb-4" />
                <div className="h-8 bg-slate-200 rounded mb-2 w-3/4" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
              </div>
            ))
          ) : (
            <>
              <StatCard
                label="Tổng đơn hàng"
                value={stats?.totalOrders?.toLocaleString() || '0'}
                change={stats?.revenueChange || '0%'}
                color="from-blue-500 to-blue-600"
                icon={ShoppingCart}
                trend={stats?.revenueChange?.startsWith('+') ? 'up' : 'down'}
              />
              <StatCard
                label="Doanh thu tháng"
                value={stats?.revenueMonth || '₫0'}
                change={stats?.revenueChange || '0%'}
                color="from-emerald-500 to-emerald-600"
                icon={BarChart3}
                trend={stats?.revenueChange?.startsWith('+') ? 'up' : 'down'}
              />
              <StatCard
                label="Đơn chờ xử lý"
                value={stats?.pendingOrders || '0'}
                change={stats?.pendingChange || '0%'}
                color="from-amber-500 to-amber-600"
                icon={FileText}
                trend={stats?.pendingChange?.startsWith('+') ? 'up' : 'down'}
              />
              <StatCard
                label="Khách hàng mới"
                value={stats?.newCustomers?.toLocaleString() || '0'}
                change={stats?.customersChange || '0%'}
                color="from-violet-500 to-violet-600"
                icon={Users}
                trend={stats?.customersChange?.startsWith('+') ? 'up' : 'down'}
              />
            </>
          )}
        </div>
      ),
    },
    orders: {
      title: 'Đơn hàng',
      content: (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <p className="text-slate-500">Danh sách đơn hàng sẽ hiển thị ở đây</p>
        </div>
      ),
    },
    reports: {
      title: 'Báo cáo',
      content: (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <p className="text-slate-500">Nội dung báo cáo sẽ hiển thị ở đây</p>
        </div>
      ),
    },
    statistics: {
      title: 'Thống kê',
      content: (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <p className="text-slate-500">Biểu đồ thống kê sẽ hiển thị ở đây</p>
        </div>
      ),
    },
    users: {
      title: 'Người dùng',
      content: (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <p className="text-slate-500">Danh sách người dùng sẽ hiển thị ở đây</p>
        </div>
      ),
    },
    settings: {
      title: 'Cài đặt',
      content: (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <p className="text-slate-500">Cài đặt hệ thống sẽ hiển thị ở đây</p>
        </div>
      ),
    },
  };

  return (
    <div className="p-6 space-y-6">
      {contentMap[activeMenu]?.content}
    </div>
  );
};

const StatCard = ({ label, value, change, color, icon: Icon, trend }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <span className={`text-sm font-medium flex items-center gap-1 ${trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
        {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
        {change}
      </span>
    </div>
    <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
    <p className="text-sm text-slate-500">{label}</p>
  </div>
);

export default function DashboardLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const title = menuItems.find((item) => item.id === activeMenu)?.label || 'Dashboard';

  useEffect(() => {
    if (activeMenu === 'dashboard') {
      setIsLoading(true);
      dashboardApi.getStats()
        .then((res) => setStats(res.data.data))
        .catch((err) => console.error('Failed to fetch stats:', err))
        .finally(() => setIsLoading(false));
    }
  }, [activeMenu]);

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
      />

      <div
        className={`transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-[260px]'}`}
      >
        <Header title={title} isSidebarCollapsed={isCollapsed} />
        <main className="min-h-[calc(100vh-64px)]">
          <DashboardContent activeMenu={activeMenu} stats={stats} isLoading={isLoading} />
        </main>
      </div>
    </div>
  );
}
