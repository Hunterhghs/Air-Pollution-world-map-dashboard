let regionalChart, healthChart, trendChart, pollutantChart, tooltipChart;

const CHART_DEFAULTS = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false
        }
    },
    scales: {
        x: {
            grid: { color: 'rgba(51, 65, 85, 0.4)', lineWidth: 0.5 },
            ticks: { color: '#64748b', font: { size: 10, family: 'Inter' } },
            border: { display: false }
        },
        y: {
            grid: { color: 'rgba(51, 65, 85, 0.4)', lineWidth: 0.5 },
            ticks: { color: '#64748b', font: { size: 10, family: 'Inter' } },
            border: { display: false }
        }
    }
};

function initCharts() {
    Chart.defaults.font.family = 'Inter';
    Chart.defaults.color = '#94a3b8';

    initRegionalChart();
    initHealthChart();
    initTrendChart();
    initPollutantChart();
}

function initRegionalChart() {
    const ctx = document.getElementById('regionalChart').getContext('2d');
    regionalChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [],
                borderRadius: 4,
                borderSkipped: false,
                barThickness: 14
            }]
        },
        options: {
            ...CHART_DEFAULTS,
            indexAxis: 'y',
            scales: {
                x: {
                    ...CHART_DEFAULTS.scales.x,
                    ticks: { ...CHART_DEFAULTS.scales.x.ticks, callback: v => v + '' }
                },
                y: {
                    ...CHART_DEFAULTS.scales.y,
                    ticks: {
                        ...CHART_DEFAULTS.scales.y.ticks,
                        font: { size: 9, family: 'Inter' },
                        callback: function(value) {
                            const label = this.getLabelForValue(value);
                            return label.length > 12 ? label.substring(0, 12) + '…' : label;
                        }
                    }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    titleFont: { size: 11 },
                    bodyFont: { size: 11 },
                    padding: 8,
                    cornerRadius: 6
                }
            }
        }
    });
}

function initHealthChart() {
    const ctx = document.getElementById('healthChart').getContext('2d');
    healthChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['South Asia', 'East Asia', 'Sub-Saharan Africa', 'MENA', 'Europe', 'Other'],
            datasets: [{
                data: [30, 25, 18, 10, 8, 9],
                backgroundColor: [
                    '#ef4444', '#f97316', '#84cc16', '#eab308', '#3b82f6', '#64748b'
                ],
                borderWidth: 0,
                spacing: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        color: '#94a3b8',
                        font: { size: 9, family: 'Inter' },
                        boxWidth: 8,
                        boxHeight: 8,
                        padding: 6,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    titleFont: { size: 11 },
                    bodyFont: { size: 11 },
                    padding: 8,
                    cornerRadius: 6,
                    callbacks: {
                        label: function(ctx) {
                            return ctx.label + ': ' + ctx.parsed.toLocaleString() + 'K deaths';
                        }
                    }
                }
            }
        }
    });
}

function initTrendChart() {
    const ctx = document.getElementById('trendChart').getContext('2d');
    trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Baseline',
                    data: [],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3,
                    pointRadius: 0,
                    pointHoverRadius: 4
                },
                {
                    label: 'Optimistic',
                    data: [],
                    borderColor: '#10b981',
                    borderWidth: 1.5,
                    borderDash: [5, 3],
                    fill: false,
                    tension: 0.3,
                    pointRadius: 0,
                    pointHoverRadius: 4
                },
                {
                    label: 'Pessimistic',
                    data: [],
                    borderColor: '#ef4444',
                    borderWidth: 1.5,
                    borderDash: [5, 3],
                    fill: false,
                    tension: 0.3,
                    pointRadius: 0,
                    pointHoverRadius: 4
                }
            ]
        },
        options: {
            ...CHART_DEFAULTS,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#94a3b8',
                        font: { size: 9, family: 'Inter' },
                        boxWidth: 16,
                        boxHeight: 2,
                        padding: 8,
                        usePointStyle: false
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    titleFont: { size: 11 },
                    bodyFont: { size: 11 },
                    padding: 8,
                    cornerRadius: 6,
                    mode: 'index',
                    intersect: false
                }
            },
            interaction: {
                mode: 'index',
                intersect: false
            }
        }
    });
}

function initPollutantChart() {
    const ctx = document.getElementById('pollutantChart').getContext('2d');
    pollutantChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['PM2.5', 'NO₂', 'O₃', 'Deaths', 'Pop Exposed'],
            datasets: [{
                label: 'Global',
                data: [50, 40, 60, 45, 80],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                borderWidth: 2,
                pointRadius: 3,
                pointBackgroundColor: '#3b82f6'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    grid: { color: 'rgba(51, 65, 85, 0.3)' },
                    angleLines: { color: 'rgba(51, 65, 85, 0.3)' },
                    pointLabels: {
                        color: '#94a3b8',
                        font: { size: 10, family: 'Inter' }
                    },
                    ticks: {
                        display: false,
                        stepSize: 20
                    },
                    suggestedMin: 0,
                    suggestedMax: 100
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    bodyFont: { size: 11 },
                    padding: 8,
                    cornerRadius: 6
                }
            }
        }
    });
}

function updateAllCharts(year, scenario, metric) {
    updateRegionalChart(year, scenario, metric);
    updateHealthChart(year, scenario);
    updateTrendChart(scenario, metric);
    updatePollutantChart(year, scenario);
    updateInsights(year, scenario);
}

function updateRegionalChart(year, scenario, metric) {
    const regional = getRegionalAverages(year, scenario);
    const sorted = Object.entries(regional)
        .map(([region, data]) => ({ region, value: data[metric] || data.pm25 }))
        .sort((a, b) => b.value - a.value);

    regionalChart.data.labels = sorted.map(d => d.region);
    regionalChart.data.datasets[0].data = sorted.map(d => d.value);
    regionalChart.data.datasets[0].backgroundColor = sorted.map(d =>
        REGIONS[d.region] ? REGIONS[d.region].color : '#64748b'
    );
    regionalChart.update('none');
}

function updateHealthChart(year, scenario) {
    const regional = getRegionalAverages(year, scenario);
    const deathData = Object.entries(regional)
        .map(([region, data]) => ({ region, deaths: data.deaths }))
        .sort((a, b) => b.deaths - a.deaths);

    const top5 = deathData.slice(0, 5);
    const otherDeaths = deathData.slice(5).reduce((sum, d) => sum + d.deaths, 0);

    healthChart.data.labels = [...top5.map(d => d.region), 'Other'];
    healthChart.data.datasets[0].data = [...top5.map(d => d.deaths), otherDeaths];
    healthChart.data.datasets[0].backgroundColor = [
        ...top5.map(d => REGIONS[d.region] ? REGIONS[d.region].color : '#64748b'),
        '#475569'
    ];
    healthChart.update('none');
}

function updateTrendChart(scenario, metric) {
    const years = [];
    const baselineData = [];
    const optimisticData = [];
    const pessimisticData = [];

    for (let y = 2025; y <= 2050; y++) {
        years.push(y);
        const baseStats = getGlobalStats(y, 'baseline');
        const optStats = getGlobalStats(y, 'optimistic');
        const pesStats = getGlobalStats(y, 'pessimistic');

        if (metric === 'deaths') {
            baselineData.push(baseStats.totalDeaths);
            optimisticData.push(optStats.totalDeaths);
            pessimisticData.push(pesStats.totalDeaths);
        } else {
            baselineData.push(baseStats.meanPM25);
            optimisticData.push(optStats.meanPM25);
            pessimisticData.push(pesStats.meanPM25);
        }
    }

    trendChart.data.labels = years;
    trendChart.data.datasets[0].data = baselineData;
    trendChart.data.datasets[1].data = optimisticData;
    trendChart.data.datasets[2].data = pessimisticData;

    const config = METRIC_CONFIG[metric];
    trendChart.options.scales.y.title = {
        display: true,
        text: metric === 'deaths' ? 'Deaths (thousands)' : `${config.label} (${config.unit})`,
        color: '#64748b',
        font: { size: 10 }
    };

    trendChart.update('none');
}

function updatePollutantChart(year, scenario) {
    const stats = getGlobalStats(year, scenario);
    const maxPM25 = 70, maxNO2 = 35, maxO3 = 70, maxDeaths = 8000;

    const pm25Pct = Math.min(100, (stats.meanPM25 / maxPM25) * 100);
    const regional = getRegionalAverages(year, scenario);
    const allNO2 = Object.values(regional).map(r => r.no2);
    const allO3 = Object.values(regional).map(r => r.o3);
    const avgNO2 = allNO2.reduce((a, b) => a + b, 0) / allNO2.length;
    const avgO3 = allO3.reduce((a, b) => a + b, 0) / allO3.length;

    pollutantChart.data.datasets[0].data = [
        pm25Pct,
        Math.min(100, (avgNO2 / maxNO2) * 100),
        Math.min(100, (avgO3 / maxO3) * 100),
        Math.min(100, (stats.totalDeaths / maxDeaths) * 100),
        Math.min(100, (stats.popExposed / 80) * 100)
    ];
    pollutantChart.update('none');
}

function updateInsights(year, scenario) {
    const stats = getGlobalStats(year, scenario);
    const stats2025 = getGlobalStats(2025, 'baseline');
    const container = document.getElementById('insights');

    const insights = [];
    const pm25Change = ((stats.meanPM25 - stats2025.meanPM25) / stats2025.meanPM25 * 100).toFixed(1);
    const deathChange = ((stats.totalDeaths - stats2025.totalDeaths) / stats2025.totalDeaths * 100).toFixed(1);

    if (year > 2025) {
        const dir = pm25Change > 0 ? 'increased' : 'decreased';
        const cls = pm25Change > 0 ? 'warning' : 'success';
        insights.push({
            text: `Global PM2.5 has ${dir} ${Math.abs(pm25Change)}% from 2025 to ${year} under ${scenario} scenario.`,
            cls
        });
    }

    const ranked = getRankedCountries(year, scenario, 'pm25', false);
    if (ranked.length > 0) {
        insights.push({
            text: `${ranked[0].flag} ${ranked[0].name} has the highest PM2.5 at ${ranked[0].value} µg/m³ — ${(ranked[0].value / WHO_GUIDELINE_PM25).toFixed(1)}x the WHO guideline.`,
            cls: 'danger'
        });
    }

    if (stats.popExposed > 60) {
        insights.push({
            text: `${stats.popExposed}B people (${Math.round(stats.popExposed / 82 * 100)}% of global population) breathe air exceeding WHO guidelines.`,
            cls: 'warning'
        });
    }

    if (scenario === 'optimistic' && year >= 2035) {
        const optStats = getGlobalStats(year, 'optimistic');
        const pesStats = getGlobalStats(year, 'pessimistic');
        const deathDiff = pesStats.totalDeaths - optStats.totalDeaths;
        insights.push({
            text: `Accelerated action could prevent ${Math.round(deathDiff).toLocaleString()}K premature deaths annually by ${year} compared to no-policy scenario.`,
            cls: 'success'
        });
    }

    if (year >= 2030) {
        const ssaRegional = getRegionalAverages(year, scenario);
        if (ssaRegional['Sub-Saharan Africa']) {
            const ssa2025 = getRegionalAverages(2025, 'baseline')['Sub-Saharan Africa'];
            if (ssaRegional['Sub-Saharan Africa'].pm25 > ssa2025.pm25) {
                insights.push({
                    text: `Sub-Saharan Africa shows worsening air quality — urbanization and industrialization outpace emission controls.`,
                    cls: 'danger'
                });
            }
        }
    }

    container.innerHTML = insights.map(i =>
        `<div class="insight ${i.cls}">${i.text}</div>`
    ).join('');
}

function updateTooltipChart(iso3) {
    const ctx = document.getElementById('tooltipChart').getContext('2d');

    if (tooltipChart) {
        tooltipChart.destroy();
    }

    const series = getCountryTimeSeries(iso3, currentScenario);
    const metricData = series[currentMetric];
    const config = METRIC_CONFIG[currentMetric];

    tooltipChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: series.years,
            datasets: [{
                data: metricData,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.3,
                pointRadius: 0,
                pointHoverRadius: 3
            },
            ...(config.guideline ? [{
                data: series.years.map(() => config.guideline),
                borderColor: '#10b981',
                borderWidth: 1,
                borderDash: [4, 4],
                fill: false,
                pointRadius: 0,
                pointHoverRadius: 0
            }] : [])
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    bodyFont: { size: 10 },
                    padding: 6,
                    cornerRadius: 4,
                    callbacks: {
                        label: function(ctx) {
                            if (ctx.datasetIndex === 1) return 'WHO Guideline';
                            return config.label + ': ' + ctx.parsed.y + ' ' + config.unit;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        color: '#64748b',
                        font: { size: 9 },
                        maxTicksLimit: 6
                    },
                    border: { display: false }
                },
                y: {
                    grid: { color: 'rgba(51, 65, 85, 0.3)' },
                    ticks: { color: '#64748b', font: { size: 9 } },
                    border: { display: false }
                }
            }
        }
    });
}

function updateRankLists(year, scenario, metric) {
    const mostPolluted = getRankedCountries(year, scenario, metric, false).slice(0, 7);
    const cleanest = getRankedCountries(year, scenario, metric, true).slice(0, 5);

    const config = METRIC_CONFIG[metric];

    document.getElementById('mostPolluted').innerHTML = mostPolluted.map((c, i) => {
        let cls = 'danger';
        if (metric === 'pm25') {
            if (c.value < 15) cls = 'caution';
            else if (c.value < 35) cls = 'warning';
        } else if (metric === 'deaths') {
            if (c.value < 10) cls = 'caution';
            else if (c.value < 50) cls = 'warning';
        }
        const displayVal = metric === 'deaths' ? formatDeaths(c.value) : c.value;
        return `<div class="rank-item" data-iso3="${c.iso3}">
            <span class="rank-num">${i + 1}</span>
            <span class="rank-flag">${c.flag}</span>
            <span class="rank-name">${c.name}</span>
            <span class="rank-value ${cls}">${displayVal}</span>
        </div>`;
    }).join('');

    document.getElementById('cleanestAir').innerHTML = cleanest.map((c, i) => {
        const displayVal = metric === 'deaths' ? formatDeaths(c.value) : c.value;
        return `<div class="rank-item" data-iso3="${c.iso3}">
            <span class="rank-num">${i + 1}</span>
            <span class="rank-flag">${c.flag}</span>
            <span class="rank-name">${c.name}</span>
            <span class="rank-value good">${displayVal}</span>
        </div>`;
    }).join('');

    document.querySelectorAll('.rank-item').forEach(item => {
        item.addEventListener('click', () => {
            const iso3 = item.dataset.iso3;
            if (iso3) {
                selectedCountryIso3 = iso3;
                showCountryDetail(iso3);
                updateMap();
            }
        });
    });
}
