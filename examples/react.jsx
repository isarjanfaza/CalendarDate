import React, { useEffect, useRef } from 'react';
import { createDualCalendar } from 'calendardate';
import 'calendardate/dist/dualcal.css';

function App() {
  const calendarRef = useRef(null);
  const calendarInstance = useRef(null);

  useEffect(() => {
    if (calendarRef.current && !calendarInstance.current) {
      calendarInstance.current = createDualCalendar(calendarRef.current, {
        holidays: [
          {
            date: '2026-07-20',
            calendar: 'gregorian',
            title: 'My Birthday',
            recurring: false,
            type: 'personal',
          },
          {
            date: '01/01',
            calendar: 'gregorian',
            title: 'New Year\'s Day',
            recurring: true,
            type: 'official',
          },
        ],
        weekendDays: [0, 6], // Saturday and Sunday
        locale: 'en', // Available: 'en', 'fr', 'de'
        onDayClick: (date) => {
          console.log('Day clicked:', date);
        },
        onMonthChange: (grid) => {
          console.log('Month changed:', grid);
        },
      });
    }

    return () => {
      calendarInstance.current?.destroy();
    };
  }, []);

  return (
    <div style={{ padding: '40px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: '500px', width: '100%' }}>
        <h1 style={{ textAlign: 'center', color: '#333' }}>CalendarDate - React Example</h1>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
          Gregorian calendar widget with holidays and events
        </p>
        <div ref={calendarRef} />
      </div>
    </div>
  );
}

export default App;
