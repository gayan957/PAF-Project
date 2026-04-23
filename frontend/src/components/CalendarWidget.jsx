import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './CalendarWidget.css';

const CalendarWidget = () => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    const renderDays = () => {
        const days = [];
        // Empty slots for days before the 1st
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        }
        
        const today = new Date();
        const isCurrentMonth = today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();

        // Actual days
        for (let i = 1; i <= daysInMonth; i++) {
            const isToday = isCurrentMonth && i === today.getDate();
            days.push(
                <div key={`day-${i}`} className={`calendar-day ${isToday ? 'today' : ''}`}>
                    {i}
                </div>
            );
        }
        return days;
    };

    return (
        <div className="calendar-widget">
            <div className="calendar-header">
                <button onClick={prevMonth} className="calendar-nav-btn">
                    <ChevronLeft size={16} />
                </button>
                <div className="calendar-month-year">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </div>
                <button onClick={nextMonth} className="calendar-nav-btn">
                    <ChevronRight size={16} />
                </button>
            </div>
            
            <div className="calendar-grid">
                <div className="calendar-day-name">Sun</div>
                <div className="calendar-day-name">Mon</div>
                <div className="calendar-day-name">Tue</div>
                <div className="calendar-day-name">Wed</div>
                <div className="calendar-day-name">Thu</div>
                <div className="calendar-day-name">Fri</div>
                <div className="calendar-day-name">Sat</div>
                {renderDays()}
            </div>
        </div>
    );
};

export default CalendarWidget;
