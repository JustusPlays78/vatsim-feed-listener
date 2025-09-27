// VATSIM Flight Analyzer JavaScript
class FlightAnalyzer {
    constructor() {
        // Verwende lokalen Proxy statt direkten API-Aufruf
        this.apiBase = '/api/flights';
        this.init();
    }

    init() {
        // Event Listeners
        document.getElementById('searchForm').addEventListener('submit', this.handleSearch.bind(this));
        document.getElementById('icao').addEventListener('input', this.handleIcaoInput.bind(this));
        
        // Dark Mode Toggle
        document.getElementById('themeToggle').addEventListener('click', this.toggleTheme.bind(this));
        
        // Standardwerte setzen
        this.setDefaultDates();
        
        // Auto-Format für ICAO Input
        this.setupIcaoFormatting();
        
        // Theme initialisieren
        this.initTheme();
    }

    initTheme() {
        // Gespeicherte Theme-Präferenz laden oder System-Präferenz verwenden
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        const theme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
        this.setTheme(theme);
        
        // System Theme Changes überwachen
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Schöne Animation für den Toggle
        const button = document.getElementById('themeToggle');
        button.style.transform = 'scale(0.8) rotate(180deg)';
        setTimeout(() => {
            button.style.transform = 'scale(1) rotate(0deg)';
        }, 200);
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        const icon = document.getElementById('themeIcon');
        const button = document.getElementById('themeToggle');
        
        if (theme === 'dark') {
            icon.className = 'fas fa-sun';
            button.title = 'Light Mode aktivieren';
        } else {
            icon.className = 'fas fa-moon';
            button.title = 'Dark Mode aktivieren';
        }
    }

    setDefaultDates() {
        const now = new Date();
        const twoHoursAgo = new Date(now.getTime() - (2 * 60 * 60 * 1000));
        
        document.getElementById('fromDateTime').value = this.formatDateTimeLocal(twoHoursAgo);
        document.getElementById('toDateTime').value = this.formatDateTimeLocal(now);
    }

    formatDateTimeLocal(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    setupIcaoFormatting() {
        const icaoInput = document.getElementById('icao');
        icaoInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase();
        });
    }

    handleIcaoInput(e) {
        const value = e.target.value.toUpperCase();
        e.target.value = value;
        
        // Validierung
        if (value.length === 4) {
            e.target.classList.remove('is-invalid');
            e.target.classList.add('is-valid');
        } else if (value.length > 0) {
            e.target.classList.remove('is-valid');
            e.target.classList.add('is-invalid');
        } else {
            e.target.classList.remove('is-valid', 'is-invalid');
        }
    }

    async handleSearch(e) {
        e.preventDefault();
        
        const icao = document.getElementById('icao').value.trim().toUpperCase();
        const fromDateTime = document.getElementById('fromDateTime').value;
        const toDateTime = document.getElementById('toDateTime').value;

        // Validierung
        if (!this.validateInput(icao, fromDateTime, toDateTime)) {
            return;
        }

        try {
            this.showLoading(true);
            this.clearAlerts();
            
            const flights = await this.fetchFlights(icao, fromDateTime, toDateTime);
            this.displayResults(flights, icao);
            
        } catch (error) {
            console.error('Fehler beim Laden der Flugdaten:', error);
            this.showAlert('danger', `
                <i class="fas fa-exclamation-triangle me-2"></i>
                <strong>Fehler beim Laden der Daten</strong><br>
                ${error.message}<br>
                <small>Bitte versuchen Sie es später noch einmal oder prüfen Sie Ihre Internetverbindung.</small>
            `);
        } finally {
            this.showLoading(false);
        }
    }

    validateInput(icao, fromDateTime, toDateTime) {
        if (icao.length !== 4) {
            this.showAlert('danger', '<i class="fas fa-exclamation-triangle me-2"></i>Bitte geben Sie einen gültigen 4-stelligen ICAO-Code ein.');
            return false;
        }

        if (new Date(fromDateTime) >= new Date(toDateTime)) {
            this.showAlert('danger', '<i class="fas fa-exclamation-triangle me-2"></i>Das "Von"-Datum muss vor dem "Bis"-Datum liegen.');
            return false;
        }

        return true;
    }

    async fetchFlights(icao, fromDateTime, toDateTime) {
        // Datumsformatierung für API
        const fromFormatted = new Date(fromDateTime).toISOString();
        const toFormatted = new Date(toDateTime).toISOString();
        
        const url = `${this.apiBase}?icao=${icao}&from=${encodeURIComponent(fromFormatted)}&to=${encodeURIComponent(toFormatted)}`;
        
        this.showAlert('success', `
            <i class="fas fa-satellite-dish me-2"></i>
            <strong>API-Aufruf wird durchgeführt...</strong><br>
            <small>Daten werden über lokalen Proxy von STATSIM API geladen</small>
        `);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(`HTTP ${response.status}: ${errorData.error || response.statusText}`);
        }

        const flights = await response.json();
        
        if (!Array.isArray(flights)) {
            throw new Error('Unerwartetes Datenformat von der API erhalten');
        }

        return flights;
    }

    displayResults(flights, icao) {
        if (flights.length === 0) {
            this.showAlert('warning', '<i class="fas fa-info-circle me-2"></i>Keine Flugdaten für den angegebenen Zeitraum gefunden.');
            document.getElementById('results').style.display = 'none';
            return;
        }

        this.clearAlerts();
        this.showAlert('success', `
            <i class="fas fa-check-circle me-2"></i>
            <strong>${flights.length} Flüge gefunden!</strong> Daten erfolgreich von STATSIM API geladen.
        `);

        // Statistiken berechnen und anzeigen
        this.displayStatistics(flights);
        
        // Top Abflughäfen anzeigen
        this.displayTopAirports(flights);
        
        // Flugdaten Tabelle füllen
        this.displayFlightsTable(flights);
        
        // Ergebnisse Container anzeigen
        document.getElementById('results').style.display = 'block';
        document.getElementById('results').classList.add('fade-in');
    }

    displayStatistics(flights) {
        const totalFlights = flights.length;
        
        // Korrekte Berechnung: Flüge die bereits angekommen sind (haben arrived Timestamp)
        const arrivedFlights = flights.filter(f => f.arrived && f.arrived !== null && f.arrived !== '').length;
        
        // Korrekte Berechnung: Flüge die bereits abgeflogen sind (haben departed Timestamp)
        const departedFlights = flights.filter(f => f.departed && f.departed !== null && f.departed !== '').length;
        
        // Flüge die noch in der Luft sind (abgeflogen aber noch nicht angekommen)
        const inFlightFlights = flights.filter(f => 
            (f.departed && f.departed !== null && f.departed !== '') && 
            (!f.arrived || f.arrived === null || f.arrived === '')
        ).length;
        
        const uniqueAirports = new Set(flights.map(f => f.departure)).size;

        const statsHtml = `
            <div class="stat-card">
                <span class="stat-number">${totalFlights}</span>
                <div class="stat-label">Gesamt Flüge</div>
            </div>
            <div class="stat-card">
                <span class="stat-number">${arrivedFlights}</span>
                <div class="stat-label">Angekommen</div>
            </div>
            <div class="stat-card">
                <span class="stat-number">${inFlightFlights}</span>
                <div class="stat-label">In der Luft</div>
            </div>
            <div class="stat-card">
                <span class="stat-number">${uniqueAirports}</span>
                <div class="stat-label">Abflughäfen</div>
            </div>
        `;

        document.getElementById('statsGrid').innerHTML = statsHtml;
        
        // Debug-Ausgabe für besseres Verständnis
        console.log('Statistik Debug:', {
            total: totalFlights,
            arrived: arrivedFlights,
            departed: departedFlights,
            inFlight: inFlightFlights,
            airports: uniqueAirports
        });
    }

    displayTopAirports(flights) {
        // Zähle Abflughäfen
        const airportCounts = {};
        flights.forEach(flight => {
            const airport = flight.departure;
            airportCounts[airport] = (airportCounts[airport] || 0) + 1;
        });

        // Sortiere nach Anzahl
        const sortedAirports = Object.entries(airportCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10); // Top 10

        if (sortedAirports.length === 0) {
            document.getElementById('airportsCard').style.display = 'none';
            return;
        }

        const totalFlights = flights.length;
        const airportsHtml = sortedAirports.map(([airport, count]) => {
            const percentage = ((count / totalFlights) * 100).toFixed(1);
            return `
                <div class="airport-card">
                    <div class="airport-code">${airport}</div>
                    <div class="airport-stats">
                        ${count} Flüge<br>
                        <small>(${percentage}%)</small>
                    </div>
                </div>
            `;
        }).join('');

        document.getElementById('airportsGrid').innerHTML = airportsHtml;
        document.getElementById('airportsCard').style.display = 'block';
    }

    displayFlightsTable(flights) {
        // Sortiere nach Ankunftszeit
        const sortedFlights = flights.sort((a, b) => {
            const timeA = a.arrived ? new Date(a.arrived).getTime() : Date.now();
            const timeB = b.arrived ? new Date(b.arrived).getTime() : Date.now();
            return timeA - timeB;
        });

        const tableHtml = sortedFlights.map(flight => {
            return `
                <tr>
                    <td><span class="callsign">${this.escapeHtml(flight.callsign)}</span></td>
                    <td><span class="airport-code-table">${this.escapeHtml(flight.departure)}</span></td>
                    <td><span class="airport-code-table">${this.escapeHtml(flight.destination)}</span></td>
                    <td><span class="aircraft-type">${this.escapeHtml(flight.aircraft)}</span></td>
                    <td>${this.formatAltitude(flight.altitude)}</td>
                    <td>${this.formatDateTime(flight.departed, 'status-departed')}</td>
                    <td>${this.formatDateTime(flight.arrived, 'status-arrived')}</td>
                    <td>${this.formatDateTime(flight.loggedOn)}</td>
                    <td><div class="route-cell">${this.escapeHtml(flight.route || '-')}</div></td>
                </tr>
            `;
        }).join('');

        document.getElementById('flightsTableBody').innerHTML = tableHtml;
    }

    formatAltitude(altitude) {
        if (typeof altitude === 'number') {
            return `${altitude.toLocaleString()} ft`;
        } else if (altitude) {
            return this.escapeHtml(altitude.toString());
        }
        return '-';
    }

    formatDateTime(dateTimeString, className = '') {
        if (!dateTimeString) {
            return '<span class="text-muted">-</span>';
        }

        try {
            const date = new Date(dateTimeString);
            const formatted = date.toLocaleString('de-DE', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const classes = className ? `class="${className}"` : '';
            return `<span ${classes}>${formatted}</span>`;
        } catch (e) {
            return `<span class="text-muted">${this.escapeHtml(dateTimeString)}</span>`;
        }
    }

    showLoading(show) {
        document.getElementById('loadingOverlay').style.display = show ? 'flex' : 'none';
    }

    showAlert(type, message) {
        const alertHtml = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        
        document.getElementById('alertContainer').innerHTML = alertHtml;
        
        // Auto-dismiss nach 10 Sekunden (außer bei Fehlern)
        if (type !== 'danger') {
            setTimeout(() => {
                this.clearAlerts();
            }, 10000);
        }
    }

    clearAlerts() {
        document.getElementById('alertContainer').innerHTML = '';
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return (text || '').toString().replace(/[&<>"']/g, (m) => map[m]);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FlightAnalyzer();
});