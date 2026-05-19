/**
 * Air pollution projection models based on:
 * - OECD Environmental Outlook to 2050
 * - IHME Global Burden of Disease projections
 * - WHO Air Quality Guidelines trajectory modeling
 * - SSP (Shared Socioeconomic Pathways) scenarios
 *
 * Three scenarios:
 *   baseline    = Current policies continue (SSP2 / middle-of-the-road)
 *   optimistic  = Accelerated clean air action (SSP1 / sustainability)
 *   pessimistic = No new policies, increased fossil fuels (SSP3 / regional rivalry)
 */

const PROJECTION_PARAMS = {
    "South Asia": {
        baseline:    { pm25Rate: -0.012, no2Rate: -0.010, o3Rate: -0.005, deathRate: -0.008 },
        optimistic:  { pm25Rate: -0.032, no2Rate: -0.028, o3Rate: -0.018, deathRate: -0.028 },
        pessimistic: { pm25Rate:  0.006, no2Rate:  0.008, o3Rate:  0.005, deathRate:  0.010 }
    },
    "East Asia": {
        baseline:    { pm25Rate: -0.025, no2Rate: -0.022, o3Rate: -0.008, deathRate: -0.020 },
        optimistic:  { pm25Rate: -0.042, no2Rate: -0.038, o3Rate: -0.022, deathRate: -0.038 },
        pessimistic: { pm25Rate: -0.005, no2Rate: -0.002, o3Rate:  0.003, deathRate: -0.002 }
    },
    "Southeast Asia": {
        baseline:    { pm25Rate: -0.008, no2Rate: -0.005, o3Rate: -0.003, deathRate: -0.004 },
        optimistic:  { pm25Rate: -0.028, no2Rate: -0.024, o3Rate: -0.016, deathRate: -0.024 },
        pessimistic: { pm25Rate:  0.008, no2Rate:  0.010, o3Rate:  0.006, deathRate:  0.012 }
    },
    "MENA": {
        baseline:    { pm25Rate: -0.010, no2Rate: -0.008, o3Rate: -0.004, deathRate: -0.006 },
        optimistic:  { pm25Rate: -0.028, no2Rate: -0.025, o3Rate: -0.015, deathRate: -0.022 },
        pessimistic: { pm25Rate:  0.005, no2Rate:  0.006, o3Rate:  0.004, deathRate:  0.008 }
    },
    "Sub-Saharan Africa": {
        baseline:    { pm25Rate:  0.008, no2Rate:  0.012, o3Rate:  0.005, deathRate:  0.014 },
        optimistic:  { pm25Rate: -0.010, no2Rate: -0.005, o3Rate: -0.004, deathRate: -0.005 },
        pessimistic: { pm25Rate:  0.018, no2Rate:  0.022, o3Rate:  0.010, deathRate:  0.025 }
    },
    "Europe": {
        baseline:    { pm25Rate: -0.018, no2Rate: -0.020, o3Rate: -0.008, deathRate: -0.015 },
        optimistic:  { pm25Rate: -0.035, no2Rate: -0.035, o3Rate: -0.020, deathRate: -0.030 },
        pessimistic: { pm25Rate: -0.005, no2Rate: -0.004, o3Rate:  0.002, deathRate: -0.003 }
    },
    "Latin America": {
        baseline:    { pm25Rate: -0.010, no2Rate: -0.008, o3Rate: -0.005, deathRate: -0.006 },
        optimistic:  { pm25Rate: -0.025, no2Rate: -0.022, o3Rate: -0.015, deathRate: -0.020 },
        pessimistic: { pm25Rate:  0.005, no2Rate:  0.006, o3Rate:  0.004, deathRate:  0.008 }
    },
    "North America": {
        baseline:    { pm25Rate: -0.015, no2Rate: -0.018, o3Rate: -0.008, deathRate: -0.012 },
        optimistic:  { pm25Rate: -0.030, no2Rate: -0.032, o3Rate: -0.018, deathRate: -0.028 },
        pessimistic: { pm25Rate: -0.003, no2Rate: -0.002, o3Rate:  0.003, deathRate: -0.001 }
    },
    "Central Asia": {
        baseline:    { pm25Rate: -0.008, no2Rate: -0.006, o3Rate: -0.003, deathRate: -0.005 },
        optimistic:  { pm25Rate: -0.025, no2Rate: -0.022, o3Rate: -0.014, deathRate: -0.020 },
        pessimistic: { pm25Rate:  0.006, no2Rate:  0.008, o3Rate:  0.005, deathRate:  0.010 }
    },
    "Oceania": {
        baseline:    { pm25Rate: -0.012, no2Rate: -0.015, o3Rate: -0.006, deathRate: -0.010 },
        optimistic:  { pm25Rate: -0.025, no2Rate: -0.028, o3Rate: -0.016, deathRate: -0.024 },
        pessimistic: { pm25Rate:  0.002, no2Rate:  0.000, o3Rate:  0.003, deathRate:  0.004 }
    }
};

function projectValue(baseValue, annualRate, yearsFromBase) {
    return baseValue * Math.pow(1 + annualRate, yearsFromBase);
}

function getProjectedData(iso3, year, scenario) {
    const country = COUNTRY_DATA[iso3];
    if (!country) return null;

    const params = PROJECTION_PARAMS[country.region];
    if (!params) return null;

    const scenarioParams = params[scenario] || params.baseline;
    const yearsFromBase = year - 2025;

    if (yearsFromBase === 0) {
        return {
            pm25: country.pm25,
            no2: country.no2,
            o3: country.o3,
            deaths: country.deaths
        };
    }

    let pm25 = projectValue(country.pm25, scenarioParams.pm25Rate, yearsFromBase);
    let no2 = projectValue(country.no2, scenarioParams.no2Rate, yearsFromBase);
    let o3 = projectValue(country.o3, scenarioParams.o3Rate, yearsFromBase);
    let deaths = projectValue(country.deaths, scenarioParams.deathRate, yearsFromBase);

    const popGrowthRate = getPopGrowthRate(country.region);
    const popFactor = Math.pow(1 + popGrowthRate, yearsFromBase);
    deaths *= (popFactor / (1 + popGrowthRate * yearsFromBase * 0.3));

    pm25 = Math.max(1.0, pm25);
    no2 = Math.max(1.0, no2);
    o3 = Math.max(10.0, o3);
    deaths = Math.max(0.01, deaths);

    return {
        pm25: Math.round(pm25 * 10) / 10,
        no2: Math.round(no2 * 10) / 10,
        o3: Math.round(o3 * 10) / 10,
        deaths: Math.round(deaths * 10) / 10
    };
}

function getPopGrowthRate(region) {
    const rates = {
        "South Asia": 0.008,
        "East Asia": -0.002,
        "Southeast Asia": 0.006,
        "MENA": 0.012,
        "Sub-Saharan Africa": 0.024,
        "Europe": -0.001,
        "Latin America": 0.005,
        "North America": 0.003,
        "Central Asia": 0.010,
        "Oceania": 0.008
    };
    return rates[region] || 0.005;
}

function getGlobalStats(year, scenario) {
    let totalPM25 = 0;
    let totalPop = 0;
    let totalDeaths = 0;
    let popExposed = 0;
    let count = 0;

    Object.entries(COUNTRY_DATA).forEach(([iso3, country]) => {
        const projected = getProjectedData(iso3, year, scenario);
        if (!projected) return;

        const popGrowthRate = getPopGrowthRate(country.region);
        const pop = country.pop * Math.pow(1 + popGrowthRate, year - 2025);

        totalPM25 += projected.pm25 * pop;
        totalPop += pop;
        totalDeaths += projected.deaths;

        if (projected.pm25 > WHO_GUIDELINE_PM25) {
            popExposed += pop;
        }
        count++;
    });

    return {
        meanPM25: Math.round((totalPM25 / totalPop) * 10) / 10,
        popExposed: Math.round(popExposed / 100) / 10,
        totalDeaths: Math.round(totalDeaths),
        countryCount: count
    };
}

function getRegionalAverages(year, scenario) {
    const regionTotals = {};

    Object.entries(COUNTRY_DATA).forEach(([iso3, country]) => {
        const projected = getProjectedData(iso3, year, scenario);
        if (!projected) return;

        if (!regionTotals[country.region]) {
            regionTotals[country.region] = { pm25Sum: 0, no2Sum: 0, o3Sum: 0, deathSum: 0, popSum: 0, count: 0 };
        }

        const popGrowthRate = getPopGrowthRate(country.region);
        const pop = country.pop * Math.pow(1 + popGrowthRate, year - 2025);

        regionTotals[country.region].pm25Sum += projected.pm25 * pop;
        regionTotals[country.region].popSum += pop;
        regionTotals[country.region].deathSum += projected.deaths;
        regionTotals[country.region].no2Sum += projected.no2;
        regionTotals[country.region].o3Sum += projected.o3;
        regionTotals[country.region].count++;
    });

    const result = {};
    Object.entries(regionTotals).forEach(([region, totals]) => {
        result[region] = {
            pm25: Math.round((totals.pm25Sum / totals.popSum) * 10) / 10,
            no2: Math.round((totals.no2Sum / totals.count) * 10) / 10,
            o3: Math.round((totals.o3Sum / totals.count) * 10) / 10,
            deaths: Math.round(totals.deathSum),
            pop: Math.round(totals.popSum)
        };
    });

    return result;
}

function getRankedCountries(year, scenario, metric, ascending) {
    const ranked = [];

    Object.entries(COUNTRY_DATA).forEach(([iso3, country]) => {
        const projected = getProjectedData(iso3, year, scenario);
        if (!projected) return;

        ranked.push({
            iso3,
            name: country.name,
            flag: country.flag,
            region: country.region,
            value: projected[metric],
            pm25: projected.pm25,
            no2: projected.no2,
            o3: projected.o3,
            deaths: projected.deaths
        });
    });

    ranked.sort((a, b) => ascending ? a.value - b.value : b.value - a.value);
    return ranked;
}

function getCountryTimeSeries(iso3, scenario) {
    const series = { years: [], pm25: [], no2: [], o3: [], deaths: [] };

    for (let year = 2025; year <= 2050; year++) {
        const projected = getProjectedData(iso3, year, scenario);
        if (!projected) continue;

        series.years.push(year);
        series.pm25.push(projected.pm25);
        series.no2.push(projected.no2);
        series.o3.push(projected.o3);
        series.deaths.push(projected.deaths);
    }

    return series;
}
