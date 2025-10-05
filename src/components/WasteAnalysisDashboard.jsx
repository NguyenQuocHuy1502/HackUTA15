import React from 'react';
import WeeklyWasteChart from './WeeklyWasteChart';

const WasteAnalysisDashboard = ({ restaurantId, realTimeWasteData = null }) => {
    return (
        <div className="space-y-6">
            {/* Weekly Waste Chart */}
            <WeeklyWasteChart restaurantId={restaurantId} realTimeWasteData={realTimeWasteData} />
        </div>
    );
};

export default WasteAnalysisDashboard;