// Daten für die Anwendung
const applicationData = {
  materials: {
    Stahl: 1000,
    Eisen: 5000,
    Nickel: 600,
    Kobalt: 250
  },
  presets: [
    {
      name: "Kleine Testkonstruktion",
      capacitors: 2,
      capacitance: 1000,
      voltage: 250,
      turns: 200,
      length: 3,
      diameter: 1.5,
      projectile_mass: 5,
      material: "Stahl",
      resistance: 0.3
    },
    {
      name: "Mittelgroße Coilgun",
      capacitors: 4,
      capacitance: 2200,
      voltage: 350,
      turns: 300,
      length: 5,
      diameter: 2,
      projectile_mass: 10,
      material: "Stahl",
      resistance: 0.5
    },
    {
      name: "Leistungsstarke Version",
      capacitors: 6,
      capacitance: 3300,
      voltage: 400,
      turns: 400,
      length: 8,
      diameter: 3,
      projectile_mass: 20,
      material: "Eisen",
      resistance: 0.8
    }
  ],
  safety_warnings: [
    "⚠️ LEBENSGEFAHR: Hochspannung kann tödlich sein!",
    "🔋 Kondensatoren speichern Energie auch nach dem Ausschalten!",
    "🧤 Immer Schutzausrüstung und isolierte Werkzeuge verwenden!",
    "🔥 Brandgefahr bei Kurzschluss der Kondensatoren!",
    "🎯 Nie auf Menschen oder Tiere richten!",
    "⚖️ Rechtliche Einschränkungen in Deutschland beachten!"
  ]
};

// Konstanten für physikalische Berechnungen
const CONSTANTS = {
  μ0: 4 * Math.PI * 1e-7, // Magnetische Feldkonstante in H/m (Henry pro Meter)
  efficiency_factor: 0.3, // Angenommene Effizienz der Energieübertragung
};

// DOM-Elemente
const elements = {
  // Eingabefelder
  capacitors: document.getElementById('capacitors'),
  capacitance: document.getElementById('capacitance'),
  voltage: document.getElementById('voltage'),
  voltageValue: document.getElementById('voltage-value'),
  turns: document.getElementById('turns'),
  resistance: document.getElementById('resistance'),
  coilLength: document.getElementById('coil-length'),
  coilDiameter: document.getElementById('coil-diameter'),
  projectileMass: document.getElementById('projectile-mass'),
  material: document.getElementById('material'),
  
  // Buttons
  calcButton: document.getElementById('calc-button'),
  resetButton: document.getElementById('reset-button'),
  
  // Presets
  preset: document.getElementById('preset'),
  
  // Ergebnisfelder
  energy: document.getElementById('energy'),
  peakCurrent: document.getElementById('peak-current'),
  magneticField: document.getElementById('magnetic-field'),
  force: document.getElementById('force'),
  acceleration: document.getElementById('acceleration'),
  velocity: document.getElementById('velocity'),
  efficiency: document.getElementById('efficiency'),
  
  // Listen und Tabellen
  safetyWarnings: document.getElementById('safety-warnings'),
  presetsTableBody: document.getElementById('presets-table-body'),
  
  // Diagramm
  velocityChart: document.getElementById('velocity-chart')
};

// Globale Variablen
let velocityChartInstance = null;

// Initialisierungsfunktion
function initialize() {
  // Sicherheitshinweise laden
  loadSafetyWarnings();
  
  // Presets-Tabelle füllen
  populatePresetsTable();
  
  // Event-Listener einrichten
  setupEventListeners();
  
  // Diagramm initialisieren
  initVelocityChart();
  
  // Erste Berechnung durchführen
  calculateResults();
}

// Sicherheitshinweise laden
function loadSafetyWarnings() {
  const warningsList = elements.safetyWarnings;
  warningsList.innerHTML = '';
  
  applicationData.safety_warnings.forEach(warning => {
    const li = document.createElement('li');
    li.textContent = warning;
    warningsList.appendChild(li);
  });
}

// Presets-Tabelle füllen
function populatePresetsTable() {
  const tableBody = elements.presetsTableBody;
  tableBody.innerHTML = '';
  
  applicationData.presets.forEach(preset => {
    const row = document.createElement('tr');
    
    row.innerHTML = `
      <td>${preset.name}</td>
      <td>${preset.capacitors}</td>
      <td>${preset.capacitance}</td>
      <td>${preset.voltage}</td>
      <td>${preset.turns}</td>
      <td>${preset.length}</td>
      <td>${preset.diameter}</td>
      <td>${preset.projectile_mass}</td>
      <td>${preset.material}</td>
    `;
    
    // Klickbare Zeilen für einfaches Anwenden der Presets
    row.style.cursor = 'pointer';
    row.addEventListener('click', () => {
      // Entsprechendes Preset aus dem Dropdown wählen
      const index = applicationData.presets.findIndex(p => p.name === preset.name);
      elements.preset.selectedIndex = index + 1; // +1 wegen der "Bitte wählen" Option
      
      // Preset anwenden
      applyPresetByIndex(index);
    });
    
    tableBody.appendChild(row);
  });
}

// Event-Listener einrichten
function setupEventListeners() {
  // Spannung Slider
  elements.voltage.addEventListener('input', () => {
    elements.voltageValue.textContent = elements.voltage.value;
    calculateResults(); // Sofort aktualisieren bei Änderung
  });
  
  // Alle Eingabefelder: Bei Änderung neu berechnen
  const inputElements = [
    elements.capacitors, elements.capacitance,
    elements.turns, elements.resistance, elements.coilLength,
    elements.coilDiameter, elements.projectileMass, elements.material
  ];
  
  inputElements.forEach(element => {
    element.addEventListener('input', calculateResults);
  });
  
  // Berechnen-Button
  elements.calcButton.addEventListener('click', calculateResults);
  
  // Reset-Button
  elements.resetButton.addEventListener('click', resetForm);
  
  // Preset-Auswahl
  elements.preset.addEventListener('change', () => {
    const selectedIndex = elements.preset.selectedIndex - 1; // -1 wegen der "Bitte wählen" Option
    if (selectedIndex >= 0) {
      applyPresetByIndex(selectedIndex);
    }
  });
}

// Presets anwenden nach Index
function applyPresetByIndex(index) {
  if (index >= 0 && index < applicationData.presets.length) {
    const preset = applicationData.presets[index];
    
    // Werte in Formular übertragen
    elements.capacitors.value = preset.capacitors;
    elements.capacitance.value = preset.capacitance;
    elements.voltage.value = preset.voltage;
    elements.voltageValue.textContent = preset.voltage;
    elements.turns.value = preset.turns;
    elements.resistance.value = preset.resistance;
    elements.coilLength.value = preset.length;
    elements.coilDiameter.value = preset.diameter;
    elements.projectileMass.value = preset.projectile_mass;
    elements.material.value = preset.material;
    
    // Ergebnisse aktualisieren
    calculateResults();
  }
}

// Formular zurücksetzen
function resetForm() {
  // Auf Standardwerte zurücksetzen (Mittelgroße Coilgun)
  elements.capacitors.value = 4;
  elements.capacitance.value = 2200;
  elements.voltage.value = 350;
  elements.voltageValue.textContent = 350;
  elements.turns.value = 300;
  elements.resistance.value = 0.5;
  elements.coilLength.value = 5;
  elements.coilDiameter.value = 2;
  elements.projectileMass.value = 10;
  elements.material.value = "Stahl";
  elements.preset.selectedIndex = 0; // "Bitte wählen" Option
  
  // Ergebnisse aktualisieren
  calculateResults();
}

// Geschwindigkeit vs. Spannung Diagramm initialisieren
function initVelocityChart() {
  const ctx = elements.velocityChart.getContext('2d');
  
  // Daten für das Diagramm vorbereiten
  const voltageValues = [];
  const velocityValues = [];
  
  // Spannungswerte von 50V bis 500V in 50V-Schritten
  for (let v = 50; v <= 500; v += 50) {
    voltageValues.push(v);
  }
  
  // Aktuelle Parameter speichern
  const currentVoltage = elements.voltage.value;
  
  // Für jeden Spannungswert die Geschwindigkeit berechnen
  voltageValues.forEach(voltage => {
    elements.voltage.value = voltage;
    const velocity = calculateVelocity();
    velocityValues.push(velocity);
  });
  
  // Ursprüngliche Spannung wiederherstellen
  elements.voltage.value = currentVoltage;
  elements.voltageValue.textContent = currentVoltage;
  
  // Diagramm erstellen
  velocityChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: voltageValues,
      datasets: [{
        label: 'Geschwindigkeit (m/s)',
        data: velocityValues,
        backgroundColor: '#1FB8CD',
        borderColor: '#1FB8CD',
        borderWidth: 2,
        tension: 0.3,
        fill: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: {
            display: true,
            text: 'Spannung (V)'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Geschwindigkeit (m/s)'
          },
          beginAtZero: true
        }
      }
    }
  });
}

// Diagramm aktualisieren
function updateVelocityChart() {
  if (!velocityChartInstance) return;
  
  // Daten für das Diagramm vorbereiten
  const voltageValues = [];
  const velocityValues = [];
  
  // Spannungswerte von 50V bis 500V in 50V-Schritten
  for (let v = 50; v <= 500; v += 50) {
    voltageValues.push(v);
  }
  
  // Aktuelle Parameter speichern
  const currentVoltage = elements.voltage.value;
  
  // Für jeden Spannungswert die Geschwindigkeit berechnen
  voltageValues.forEach(voltage => {
    elements.voltage.value = voltage;
    const velocity = calculateVelocity();
    velocityValues.push(velocity);
  });
  
  // Ursprüngliche Spannung wiederherstellen
  elements.voltage.value = currentVoltage;
  elements.voltageValue.textContent = currentVoltage;
  
  // Diagramm aktualisieren
  velocityChartInstance.data.datasets[0].data = velocityValues;
  velocityChartInstance.update();
}

// Hauptberechnungsfunktion
function calculateResults() {
  // Ergebnisse berechnen
  const energy = calculateEnergy();
  const peakCurrent = calculatePeakCurrent();
  const magneticField = calculateMagneticField(peakCurrent);
  const force = calculateForce(magneticField);
  const acceleration = calculateAcceleration(force);
  const velocity = calculateVelocity();
  const efficiencyPercent = calculateEfficiency();
  
  // Ergebnisse anzeigen
  elements.energy.textContent = `${energy.toFixed(2)} J`;
  elements.peakCurrent.textContent = `${peakCurrent.toFixed(2)} A`;
  elements.magneticField.textContent = `${magneticField.toFixed(4)} T`;
  elements.force.textContent = `${force.toFixed(2)} N`;
  elements.acceleration.textContent = `${acceleration.toFixed(0)} m/s²`;
  elements.velocity.textContent = `${velocity.toFixed(2)} m/s`;
  elements.efficiency.textContent = `${efficiencyPercent.toFixed(1)} %`;
  
  // Diagramm aktualisieren
  updateVelocityChart();
}

// Einzelne Berechnungsfunktionen

// 1. Gespeicherte Energie in Joule
function calculateEnergy() {
  const capacitors = parseInt(elements.capacitors.value);
  const capacitance = parseFloat(elements.capacitance.value) * 1e-6; // µF zu F
  const voltage = parseFloat(elements.voltage.value);
  
  // E = 0.5 * C * V²
  return 0.5 * capacitors * capacitance * Math.pow(voltage, 2);
}

// 2. Spitzenstrom
function calculatePeakCurrent() {
  const energy = calculateEnergy();
  const resistance = parseFloat(elements.resistance.value);
  const voltage = parseFloat(elements.voltage.value);
  
  // I = V / R (vereinfacht, in Realität komplexer mit L und C)
  return voltage / resistance;
}

// 3. Magnetische Feldstärke
function calculateMagneticField(current) {
  const turns = parseInt(elements.turns.value);
  const length = parseFloat(elements.coilLength.value) / 100; // cm zu m
  
  // B = μ0 * n * I (für Solenoid)
  // n = Windungsdichte = Windungen / Länge
  return CONSTANTS.μ0 * (turns / length) * current;
}

// 4. Kraft auf das Projektil
function calculateForce(magneticField) {
  const material = elements.material.value;
  const materialFactor = applicationData.materials[material];
  const volume = calculateProjectileVolume();
  
  // F = materialFactor * B² * V / (2 * μ0)
  // Vereinfachte Formel für ferromagnetische Materialien
  return materialFactor * Math.pow(magneticField, 2) * volume / (2 * CONSTANTS.μ0);
}

// Hilfsfunktion: Projektilvolumen (vereinfacht als Zylinder)
function calculateProjectileVolume() {
  const diameter = parseFloat(elements.coilDiameter.value) / 100; // cm zu m
  const radius = diameter / 2 * 0.8; // Annahme: Projektil hat 80% des Spulendurchmessers
  const length = radius * 2; // Annahme: Länge = Durchmesser
  
  // V = π * r² * l
  return Math.PI * Math.pow(radius, 2) * length;
}

// 5. Beschleunigung des Projektils
function calculateAcceleration(force) {
  const mass = parseFloat(elements.projectileMass.value) / 1000; // g zu kg
  
  // a = F / m
  return force / mass;
}

// 6. Theoretische Endgeschwindigkeit
function calculateVelocity() {
  const energy = calculateEnergy();
  const efficiency = CONSTANTS.efficiency_factor;
  const mass = parseFloat(elements.projectileMass.value) / 1000; // g zu kg
  
  // E_kin = 0.5 * m * v²
  // v = sqrt(2 * E_kin / m)
  // E_kin = E * efficiency
  return Math.sqrt(2 * energy * efficiency / mass);
}

// 7. Energieeffizienz in Prozent
function calculateEfficiency() {
  const materialValue = applicationData.materials[elements.material.value];
  const maxMaterialValue = Math.max(...Object.values(applicationData.materials));
  
  // Basiseffizienz (30%)
  let efficiency = CONSTANTS.efficiency_factor * 100;
  
  // Materialeffizienz (bis zu +10%)
  efficiency += (materialValue / maxMaterialValue) * 10;
  
  // Spulenfaktor (bis zu +5%)
  const turns = parseInt(elements.turns.value);
  const optimalTurns = 350; // Annahme
  const turnsFactor = 1 - Math.abs(turns - optimalTurns) / optimalTurns;
  efficiency += turnsFactor * 5;
  
  // Maximal 50%
  return Math.min(efficiency, 50);
}

// Anwendung initialisieren
document.addEventListener('DOMContentLoaded', initialize);