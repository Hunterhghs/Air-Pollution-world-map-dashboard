let isPlaying = false;
let playInterval = null;

document.addEventListener('DOMContentLoaded', function() {
    initMap();
    initCharts();
    setupEventListeners();

    setTimeout(() => {
        updateDashboard();
    }, 500);
});

function setupEventListeners() {
    document.querySelectorAll('.pill').forEach(pill => {
        pill.addEventListener('click', function() {
            document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
            this.classList.add('active');
            currentMetric = this.dataset.metric;
            updateDashboard();
        });
    });

    const yearSlider = document.getElementById('yearSlider');
    yearSlider.addEventListener('input', function() {
        currentYear = parseInt(this.value);
        document.getElementById('yearDisplay').textContent = currentYear;
        updateDashboard();
    });

    document.getElementById('scenarioSelect').addEventListener('change', function() {
        currentScenario = this.value;
        updateDashboard();
    });

    document.getElementById('playBtn').addEventListener('click', togglePlay);

    document.getElementById('tooltipClose').addEventListener('click', function() {
        document.getElementById('countryTooltip').classList.remove('visible');
        selectedCountryIso3 = null;
        updateMap();
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.getElementById('countryTooltip').classList.remove('visible');
            selectedCountryIso3 = null;
            updateMap();
        }
        if (e.key === ' ') {
            e.preventDefault();
            togglePlay();
        }
        if (e.key === 'ArrowRight') {
            const slider = document.getElementById('yearSlider');
            const newVal = Math.min(2050, parseInt(slider.value) + 1);
            slider.value = newVal;
            currentYear = newVal;
            document.getElementById('yearDisplay').textContent = currentYear;
            updateDashboard();
        }
        if (e.key === 'ArrowLeft') {
            const slider = document.getElementById('yearSlider');
            const newVal = Math.max(2025, parseInt(slider.value) - 1);
            slider.value = newVal;
            currentYear = newVal;
            document.getElementById('yearDisplay').textContent = currentYear;
            updateDashboard();
        }
    });
}

function togglePlay() {
    const btn = document.getElementById('playBtn');
    if (isPlaying) {
        clearInterval(playInterval);
        isPlaying = false;
        btn.classList.remove('playing');
        btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M4 2l10 6-10 6V2z"/></svg>';
    } else {
        isPlaying = true;
        btn.classList.add('playing');

        if (currentYear >= 2050) {
            currentYear = 2025;
            document.getElementById('yearSlider').value = 2025;
        }

        playInterval = setInterval(() => {
            currentYear++;
            if (currentYear > 2050) {
                currentYear = 2025;
            }
            document.getElementById('yearSlider').value = currentYear;
            document.getElementById('yearDisplay').textContent = currentYear;
            updateDashboard();
        }, 800);
    }
}

function updateDashboard() {
    const stats = getGlobalStats(currentYear, currentScenario);

    document.getElementById('globalMean').textContent = stats.meanPM25;
    document.getElementById('globalMeanBar').style.width = Math.min(100, (stats.meanPM25 / 50) * 100) + '%';

    document.getElementById('popExposed').textContent = stats.popExposed + 'B';
    document.getElementById('prematureDeaths').textContent = (stats.totalDeaths / 1000).toFixed(1) + 'M';

    updateMap();
    updateRankLists(currentYear, currentScenario, currentMetric);
    updateAllCharts(currentYear, currentScenario, currentMetric);

    if (selectedCountryIso3) {
        showCountryDetail(selectedCountryIso3);
    }
}

const style = document.createElement('style');
style.textContent = `
    .custom-tooltip {
        background: rgba(17, 24, 39, 0.95) !important;
        backdrop-filter: blur(8px);
        border: 1px solid #334155 !important;
        border-radius: 8px !important;
        padding: 8px 12px !important;
        font-family: 'Inter', sans-serif !important;
        font-size: 12px !important;
        color: #f1f5f9 !important;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4) !important;
    }
    .custom-tooltip::before {
        border-top-color: rgba(17, 24, 39, 0.95) !important;
    }
    .leaflet-control-zoom a {
        background: rgba(17, 24, 39, 0.9) !important;
        color: #f1f5f9 !important;
        border-color: #334155 !important;
        width: 32px !important;
        height: 32px !important;
        line-height: 32px !important;
        font-size: 14px !important;
    }
    .leaflet-control-zoom a:hover {
        background: #1e293b !important;
    }
    .leaflet-control-zoom {
        border: none !important;
        border-radius: 8px !important;
        overflow: hidden;
        margin: 16px !important;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3) !important;
    }
`;
document.head.appendChild(style);
