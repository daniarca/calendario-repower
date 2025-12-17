import * as XLSX from 'xlsx';

/**
 * Exports triggers to an Excel file with a specific format.
 * Format:
 * | TIME  | DAILY | WEEKLY | CUSTOM |
 * | 00:00 | ...   | ...    | ...    |
 * 
 * @param {Array} triggers - List of trigger objects
 */
export const exportToExcel = (triggers) => {
  const wb = XLSX.utils.book_new();
  const headers = ['TIME', 'GIORNALIERO', 'SETTIMANALE', 'MENSILE', 'CUSTOM'];
  
  // Generate time slots (every 15 mins)
  const rows = [];
  
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      
      // Find triggers active at this time slot (approx)
      // Note: This is a simplified "snapshot" view.
      // A trigger starting at 09:00 is placed in the 09:00 row.
      
      const getTriggersForSlot = (type) => {
        return triggers
          .filter(t => t.recurrenceType === type)
          .filter(t => {
            const date = new Date(t.start);
            return date.getHours() === h && date.getMinutes() === m;
          })
          .map(t => {
             // For Weekly, add Day label
             let prefix = '';
             if (t.recurrenceType === 'WEEKLY' && t.dayOfWeek !== undefined) {
                prefix = `[${['DOM','LUN','MAR','MER','GIO','VEN','SAB'][t.dayOfWeek]}] `;
             }
             // For Monthly, add Day of Month
             if (t.recurrenceType === 'MONTHLY' && t.dayOfMonth !== undefined) {
                prefix = `[${t.dayOfMonth}°] `;
             }
             return `${prefix}${t.title} (${t.durationMinutes || 15}m)`;
          })
          .join(', ');
      };

      rows.push([
        timeStr, 
        getTriggersForSlot('DAILY'), 
        getTriggersForSlot('WEEKLY'), 
        getTriggersForSlot('MONTHLY'),
        getTriggersForSlot('CUSTOM')
      ]);
    }
  }

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  
  // Basic column width
  ws['!cols'] = [
    { wch: 10 },
    { wch: 40 },
    { wch: 40 },
    { wch: 40 },
    { wch: 40 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Scheduler_Repower');
  
  // Generate file name
  const date = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `Trigger_Scheduler_${date}.xlsx`);
};
