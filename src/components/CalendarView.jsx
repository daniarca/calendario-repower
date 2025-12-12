import React, { useCallback } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import it from 'date-fns/locale/it';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

const locales = {
  'it': it,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const DnDCalendar = (withDragAndDrop.default || withDragAndDrop)(Calendar);

// The Static Generic Date
const GENERIC_DATE = new Date('2024-01-01T00:00:00');

// Custom Event Component for Readability & Actions
const CustomEvent = ({ event, onEdit, onDelete }) => {
    const isShort = (event.durationMinutes || 0) <= 20;

    const handleEditClick = (e) => {
        e.stopPropagation();
        onEdit(event);
    };

    const handleDeleteClick = (e) => {
        e.stopPropagation();
        onDelete(event);
    };

    return (
        <div className={`custom-event-container ${isShort ? 'short-event' : ''}`}>
            <div className="event-content">
                <span className="event-title">{event.title}</span>
                {!isShort && <div className="event-meta">{event.server}</div>}
            </div>
            
            <div className="event-actions">
                <button 
                    className="event-action-btn edit-action" 
                    onClick={handleEditClick}
                    title="Modifica"
                >
                    ✎
                </button>
                <button 
                    className="event-action-btn delete-action" 
                    onClick={handleDeleteClick}
                    title="Elimina"
                >
                    🗑
                </button>
            </div>
        </div>
    );
};


const CalendarView = ({ triggers, onSelectTrigger, onUpdateTrigger, onEditTrigger, onDeleteTrigger }) => {

  const handleEventDrop = useCallback(({ event, start, end }) => {
    // Calculate new duration
    const durationMinutes = Math.round((end - start) / 1000 / 60);
    
    onUpdateTrigger(event.id, {
        start,
        end,
        durationMinutes
    });
  }, [onUpdateTrigger]);

  const handleEventResize = useCallback(({ event, start, end }) => {
    const durationMinutes = Math.round((end - start) / 1000 / 60);
    
    onUpdateTrigger(event.id, {
        start,
        end,
        durationMinutes
    });
  }, [onUpdateTrigger]);
  
  // Wrapper to inject props into CustomEvent
  const components = {
      event: (props) => (
          <CustomEvent 
            {...props} 
            onEdit={onEditTrigger} 
            onDelete={onDeleteTrigger} 
          />
      ),
      toolbar: () => null // Keep toolbar hidden
  };
  
  return (
    <div style={{ height: '100%', padding: '0.5rem' }}>
      <DnDCalendar
        localizer={localizer}
        events={triggers} 
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        onSelectEvent={(event) => onSelectTrigger(event)}
        onDoubleClickEvent={(event) => onEditTrigger(event)} // Quick Edit
        
        // Drag & Drop Handlers
        onEventDrop={handleEventDrop}
        onEventResize={handleEventResize}
        resizable
        
        // Custom Components
        components={components}

        // Strict View Config
        views={['day']}
        defaultView="day"
        
        // Lock the date!
        date={GENERIC_DATE}
        onNavigate={() => {}} 
        
        // Format Config
        culture='it'
        step={15}
        timeslots={4}
        selectable
        onSelectSlot={(slotInfo) => onSelectTrigger(null, slotInfo)}
        
         formats={{
            timeGutterFormat: (date, culture, localizer) => 
                localizer.format(date, 'HH:mm', culture),
            eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
                `${localizer.format(start, 'HH:mm', culture)} - ${localizer.format(end, 'HH:mm', culture)}`,
         }}
      />
    </div>
  );
};

export default CalendarView;
