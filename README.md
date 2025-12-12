# Repower UiPath Scheduler

## 📖 Descrizione del Progetto
Questa applicazione web è una **Dashboard di Schedulazione per Processi RPA (UiPath)** progettata per Repower.
Permette ai team operativi di visualizzare, gestire e pianificare l'esecuzione dei bot UiPath durante una "giornata tipo", fornendo una visione chiara dei carichi di lavoro su diversi server.

L'applicazione non è un calendario tradizionale basato su date specifiche, ma una **Agenda di Flusso** che copre una finestra temporale di 24 ore (00:00 - 23:59), ideale per definire schedule standard ricorrenti.

### Funzionalità Principali
-   **Dashboard a Schermo Intero**: Layout "Split View" professionale che massimizza lo spazio visivo.
    -   **Sinistra**: Griglia oraria interattiva (Calendar View).
    -   **Destra**: Pannello di dettaglio per il processo selezionato.
-   **Gestione Processi**: Creazione, modifica ed eliminazione di job UiPath.
    -   Tracciamento di: Nome Processo, Server Target, Responsabile, Orario Avvio, Durata Media.
-   **Logica "Giorno Generico"**: Tutti gli eventi sono normalizzati su un'unica data virtuale per semplificare la visualizzazione e ignorare la complessità di settimane/mesi.
-   **Branding Corporate**: Design System personalizzato sui colori Repower (**Rosso #D31145**, Nero #1A1A1A, Bianco) con logo integrato.

---

## 🛠 Stack Tecnologico & Architettura

Il progetto è costruito con tecnologie React moderne e leggere per garantire velocità ed estendibilità.

### Core Stack
-   **Runtime**: [Node.js](https://nodejs.org/)
-   **Framework**: [React](https://reactjs.org/) (v18+)
-   **Build Tool**: [Vite](https://vitejs.dev/) - per un ambiente di sviluppo rapido e build ottimizzate.
-   **Linguaggio**: JavaScript (ES6+)

### Librerie Chiave
-   **Calendario**: `react-big-calendar` - Gestione avanzata della griglia oraria.
-   **Gestione Date**: `date-fns` - Manipolazione robusta di orari e date.
-   **Stile**: CSS3 nativo con variabili CSS (Custom Properties) per un theming flessibile (Repower Theme).

### Struttura Dati & Persistenza
-   **Storage**: `localStorage` del browser.
    -   I dati sono persistenti localmente e sopravvivono al refresh della pagina.
    -   Non è richiesto un database backend per questa versione standalone.
-   **Modello Dati (Job UiPath)**:
    ```javascript
    {
      id: string,              // UUID unico
      title: string,           // Nome del processo
      server: string,          // Server di esecuzione (es. SRV-01)
      start: Date,             // Data normalizzata al 01/01/2024 + Orario
      end: Date,               // Calcolato da Start + Duration
      durationMinutes: number, // Durata media in minuti
      userName: string,        // Responsabile
      description: string      // Note operative
    }
    ```

---

## 📂 Struttura del Progetto

```
/src
  /assets           # Immagini e loghi (es. Logo Repower)
  /components       # Componenti React riutilizzabili
    CalendarView.jsx  # Griglia temporale (Logica "Generic Day")
    DetailsPanel.jsx  # Pannello laterale destro (Info e Azioni)
    TriggerForm.jsx   # Modale per creazione/modifica flussi
  /hooks            # Logica di business personalizzata
    useTriggers.js    # Hook per gestione stato crud e persistenza
  /storage          # Acesso al localStorage
    localTriggerStorage.js
  App.jsx           # Layout principale (Split Screen)
  App.css           # Global Styles e Design System Repower
  main.jsx          # Punto di ingresso React
```

---

## 🚀 Istruzioni per l'Avvio

### Prerequisiti
-   Node.js installato sul sistema.

### Installazione
1.  Apri il terminale nella cartella del progetto.
2.  Installa le dipendenze:
    ```bash
    npm install
    ```

### Sviluppo Locale
Per avviare l'applicazione in modalità sviluppo:
```bash
npm run dev
```
L'applicazione sarà accessibile all'indirizzo mostrato nel terminale (solitamente `http://localhost:5173`).

---

## 🎨 Note di Design (Repower Theme)
Il design segue rigorosamente la palette aziendale:
-   **Primary**: `#D31145` (Rosso) - Utilizzato per accenti, indicatori di tempo e stati attivi.
-   **Secondary**: `#1A1A1A` (Nero) - Utilizzato per barre laterali, testi principali ed eventi calendario.
-   **Background**: `#F4F4F4` / `#FFFFFF` - Per massimizzare la leggibilità.
-   **Layout**: Full Viewport (100vw/100vh) senza barre di scorrimento globali.

---
Generato da **Antigravity** per Repower.
