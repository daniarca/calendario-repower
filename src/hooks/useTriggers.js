import { useState, useEffect, useCallback } from 'react';
import { loadTriggers, saveTriggers } from '../storage/localTriggerStorage';

// Static date for "Generic Day" logic. 
// We process all times as if they are on this date.
const GENERIC_DATE_ISO = '2024-01-01';

export const useTriggers = () => {
  const [triggers, setTriggers] = useState(() => {
    const stored = loadTriggers();
    // Normalize stored triggers to ensure they are all on the Generic Date
    // This handles migrating old data or simply ensuring consistency
    return stored.map(t => normalizeTriggerDate(t));
  });

  useEffect(() => {
    saveTriggers(triggers);
  }, [triggers]);

  const addTrigger = useCallback((newTrigger) => {
    setTriggers(prev => [...prev, normalizeTriggerDate(newTrigger)]);
  }, []);

  const updateTrigger = useCallback((id, updatedData) => {
    setTriggers(prev => prev.map(t => 
        t.id === id ? normalizeTriggerDate({ ...t, ...updatedData }) : t
    ));
  }, []);

  const deleteTrigger = useCallback((id) => {
    setTriggers(prev => prev.filter(t => t.id !== id));
  }, []);

  return {
    triggers,
    addTrigger,
    updateTrigger,
    deleteTrigger,
    setTriggers // For import functionality
  };
};

// Helper: Force any trigger to be on GENERIC_DATE_ISO
// Preserving only the TIME component.
function normalizeTriggerDate(trigger) {
    const start = new Date(trigger.start);
    const end = new Date(trigger.end);
    
    // Create new dates on 2024-01-01 with original time
    const newStart = new Date(GENERIC_DATE_ISO);
    newStart.setHours(start.getHours(), start.getMinutes(), 0, 0);

    const newEnd = new Date(GENERIC_DATE_ISO);
    newEnd.setHours(end.getHours(), end.getMinutes(), 0, 0);

    return {
        ...trigger,
        id: trigger.id || crypto.randomUUID(),
        start: newStart,
        end: newEnd,
        recurrenceType: trigger.recurrenceType || 'DAILY', // Default to DAILY
        dayOfWeek: trigger.dayOfWeek ?? null // 0-6 for WEEKLY, null otherwise
    };
}
