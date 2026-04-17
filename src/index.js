/*
 * Histogram of world population by age per year.
 */

const lcjs = require('@lightningchart/lcjs')

const { lightningChart, BarChartTypes, BarChartSorting, Themes } = lcjs

const barChart = lightningChart({
            resourcesBaseUrl: new URL(document.head.baseURI).origin + new URL(document.head.baseURI).pathname + 'resources/',
        })
    .BarChart({
        theme: (() => {
    const t = Themes[new URLSearchParams(window.location.search).get('theme') || 'darkGold'] || undefined
    const smallView = window.devicePixelRatio >= 2
    if (!window.__lcjsDebugOverlay) {
        window.__lcjsDebugOverlay = document.createElement('div')
        window.__lcjsDebugOverlay.style.cssText = 'position:fixed;top:0;left:0;background:rgba(0,0,0,0.7);color:#fff;padding:4px 8px;z-index:99999;font:12px monospace;pointer-events:none'
        if (document.body) document.body.appendChild(window.__lcjsDebugOverlay)
        setInterval(() => {
            if (!window.__lcjsDebugOverlay.parentNode && document.body) document.body.appendChild(window.__lcjsDebugOverlay)
            window.__lcjsDebugOverlay.textContent = window.innerWidth + 'x' + window.innerHeight + ' dpr=' + window.devicePixelRatio + ' small=' + (window.devicePixelRatio >= 2)
        }, 500)
    }
    return t && smallView ? lcjs.scaleTheme(t, 0.5) : t
})(),
textRenderer: window.devicePixelRatio >= 2 ? lcjs.htmlTextRenderer : undefined,
        type: BarChartTypes.Vertical,
        legend: { addEntriesAutomatically: false },
    })
    .setSorting(BarChartSorting.Disabled)
    .setValueLabels(undefined)
barChart.valueAxis.setTitle('Population (thousands)')
barChart.categoryAxis.setTitle('Age')

// Create HTML slider for selecting year
const barDiv = barChart.engine.container
const slider = document.createElement('input')
barDiv.append(slider)
barChart.setTitleMargin({ top: 25, bottom: -10 })
slider.type = 'range'
slider.min = '1950'
slider.max = '2021'
slider.value = '1950'
slider.style.width = '98%'
barDiv.style.textAlign = 'center'
slider.style.position = 'absolute'
slider.style.top = '0'
slider.style.left = '1%'
slider.addEventListener('input', () => {
    animationIsOn = false
    displayYear(slider.value)
})
slider.addEventListener('change', () => {
    currentYear = slider.value
    displayYear(slider.value)
})

// Event for space key to pause and continue the animation
document.addEventListener('keydown', (event) => {
    if (event.key === ' ') {
        animationIsOn = !animationIsOn
        if (animationIsOn) {
            if (currentYear == 2021) currentYear = 1950
            iterateYear()
        }
    }
})

const displayYear = (year) => {
    barChart.setData(populationData[`${year}`])
    barChart.setTitle(`${year}`)
}

let currentYear = 1950
let animationIsOn = true
// Function to move forward in years
const iterateYear = () => {
    if (!animationIsOn) return
    slider.value = currentYear
    displayYear(currentYear)
    if (currentYear < 2021) {
        currentYear++
        setTimeout(() => iterateYear(), 250)
    } else {
        animationIsOn = false
    }
}

// Fetch the dataset
let populationData
fetch(new URL(document.head.baseURI).origin + new URL(document.head.baseURI).pathname + 'examples/assets/1401/population.json')
    .then((r) => r.json())
    .then((data) => {
        populationData = data
        displayYear(1950)

        // Set same color for all bars
        const bars = barChart.getBars()
        const fillSTyle = bars[0].getFillStyle()
        bars.forEach((bar) => {
            bar.setFillStyle(fillSTyle)
        })

        setTimeout(() => iterateYear(), 1000)
    })
