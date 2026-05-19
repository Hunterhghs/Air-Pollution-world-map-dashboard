let map;
let geoJsonLayer;
let currentMetric = 'pm25';
let currentYear = 2025;
let currentScenario = 'baseline';
let selectedCountryIso3 = null;

const METRIC_CONFIG = {
    pm25: {
        label: 'PM2.5',
        unit: 'µg/m³',
        guideline: 5,
        breaks: [0, 5, 10, 15, 25, 35, 50, 75, 100, 150],
        colors: ['#10b981', '#22c55e', '#84cc16', '#eab308', '#f59e0b', '#f97316', '#ef4444', '#dc2626', '#991b1b', '#4a0404'],
        legendLabels: ['0', '5', '15', '35', '75', '150+']
    },
    no2: {
        label: 'NO₂',
        unit: 'µg/m³',
        guideline: 10,
        breaks: [0, 5, 10, 15, 20, 25, 30, 40, 50, 60],
        colors: ['#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#c026d3', '#e11d48', '#be123c', '#881337'],
        legendLabels: ['0', '10', '20', '30', '50', '60+']
    },
    o3: {
        label: 'O₃',
        unit: 'µg/m³',
        guideline: 60,
        breaks: [0, 20, 30, 40, 50, 55, 60, 65, 70, 80],
        colors: ['#10b981', '#34d399', '#6ee7b7', '#fde047', '#facc15', '#eab308', '#f59e0b', '#f97316', '#ef4444', '#991b1b'],
        legendLabels: ['0', '30', '40', '55', '65', '80+']
    },
    deaths: {
        label: 'Premature Deaths',
        unit: 'thousands/yr',
        guideline: null,
        breaks: [0, 1, 5, 10, 25, 50, 100, 250, 500, 1000],
        colors: ['#f0fdf4', '#bbf7d0', '#fef08a', '#fde047', '#fbbf24', '#f97316', '#ef4444', '#dc2626', '#991b1b', '#450a0a'],
        legendLabels: ['0', '5', '25', '100', '500', '1000+']
    }
};

function getColor(value, metric) {
    const config = METRIC_CONFIG[metric];
    for (let i = config.breaks.length - 1; i >= 0; i--) {
        if (value >= config.breaks[i]) {
            return config.colors[i];
        }
    }
    return config.colors[0];
}

function initMap() {
    map = L.map('map', {
        center: [20, 15],
        zoom: 2.5,
        minZoom: 2,
        maxZoom: 7,
        zoomControl: false,
        attributionControl: false,
        worldCopyJump: true,
        maxBounds: [[-85, -200], [85, 200]]
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 19,
        pane: 'overlayPane'
    }).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);

    loadGeoJSON();
}

async function loadGeoJSON() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson');
        const data = await response.json();
        renderGeoJSON(data);
    } catch (e) {
        console.error('Failed to load GeoJSON:', e);
        try {
            const fallback = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
            const topo = await fallback.json();
            const countries = topojson.feature(topo, topo.objects.countries);
            renderGeoJSON(countries);
        } catch (e2) {
            console.error('Fallback also failed:', e2);
        }
    }
}

function renderGeoJSON(data) {
    if (geoJsonLayer) {
        map.removeLayer(geoJsonLayer);
    }

    geoJsonLayer = L.geoJSON(data, {
        style: featureStyle,
        onEachFeature: onEachFeature
    }).addTo(map);
}

function featureStyle(feature) {
    const iso3 = feature.properties.ISO_A3 || feature.properties.ADM0_A3 || feature.id;
    const country = COUNTRY_DATA[iso3];

    if (!country) {
        return {
            fillColor: '#1a2235',
            weight: 0.5,
            opacity: 0.6,
            color: '#334155',
            fillOpacity: 0.7
        };
    }

    const projected = getProjectedData(iso3, currentYear, currentScenario);
    const value = projected ? projected[currentMetric] : country[currentMetric];
    const color = getColor(value, currentMetric);

    return {
        fillColor: color,
        weight: selectedCountryIso3 === iso3 ? 2.5 : 0.8,
        opacity: 1,
        color: selectedCountryIso3 === iso3 ? '#f1f5f9' : '#334155',
        fillOpacity: 0.85
    };
}

function onEachFeature(feature, layer) {
    const iso3 = feature.properties.ISO_A3 || feature.properties.ADM0_A3 || feature.id;
    const country = COUNTRY_DATA[iso3];

    layer.on({
        mouseover: function(e) {
            if (!country) return;
            const layer = e.target;
            layer.setStyle({
                weight: 2,
                color: '#60a5fa',
                fillOpacity: 0.95
            });
            layer.bringToFront();
        },
        mouseout: function(e) {
            if (geoJsonLayer) {
                geoJsonLayer.resetStyle(e.target);
            }
        },
        click: function(e) {
            if (!country) return;
            selectedCountryIso3 = iso3;
            showCountryDetail(iso3);
            if (geoJsonLayer) {
                geoJsonLayer.setStyle(featureStyle);
            }
            const layer = e.target;
            layer.setStyle({
                weight: 2.5,
                color: '#f1f5f9',
                fillOpacity: 0.95
            });
            layer.bringToFront();
        }
    });

    if (country) {
        const projected = getProjectedData(iso3, currentYear, currentScenario);
        const value = projected ? projected[currentMetric] : country[currentMetric];
        const config = METRIC_CONFIG[currentMetric];
        layer.bindTooltip(
            `<strong>${country.flag} ${country.name}</strong><br>${config.label}: ${value} ${config.unit}`,
            { className: 'custom-tooltip', sticky: true }
        );
    }
}

function updateMap() {
    if (geoJsonLayer) {
        geoJsonLayer.setStyle(featureStyle);
        geoJsonLayer.eachLayer(function(layer) {
            const iso3 = layer.feature.properties.ISO_A3 || layer.feature.properties.ADM0_A3 || layer.feature.id;
            const country = COUNTRY_DATA[iso3];
            if (country) {
                const projected = getProjectedData(iso3, currentYear, currentScenario);
                const value = projected ? projected[currentMetric] : country[currentMetric];
                const config = METRIC_CONFIG[currentMetric];
                layer.unbindTooltip();
                layer.bindTooltip(
                    `<strong>${country.flag} ${country.name}</strong><br>${config.label}: ${value} ${config.unit}`,
                    { className: 'custom-tooltip', sticky: true }
                );
            }
        });
    }
    updateLegend();
}

function updateLegend() {
    const config = METRIC_CONFIG[currentMetric];
    const legend = document.getElementById('mapLegend');

    const title = legend.querySelector('.legend-title');
    title.textContent = `${config.label} (${config.unit})`;

    const labels = legend.querySelectorAll('.legend-labels span');
    config.legendLabels.forEach((lbl, i) => {
        if (labels[i]) labels[i].textContent = lbl;
    });

    const bar = legend.querySelector('.legend-bar');
    bar.style.background = `linear-gradient(to right, ${config.colors.join(', ')})`;

    const whoLine = legend.querySelector('.legend-who');
    if (config.guideline) {
        whoLine.style.display = 'flex';
        whoLine.innerHTML = `<span class="who-line"></span> WHO Guideline: ${config.guideline} ${config.unit}`;
    } else {
        whoLine.style.display = 'none';
    }
}

function showCountryDetail(iso3) {
    const country = COUNTRY_DATA[iso3];
    if (!country) return;

    const projected = getProjectedData(iso3, currentYear, currentScenario);
    const tooltip = document.getElementById('countryTooltip');

    document.getElementById('tooltipFlag').textContent = country.flag;
    document.getElementById('tooltipCountry').textContent = country.name;
    document.getElementById('tooltipRegion').textContent = country.region;
    document.getElementById('tooltipPM25').textContent = projected.pm25 + ' µg/m³';
    document.getElementById('tooltipNO2').textContent = projected.no2 + ' µg/m³';
    document.getElementById('tooltipO3').textContent = projected.o3 + ' µg/m³';
    document.getElementById('tooltipDeaths').textContent = formatDeaths(projected.deaths);

    const whoStatus = document.getElementById('tooltipWHO');
    if (projected.pm25 <= WHO_GUIDELINE_PM25) {
        whoStatus.textContent = 'Meets WHO PM2.5 Guideline';
        whoStatus.className = 'tooltip-who-status meets';
    } else {
        const exceed = Math.round((projected.pm25 / WHO_GUIDELINE_PM25) * 10) / 10;
        whoStatus.textContent = `Exceeds WHO guideline by ${exceed}x`;
        whoStatus.className = 'tooltip-who-status exceeds';
    }

    updateTooltipChart(iso3);
    tooltip.classList.add('visible');
}

function formatDeaths(val) {
    if (val >= 1000) return (Math.round(val / 100) / 10) + 'M';
    if (val >= 1) return Math.round(val) + 'K';
    return (Math.round(val * 100) / 100) + 'K';
}
