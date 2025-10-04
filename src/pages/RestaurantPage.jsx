import React, { useEffect, useRef, useState } from 'react';
import { Chart } from 'chart.js/auto';
import './RestaurantPage.css';

// SVG ICON COMPONENTS 
const FecoLogo = () => (
    <svg width="160" height="50" viewBox="0 0 170 50" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="peelGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#EF4444" />
                <stop offset="100%" stopColor="#DC2626" />
            </linearGradient>
        </defs>
        <g><rect x="5" y="8" width="12" height="34" rx="2" fill="#4D7C0F" /><rect x="3" y="4" width="16" height="4" rx="2" fill="#65A30D" /><path d="M17 15 C 27 10, 37 15, 17 20 Z" fill="#84CC16" /><path d="M17 28 C 30 24, 40 28, 17 32 Z" fill="#84CC16" /></g>
        <g><path d="M70 27 C 50 27, 50 12, 70 12 C 90 12, 90 42, 60 42 C 45 42, 45 32, 55 30" fill="none" stroke="url(#peelGradient)" strokeWidth="5" strokeLinecap="round"/></g>
        <g><path d="M95 40 C 110 10, 125 10, 135 40 C 125 44, 110 44, 95 40" fill="#FDE047" /><path d="M95 40 C 93 37, 93 34, 95 32 L 97 33 Z" fill="#6B4628" /><path d="M96 39.5 C 100 30, 102 20, 100 15" stroke="#FBBF24" strokeWidth="1" fill="none" /></g>
        <g><circle cx="150" cy="27" r="15" fill="#F97316"/><circle cx="147" cy="21" r="1" fill="#EA580C" opacity="0.8"/><circle cx="155" cy="25" r="1" fill="#EA580C" opacity="0.8"/><circle cx="149" cy="34" r="1" fill="#EA580C" opacity="0.8"/><path d="M154 14 C 158 10, 164 12, 161 17" fill="#4ADE80"/></g>
    </svg>
);
const DashboardIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>);
const AnalyticsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>);
const HistoryIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 2v6h6V2h-6zM15.5 2v6h6V2h-6zM2.5 15.5v6h6v-6h-6zM15.5 15.5v6h6v-6h-6z"></path></svg>);
const SettingsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2.4l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2.4l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>);
const BoxIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>);
const WeekAverageIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>);
const TotalTrackedIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>);
const AddIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>);


// --- COMPONENT IMPLEMENTATIONS ---

const Sidebar = ({ activeTab, setActiveTab }) => (
    <aside className="sidebar">
        <div className="sidebar-header">
            <FecoLogo />
        </div>
        <nav className="sidebar-nav">
            <button onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? 'active' : 'inactive'}>
                <DashboardIcon /> <span>Dashboard</span>
            </button>
            <button onClick={() => setActiveTab('analytics')} className={activeTab === 'analytics' ? 'active' : 'inactive'}>
                <AnalyticsIcon /> <span>Analytics</span>
            </button>
            <button onClick={() => setActiveTab('history')} className={activeTab === 'history' ? 'active' : 'inactive'}>
                <HistoryIcon /> <span>History</span>
            </button>
            <button onClick={() => setActiveTab('settings')} className={activeTab === 'settings' ? 'active' : 'inactive'}>
                <SettingsIcon /> <span>Settings</span>
            </button>
        </nav>
        <div className="sidebar-footer">
            <div className="sidebar-footer-card">
                <div className="sidebar-footer-header">
                    <div className="sidebar-footer-dot"></div>
                    <span className="sidebar-footer-title">Today's Goal</span>
                </div>
                <div className="sidebar-footer-value">0 kg</div>
                <div className="sidebar-footer-target">Target: 5 kg waste reduction</div>
            </div>
        </div>
    </aside>
);

const Header = () => (
    <header className="page-header">
        <div>
            <h1 className="page-header-title">Dashboard</h1>
            <p className="page-header-subtitle">Track and manage your restaurant's food waste efficiently</p>
        </div>
        <div className="page-header-actions">
            <div className="last-updated-text">
                <p>Last updated</p>
                <p className="last-updated-time">2 minutes ago</p>
            </div>
            <div className="status-indicator">
                <div className="status-indicator-dot"></div>
            </div>
        </div>
    </header>
);

const RescueChart = () => {
    const chartRef = useRef(null);
    useEffect(() => {
        if (!chartRef.current) return;
        const rescueCtx = chartRef.current.getContext('2d');
        const chartInstance = new Chart(rescueCtx, {
            type: 'doughnut',
            data: { datasets: [{ data: [78, 22], backgroundColor: ['#10b981', '#6b7280'], borderColor: 'rgba(255, 255, 255, 0.2)', borderWidth: 4 }] },
            options: { responsive: true, maintainAspectRatio: false, cutout: '75%', plugins: { legend: { display: false }, tooltip: { enabled: false } } }
        });
        return () => chartInstance.destroy();
    }, []);
    return <canvas ref={chartRef}></canvas>;
};

const WasteChart = () => {
    const chartRef = useRef(null);
    useEffect(() => {
        if (!chartRef.current) return;
        const ctx = chartRef.current.getContext('2d');
        const chartInstance = new Chart(ctx, {
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
                    y: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.05)', borderDash: [3, 3] }, ticks: { color: '#6b7280' } },
                    x: { grid: { display: false }, ticks: { color: '#6b7280' } }
                },
                plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1f2937', titleFont: { size: 14 }, bodyFont: { size: 12 }, padding: 10, cornerRadius: 6, displayColors: false } }
            }
        });
        return () => chartInstance.destroy();
    }, []);
    return <canvas ref={chartRef}></canvas>;
};

const WeeklyRescueProgress = ({ onAddWaste }) => (
    <div className="progress-card lg-col-span-2">
        <div className="progress-card-overlay"></div>
        <div className="progress-card-content">
            <div className="progress-card-header">
                <div>
                    <h3 className="progress-card-title">Log Today's Progress</h3>
                    <p className="progress-card-subtitle">Update the numbers for today.</p>
                </div>
                <div className="progress-card-chart-wrapper">
                    <RescueChart />
                    <div className="progress-card-chart-text">
                        <span className="progress-card-percentage">78%</span>
                        <span className="progress-card-label">Rescue</span>
                    </div>
                </div>
            </div>
            
            <div className="progress-card-body">
                <div className="form-section">
                    <div className="form-input-group">
                        <label htmlFor="total-value-products">Total Value Products Today</label>
                        <input type="number" id="total-value-products" className="form-input" placeholder="e.g., 50" />
                    </div>
                    <div className="form-input-group">
                        <label htmlFor="progress-products-taken">Products Taken Today</label>
                        <input type="number" id="progress-products-taken" className="form-input" placeholder="e.g., 35" />
                    </div>
                    <button type="submit" className="form-submit-btn">Update Progress</button>
                </div>
                
                <div className="stats-section">
                    <div className="stat-item">
                        <div className="stat-value">125 lbs</div>
                        <div className="stat-label">Rescued</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value">35 lbs</div>
                        <div className="stat-label">Wasted</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const StatCards = () => (
    <div className="stat-cards-container lg-col-span-1">
        <div className="stat-card stat-card-green">
            <div className="stat-card-header">
                <div className="stat-card-icon stat-card-icon-green"><BoxIcon /></div>
            </div>
            <div>
                <h3 className="stat-card-value">24</h3>
                <p className="stat-card-title">Today's Total</p>
                <p className="stat-card-subtitle">items remaining</p>
            </div>
        </div>
        <div className="stat-card stat-card-yellow">
            <div className="stat-card-header">
                <div className="stat-card-icon stat-card-icon-yellow"><WeekAverageIcon /></div>
            </div>
            <div>
                <h3 className="stat-card-value">22</h3>
                <p className="stat-card-title">Week Average</p>
                <p className="stat-card-subtitle">items per day</p>
            </div>
        </div>
        <div className="stat-card stat-card-red">
            <div className="stat-card-header">
                <div className="stat-card-icon stat-card-icon-red"><TotalTrackedIcon /></div>
            </div>
            <div>
                <h3 className="stat-card-value">156</h3>
                <p className="stat-card-title">Total Tracked</p>
                <p className="stat-card-subtitle">items overall</p>
            </div>
        </div>
    </div>
);

const AddFormButton = ({ onAddWaste }) => (
    <div className="lg-col-span-1">
        <button onClick={onAddWaste} className="add-form-button">
            <div className="add-form-icon-wrapper"><AddIcon /></div>
            <h3 className="add-form-title">Add Today's Form</h3>
            <p className="add-form-subtitle">Click here to log today's food waste and track your progress</p>
        </button>
    </div>
);

const TrendGraph = () => (
    <div className="trend-graph-card lg-col-span-2">
        <div className="trend-graph-header">
            <div>
                <h3 className="trend-graph-title">This Week's Waste Trend</h3>
                <p className="trend-graph-subtitle">Amount of waste in lbs</p>
            </div>
            <div className="trend-graph-legend">
                <div className="trend-graph-legend-dot"></div>
                <span className="trend-graph-legend-text">Waste (lbs)</span>
            </div>
        </div>
        <div className="trend-graph-chart-wrapper"><WasteChart /></div>
    </div>
);

const History = () => {
    const historyData = [
        { date: 'Oct 03, 2025', logged: '35 Items', waste: '5.2 lbs', donated: '12 Items' },
        { date: 'Oct 02, 2025', logged: '41 Items', waste: '7.8 lbs', donated: '8 Items' },
        { date: 'Oct 01, 2025', logged: '28 Items', waste: '4.1 lbs', donated: '15 Items' },
    ];

    return (
        <div className="history-section">
            <div className="history-header">
                <h3 className="history-title">Recent Activity</h3>
                <button className="history-view-all-btn">View All</button>
            </div>
            <div className="history-table">
                {historyData.map((item, index) => (
                    <div key={index} className="history-item">
                        <div className="history-item-date">{item.date}</div>
                        <div>
                            <div className="history-item-label">Logged</div>
                            <div className="history-item-value">{item.logged}</div>
                        </div>
                        <div>
                            <div className="history-item-label">Waste</div>
                            <div className="history-item-value">{item.waste}</div>
                        </div>
                        <div>
                            <div className="history-item-label">Donated</div>
                            <div className="history-item-value">{item.donated}</div>
                        </div>
                        <div className="history-item-status">
                            <span className="status-badge">Completed</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const RestaurantPage = ({ onAddWaste }) => {
    const [activeTab, setActiveTab] = useState('dashboard');

    const handleAddWaste = () => {
        console.log('Add waste entry clicked');
        if (onAddWaste) onAddWaste();
    };

    const DashboardContent = () => (
        <div className="dashboard-content">
            <Header />
            <div className="grid-container lg-grid-cols-3">
                <WeeklyRescueProgress onAddWaste={handleAddWaste} />
                <StatCards />
            </div>
            <div className="grid-container lg-grid-cols-3">
                <AddFormButton onAddWaste={handleAddWaste} />
                <TrendGraph />
            </div>``
            <History />
        </div>
    );
    
    const PlaceholderContent = ({ title, subtitle, icon }) => (
         <div className="placeholder-content">
            {icon}
            <p className="placeholder-text-primary">{subtitle}</p>
            {title === 'History' && <p className="placeholder-text-secondary">Start tracking to build your history</p>}
        </div>
    );

    const AnalyticsContent = () => (
      <div className="analytics-content">
          <div className="page-banner banner-blue">
              <h1 className="page-header-title">Analytics Dashboard</h1>
              <p className="page-header-subtitle">Insights and trends for your food waste management.</p>
          </div>
          <div className="grid-container lg-grid-cols-2">
              <div className="trend-graph-card"><h3 className="trend-graph-title">Waste Trends</h3><PlaceholderContent subtitle="No data available yet" icon={<AnalyticsIcon />} /></div>
              <div className="trend-graph-card"><h3 className="trend-graph-title">Category Breakdown</h3><PlaceholderContent subtitle="Start tracking to see insights" icon={<BoxIcon />} /></div>
          </div>
      </div>
    );

    const HistoryContent = () => (
      <div className="history-content">
          <div className="page-banner banner-purple">
              <h1 className="page-header-title">Waste History</h1>
              <p className="page-header-subtitle">View and manage your historical food waste data.</p>
          </div>
          <div className="trend-graph-card">
               <PlaceholderContent title="History" subtitle="No history available yet" icon={<HistoryIcon />} />
          </div>
      </div>
    );

    const SettingsContent = () => (
      <div className="settings-content">
          <div className="page-banner banner-orange">
              <h1 className="page-header-title">Settings</h1>
              <p className="page-header-subtitle">Manage your account and application preferences.</p>
          </div>
          <div className="grid-container lg-grid-cols-2">
              <div className="trend-graph-card"><h3 className="trend-graph-title">Account Settings</h3><PlaceholderContent subtitle="Profile settings coming soon" /></div>
              <div className="trend-graph-card"><h3 className="trend-graph-title">Notifications</h3><PlaceholderContent subtitle="Notification preferences coming soon" /></div>
          </div>
      </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <DashboardContent />;
            case 'analytics': return <AnalyticsContent />;
            case 'history': return <HistoryContent />;
            case 'settings': return <SettingsContent />;
            default: return <DashboardContent />;
        }
    };

    return (
        <div className="app-container">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <main className="main-content">
                <div className="main-content-inner">{renderContent()}</div>
            </main>
        </div>
    );
};

export default RestaurantPage;
