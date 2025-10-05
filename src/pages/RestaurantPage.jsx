import React, { useEffect, useRef, useState } from 'react';
import { Chart } from 'chart.js/auto';
import './RestaurantPage.css';
import FoodWasteForm from '../components/FoodWasteForm';
import FoodLeftoverForm from '../components/FoodLeftoverForm';
import DataViewer from '../components/DataViewer';
import WasteAnalysisDashboard from '../components/WasteAnalysisDashboard';
import { wasteService, orderService } from '../lib/supabaseService';
import { WEEKDAYS, CONSISTENT_SAMPLE_DATA } from '../lib/wasteAnalysisService';

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
const FormsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>);
const NotificationsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>);
const DataViewerIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 17V7M9 17L5 13M9 17L13 13M15 7V17M15 7L19 11M15 7L11 11"></path></svg>);


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
            <button onClick={() => setActiveTab('forms')} className={activeTab === 'forms' ? 'active' : 'inactive'}>
                <FormsIcon /> <span>Forms</span>
            </button>
            <button onClick={() => setActiveTab('notifications')} className={activeTab === 'notifications' ? 'active' : 'inactive'}>
                <NotificationsIcon /> <span>Notifications</span>
            </button>
            <button onClick={() => setActiveTab('data-viewer')} className={activeTab === 'data-viewer' ? 'active' : 'inactive'}>
                <DataViewerIcon /> <span>Data Viewer</span>
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

const RescueChart = ({ percentage = 0 }) => {
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);

    useEffect(() => {
        if (!chartRef.current) return;
        
        // Destroy existing chart instance if it exists
        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }
        
        const rescueCtx = chartRef.current.getContext('2d');
        
        // Calculate chart data based on actual percentage
        const rescueValue = percentage;
        const wasteValue = 100 - percentage;
        
        chartInstanceRef.current = new Chart(rescueCtx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [rescueValue, wasteValue], 
                    backgroundColor: ['#10b981', '#6b7280'], 
                    borderColor: 'rgba(255, 255, 255, 0.2)', 
                    borderWidth: 4 
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
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
                chartInstanceRef.current = null;
        }
        };
    }, [percentage]);

    return <canvas ref={chartRef}></canvas>;
};

const WasteChart = ({ sampleData }) => {
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);

    useEffect(() => {
        if (!chartRef.current || !sampleData) return;
        
        // Destroy existing chart instance if it exists
        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }
        
        const ctx = chartRef.current.getContext('2d');
        
        chartInstanceRef.current = new Chart(ctx, {
            type: 'line',
            data: {
                labels: sampleData.dailyData.map(day => day.day.substring(0, 3)), // Mon, Tue, Wed, Thu, Fri, Sat, Sun
                datasets: [
                    {
                        label: 'Waste (servings)',
                        data: sampleData.dailyData.map(day => day.wasteServings),
                        backgroundColor: 'rgba(220, 38, 38, 0.1)',
                        borderColor: 'rgba(220, 38, 38, 1)',
                        borderWidth: 3,
                        pointBackgroundColor: 'rgba(220, 38, 38, 1)',
                        pointBorderColor: '#fff',
                        pointHoverRadius: 6,
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(220, 38, 38, 1)',
                        pointHoverBorderWidth: 3,
                        tension: 0.4,
                        fill: true,
                    },
                    {
                        label: 'Rescued (servings)',
                        data: sampleData.dailyData.map(day => day.rescueServings),
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
                    }
                ]
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
                    legend: { 
                        display: true,
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: { size: 12 }
                        }
                    }, 
                    tooltip: { 
                        backgroundColor: '#1f2937', 
                        titleFont: { size: 14 }, 
                        bodyFont: { size: 12 }, 
                        padding: 10, 
                        cornerRadius: 6, 
                        displayColors: true 
                    } 
                }
            }
        });

        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
                chartInstanceRef.current = null;
        }
        };
    }, [sampleData]);

    return <canvas ref={chartRef}></canvas>;
};

const WeeklyRescueProgress = ({ onAddWaste, sampleData, rescueData, onRescueUpdate, onResetToday, originalWasteValue }) => {
    const [rescueInput, setRescueInput] = useState('');

    // Get current waste and rescue data
    const todayWaste = sampleData ? sampleData.dailyData[6].wasteServings : 0;
    const todayRescue = rescueData ? rescueData.todayServingsRescued : 0;
    
    // Calculate rescue percentage: rescued / original wasted * 100
    const rescuePercentage = originalWasteValue > 0 ? Math.round((todayRescue / originalWasteValue) * 100) : 0;

    const handleSubmit = (e) => {
        e.preventDefault();
        const rescueServings = parseInt(rescueInput);
        
        if (isNaN(rescueServings) || rescueServings <= 0) {
            alert('Please enter a valid number for rescue servings.');
            return;
        }

        if (rescueServings > originalWasteValue) {
            alert(`Cannot rescue ${rescueServings} servings. You only have ${originalWasteValue} servings wasted today.`);
            return;
        }

        onRescueUpdate(rescueServings);
        setRescueInput(''); // Clear the input after successful rescue
    };

    const handleResetToday = () => {
        if (window.confirm('Are you sure you want to reset today\'s waste data? This will clear all waste and rescue data for today only.')) {
            onResetToday();
        }
    };

    return (
        <div className="progress-card lg-col-span-2">
            <div className="progress-card-overlay"></div>
            <div className="progress-card-content">
                <div className="form-section">
                    <div className="form-header">
                        <h3 className="progress-card-title">Log Today's Progress</h3>
                        <p className="progress-card-subtitle">Rescue servings from waste.</p>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="form-input-group">
                            <label htmlFor="rescue-input">Rescue (servings)</label>
                            <input 
                                type="number" 
                                id="rescue-input" 
                                className="form-input" 
                                placeholder="0" 
                                value={rescueInput}
                                onChange={(e) => setRescueInput(e.target.value)}
                                min="1"
                                max={originalWasteValue}
                            />
                            <small className="form-help-text">
                                Available to rescue: {originalWasteValue} servings
                            </small>
                        </div>
                        <button type="submit" className="form-submit-btn">
                            Update Progress
                        </button>
                    </form>
                    <button 
                        type="button" 
                        className="form-reset-btn"
                        onClick={handleResetToday}
                    >
                        Reset Today Data
                    </button>
                </div>
                
                <div className="stats-section">
                    <div className="progress-card-chart-wrapper">
                        <RescueChart percentage={rescuePercentage} />
                        <div className="progress-card-chart-text">
                            <span className="progress-card-percentage">{sampleData ? `${rescuePercentage}%` : '...'}</span>
                            <span className="progress-card-label">Rescue</span>
                        </div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value">{rescueData ? `${todayRescue} servings` : '...'}</div>
                        <div className="stat-label">Rescued</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value">{sampleData ? `${todayWaste} servings` : '...'}</div>
                        <div className="stat-label">Wasted</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCards = ({ sampleData }) => (
    <div className="stat-cards-container lg-col-span-1">
        <div className="stat-card stat-card-green">
            <div className="stat-card-header">
                <div className="stat-card-icon stat-card-icon-green"><BoxIcon /></div>
            </div>
            <div>
                <h3 className="stat-card-value">{sampleData ? sampleData.dailyData[6].wasteServings : '...'}</h3>
                <div className="stat-card-title">Today's Waste</div>
                <div className="stat-card-subtitle">servings wasted</div>
            </div>
        </div>
        <div className="stat-card stat-card-yellow">
            <div className="stat-card-header">
                <div className="stat-card-icon stat-card-icon-yellow"><WeekAverageIcon /></div>
            </div>
            <div>
                <h3 className="stat-card-value">{sampleData ? sampleData.totals.weekAverage : '...'}</h3>
                <div className="stat-card-title">Week Average</div>
                <div className="stat-card-subtitle">servings per day</div>
            </div>
        </div>
        <div className="stat-card stat-card-red">
            <div className="stat-card-header">
                <div className="stat-card-icon stat-card-icon-red"><TotalTrackedIcon /></div>
            </div>
            <div>
                <h3 className="stat-card-value">{sampleData ? sampleData.totals.totalWaste : '...'}</h3>
                <div className="stat-card-title">Total Waste</div>
                <div className="stat-card-subtitle">servings overall</div>
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

const TrendGraph = ({ sampleData }) => (
    <div className="trend-graph-card lg-col-span-2">
        <div className="trend-graph-header">
            <div>
                <h3 className="trend-graph-title">This Week's Waste & Rescue Trend</h3>
                <p className="trend-graph-subtitle">Daily waste and rescue servings</p>
            </div>
            <div className="trend-graph-legend">
                <div className="trend-graph-legend-dot waste-dot"></div>
                <span className="trend-graph-legend-text">Waste</span>
                <div className="trend-graph-legend-dot rescue-dot"></div>
                <span className="trend-graph-legend-text">Rescue</span>
            </div>
        </div>
        <div className="trend-graph-chart-wrapper">
            <WasteChart sampleData={sampleData} />
        </div>
    </div>
);

const History = ({ sampleData }) => {
    if (!sampleData) {
        return (
            <div className="history-section">
                <div className="history-header">
                    <h3 className="history-title">Recent Activities</h3>
                    <button className="history-view-all-btn">View All</button>
                </div>
                <div className="history-loading">Loading...</div>
            </div>
        );
    }

    return (
        <div className="history-section">
            <div className="history-header">
                <h3 className="history-title">Recent Activity</h3>
                <button className="history-view-all-btn">View All</button>
            </div>
            <div className="history-table">
                {sampleData.dailyData.map((day, index) => (
                    <div key={day.date} className="history-item">
                        <div className="history-item-date">{day.day}</div>
                        <div>
                            <div className="history-item-label">Waste</div>
                            <div className="history-item-value waste-value">{day.wasteServings} servings</div>
                        </div>
                        <div>
                            <div className="history-item-label">Rescued</div>
                            <div className="history-item-value rescue-value">{day.rescueServings} servings</div>
                        </div>
                        <div>
                            <div className="history-item-label">Remaining</div>
                            <div className="history-item-value remaining-value">{day.remainingWaste} servings</div>
                        </div>
                        <div className="history-item-status">
                            <span className="status-badge">{day.rescuePercentage}% rescued</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const RestaurantPage = ({ restaurantId }) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [wasteData, setWasteData] = useState({
        totalServingsWasted: 0,
        todayServingsWasted: 0,
        weekAverageWasted: 0,
        loading: true,
        error: null
    });

    const [rescueData, setRescueData] = useState({
        totalServingsRescued: 0,
        todayServingsRescued: 0,
        loading: true,
        error: null
    });

    // Generate sample data for 7 days (including Sunday as today with real data)
    const generateSampleData = (actualWasteData = null, actualRescueData = null, initialWasteValue = 20) => {
        const days = WEEKDAYS;
        const sampleData = days.map((day, index) => {
            // For Sunday (index 6), use actual data if available, otherwise use initial value
            if (index === 6) {
                if (actualWasteData && actualRescueData) {
                    const wasteServings = actualWasteData.todayServingsWasted || 0;
                    const rescueServings = actualRescueData.todayServingsRescued || 0;
                    const remainingWaste = wasteServings - rescueServings;
                    
                    return {
                        day,
                        date: new Date().toISOString().split('T')[0], // Today's date
                        wasteServings,
                        rescueServings,
                        remainingWaste,
                        rescuePercentage: wasteServings > 0 ? Math.round((rescueServings / wasteServings) * 100) : 0
                    };
                } else {
                    // Use consistent initial value for Sunday when no actual data
                    return {
                        day,
                        date: new Date().toISOString().split('T')[0], // Today's date
                        wasteServings: initialWasteValue,
                        rescueServings: 0,
                        remainingWaste: initialWasteValue,
                        rescuePercentage: 0
                    };
                }
            }
            
            // For other days (Monday-Saturday), use consistent sample data
            const dayData = CONSISTENT_SAMPLE_DATA[day];
            const wasteServings = dayData.wasteServings;
            const rescueServings = dayData.rescueServings;
            const remainingWaste = wasteServings - rescueServings;
            
            return {
                day,
                date: new Date(Date.now() - (6 - index) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                wasteServings,
                rescueServings,
                remainingWaste,
                rescuePercentage: Math.round((rescueServings / wasteServings) * 100)
            };
        });

        // Calculate totals
        const totalWaste = sampleData.reduce((sum, day) => sum + day.wasteServings, 0);
        const totalRescue = sampleData.reduce((sum, day) => sum + day.rescueServings, 0);
        const totalRemaining = totalWaste - totalRescue;
        const weekAverage = Math.round(totalWaste / 7);

        return {
            dailyData: sampleData,
            totals: {
                totalWaste,
                totalRescue,
                totalRemaining,
                weekAverage,
                overallRescuePercentage: Math.round((totalRescue / totalWaste) * 100)
            }
        };
    };

    const [sampleData, setSampleData] = useState(null);
    const [originalWasteValue, setOriginalWasteValue] = useState(null);

    // Generate sample data on component mount
    useEffect(() => {
        const initialWasteValue = 20; // Set consistent initial waste value
        const data = generateSampleData(null, null, initialWasteValue);
        setSampleData(data);
        
        // Store the original waste value for Sunday (today)
        setOriginalWasteValue(initialWasteValue);
        
        // Update waste and rescue data with sample data
        setWasteData(prev => ({
            ...prev,
            totalServingsWasted: data.totals.totalRemaining,
            todayServingsWasted: data.dailyData[6].remainingWaste, // Sunday (today)
            weekAverageWasted: data.totals.weekAverage,
            loading: false
        }));

        // Rescue data resets daily - today starts at 0
        setRescueData(prev => ({
            ...prev,
            totalServingsRescued: data.totals.totalRescue,
            todayServingsRescued: 0, // Daily rescue starts at 0 each day
            loading: false
        }));
    }, []);

    // Update sample data when waste or rescue data changes (to keep Sunday current)
    useEffect(() => {
        if (wasteData && rescueData && !wasteData.loading && !rescueData.loading) {
            // Use actual waste data from Supabase if available, otherwise use original value
            const actualWasteValue = wasteData.todayServingsWasted > 0 ? wasteData.todayServingsWasted : originalWasteValue;
            const updatedData = generateSampleData(wasteData, rescueData, actualWasteValue);
            setSampleData(updatedData);
            
            // Update original waste value if we have actual data (this ensures rescue calculations use the correct base)
            if (wasteData.todayServingsWasted > 0) {
                setOriginalWasteValue(wasteData.todayServingsWasted);
            }
        }
    }, [wasteData.todayServingsWasted, rescueData.todayServingsRescued, originalWasteValue]);

    // Function to fetch waste data
    const fetchWasteData = async () => {
        if (!restaurantId) {
            setWasteData(prev => ({ ...prev, loading: false }));
            return;
        }

        try {
            console.log('Fetching waste data for restaurant:', restaurantId);
            const result = await wasteService.getWasteByRestaurant(restaurantId);
            
            if (result.success) {
                const wasteEntries = result.data || [];
                
                // Calculate today's waste
                const today = new Date().toISOString().split('T')[0];
                const todayWaste = wasteEntries.filter(entry => entry.waste_date === today);
                const todayServingsWasted = todayWaste.reduce((total, entry) => total + (entry.servings_wasted || 0), 0);
                
                // Update original waste value if we have actual data from today
                if (todayServingsWasted > 0) {
                    setOriginalWasteValue(todayServingsWasted);
                }
                
                // Calculate total waste
                const totalServingsWasted = wasteEntries.reduce((total, entry) => total + (entry.servings_wasted || 0), 0);
                
                // Calculate week average (last 7 days)
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                const weekWaste = wasteEntries.filter(entry => new Date(entry.waste_date) >= weekAgo);
                const weekAverageWasted = weekWaste.length > 0 ? Math.round(weekWaste.reduce((total, entry) => total + (entry.servings_wasted || 0), 0) / 7) : 0;
                
                console.log('Waste data calculated:', {
                    totalServingsWasted,
                    todayServingsWasted,
                    weekAverageWasted
                });
                
                setWasteData({
                    totalServingsWasted,
                    todayServingsWasted,
                    weekAverageWasted,
                    loading: false,
                    error: null
                });
            } else {
                console.error('Failed to fetch waste data:', result.error);
                setWasteData(prev => ({
                    ...prev,
                    loading: false,
                    error: result.error
                }));
            }
        } catch (err) {
            console.error('Error fetching waste data:', err);
            setWasteData(prev => ({
                ...prev,
                loading: false,
                error: err.message
            }));
        }
    };

    // Fetch waste data when component mounts or restaurantId changes
    useEffect(() => {
        fetchWasteData();
    }, [restaurantId]);

    // Refresh waste data when returning to dashboard from forms tab
    useEffect(() => {
        if (activeTab === 'dashboard') {
            fetchWasteData();
        }
    }, [activeTab]);

    const handleAddWaste = () => {
        console.log('Add waste entry clicked - navigating to Forms tab');
        setActiveTab('forms');
    };

    const handleRescueUpdate = (rescueServings) => {
        if (rescueServings <= 0) {
            alert('Please enter a positive number for rescue servings.');
            return;
        }

        if (!sampleData) {
            alert('Data not loaded yet. Please try again.');
            return;
        }

        const todayWaste = sampleData.dailyData[6].wasteServings;
        if (rescueServings > todayWaste) {
            alert(`Cannot rescue ${rescueServings} servings. You only have ${todayWaste} servings wasted today.`);
            return;
        }

        // Update rescue data
        setRescueData(prev => ({
            ...prev,
            totalServingsRescued: prev.totalServingsRescued + rescueServings,
            todayServingsRescued: prev.todayServingsRescued + rescueServings
        }));

        // Update sample data to reflect the rescue operation
        setSampleData(prev => {
            if (!prev) return prev;
            
            const updatedDailyData = [...prev.dailyData];
            // Calculate original waste before rescue operation
            const originalWaste = updatedDailyData[6].wasteServings + updatedDailyData[6].rescueServings;
            
            // Update Sunday's data (index 6)
            updatedDailyData[6] = {
                ...updatedDailyData[6],
                wasteServings: Math.max(0, updatedDailyData[6].wasteServings - rescueServings),
                rescueServings: updatedDailyData[6].rescueServings + rescueServings,
                remainingWaste: Math.max(0, updatedDailyData[6].wasteServings - rescueServings),
                rescuePercentage: originalWaste > 0 ? 
                    Math.round(((updatedDailyData[6].rescueServings + rescueServings) / originalWaste) * 100) : 0
            };

            // Recalculate totals
            const totalWaste = updatedDailyData.reduce((sum, day) => sum + day.wasteServings, 0);
            const totalRescue = updatedDailyData.reduce((sum, day) => sum + day.rescueServings, 0);
            const totalRemaining = totalWaste - totalRescue;
            const weekAverage = Math.round(totalWaste / 7);

            return {
                dailyData: updatedDailyData,
                totals: {
                    totalWaste,
                    totalRescue,
                    totalRemaining,
                    weekAverage,
                    overallRescuePercentage: Math.round((totalRescue / totalWaste) * 100)
                }
            };
        });

        console.log(`Rescued ${rescueServings} servings. Updated Sunday data.`);
    };

    const handleResetToday = () => {
        if (!sampleData) {
            alert('Data not loaded yet. Please try again.');
            return;
        }

        // Reset rescue data for today
        setRescueData(prev => ({
            ...prev,
            todayServingsRescued: 0
        }));

        // Reset waste data for today
        setWasteData(prev => ({
            ...prev,
            todayServingsWasted: 0
        }));

        // Reset original waste value to 0
        setOriginalWasteValue(0);

        // Update sample data to reset Sunday's data
        setSampleData(prev => {
            if (!prev) return prev;
            
            const updatedDailyData = [...prev.dailyData];
            
            // Reset Sunday's data (index 6) to 0 waste, 0 rescue
            updatedDailyData[6] = {
                ...updatedDailyData[6],
                wasteServings: 0, // Reset waste to 0
                rescueServings: 0, // Reset rescue to 0
                remainingWaste: 0, // Remaining = 0
                rescuePercentage: 0 // Reset percentage to 0
            };

            // Recalculate totals
            const totalWaste = updatedDailyData.reduce((sum, day) => sum + day.wasteServings, 0);
            const totalRescue = updatedDailyData.reduce((sum, day) => sum + day.rescueServings, 0);
            const totalRemaining = totalWaste - totalRescue;
            const weekAverage = Math.round(totalWaste / 7);

            return {
                dailyData: updatedDailyData,
                totals: {
                    totalWaste,
                    totalRescue,
                    totalRemaining,
                    weekAverage,
                    overallRescuePercentage: Math.round((totalRescue / totalWaste) * 100)
                }
            };
        });

        console.log('Reset today\'s data. Sunday waste and rescue set to 0.');
    };

    const DashboardContent = () => (
        <div className="dashboard-content">
            <Header />
            <div className="grid-container lg-grid-cols-3">
                <WeeklyRescueProgress 
                    onAddWaste={handleAddWaste} 
                    sampleData={sampleData} 
                    rescueData={rescueData}
                    onRescueUpdate={handleRescueUpdate}
                    onResetToday={handleResetToday}
                    originalWasteValue={originalWasteValue}
                />
                <StatCards sampleData={sampleData} />
            </div>
            <div className="grid-container lg-grid-cols-3">
                <AddFormButton onAddWaste={handleAddWaste} />
                <TrendGraph sampleData={sampleData} />
            </div>
            <History sampleData={sampleData} />
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
          
          {/* Waste Analysis Dashboard */}
          <WasteAnalysisDashboard restaurantId={restaurantId} realTimeWasteData={wasteData} />
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

    // Notifications Content Component
    const NotificationsContent = () => {
        const [orders, setOrders] = useState([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);

        useEffect(() => {
            const fetchOrders = async () => {
                if (!restaurantId) return;
                
                try {
                    setLoading(true);
                    const result = await orderService.getOrdersByRestaurant(restaurantId);
                    
                    if (result.success) {
                        setOrders(result.data || []);
                    } else {
                        setError(result.error);
                    }
                } catch (err) {
                    console.error('Error fetching orders:', err);
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };

            fetchOrders();
        }, [restaurantId]);

        const handleOrderAction = async (orderId, action) => {
            try {
                const result = await orderService.updateOrderStatus(orderId, action);
                if (result.success) {
                    // Refresh orders
                    const refreshResult = await orderService.getOrdersByRestaurant(restaurantId);
                    if (refreshResult.success) {
                        setOrders(refreshResult.data || []);
                    }
                } else {
                    alert(`Failed to ${action} order: ${result.error}`);
                }
            } catch (err) {
                console.error(`Error ${action}ing order:`, err);
                alert(`Failed to ${action} order`);
            }
        };

        if (loading) {
  return (
                <div className="main-content">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading notifications...</p>
                    </div>
            </div>
            );
        }

        if (error) {
            return (
                <div className="main-content">
                    <div className="error-container">
                        <h3>Error loading notifications</h3>
                        <p>{error}</p>
            </div>
    </div>
  );
}

        return (
            <div className="main-content">
                <div className="content-header">
                    <h2>Pickup Notifications</h2>
                    <p>Manage incoming pickup requests from organizations</p>
                </div>

                <div className="notifications-container">
                    {orders.length === 0 ? (
                        <div className="empty-state">
                            <NotificationsIcon />
                            <h3>No pickup requests</h3>
                            <p>You don't have any pending pickup requests at the moment.</p>
                        </div>
                    ) : (
                        <div className="orders-list">
                            {orders.map(order => (
                                <div key={order.order_id} className="order-card">
                                    <div className="order-header">
                                        <div className="order-info">
                                            <h3>{order.pickups?.pickup_name || 'Unknown Organization'}</h3>
                                            <p className="order-date">
                                                Requested: {new Date(order.created_at).toLocaleDateString()}
                                            </p>
                                            <p className={`order-status status-${order.status}`}>
                                                Status: {order.status}
                                            </p>
                                        </div>
                                        <div className="order-actions">
                                            {order.status === 'pending' && (
                                                <>
                                                    <button 
                                                        onClick={() => handleOrderAction(order.order_id, 'approved')}
                                                        className="btn-approve"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button 
                                                        onClick={() => handleOrderAction(order.order_id, 'denied')}
                                                        className="btn-deny"
                                                    >
                                                        Deny
                                                    </button>
                                                </>
                                            )}
                                            {order.status === 'approved' && (
                                                <button 
                                                    onClick={() => handleOrderAction(order.order_id, 'completed')}
                                                    className="btn-complete"
                                                >
                                                    Mark Complete
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="order-items">
                                        <h4>Requested Items:</h4>
                                        {order.order_items && order.order_items.length > 0 ? (
                                            <ul>
                                                {order.order_items.map((item, index) => (
                                                    <li key={index}>
                                                        {item.waste?.recipes?.recipe_name || 'Unknown Recipe'} - 
                                                        {item.waste?.servings_wasted || 0} servings
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p>No specific items listed</p>
                                        )}
                                    </div>

                                    <div className="contact-info">
                                        <h4>Contact Information:</h4>
                                        <p>Organization: {order.pickups?.pickup_name || 'N/A'}</p>
                                        <p>Contact: {order.pickups?.contact_person || 'N/A'}</p>
                                        <p>Phone: {order.pickups?.phone_number || 'N/A'}</p>
                                        <p>Email: {order.pickups?.email || 'N/A'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const FormsContent = () => {
        const [activeForm, setActiveForm] = useState('daily-import');
        
        return (
            <div className="forms-content">
                <div className="page-banner banner-green">
                    <h1 className="page-header-title">Daily Forms</h1>
                    <p className="page-header-subtitle">Track your daily food inventory and leftovers.</p>
                </div>
                
                <div className="forms-tabs">
                    <button 
                        onClick={() => setActiveForm('daily-import')} 
                        className={`form-tab ${activeForm === 'daily-import' ? 'active' : ''}`}
                    >
                        Daily Import
                    </button>
                    <button 
                        onClick={() => setActiveForm('leftovers')} 
                        className={`form-tab ${activeForm === 'leftovers' ? 'active' : ''}`}
                    >
                        Food Leftovers
                    </button>
                </div>
                
                <div className="form-content">
                    {activeForm === 'daily-import' ? <FoodWasteForm restaurantId={restaurantId} /> : <FoodLeftoverForm restaurantId={restaurantId} />}
                </div>
            </div>
        );
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <DashboardContent />;
            case 'forms': return <FormsContent />;
            case 'notifications': return <NotificationsContent />;
            case 'data-viewer': return <DataViewer />;
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

