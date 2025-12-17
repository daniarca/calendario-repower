import React, { useMemo, useCallback } from 'react';

const HOURS = Array.from({ length: 24 }, (_, i) => i);

const DAY_LABELS = {
    0: 'DOM', 1: 'LUN', 2: 'MAR', 3: 'MER', 4: 'GIO', 5: 'VEN', 6: 'SAB'
};

// Color variants by recurrence type (matching column headers)
const RECURRENCE_COLORS = {
    'DAILY': { bg: 'rgba(211, 17, 69, 0.12)', border: '#D31145' },      // Red
    'WEEKLY': { bg: 'rgba(37, 99, 235, 0.12)', border: '#2563EB' },      // Blue
    'MONTHLY': { bg: 'rgba(249, 115, 22, 0.12)', border: '#F97316' },    // Orange
    'CUSTOM': { bg: 'rgba(124, 58, 237, 0.12)', border: '#7C3AED' }      // Purple
};

// Detect overlapping triggers and assign slot positions
// Detect overlapping triggers and assign slot positions
const calculateOverlapLayout = (triggers) => {
    if (!triggers.length) return [];

    // VISUAL_BLOCK_DURATION: Minimum time visual block forces collision
    // Forces side-by-side layout for anything overlapping within ~60 mins 
    // to allow for min-height: 40px cards without overlap
    const VISUAL_MIN_MS = 60 * 60 * 1000; // 60 minutes

    const sorted = [...triggers].sort((a, b) => new Date(a.start) - new Date(b.start));
    const columns = [];
    const result = [];

    for (const trigger of sorted) {
        const startTime = new Date(trigger.start).getTime();
        const trueEndTime = new Date(trigger.end).getTime();
        // Use visual end time for layout collision detection
        const visualEndTime = Math.max(trueEndTime, startTime + VISUAL_MIN_MS);

        let slotIndex = 0;
        // Find first column where this trigger fits (using visual end time of used slot)
        while (slotIndex < columns.length && columns[slotIndex] > startTime) {
            slotIndex++;
        }

        columns[slotIndex] = visualEndTime;

        result.push({
            ...trigger,
            slotIndex,
            // Store visual ranges for the next pass
            _visualStart: startTime,
            _visualEnd: visualEndTime
        });
    }

    return result.map(trigger => {
        const myStart = trigger._visualStart;
        const myEnd = trigger._visualEnd;

        // Calculate concurrency based on visual overlaps
        const concurrent = result.filter(t => {
            const tStart = t._visualStart;
            const tEnd = t._visualEnd;
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
        monthly: calculateOverlapLayout(triggers.filter(t => t.recurrenceType === 'MONTHLY')),
        custom: calculateOverlapLayout(triggers.filter(t => t.recurrenceType === 'CUSTOM'))
    }), [triggers]);

    const [dragPreview, setDragPreview] = React.useState(null);
    const draggedTriggerRef = React.useRef(null);

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
        draggedTriggerRef.current = trigger;

        // Hide original element slightly to show it's being moved (optional, but ghost handles visual)
        // e.target.style.opacity = '0.5'; 
    }, []);

    const handleDragOver = useCallback((e, columnClass) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        const rect = e.currentTarget.getBoundingClientRect();
        const y = e.clientY - rect.top;

        // Snap calculation
        const totalMinutes = Math.round((y / rect.height) * 1440);
        const snapedMinutes = Math.round(totalMinutes / 15) * 15; // Round to 15min

        // Boundaries
        if (snapedMinutes < 0) return;
        if (snapedMinutes > 1440) return;

        const hours = Math.floor(snapedMinutes / 60);
        const minutes = snapedMinutes % 60;
        const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

        const duration = draggedTriggerRef.current?.durationMinutes || 15;
        const heightPercent = Math.max((duration / 1440) * 100, 2.5);
        const topPercent = (snapedMinutes / 1440) * 100;

        // Calculate overlaps for positioning - determine which slot this would occupy
        // Get all triggers in the target column (excluding the one being dragged)
        const targetRecurrence = columnClass.replace('-column', '').toUpperCase();
        const colTriggers = triggers.filter(t =>
            t.recurrenceType === targetRecurrence &&
            t.id !== draggedTriggerRef.current?.id
        );

        // Create a temporary trigger for the preview position
        const tempTrigger = {
            start: new Date('2024-01-01'),
            durationMinutes: duration
        };
        tempTrigger.start.setHours(hours, minutes, 0, 0);
        const tempEnd = new Date(tempTrigger.start.getTime() + duration * 60000);

        // Find overlapping triggers
        const overlapping = colTriggers.filter(existing => {
            const existStart = new Date(existing.start).getTime();
            const existEnd = new Date(existing.end).getTime();
            const tempStart = tempTrigger.start.getTime();
            const tempEndTime = tempEnd.getTime();
            return !(existEnd <= tempStart || existStart >= tempEndTime);
        });

        // Calculate slot position
        let slotIndex = 0;
        const occupiedSlots = overlapping.map(t => t.slotIndex || 0);
        while (occupiedSlots.includes(slotIndex)) {
            slotIndex++;
        }

        const totalSlots = Math.max(slotIndex + 1, ...overlapping.map(t => t.totalSlots || 1));
        const widthPercent = 100 / totalSlots;
        const leftPercent = slotIndex * widthPercent;

        setDragPreview({
            column: columnClass,
            top: topPercent,
            height: heightPercent,
            time: timeStr,
            width: widthPercent,
            left: leftPercent
        });
    }, [triggers]);

    const handleDragLeave = useCallback(() => {
        setDragPreview(null);
    }, []);

    const handleDrop = useCallback((e, columnElement) => {
        e.preventDefault();
        setDragPreview(null);
        draggedTriggerRef.current = null;

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

        const newStart = new Date(trigger.start); // Keep date components
        newStart.setHours(hours, minutes, 0, 0);

        // Logic to clear day if dropped in a different column? 
        // For simplicity we assume drag-drop just changes time for now, 
        // unless we want to allow changing recurrence type via drag (complex).
        // Current logic modifies start/end time. 

        const newEnd = new Date(newStart.getTime() + (trigger.durationMinutes || 15) * 60000);

        onUpdateTrigger(triggerId, { start: newStart, end: newEnd });
    }, [triggers, onUpdateTrigger]);

    // Get color based on recurrence type
    const getRecurrenceColors = (recurrenceType) => {
        return RECURRENCE_COLORS[recurrenceType] || RECURRENCE_COLORS['CUSTOM'];
    };

    const TriggerCard = ({ trigger, colorClass }) => {
        const compact = isCompact(trigger);
        const timeStr = new Date(trigger.start).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

        // Clean tooltip content
        const serverInfo = trigger.server ? `\n🖥️ ${trigger.server}` : '';
        const durationInfo = `⏱️ ${trigger.durationMinutes || 15} min`;
        const recurrenceLabels = { 'DAILY': 'GIORNALIERO', 'WEEKLY': 'SETTIMANALE', 'MONTHLY': 'MENSILE', 'CUSTOM': 'PERSONALIZZATO' };
        const recurrenceInfo = trigger.recurrenceType !== 'CUSTOM' ? `\n🔄 ${recurrenceLabels[trigger.recurrenceType] || trigger.recurrenceType}` : '';

        const tooltipText = `${trigger.title}\n${timeStr} • ${durationInfo}${serverInfo}${recurrenceInfo}`;

        const widthPercent = 100 / trigger.totalSlots;
        const leftPercent = trigger.slotIndex * widthPercent;
        const recurrenceColors = getRecurrenceColors(trigger.recurrenceType);

        // Calculate z-index based on start time
        const startMinutes = new Date(trigger.start).getHours() * 60 + new Date(trigger.start).getMinutes();
        const zIndex = 10 + Math.floor(startMinutes / 15);

        // Check if card is narrow (shared slot)
        const isNarrow = trigger.totalSlots > 1;

        return (
            <div
                className={`trigger-card ${compact ? 'compact-card' : ''} ${isNarrow ? 'narrow-card' : ''}`}
                style={{
                    top: `${getTopPercent(trigger)}%`,
                    height: `${getHeightPercent(trigger)}%`,
                    left: `${leftPercent}%`,
                    width: `${widthPercent}%`,
                    background: recurrenceColors.bg,
                    borderLeft: `4px solid ${recurrenceColors.border}`,
                    zIndex: zIndex
                }}
                onClick={() => onSelectTrigger(trigger)}
                data-tooltip={tooltipText}
                draggable
                onDragStart={(e) => handleDragStart(e, trigger)}
            >
                <div className="card-content">
                    <div className="card-header-row">
                        {trigger.recurrenceType === 'WEEKLY' && (
                            <span className="day-badge">{DAY_LABELS[trigger.dayOfWeek]}</span>
                        )}
                        {trigger.recurrenceType === 'MONTHLY' && trigger.dayOfMonth && (
                            <span className="day-badge monthly-badge">{trigger.dayOfMonth}°</span>
                        )}
                        <span className="card-title">{trigger.title}</span>
                    </div>
                    <span className="card-time" style={{ color: recurrenceColors.border }}>{timeStr}</span>
                </div>
            </div>
        );
    };

    const renderColumn = (columnData, colorClass) => (
        <div
            className={`trigger-column ${colorClass}`}
            onDragOver={(e) => handleDragOver(e, colorClass)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, e.currentTarget)}
        >
            <div className="column-background">
                {HOURS.map(hour => <div key={hour} className="hour-line" />)}
            </div>

            <div className="triggers-layer">
                {columnData.map(trigger => (
                    <TriggerCard key={trigger.id} trigger={trigger} colorClass={colorClass} />
                ))}

                {/* Ghost Preview */}
                {dragPreview && dragPreview.column === colorClass && (
                    <div
                        className="ghost-card"
                        style={{
                            top: `${dragPreview.top}%`,
                            height: `${dragPreview.height}%`,
                            left: `${dragPreview.left || 0}%`,
                            width: `${dragPreview.width || 100}%`,
                        }}
                    >
                        <span className="ghost-time">{dragPreview.time}</span>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="scheduler-container">
            <div className="scheduler-header">
                <div className="time-column-header"></div>
                <div className="column-header daily-header">GIORNALIERO</div>
                <div className="column-header weekly-header">SETTIMANALE</div>
                <div className="column-header monthly-header">MENSILE</div>
                <div className="column-header custom-header">PERSONALIZZATO</div>
            </div>

            <div className="scheduler-body">
                <div className="time-column">
                    {HOURS.map(hour => (
                        <div key={hour} className="time-slot">{String(hour).padStart(2, '0')}</div>
                    ))}
                </div>

                {renderColumn(layoutData.daily, 'daily-column')}
                {renderColumn(layoutData.weekly, 'weekly-column')}
                {renderColumn(layoutData.monthly, 'monthly-column')}
                {renderColumn(layoutData.custom, 'custom-column')}
            </div>
        </div>
    );
};

export default SchedulerView;
