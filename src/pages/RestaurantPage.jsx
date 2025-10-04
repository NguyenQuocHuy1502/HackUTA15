import React, { useEffect, useRef, useState } from 'react';
import { Chart } from 'chart.js/auto';
import './RestaurantPage.css';

// SVG Icon Components
const LogoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
    </svg>
);

const DashboardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
    </svg>
);

const AnalyticsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"></line>
        <line x1="12" y1="20" x2="12" y2="4"></line>
        <line x1="6" y1="20" x2="6" y2="14"></line>
    </svg>
);

const HistoryIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2.5 2v6h6V2h-6zM15.5 2v6h6V2h-6zM2.5 15.5v6h6v-6h-6zM15.5 15.5v6h6v-6h-6z"></path>
    </svg>
);

const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2.4l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2.4l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
        <circle cx="12" cy="12" r="3"></circle>
    </svg>
);

const BoxIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
        <line x1="12" y1="22.08" x2="12" y2="12"></line>
    </svg>
);

const WeekAverageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
);

const TotalTrackedIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
);

const AddIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

// Enhanced Sidebar Component
const Sidebar = ({ activeTab, setActiveTab }) => (
    <aside className="w-72 bg-white shadow-xl flex flex-col border-r border-gray-200">
        <div className="p-6 flex items-center space-x-3 border-b border-gray-100">
            <div className="p-2 bg-green-100 rounded-lg">
                <LogoIcon />
            </div>
            <div>
                <h1 className="text-xl font-bold text-gray-800">FoodSaver</h1>
                <p className="text-sm text-gray-500">Restaurant Dashboard</p>
            </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
            <button 
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg font-medium transition-all duration-200 ${
                    activeTab === 'dashboard' 
                        ? 'text-green-700 bg-green-50 border border-green-200' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`}
            >
                <DashboardIcon />
                <span className="ml-3">Dashboard</span>
            </button>
            <button 
                onClick={() => setActiveTab('analytics')}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg font-medium transition-all duration-200 ${
                    activeTab === 'analytics' 
                        ? 'text-green-700 bg-green-50 border border-green-200' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`}
            >
                <AnalyticsIcon />
                <span className="ml-3">Analytics</span>
            </button>
            <button 
                onClick={() => setActiveTab('history')}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg font-medium transition-all duration-200 ${
                    activeTab === 'history' 
                        ? 'text-green-700 bg-green-50 border border-green-200' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`}
            >
                <HistoryIcon />
                <span className="ml-3">History</span>
            </button>
            <button 
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg font-medium transition-all duration-200 ${
                    activeTab === 'settings' 
                        ? 'text-green-700 bg-green-50 border border-green-200' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`}
            >
                <SettingsIcon />
                <span className="ml-3">Settings</span>
            </button>
        </nav>
        <div className="p-4 border-t border-gray-100">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-semibold text-green-800">Today's Goal</span>
                </div>
                <div className="text-2xl font-bold text-green-700 mb-1">0 kg</div>
                <div className="text-xs text-green-600">Target: 5 kg waste reduction</div>
            </div>
        </div>
    </aside>
);

// Enhanced Header Component
const Header = () => (
    <header className="mb-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
                <p className="text-gray-600">Track and manage your restaurant's food waste efficiently</p>
            </div>
            <div className="flex items-center space-x-4">
                <div className="text-right">
                    <p className="text-sm text-gray-500">Last updated</p>
                    <p className="text-sm font-medium text-gray-900">2 minutes ago</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
            </div>
        </div>
    </header>
);

// Enhanced Chart Components
const RescueChart = () => {
    const chartRef = useRef(null);

    useEffect(() => {
        if (!chartRef.current) return;
        
        const rescueCtx = chartRef.current.getContext('2d');
        const rescueData = { rescued: 78, wasted: 22 };
        
        let chartInstance = new Chart(rescueCtx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [rescueData.rescued, rescueData.wasted],
                    backgroundColor: ['#10b981', '#6b7280'],
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    borderWidth: 4,
                    hoverBorderColor: 'rgba(255, 255, 255, 0.3)',
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '75%',
                plugins: { 
                    legend: { display: false }, 
                    tooltip: { enabled: false } 
                }
            }
        });
        
        return () => {
            if (chartInstance) {
                chartInstance.destroy();
            }
        }
    }, []);

    return <canvas ref={chartRef} className="w-full h-full"></canvas>;
};

const WasteChart = () => {
    const chartRef = useRef(null);

    useEffect(() => {
        if (!chartRef.current) return;
        
        const ctx = chartRef.current.getContext('2d');
        
        let chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Waste (lbs)',
                    data: [12, 19, 15, 22, 18, 25, 21],
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 3,
                    pointBackgroundColor: 'rgba(16, 185, 129, 1)',
                    pointBorderColor: '#fff',
                    pointHoverRadius: 6,
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(16, 185, 129, 1)',
                    pointHoverBorderWidth: 3,
                    tension: 0.4,
                    fill: true,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { 
                        beginAtZero: true, 
                        grid: { color: 'rgba(0, 0, 0, 0.05)', borderDash: [3, 3] }, 
                        ticks: { color: '#6b7280' } 
                    },
                    x: { 
                        grid: { display: false }, 
                        ticks: { color: '#6b7280' } 
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: { 
                        backgroundColor: '#1f2937', 
                        titleFont: { size: 14 }, 
                        bodyFont: { size: 12 }, 
                        padding: 10, 
                        cornerRadius: 6, 
                        displayColors: false 
                    }
                }
            }
        });

        return () => {
            if (chartInstance) {
                chartInstance.destroy();
            }
        }
    }, []);

    return <canvas ref={chartRef} className="w-full h-full"></canvas>;
};

// Enhanced Progress Card
const WeeklyRescueProgress = ({ onAddWaste }) => (
    <div className="lg:col-span-2 bg-gradient-to-br from-green-600 to-green-700 rounded-xl shadow-lg p-6 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold mb-2">Log Today's Progress</h3>
                    <p className="text-green-100">Update the numbers for today.</p>
                </div>
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <RescueChart />
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-lg font-bold">78%</span>
                        <span className="text-xs text-green-100">Rescue</span>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <label htmlFor="total-value-products" className="block text-sm font-medium text-white mb-2">
                            Total Value Products Today
                        </label>
                        <input 
                            type="number" 
                            id="total-value-products" 
                            className="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 focus:bg-white focus:bg-opacity-30" 
                            placeholder="e.g., 50" 
                        />
                    </div>
                    <div>
                        <label htmlFor="progress-products-taken" className="block text-sm font-medium text-white mb-2">
                            Products Taken Today
                        </label>
                        <input 
                            type="number" 
                            id="progress-products-taken" 
                            className="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 focus:bg-white focus:bg-opacity-30" 
                            placeholder="e.g., 35" 
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="w-full bg-white text-green-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    >
                        Update Progress
                    </button>
                </div>
                
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="text-center">
                        <div className="text-3xl font-bold mb-1">125 lbs</div>
                        <div className="text-sm text-green-100">Rescued</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold mb-1">35 lbs</div>
                        <div className="text-sm text-green-100">Wasted</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// Enhanced Stat Cards
const StatCards = () => (
    <div className="lg:col-span-1 space-y-4">
        <div className="bg-white border-l-4 border-l-green-500 rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-50 rounded-lg">
                    <BoxIcon />
                </div>
            </div>
            <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">24</h3>
                <p className="text-gray-600 font-medium">Today's Total</p>
                <p className="text-gray-400 text-sm mt-1">items remaining</p>
            </div>
        </div>
        
        <div className="bg-white border-l-4 border-l-yellow-500 rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-50 rounded-lg">
                    <WeekAverageIcon />
                </div>
            </div>
            <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">22</h3>
                <p className="text-gray-600 font-medium">Week Average</p>
                <p className="text-gray-400 text-sm mt-1">items per day</p>
            </div>
        </div>
        
        <div className="bg-white border-l-4 border-l-red-500 rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-50 rounded-lg">
                    <TotalTrackedIcon />
                </div>
            </div>
            <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">156</h3>
                <p className="text-gray-600 font-medium">Total Tracked</p>
                <p className="text-gray-400 text-sm mt-1">items overall</p>
            </div>
        </div>
    </div>
);

// Enhanced Add Form Button
const AddFormButton = ({ onAddWaste }) => (
    <div className="lg:col-span-1">
        <button 
            onClick={onAddWaste}
            className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl shadow-lg text-white p-6 flex flex-col justify-center items-center text-center hover:from-gray-600 hover:to-gray-700 hover:scale-105 transition-all duration-300 group"
        >
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4 group-hover:bg-opacity-30 transition-all duration-300">
                <AddIcon />
            </div>
            <h3 className="text-xl font-bold mb-2">Add Today's Form</h3>
            <p className="text-gray-300 text-sm">Click here to log today's food waste and track your progress</p>
        </button>
    </div>
);

// Enhanced Trend Graph
const TrendGraph = () => (
    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900">This Week's Waste Trend</h3>
                <p className="text-sm text-gray-500">Amount of waste in lbs</p>
            </div>
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Waste (lbs)</span>
                </div>
            </div>
        </div>
        <div className="h-64">
            <WasteChart />
        </div>
    </div>
);

// Enhanced History Component
const History = () => {
    const historyData = [
        { date: 'Oct 03, 2025', logged: '35 Items', waste: '5.2 lbs', donated: '12 Items', status: 'completed' },
        { date: 'Oct 02, 2025', logged: '41 Items', waste: '7.8 lbs', donated: '8 Items', status: 'completed' },
        { date: 'Oct 01, 2025', logged: '28 Items', waste: '4.1 lbs', donated: '15 Items', status: 'completed' },
    ];

    return (
        <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
                <button className="text-green-600 hover:text-green-700 font-medium text-sm">View All</button>
            </div>
            <div className="space-y-4">
                {historyData.map((item, index) => (
                    <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
                        <div className="grid grid-cols-2 md:grid-cols-5 items-center gap-4">
                            <div className="font-semibold text-gray-900">{item.date}</div>
                            <div>
                                <div className="text-xs text-gray-500 uppercase tracking-wide">Logged</div>
                                <div className="font-medium text-gray-700">{item.logged}</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 uppercase tracking-wide">Waste</div>
                                <div className="font-medium text-gray-700">{item.waste}</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 uppercase tracking-wide">Donated</div>
                                <div className="font-medium text-gray-700">{item.donated}</div>
                            </div>
                            <div className="text-right">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Completed
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Main RestaurantPage Component
const RestaurantPage = ({ onAddWaste }) => {
    const [activeTab, setActiveTab] = useState('dashboard');

    const handleAddWaste = () => {
        console.log('Add waste entry clicked');
        if (onAddWaste) {
            onAddWaste();
        }
    };

    const renderDashboardContent = () => (
        <div className="space-y-8">
            <Header />
            
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <WeeklyRescueProgress onAddWaste={handleAddWaste} />
                <StatCards />
            </div>
            
            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <AddFormButton onAddWaste={handleAddWaste} />
                <TrendGraph />
            </div>
            
            <History />
        </div>
    );

    const renderAnalyticsContent = () => (
        <div className="space-y-8">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
                <p className="text-gray-600">Insights and trends for your food waste management.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Waste Trends</h3>
                    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                            <AnalyticsIcon />
                            <p className="text-gray-500 mt-2">No data available yet</p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
                    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                            <BoxIcon />
                            <p className="text-gray-500 mt-2">Start tracking to see insights</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderHistoryContent = () => (
        <div className="space-y-8">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Waste History</h1>
                <p className="text-gray-600">View and manage your historical food waste data.</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="h-96 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                        <HistoryIcon />
                        <p className="text-gray-500 mt-2">No history available yet</p>
                        <p className="text-sm text-gray-400 mt-1">Start tracking to build your history</p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderSettingsContent = () => (
        <div className="space-y-8">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
                <p className="text-gray-600">Manage your account and application preferences.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500">Profile settings coming soon</p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500">Notification preferences coming soon</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return renderDashboardContent();
            case 'analytics':
                return renderAnalyticsContent();
            case 'history':
                return renderHistoryContent();
            case 'settings':
                return renderSettingsContent();
            default:
                return renderDashboardContent();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="flex">
                <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
                
                <main className="flex-1 p-8">
                    <div className="max-w-7xl mx-auto">
                        {renderContent()}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default RestaurantPage;