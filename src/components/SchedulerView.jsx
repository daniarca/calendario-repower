import React, { useMemo } from 'react';

const HOURS = Array.from({ length: 24 }, (_, i) => i); // 00:00 to 23:00

const DAY_LABELS = {
    0: 'DOM', 1: 'LUN', 2: 'MAR', 3: 'MER', 4: 'GIO', 5: 'VEN', 6: 'SAB'
};

// Detect overlapping triggers and assign slot positions
const calculateOverlapLayout = (triggers) => {
    if (!triggers.length) return [];
    
    // Sort by start time
    const sorted = [...triggers].sort((a, b) => new Date(a.start) - new Date(b.start));
    
    // Track active columns (ongoing triggers)
    const columns = [];
    const result = [];
    
    for (const trigger of sorted) {
        const startTime = new Date(trigger.start).getTime();
        const endTime = new Date(trigger.end).getTime();
        
        // Find first available column (where previous trigger has ended)
        let slotIndex = 0;
        while (slotIndex < columns.length && columns[slotIndex] > startTime) {
            slotIndex++;
        }
        
        // Assign slot
        columns[slotIndex] = endTime;
        
        result.push({
            ...trigger,
            slotIndex,
            totalSlots: columns.length // Will update later
        });
    }
    
    // Calculate max concurrent for each trigger's time range
    return result.map(trigger => {
        const myStart = new Date(trigger.start).getTime();
        const myEnd = new Date(trigger.end).getTime();
        
        // Count how many triggers overlap with this one
        const concurrent = result.filter(t => {
            const tStart = new Date(t.start).getTime();
            const tEnd = new Date(t.end).getTime();
            return !(tEnd <= myStart || tStart >= myEnd);
        });
        
        const maxSlot = Math.max(...concurrent.map(t => t.slotIndex)) + 1;
        
        return {
            ...trigger,
            totalSlots: maxSlot
        };
    });
};

const SchedulerView = ({ triggers, onSelectTrigger, onEditTrigger, onDeleteTrigger }) => {

    // Group and calculate layout for each column
    const layoutData = useMemo(() => ({
        daily: calculateOverlapLayout(triggers.filter(t => t.recurrenceType === 'DAILY')),
        weekly: calculateOverlapLayout(triggers.filter(t => t.recurrenceType === 'WEEKLY')),
        custom: calculateOverlapLayout(triggers.filter(t => t.recurrenceType === 'CUSTOM'))
    }), [triggers]);

    // Calculate vertical position based on start time (percentage of day)
    const getTopPercent = (trigger) => {
        const start = new Date(trigger.start);
        const hour = start.getHours();
        const minutes = start.getMinutes();
        const totalMinutes = hour * 60 + minutes;
        return (totalMinutes / 1440) * 100;
    };

    // Calculate height based on duration (percentage of day)
    const getHeightPercent = (trigger) => {
        const durationMinutes = trigger.durationMinutes || 15;
        const calcPercent = (durationMinutes / 1440) * 100;
        return Math.max(calcPercent, 2.5);
    };

    // Check if card is "compact" (short duration)
    const isCompact = (trigger) => {
        return (trigger.durationMinutes || 15) < 30;
    };

    // Render a single trigger card with tooltip and overlap positioning
    const TriggerCard = ({ trigger, colorClass }) => {
        const compact = isCompact(trigger);
        const timeStr = new Date(trigger.start).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
        const tooltipText = `${trigger.title}\n${timeStr} • ${trigger.durationMinutes || 15}min\n${trigger.server || ''}`;
        
        // Calculate horizontal positioning for overlaps
        const widthPercent = 100 / trigger.totalSlots;
        const leftPercent = trigger.slotIndex * widthPercent;
        
        return (
            <div 
                className={`trigger-card ${colorClass} ${compact ? 'compact-card' : ''}`}
                style={{
                    top: `${getTopPercent(trigger)}%`,
                    height: `${getHeightPercent(trigger)}%`,
                    left: `${leftPercent}%`,
                    width: `${widthPercent}%`
                }}
                onClick={() => onSelectTrigger(trigger)}
                data-tooltip={tooltipText}
            >
                <div className="card-content">
                    {trigger.recurrenceType === 'WEEKLY' && (
                        <span className="day-badge">{DAY_LABELS[trigger.dayOfWeek]}</span>
                    )}
                    <span className="card-time">{timeStr}</span>
                    {!compact && <span className="card-title">{trigger.title}</span>}
                </div>
            </div>
        );
    };

    return (
        <div className="scheduler-container">
            {/* Header Row */}
            <div className="scheduler-header">
                <div className="time-column-header"></div>
                <div className="column-header daily-header">GIORNALIERO</div>
                <div className="column-header weekly-header">SETTIMANALE</div>
                <div className="column-header custom-header">CUSTOM</div>
            </div>

            {/* Grid Body */}
            <div className="scheduler-body">
                {/* Time Column */}
                <div className="time-column">
                    {HOURS.map(hour => (
                        <div key={hour} className="time-slot">
                            {String(hour).padStart(2, '0')}
                        </div>
                    ))}
                </div>

                {/* Daily Column */}
                <div className="trigger-column daily-column">
                    <div className="column-background">
                        {HOURS.map(hour => (
                            <div key={hour} className="hour-line" />
                        ))}
                    </div>
                    <div className="triggers-layer">
                        {layoutData.daily.map(trigger => (
                            <TriggerCard key={trigger.id} trigger={trigger} colorClass="daily-card" />
                        ))}
                    </div>
                </div>

                {/* Weekly Column */}
                <div className="trigger-column weekly-column">
                    <div className="column-background">
                        {HOURS.map(hour => (
                            <div key={hour} className="hour-line" />
                        ))}
                    </div>
                    <div className="triggers-layer">
                        {layoutData.weekly.map(trigger => (
                            <TriggerCard key={trigger.id} trigger={trigger} colorClass="weekly-card" />
                        ))}
                    </div>
                </div>

                {/* Custom Column */}
                <div className="trigger-column custom-column">
                    <div className="column-background">
                        {HOURS.map(hour => (
                            <div key={hour} className="hour-line" />
                        ))}
                    </div>
                    <div className="triggers-layer">
                        {layoutData.custom.map(trigger => (
                            <TriggerCard key={trigger.id} trigger={trigger} colorClass="custom-card" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SchedulerView;
