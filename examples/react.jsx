import React, { useEffect, useRef } from 'react';
import { createDualCalendar } from 'dualcal';
import 'dualcal/dist/dualcal.css';

function App() {
  const calendarRef = useRef(null);
  const calendarInstance = useRef(null);

  useEffect(() => {
    if (calendarRef.current && !calendarInstance.current) {
      calendarInstance.current = createDualCalendar(calendarRef.current, {
        holidays: [
          {
            date: '1405/07/20',
            calendar: 'jalali',
            title: 'تولد من',
            recurring: false,
            type: 'personal',
          },
          {
            date: '01/01',
            calendar: 'jalali',
            title: 'نوروز',
            recurring: true,
            type: 'official',
          },
        ],
        weekendDays: [6], // Friday
        showHijri: true,
        gregorianDigits: 'latin',
        onDayClick: (date, jalaliDate) => {
          console.log('Day clicked:', date, jalaliDate);
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
        <h1 style={{ textAlign: 'center', color: '#333' }}>dualcal - React Example</h1>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
          Persian (Jalali) + Gregorian calendar widget
        </p>
        <div ref={calendarRef} />
      </div>
    </div>
  );
}

export default App;
