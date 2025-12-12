const STORAGE_KEY = 'trigger_manager_data';

/**
 * Loads triggers from localStorage.
 * @returns {Array} Array of triggers or empty array if none found.
 */
export const loadTriggers = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load triggers from localStorage:", error);
    return [];
  }
};

/**
 * Saves triggers to localStorage.
 * @param {Array} triggers - Array of trigger objects to save.
 */
export const saveTriggers = (triggers) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(triggers));
  } catch (error) {
    console.error("Failed to save triggers to localStorage:", error);
  }
};
