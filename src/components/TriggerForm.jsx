import React, { useState, useEffect } from 'react';
import './TriggerForm.css';

const TriggerForm = ({ onSave, onCancel, initialData }) => {
  const [formData, setFormData] = useState({
    title: '', // Process Name
    server: '',
    description: '',
    startTime: '09:00',
    durationMinutes: 60, // Default 1 hour
    userName: '' // Responsible
  });

  useEffect(() => {
    if (initialData) {
        // Calculate duration/times
        const formatTime = (date) => {
            if (!date) return '09:00';
            const d = new Date(date);
            return d.toTimeString().slice(0, 5);
        };
        
        let duration = initialData.durationMinutes || 60;
        if (!initialData.durationMinutes && initialData.start && initialData.end) {
             const diff = new Date(initialData.end) - new Date(initialData.start);
             duration = Math.floor(diff / 1000 / 60);
        }

        setFormData({
            title: initialData.title || '',
            server: initialData.server || '',
            description: initialData.description || '',
            userName: initialData.userName || '',
            startTime: formatTime(initialData.start),
            durationMinutes: duration,
        });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.startTime) {
        alert("Inserisci Nome Processo e Orario di Avvio.");
        return;
    }

    // Constructor Generic Day (2024-01-01)
    const genericDate = '2024-01-01';
    const start = new Date(`${genericDate}T${formData.startTime}:00`);
    
    // Calculate End Time based on Avg Duration
    const duration = parseInt(formData.durationMinutes, 10) || 15;
    const end = new Date(start.getTime() + duration * 60000);

    const newTrigger = {
        title: formData.title,
        server: formData.server,
        description: formData.description,
        userName: formData.userName,
        id: initialData ? initialData.id : crypto.randomUUID(),
        start,
        end,
        durationMinutes: duration,
        recurrenceType: 'NONE'
    };

    onSave(newTrigger);
  };

  return (
    <div className="trigger-form-overlay">
      <div className="trigger-form-container">
        <h2 className="form-title">
            {initialData ? 'Modifica Processo' : 'Nuovo Flusso UiPath'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label>Nome Processo</label>
            <input 
              type="text" 
              name="title" 
              value={formData.title} 
              onChange={handleChange} 
              placeholder="Es. InvoiceProcessing_Bot_V1"
              required 
              autoFocus
            />
          </div>

          <div className="form-row">
            <div className="form-group">
                <label>Server Target</label>
                <input 
                type="text" 
                name="server" 
                value={formData.server} 
                onChange={handleChange} 
                placeholder="Es. SRV-RPA-01"
                />
            </div>
            <div className="form-group">
                <label>Responsabile</label>
                <input 
                type="text" 
                name="userName" 
                value={formData.userName} 
                onChange={handleChange}
                placeholder="Es. Mario Rossi"
                />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
                <label>Ora Avvio</label>
                <input 
                type="time" 
                name="startTime" 
                value={formData.startTime} 
                onChange={handleChange} 
                required 
                />
            </div>
            <div className="form-group">
                <label>Durata Media (min)</label>
                <input 
                type="number" 
                name="durationMinutes" 
                value={formData.durationMinutes} 
                onChange={handleChange} 
                min="1"
                required 
                />
            </div>
          </div>

          <div className="form-group">
             <label>Note Operative</label>
             <textarea 
               name="description" 
               value={formData.description} 
               onChange={handleChange} 
               rows={3}
             />
          </div>

          <div className="form-actions">
            <div className="right-actions" style={{width: '100%', justifyContent:'space-between'}}>
                <button type="button" className="btn-cancel" onClick={onCancel}>Annulla</button>
                <button type="submit" className="btn-primary">Salva Schedulazione</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TriggerForm;
