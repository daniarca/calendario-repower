import React from 'react';

const DetailsPanel = ({ trigger, onEdit, onDelete }) => {
  if (!trigger) {
    return (
      <div className="details-empty">
        <div className="empty-icon">📂</div>
        <p>Seleziona un processo per<br />visualizzare i dettagli</p>
      </div>
    );
  }

  // Format times
  const formatTime = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="details-container">

      {/* Header Section */}
      <div className="trigger-header">
        <div className="trigger-subtitle">SCHEDULAZIONE ATTIVA</div>
        <h1 className="trigger-title">{trigger.title}</h1>
      </div>

      {/* Widgets Grid Layout */}
      <div className="cards-grid">

        {/* Time Card - Highlighted */}
        <div className="info-card highlight-card">
          <div className="card-icon">🕒</div>
          <div className="card-content-wrapper">
            <div className="card-label">Orario Processo</div>
            <div className="card-value-big">{formatTime(trigger.start)}</div>
            <div className="card-sub">Termine: {formatTime(trigger.end)}</div>
          </div>
        </div>

        {/* Avg Duration */}
        <div className="info-card">
          <div className="card-icon">⚡</div>
          <div className="card-label">Durata Est.</div>
          <div className="card-value-big">{trigger.durationMinutes || 0}<span className="unit">min</span></div>
        </div>

        <div className="info-card">
          <div className="card-icon">🔄</div>
          <div className="card-label">Ricorrenza</div>
          <div className="card-value">
            {({
              'DAILY': 'Giornaliero',
              'WEEKLY': 'Settimanale',
              'MONTHLY': 'Mensile',
              'CUSTOM': 'Personalizzato'
            }[trigger.recurrenceType] || trigger.recurrenceType)}
          </div>
        </div>

        {/* Server Card */}
        <div className="info-card wide-card">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div className="card-icon">🖥️</div>
            <div>
              <div className="card-label">Server Target</div>
              <div className="card-value">{trigger.server || 'N/D'}</div>
            </div>
          </div>
        </div>

        {/* User Card */}
        <div className="info-card wide-card">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div className="card-icon">👤</div>
            <div>
              <div className="card-label">Responsabile</div>
              <div className="card-value">{trigger.userName || 'Non assegnato'}</div>
            </div>
          </div>
        </div>

      </div>

      {/* Actions */}
      <div className="panel-actions">
        <button className="action-btn edit-btn" onClick={() => onEdit(trigger)}>
          ✏️ Modifica
        </button>
        <button className="action-btn delete-btn" onClick={() => onDelete(trigger)}>
          🗑️ Elimina
        </button>
      </div>
    </div>
  );
};

export default DetailsPanel;
