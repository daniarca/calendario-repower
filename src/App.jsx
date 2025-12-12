import React, { useState } from 'react';
import { useTriggers } from './hooks/useTriggers';
import CalendarView from './components/CalendarView';
import TriggerForm from './components/TriggerForm';
import DetailsPanel from './components/DetailsPanel';
import './App.css'; 

// Import Logo
import logoRepower from './assets/repower_italia-removebg-preview.png';

function App() {
  const { triggers, addTrigger, updateTrigger, deleteTrigger } = useTriggers();
  
  // State for Modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTrigger, setEditingTrigger] = useState(null); // For the modal form context
  
  // State for Right Panel Selection
  const [selectedTrigger, setSelectedTrigger] = useState(null);

  // -- ACTIONS --

  const handleAddClick = () => {
    // Open Empty Form
    setEditingTrigger(null);
    setIsFormOpen(true);
  };

  const handleCalendarSelect = (eventOrSlot, slotInfo) => {
    if (eventOrSlot && eventOrSlot.id) {
        // CLICKED EXISTING EVENT
        // Select it for the Right Panel
        setSelectedTrigger(eventOrSlot);
    } 
    else if (slotInfo) {
        // CLICKED EMPTY SLOT
        // Open Form to Create New
        setEditingTrigger({
            start: slotInfo.start,
            end: slotInfo.end,
        });
        setIsFormOpen(true);
    }
  };

  const handleSave = (triggerData) => {
    if (editingTrigger && editingTrigger.id) { // Edit Mode in Form
      updateTrigger(editingTrigger.id, triggerData);
      setSelectedTrigger(triggerData); // Update selection to reflect changes
    } else { // Create Mode
      addTrigger(triggerData);
    }
    setIsFormOpen(false);
    setEditingTrigger(null);
  };

  // Called from Details Panel
  const handleEditRequest = (trigger) => {
      setEditingTrigger(trigger);
      setIsFormOpen(true);
  };

  // Called from Details Panel
  const handleDeleteRequest = (trigger) => {
      if(window.confirm(`Eliminare il processo "${trigger.title}"?`)) {
          deleteTrigger(trigger.id);
          setSelectedTrigger(null); // Clear selection
      }
  };

  const handleCancelForm = () => {
    setIsFormOpen(false);
    setEditingTrigger(null);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo-container">
            <img src={logoRepower} alt="Repower Logo" className="app-logo" />
            <span className="header-title">UiPath Orchestrator | Scheduler</span>
        </div>
        <button className="add-button" onClick={handleAddClick}>
            <span>+ Nuovo Flusso</span>
        </button>
      </header>

      <main className="app-content">
        <div className="calendar-section">
            <CalendarView 
                triggers={triggers} 
                onSelectTrigger={handleCalendarSelect} 
                onUpdateTrigger={updateTrigger}
                onEditTrigger={handleEditRequest}
                onDeleteTrigger={handleDeleteRequest}
            />
        </div>
        
        <aside className="details-panel">
            <DetailsPanel 
                trigger={selectedTrigger} 
                onEdit={handleEditRequest}
                onDelete={handleDeleteRequest}
            />
        </aside>
      </main>

      {isFormOpen && (
        <TriggerForm 
          onSave={handleSave} 
          onCancel={handleCancelForm} 
          initialData={editingTrigger}
        />
      )}
    </div>
  );
}

export default App;
