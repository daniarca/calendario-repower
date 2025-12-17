import React, { useState, useRef } from 'react';
import { useTriggers } from './hooks/useTriggers';
import SchedulerView from './components/SchedulerView';
import DetailsPanel from './components/DetailsPanel';
import TriggerForm from './components/TriggerForm';
import { exportToExcel } from './utils/excelExport';
import { Download, Upload, FileSpreadsheet, Plus, Search } from 'lucide-react';
import repowerLogo from './assets/repower_italia-removebg-preview.png';
import './App.css';

const APP_VERSION = "1.1.0";
const CHANGELOG = [
  { version: "1.1.0", date: "18 Dic 2024", changes: ["Traduzione completa dell'interfaccia in italiano", "Ottimizzazione per accesso remoto (--host)", "Aggiunta sistema di crediti e versionamento"] },
  { version: "1.0.0", date: "15 Dic 2024", changes: ["Rilascio iniziale dello scheduler flussi UiPath", "Visualizzazione multi-colonna (Giornaliero, Settimanale, Mensile)", "Export Excel e Backup JSON"] }
];
function App() {
  const { triggers, addTrigger, updateTrigger, deleteTrigger, setTriggers } = useTriggers();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTrigger, setEditingTrigger] = useState(null);
  const [selectedTrigger, setSelectedTrigger] = useState(null);
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
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

      <footer className="app-footer">
        <div className="footer-credits">
          <span>© 2025 Repower Italia — Sviluppato con ❤️ da <strong>Daniele Arcangeli</strong></span>
        </div>

        <div className="footer-badges">
          <img src={`https://img.shields.io/badge/version-${APP_VERSION}-D31145?style=flat-square`} alt="Version" />
          <img src="https://img.shields.io/badge/build-passing-brightgreen?style=flat-square" alt="Build Status" />
          <img src="https://img.shields.io/badge/platform-uipath-orange?style=flat-square" alt="Platform" />
        </div>

        <div className="footer-links">
          <button className="changelog-trigger" onClick={() => setIsChangelogOpen(true)}>
            Changelog
          </button>
          <a href="https://github.com/daniarca/calendario-repower" target="_blank" rel="noopener noreferrer" className="github-link">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
          </a>
        </div>
      </footer>

      {isChangelogOpen && (
        <div className="modal-overlay" onClick={() => setIsChangelogOpen(false)}>
          <div className="changelog-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Registro Modifiche</h2>
              <button className="close-btn" onClick={() => setIsChangelogOpen(false)}>×</button>
            </div>
            <div className="changelog-list">
              {CHANGELOG.map(entry => (
                <div key={entry.version} className="changelog-entry">
                  <div className="entry-header">
                    <span className="entry-version">v{entry.version}</span>
                    <span className="entry-date">{entry.date}</span>
                  </div>
                  <ul className="entry-changes">
                    {entry.changes.map((change, i) => (
                      <li key={i}>{change}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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

