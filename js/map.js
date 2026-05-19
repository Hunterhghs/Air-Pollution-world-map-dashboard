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
        colors: ['#06d6a0', '#2dc653', '#84cc16', '#eab308', '#f59e0b', '#f97316', '#ef4444', '#dc2626', '#991b1b', '#4a0404'],
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
        colors: ['#06d6a0', '#34d399', '#6ee7b7', '#fde047', '#facc15', '#eab308', '#f59e0b', '#f97316', '#ef4444', '#991b1b'],
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

// UN M.49 numeric codes -> ISO 3166-1 alpha-3
const NUM_TO_ISO3 = {
    "004":"AFG","008":"ALB","012":"DZA","024":"AGO","032":"ARG","051":"ARM",
    "036":"AUS","040":"AUT","031":"AZE","048":"BHR","050":"BGD","112":"BLR",
    "056":"BEL","204":"BEN","064":"BTN","068":"BOL","070":"BIH","072":"BWA",
    "076":"BRA","096":"BRN","100":"BGR","854":"BFA","108":"BDI","116":"KHM",
    "120":"CMR","124":"CAN","148":"TCD","152":"CHL","156":"CHN","170":"COL",
    "180":"COD","188":"CRI","384":"CIV","191":"HRV","192":"CUB","196":"CYP",
    "203":"CZE","208":"DNK","262":"DJI","214":"DOM","218":"ECU","818":"EGY",
    "222":"SLV","226":"GNQ","232":"ERI","233":"EST","231":"ETH","246":"FIN",
    "250":"FRA","266":"GAB","270":"GMB","268":"GEO","276":"DEU","288":"GHA",
    "300":"GRC","320":"GTM","324":"GIN","624":"GNB","332":"HTI","340":"HND",
    "348":"HUN","352":"ISL","356":"IND","360":"IDN","364":"IRN","368":"IRQ",
    "372":"IRL","376":"ISR","380":"ITA","388":"JAM","392":"JPN","400":"JOR",
    "398":"KAZ","404":"KEN","414":"KWT","417":"KGZ","418":"LAO","428":"LVA",
    "422":"LBN","426":"LSO","430":"LBR","434":"LBY","440":"LTU","442":"LUX",
    "450":"MDG","454":"MWI","458":"MYS","466":"MLI","478":"MRT","480":"MUS",
    "484":"MEX","498":"MDA","496":"MNG","499":"MNE","504":"MAR","508":"MOZ",
    "104":"MMR","516":"NAM","524":"NPL","528":"NLD","554":"NZL","558":"NIC",
    "562":"NER","566":"NGA","408":"PRK","807":"MKD","578":"NOR","512":"OMN",
    "586":"PAK","591":"PAN","598":"PNG","600":"PRY","604":"PER","608":"PHL",
    "616":"POL","620":"PRT","634":"QAT","642":"ROU","643":"RUS","646":"RWA",
    "682":"SAU","686":"SEN","688":"SRB","694":"SLE","702":"SGP","703":"SVK",
    "705":"SVN","706":"SOM","710":"ZAF","410":"KOR","728":"SSD","724":"ESP",
    "144":"LKA","729":"SDN","740":"SUR","752":"SWE","756":"CHE","760":"SYR",
    "158":"TWN","762":"TJK","834":"TZA","764":"THA","626":"TLS","768":"TGO",
    "780":"TTO","788":"TUN","792":"TUR","795":"TKM","800":"UGA","804":"UKR",
    "784":"ARE","826":"GBR","840":"USA","858":"URY","860":"UZB","862":"VEN",
    "704":"VNM","887":"YEM","894":"ZMB","716":"ZWE",
    // Extra territories/common aliases
    "010":"ATA","074":"BVT","162":"CXR","166":"CCK","184":"COK","242":"FJI",
    "254":"GUF","258":"PYF","260":"ATF","304":"GRL","312":"GLP","316":"GUM",
    "328":"GUY","334":"HMD","344":"HKG","356":"IND","474":"MTQ","175":"MYT",
    "540":"NCL","570":"NIU","574":"NFK","580":"MNP","585":"PLW","275":"PSE",
    "638":"REU","652":"BLM","663":"MAF","666":"SPM","678":"STP","690":"SYC",
    "534":"SXM","090":"SLB","239":"SGS","748":"SWZ","158":"TWN","792":"TUR",
    "796":"TCA","798":"TUV","850":"VIR","876":"WLF","732":"ESH","882":"WSM"
};

// Name-based fallback for features that lack ISO codes
const NAME_TO_ISO3 = {};
Object.entries(COUNTRY_DATA).forEach(([iso3, c]) => {
    NAME_TO_ISO3[c.name.toLowerCase()] = iso3;
});
NAME_TO_ISO3["united states of america"] = "USA";
NAME_TO_ISO3["united states"] = "USA";
NAME_TO_ISO3["russian federation"] = "RUS";
NAME_TO_ISO3["russia"] = "RUS";
NAME_TO_ISO3["republic of korea"] = "KOR";
NAME_TO_ISO3["korea, republic of"] = "KOR";
NAME_TO_ISO3["dem. rep. congo"] = "COD";
NAME_TO_ISO3["democratic republic of the congo"] = "COD";
NAME_TO_ISO3["congo"] = "COD";
NAME_TO_ISO3["republic of the congo"] = "COD";
NAME_TO_ISO3["côte d'ivoire"] = "CIV";
NAME_TO_ISO3["ivory coast"] = "CIV";
NAME_TO_ISO3["cote d'ivoire"] = "CIV";
NAME_TO_ISO3["iran, islamic republic of"] = "IRN";
NAME_TO_ISO3["iran (islamic republic of)"] = "IRN";
NAME_TO_ISO3["lao pdr"] = "LAO";
NAME_TO_ISO3["lao people's democratic republic"] = "LAO";
NAME_TO_ISO3["viet nam"] = "VNM";
NAME_TO_ISO3["syrian arab republic"] = "SYR";
NAME_TO_ISO3["venezuela (bolivarian republic of)"] = "VEN";
NAME_TO_ISO3["bolivia (plurinational state of)"] = "BOL";
NAME_TO_ISO3["tanzania, united republic of"] = "TZA";
NAME_TO_ISO3["united republic of tanzania"] = "TZA";
NAME_TO_ISO3["north korea"] = "PRK";
NAME_TO_ISO3["dem. rep. korea"] = "PRK";
NAME_TO_ISO3["korea, dem. people's rep."] = "PRK";
NAME_TO_ISO3["czech republic"] = "CZE";
NAME_TO_ISO3["czechia"] = "CZE";
NAME_TO_ISO3["eswatini"] = "SWZ";
NAME_TO_ISO3["swaziland"] = "SWZ";
NAME_TO_ISO3["myanmar"] = "MMR";
NAME_TO_ISO3["burma"] = "MMR";
NAME_TO_ISO3["timor-leste"] = "TLS";
NAME_TO_ISO3["east timor"] = "TLS";
NAME_TO_ISO3["south korea"] = "KOR";
NAME_TO_ISO3["taiwan"] = "TWN";
NAME_TO_ISO3["brunei darussalam"] = "BRN";
NAME_TO_ISO3["north macedonia"] = "MKD";
NAME_TO_ISO3["macedonia"] = "MKD";
NAME_TO_ISO3["the former yugoslav republic of macedonia"] = "MKD";
NAME_TO_ISO3["fmr. yug. rep. macedonia"] = "MKD";
NAME_TO_ISO3["bosnia and herz."] = "BIH";
NAME_TO_ISO3["central african rep."] = "CAF";
NAME_TO_ISO3["s. sudan"] = "SSD";
NAME_TO_ISO3["eq. guinea"] = "GNQ";
NAME_TO_ISO3["solomon is."] = "SLB";
NAME_TO_ISO3["w. sahara"] = "ESH";
NAME_TO_ISO3["somaliland"] = "SOM";
NAME_TO_ISO3["fr. s. antarctic lands"] = "ATF";
NAME_TO_ISO3["falkland is."] = "FLK";
NAME_TO_ISO3["dom. rep."] = "DOM";

function resolveISO3(feature) {
    const props = feature.properties || {};
    // Try direct ISO_A3 style properties (datasets/geo-countries, Natural Earth)
    const directCodes = [
        props.ISO_A3, props.ADM0_A3, props.iso_a3, props.adm0_a3,
        props.ISO_A3_EH, props.SU_A3, props.BRK_A3, props.gu_a3
    ];
    for (const code of directCodes) {
        if (code && code !== '-99' && code !== '-1' && code.length === 3 && COUNTRY_DATA[code]) {
            return code;
        }
    }
    // Try numeric id -> ISO3 lookup (world-atlas / TopoJSON)
    const numId = String(feature.id || props.id || props.ISO_N3 || props.iso_n3 || '');
    if (numId && NUM_TO_ISO3[numId]) {
        return NUM_TO_ISO3[numId];
    }
    // Try name-based fallback
    const names = [
        props.ADMIN, props.NAME, props.name, props.NAME_LONG,
        props.FORMAL_EN, props.NAME_EN, props.admin, props.name_long
    ];
    for (const name of names) {
        if (name) {
            const lower = name.toLowerCase();
            if (NAME_TO_ISO3[lower]) return NAME_TO_ISO3[lower];
            // partial match
            for (const [key, iso3] of Object.entries(NAME_TO_ISO3)) {
                if (lower.includes(key) || key.includes(lower)) return iso3;
            }
        }
    }
    return null;
}

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

    L.control.zoom({ position: 'topright' }).addTo(map);

    loadGeoJSON();
}

const GEOJSON_SOURCES = [
    {
        url: 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json',
        type: 'topojson'
    },
    {
        url: 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json',
        type: 'topojson'
    },
    {
        url: 'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson',
        type: 'geojson'
    }
];

async function loadGeoJSON() {
    for (const source of GEOJSON_SOURCES) {
        try {
            const response = await fetch(source.url);
            if (!response.ok) continue;
            const data = await response.json();

            let geojson;
            if (source.type === 'topojson' && typeof topojson !== 'undefined') {
                const objectKey = Object.keys(data.objects)[0];
                geojson = topojson.feature(data, data.objects[objectKey]);
            } else if (source.type === 'geojson') {
                geojson = data;
            } else {
                continue;
            }

            renderGeoJSON(geojson);
            addLabelsLayer();
            return;
        } catch (e) {
            console.warn('GeoJSON source failed:', source.url, e);
        }
    }
    console.error('All GeoJSON sources failed');
}

function addLabelsLayer() {
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 19,
        pane: 'overlayPane'
    }).addTo(map);
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
    const iso3 = resolveISO3(feature);
    const country = iso3 ? COUNTRY_DATA[iso3] : null;

    if (!country) {
        return {
            fillColor: '#0f172a',
            weight: 0.5,
            opacity: 0.4,
            color: '#1e293b',
            fillOpacity: 0.5
        };
    }

    const projected = getProjectedData(iso3, currentYear, currentScenario);
    const value = projected ? projected[currentMetric] : country[currentMetric];
    const color = getColor(value, currentMetric);
    const isSelected = selectedCountryIso3 === iso3;

    return {
        fillColor: color,
        weight: isSelected ? 3 : 1,
        opacity: 1,
        color: isSelected ? '#ffffff' : 'rgba(255,255,255,0.15)',
        fillOpacity: 0.92
    };
}

function onEachFeature(feature, layer) {
    const iso3 = resolveISO3(feature);
    const country = iso3 ? COUNTRY_DATA[iso3] : null;

    // Store resolved iso3 on the feature for later use
    feature._resolvedISO3 = iso3;

    layer.on({
        mouseover: function(e) {
            if (!country) return;
            const l = e.target;
            l.setStyle({
                weight: 2.5,
                color: '#60a5fa',
                fillOpacity: 1
            });
            l.bringToFront();
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
            const l = e.target;
            l.setStyle({
                weight: 3,
                color: '#ffffff',
                fillOpacity: 1
            });
            l.bringToFront();
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
            const iso3 = layer.feature._resolvedISO3;
            const country = iso3 ? COUNTRY_DATA[iso3] : null;
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

    legend.querySelector('.legend-title').textContent = `${config.label} (${config.unit})`;

    const labels = legend.querySelectorAll('.legend-labels span');
    config.legendLabels.forEach((lbl, i) => {
        if (labels[i]) labels[i].textContent = lbl;
    });

    legend.querySelector('.legend-bar').style.background =
        `linear-gradient(to right, ${config.colors.join(', ')})`;

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
