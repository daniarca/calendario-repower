import React from 'react';

const DetailsPanel = ({ trigger, onEdit, onDelete }) => {
  if (!trigger) {
    return (
      <div className="details-empty">
        <div className="empty-icon">Select Flow</div>
        <p>Seleziona un processo per visualizzare i dettagli</p>
      </div>
    );
  }

  // Format times
  const formatTime = (date) => {
    if(!date) return '-';
    return new Date(date).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="details-container">
      
      {/* Header Section */}
      <div className="trigger-header">
        <div className="trigger-subtitle">SCHEDULAZIONE ATTIVA</div>
        <h1 className="trigger-title">{trigger.title}</h1>
      </div>

      {/* Smart Home Grid Layout */}
      <div className="cards-grid">
        
        {/* Time Card */}
        <div className="info-card highlight-card">
            <div className="card-icon">🕒</div>
            <div className="card-label">Orario Avvio</div>
            <div className="card-value-big">{formatTime(trigger.start)}</div>
            <div className="card-sub">Fine: {formatTime(trigger.end)}</div>
        </div>

        {/* Duration Card */}
        <div className="info-card">
             <div className="card-icon">⚡</div>
             <div className="card-label">Durata Media</div>
             <div className="card-value-big">{trigger.durationMinutes || 0}<span className="unit">min</span></div>
        </div>

        {/* Server Card */}
        <div className="info-card wide-card">
            <div className="card-icon">🖥️</div>
            <div className="card-label">Server Target</div>
            <div className="card-value">{trigger.server || 'N/D'}</div>
        </div>

        {/* User Card */}
        <div className="info-card wide-card">
            <div className="card-icon">👤</div>
            <div className="card-label">Responsabile</div>
            <div className="card-value">{trigger.userName || 'Non assegnato'}</div>
        </div>

        {/* Description Card */}
        {trigger.description && (
            <div className="info-card full-card description-card">
                <div className="card-label">Note Operative</div>
                <p className="description-text">{trigger.description}</p>
            </div>
        )}

      </div>

      {/* Actions */}
      <div className="panel-actions">
        <button className="action-btn edit-btn" onClick={() => onEdit(trigger)}>
            Modifica
        </button>
        <button className="action-btn delete-btn" onClick={() => onDelete(trigger)}>
            Elimina
        </button>
      </div>
      
      <style>{`
        .details-container {
            height: 100%;
            display: flex;
            flex-direction: column;
            animation: fadeIn 0.4s ease;
        }
        
        .details-empty {
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: #8E8E93;
            font-weight: 500;
        }
        .empty-icon {
            font-size: 1.5rem;
            margin-bottom: 1rem;
            opacity: 0.5;
            text-transform: uppercase;
            letter-spacing: 2px;
        }

        .trigger-header {
            margin-bottom: 2.5rem;
        }
        .trigger-subtitle {
            font-size: 0.75rem;
            color: #D31145; /* Red Accent */
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin-bottom: 0.5rem;
        }
        .trigger-title {
            margin: 0;
            font-size: 2rem;
            line-height: 1.2;
            font-weight: 700;
            color: #1A1A1A;
        }

        .cards-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.25rem;
            margin-bottom: auto; /* Push actions to bottom */
        }

        .info-card {
            background: white;
            border-radius: 20px;
            padding: 1.5rem;
            box-shadow: 0 4px 20px rgba(0,0,0,0.03);
            display: flex;
            flex-direction: column;
            transition: transform 0.2s;
        }
        .info-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.06);
        }

        .wide-card {
            grid-column: span 2;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
        }
        .full-card {
            grid-column: span 2;
        }

        .card-icon {
            font-size: 1.5rem;
            margin-bottom: 1rem;
        }
        .wide-card .card-icon {
            margin-bottom: 0;
            margin-right: 1rem;
        }

        .card-label {
            font-size: 0.8rem;
            color: #8E8E93;
            font-weight: 600;
            text-transform: uppercase;
            margin-bottom: 0.25rem;
        }

        .card-value {
            font-size: 1.2rem;
            font-weight: 600;
            color: #1A1A1A;
        }
        
        .card-value-big {
            font-size: 2.5rem;
            font-weight: 700;
            color: #1A1A1A;
            line-height: 1;
            margin: 0.5rem 0;
        }
        .unit {
            font-size: 1rem;
            color: #8E8E93;
            margin-left: 4px;
            font-weight: 500;
        }

        .card-sub {
            font-size: 0.85rem;
            color: #8E8E93;
        }

        .highlight-card {
            background: linear-gradient(135deg, #1A1A1A 0%, #2C2C2E 100%);
        }
        .highlight-card .card-label, 
        .highlight-card .card-value-big, 
        .highlight-card .card-sub,
        .highlight-card .unit {
            color: white;
        }
        .highlight-card .card-label {
            opacity: 0.7;
        }

        .description-card {
            background: transparent;
            box-shadow: none;
            border: 1px solid rgba(0,0,0,0.05);
            padding: 1rem;
        }
        .description-text {
            font-size: 0.95rem;
            color: #555;
            line-height: 1.5;
            margin: 0.5rem 0 0 0;
        }

        .panel-actions {
            margin-top: 2rem;
            display: flex;
            gap: 1rem;
        }

        .action-btn {
            flex: 1;
            padding: 1rem;
            border-radius: 16px;
            font-weight: 600;
            font-size: 1rem;
            cursor: pointer;
            border: none;
            transition: all 0.2s;
        }

        .edit-btn {
            background: #1A1A1A;
            color: white;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        .edit-btn:hover {
            background: #333;
            transform: translateY(-2px);
        }

        .delete-btn {
            background: white;
            color: #D31145;
            border: 2px solid #FFF0F3;
        }
        .delete-btn:hover {
            background: #FFF0F3;
        }

      `}</style>
    </div>
  );
};

export default DetailsPanel;
