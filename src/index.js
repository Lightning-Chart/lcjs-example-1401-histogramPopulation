/*
 * Histogram of world population by age per year.
 */

const lcjs = require('@arction/lcjs')

const { lightningChart, BarChartTypes, BarChartSorting, Themes } = lcjs

const barChart = lightningChart()
    .BarChart({
        theme: Themes[new URLSearchParams(window.location.search).get('theme') || 'darkGold'] || undefined,
        type: BarChartTypes.Vertical,
    })
    .setSorting(BarChartSorting.Disabled)
    .setValueLabels(undefined)
    .setCursorResultTableFormatter((builder, category, value, bar) =>
        builder.addRow('Age:', '', category).addRow('Population:', '', `${bar.chart.valueAxis.formatValue(value)} thousand`),
    )
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
