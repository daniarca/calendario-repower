import React, { useState } from 'react';
import { useTriggers } from './hooks/useTriggers';
import SchedulerView from './components/SchedulerView';
import DetailsPanel from './components/DetailsPanel';
import TriggerForm from './components/TriggerForm';
import repowerLogo from './assets/repower_italia-removebg-preview.png';
import './App.css'; 

function App() {
  const { triggers, addTrigger, updateTrigger, deleteTrigger } = useTriggers();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTrigger, setEditingTrigger] = useState(null);
  const [selectedTrigger, setSelectedTrigger] = useState(null);

  const handleAddClick = () => {
    setEditingTrigger(null);
    setIsFormOpen(true);
  };

  // Handle selection from scheduler
  const handleSelectTrigger = (trigger) => {
    setSelectedTrigger(trigger);
  };

  // Handle edit request (from Details or from Card)
  const handleEditRequest = (trigger) => {
    setEditingTrigger(trigger);
    setIsFormOpen(true);
  };

  // Handle delete request
  const handleDeleteRequest = (trigger) => {
    if (window.confirm(`Eliminare "${trigger.title}"?`)) {
        deleteTrigger(trigger.id);
        if (selectedTrigger?.id === trigger.id) {
            setSelectedTrigger(null);
        }
    }
  };

  const handleSave = (triggerData) => {
    if (editingTrigger) {
      updateTrigger(editingTrigger.id, triggerData);
      // Update selected if it was the one edited
      if (selectedTrigger?.id === editingTrigger.id) {
        setSelectedTrigger({...selectedTrigger, ...triggerData});
      }
    } else {
      addTrigger(triggerData);
    }
    setIsFormOpen(false);
    setEditingTrigger(null);
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingTrigger(null);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo-container">
            <img src={repowerLogo} alt="Repower Logo" className="app-logo" />
            <span className="header-title">UiPath Scheduler</span>
        </div>
        <button className="add-button" onClick={handleAddClick}>
            + Nuovo Flusso
        </button>
      </header>
      
      <main className="app-content">
        <div className="scheduler-section">
            <SchedulerView 
                triggers={triggers} 
                onSelectTrigger={handleSelectTrigger}
                onEditTrigger={handleEditRequest}
                onDeleteTrigger={handleDeleteRequest}
            />
        </div>
        
        <div className="details-panel">
            <DetailsPanel 
                trigger={selectedTrigger}
                onEdit={handleEditRequest}
                onDelete={handleDeleteRequest}
            />
        </div>
      </main>

      {isFormOpen && (
        <TriggerForm 
          onSave={handleSave} 
          onCancel={handleCancel}
          initialData={editingTrigger}
        />
      )}
    </div>
  );
}

export default App;
