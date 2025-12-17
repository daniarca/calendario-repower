import React, { useState, useRef } from 'react';
import { useTriggers } from './hooks/useTriggers';
import SchedulerView from './components/SchedulerView';
import DetailsPanel from './components/DetailsPanel';
import TriggerForm from './components/TriggerForm';
import { exportToExcel } from './utils/excelExport';
import { Download, Upload, FileSpreadsheet, Plus, Search } from 'lucide-react';
import repowerLogo from './assets/repower_italia-removebg-preview.png';
import './App.css';

function App() {
  const { triggers, addTrigger, updateTrigger, deleteTrigger, setTriggers } = useTriggers();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTrigger, setEditingTrigger] = useState(null);
  const [selectedTrigger, setSelectedTrigger] = useState(null);
  const fileInputRef = useRef(null);

  const handleAddClick = () => {
    setEditingTrigger(null);
    setIsFormOpen(true);
  };

  const handleSelectTrigger = (trigger) => {
    setSelectedTrigger(trigger);
  };

  const handleEditRequest = (trigger) => {
    setEditingTrigger(trigger);
    setIsFormOpen(true);
  };

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
      if (selectedTrigger?.id === editingTrigger.id) {
        setSelectedTrigger({ ...selectedTrigger, ...triggerData });
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

  // JSON Export
  const handleExportJSON = () => {
    const dataStr = JSON.stringify(triggers, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `repower-triggers-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Excel Export
  const handleExportExcel = () => {
    exportToExcel(triggers);
  };

  // Import JSON
  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (Array.isArray(imported)) {
          setTriggers(imported);
          alert(`Importati ${imported.length} flussi con successo!`);
        } else {
          alert('Formato file non valido.');
        }
      } catch (err) {
        alert('Errore nel parsing del file JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo-container">
          <img src={repowerLogo} alt="Repower Logo" className="app-logo" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="header-title">Ciao, Daniele</span>
            <span style={{ fontSize: '0.8rem', color: '#8E8E9A' }}>Hai {triggers.length} pianificazioni attive</span>
          </div>
        </div>

        <div className="header-search">
          <Search size={18} />
          <span>Cerca tra le tue pianificazioni...</span>
        </div>

        <div className="header-actions">
          <button className="icon-button" onClick={handleExportExcel} title="Esporta in Excel">
            <FileSpreadsheet size={20} />
          </button>
          <div style={{ width: '1px', height: '20px', background: '#E5E5EA' }}></div>
          <button className="icon-button" onClick={handleExportJSON} title="Backup JSON">
            <Download size={20} />
          </button>
          <button className="icon-button" onClick={() => fileInputRef.current?.click()} title="Ripristina JSON">
            <Upload size={20} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".json"
            style={{ display: 'none' }}
          />
          <button className="add-button" onClick={handleAddClick} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} />
            Nuovo Flusso
          </button>
        </div>
      </header>

      <main className="app-content">
        <div className="scheduler-section">
          <SchedulerView
            triggers={triggers}
            onSelectTrigger={handleSelectTrigger}
            onEditTrigger={handleEditRequest}
            onDeleteTrigger={handleDeleteRequest}
            onUpdateTrigger={updateTrigger}
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

