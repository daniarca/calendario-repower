import React, { useMemo, useCallback } from 'react';

const HOURS = Array.from({ length: 24 }, (_, i) => i);

const DAY_LABELS = {
    0: 'DOM', 1: 'LUN', 2: 'MAR', 3: 'MER', 4: 'GIO', 5: 'VEN', 6: 'SAB'
};

// Server color variants
const SERVER_COLORS = {
    'uipathprdvw01': { bg: 'rgba(211, 17, 69, 0.15)', border: '#D31145' }, // Red
    'REAPPAS61': { bg: 'rgba(37, 99, 235, 0.15)', border: '#2563EB' },      // Blue
    'default': { bg: 'rgba(156, 163, 175, 0.15)', border: '#9CA3AF' }       // Grey
};

// Detect overlapping triggers and assign slot positions
const calculateOverlapLayout = (triggers) => {
    if (!triggers.length) return [];
    
    const sorted = [...triggers].sort((a, b) => new Date(a.start) - new Date(b.start));
    const columns = [];
    const result = [];
    
    for (const trigger of sorted) {
        const startTime = new Date(trigger.start).getTime();
        const endTime = new Date(trigger.end).getTime();
        
        let slotIndex = 0;
        while (slotIndex < columns.length && columns[slotIndex] > startTime) {
            slotIndex++;
        }
        
        columns[slotIndex] = endTime;
        
        result.push({
            ...trigger,
            slotIndex,
            totalSlots: columns.length
        });
    }
    
    return result.map(trigger => {
        const myStart = new Date(trigger.start).getTime();
        const myEnd = new Date(trigger.end).getTime();
        
        const concurrent = result.filter(t => {
            const tStart = new Date(t.start).getTime();
            const tEnd = new Date(t.end).getTime();
            return !(tEnd <= myStart || tStart >= myEnd);
        });
        
        const maxSlot = Math.max(...concurrent.map(t => t.slotIndex)) + 1;
        
        return { ...trigger, totalSlots: maxSlot };
    });
};

const SchedulerView = ({ triggers, onSelectTrigger, onEditTrigger, onDeleteTrigger, onUpdateTrigger }) => {

    const layoutData = useMemo(() => ({
        daily: calculateOverlapLayout(triggers.filter(t => t.recurrenceType === 'DAILY')),
        weekly: calculateOverlapLayout(triggers.filter(t => t.recurrenceType === 'WEEKLY')),
        custom: calculateOverlapLayout(triggers.filter(t => t.recurrenceType === 'CUSTOM'))
    }), [triggers]);

    const getTopPercent = (trigger) => {
        const start = new Date(trigger.start);
        return ((start.getHours() * 60 + start.getMinutes()) / 1440) * 100;
    };

    const getHeightPercent = (trigger) => {
        const durationMinutes = trigger.durationMinutes || 15;
        return Math.max((durationMinutes / 1440) * 100, 2.5);
    };

    const isCompact = (trigger) => (trigger.durationMinutes || 15) < 30;

    // Drag and Drop handlers
    const handleDragStart = useCallback((e, trigger) => {
        e.dataTransfer.setData('triggerId', trigger.id);
        e.dataTransfer.effectAllowed = 'move';
    }, []);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }, []);

    const handleDrop = useCallback((e, columnElement) => {
        e.preventDefault();
        const triggerId = e.dataTransfer.getData('triggerId');
        if (!triggerId || !onUpdateTrigger) return;

        const rect = columnElement.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const percentY = (y / rect.height) * 100;
        
        // Convert to time (percentage of 24h)
        const totalMinutes = Math.round((percentY / 100) * 1440);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = Math.round((totalMinutes % 60) / 15) * 15; // Round to 15min

        const trigger = triggers.find(t => t.id === triggerId);
        if (!trigger) return;

        const newStart = new Date('2024-01-01');
        newStart.setHours(hours, minutes, 0, 0);
        const newEnd = new Date(newStart.getTime() + (trigger.durationMinutes || 15) * 60000);

        onUpdateTrigger(triggerId, { start: newStart, end: newEnd });
    }, [triggers, onUpdateTrigger]);

    // Get color based on server
    const getServerColors = (server) => {
        return SERVER_COLORS[server] || SERVER_COLORS.default;
    };

    const TriggerCard = ({ trigger, colorClass }) => {
        const compact = isCompact(trigger);
        const timeStr = new Date(trigger.start).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
        const tooltipText = `${trigger.title}\n${timeStr} • ${trigger.durationMinutes || 15}min\n${trigger.server || ''}`;
        
        const widthPercent = 100 / trigger.totalSlots;
        const leftPercent = trigger.slotIndex * widthPercent;
        const serverColors = getServerColors(trigger.server);
        
        return (
            <div 
                className={`trigger-card ${compact ? 'compact-card' : ''}`}
                style={{
                    top: `${getTopPercent(trigger)}%`,
                    height: `${getHeightPercent(trigger)}%`,
                    left: `${leftPercent}%`,
                    width: `${widthPercent}%`,
                    background: serverColors.bg,
                    borderLeft: `3px solid ${serverColors.border}`
                }}
                onClick={() => onSelectTrigger(trigger)}
                data-tooltip={tooltipText}
                draggable
                onDragStart={(e) => handleDragStart(e, trigger)}
            >
                <div className="card-content">
                    {trigger.recurrenceType === 'WEEKLY' && (
                        <span className="day-badge">{DAY_LABELS[trigger.dayOfWeek]}</span>
                    )}
                    <span className="card-time" style={{ color: serverColors.border }}>{timeStr}</span>
                    {!compact && <span className="card-title">{trigger.title}</span>}
                </div>
            </div>
        );
    };

    const renderColumn = (columnData, colorClass, columnRef) => (
        <div 
            className={`trigger-column ${colorClass}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, e.currentTarget)}
        >
            <div className="column-background">
                {HOURS.map(hour => <div key={hour} className="hour-line" />)}
            </div>
            <div className="triggers-layer">
                {columnData.map(trigger => (
                    <TriggerCard key={trigger.id} trigger={trigger} colorClass={colorClass} />
                ))}
            </div>
        </div>
    );

    return (
        <div className="scheduler-container">
            <div className="scheduler-header">
                <div className="time-column-header"></div>
                <div className="column-header daily-header">GIORNALIERO</div>
                <div className="column-header weekly-header">SETTIMANALE</div>
                <div className="column-header custom-header">CUSTOM</div>
            </div>

            <div className="scheduler-body">
                <div className="time-column">
                    {HOURS.map(hour => (
                        <div key={hour} className="time-slot">{String(hour).padStart(2, '0')}</div>
                    ))}
                </div>

                {renderColumn(layoutData.daily, 'daily-column')}
                {renderColumn(layoutData.weekly, 'weekly-column')}
                {renderColumn(layoutData.custom, 'custom-column')}
            </div>
        </div>
    );
};

export default SchedulerView;
