import React, { useState, useEffect } from 'react';
import './TriggerForm.css';

const DAYS_OF_WEEK = [
  { value: 1, label: 'Lunedì' },
  { value: 2, label: 'Martedì' },
  { value: 3, label: 'Mercoledì' },
  { value: 4, label: 'Giovedì' },
  { value: 5, label: 'Venerdì' },
  { value: 6, label: 'Sabato' },
  { value: 0, label: 'Domenica' },
];

const TriggerForm = ({ onSave, onCancel, initialData }) => {
  const [formData, setFormData] = useState({
    title: '',
    server: '',
    description: '',
    startTime: '09:00',
    durationMinutes: 60,
    userName: '',
    recurrenceType: 'DAILY',
    dayOfWeek: 1, // Default to Monday
    dayOfMonth: 1 // Default to 1st
  });

  useEffect(() => {
    if (initialData) {
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
        recurrenceType: initialData.recurrenceType || 'DAILY',
        dayOfWeek: initialData.dayOfWeek ?? 1,
        dayOfMonth: initialData.dayOfMonth ?? 1,
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

    const genericDate = '2024-01-01';
    const start = new Date(`${genericDate}T${formData.startTime}:00`);
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
      recurrenceType: formData.recurrenceType,
      dayOfWeek: formData.recurrenceType === 'WEEKLY' ? parseInt(formData.dayOfWeek, 10) : null,
      dayOfMonth: formData.recurrenceType === 'MONTHLY' ? parseInt(formData.dayOfMonth, 10) : null
    };

    onSave(newTrigger);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div className="trigger-form-overlay" onClick={handleOverlayClick}>
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
              placeholder="Es. Processo_Fatturazione_V1"
              required
              autoFocus
            />
          </div>

          {/* Recurrence Type Selector */}
          <div className="form-group">
            <label>Tipo Ricorrenza</label>
            <div className="recurrence-selector">
              <button
                type="button"
                className={`recurrence-btn ${formData.recurrenceType === 'DAILY' ? 'active daily' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, recurrenceType: 'DAILY' }))}
              >
                Giornaliero
              </button>
              <button
                type="button"
                className={`recurrence-btn ${formData.recurrenceType === 'WEEKLY' ? 'active weekly' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, recurrenceType: 'WEEKLY' }))}
              >
                Settimanale
              </button>
              <button
                type="button"
                className={`recurrence-btn ${formData.recurrenceType === 'MONTHLY' ? 'active monthly' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, recurrenceType: 'MONTHLY' }))}
              >
                Mensile
              </button>
              <button
                type="button"
                className={`recurrence-btn ${formData.recurrenceType === 'CUSTOM' ? 'active custom' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, recurrenceType: 'CUSTOM' }))}
              >
                Personalizzato
              </button>
            </div>
          </div>

          {/* Day of Week (only for WEEKLY) */}
          {formData.recurrenceType === 'WEEKLY' && (
            <div className="form-group">
              <label>Giorno della Settimana</label>
              <select
                name="dayOfWeek"
                value={formData.dayOfWeek}
                onChange={handleChange}
              >
                {DAYS_OF_WEEK.map(day => (
                  <option key={day.value} value={day.value}>{day.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Day of Month (only for MONTHLY) */}
          {formData.recurrenceType === 'MONTHLY' && (
            <div className="form-group">
              <label>Giorno del Mese</label>
              <select
                name="dayOfMonth"
                value={formData.dayOfMonth}
                onChange={handleChange}
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                  <option key={day} value={day}>{day}°</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Server Target</label>
              <select
                name="server"
                value={formData.server}
                onChange={handleChange}
              >
                <option value="">Seleziona server...</option>
                <option value="uipathprdvw01">uipathprdvw01</option>
                <option value="REAPPAS61">REAPPAS61</option>
              </select>
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
            <button type="button" className="btn-cancel" onClick={onCancel}>Annulla</button>
            <button type="submit" className="btn-primary">Salva</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TriggerForm;
