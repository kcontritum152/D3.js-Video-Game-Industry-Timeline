function addDecadeInteractions(data, svg, x, height, brandColor, rawDataGlobal, brandMap) {
  const decades = d3.range(1971, 2021, 10)

  //Draw dotted divider lines
  svg.append("g")
    .attr("class", "decade-lines")
    .selectAll("line")
    .data(decades)
    .enter()
    .append("line")
    .attr("x1", d => x(d))
    .attr("x2", d => x(d))
    .attr("y1", 0)
    .attr("y2", height)
    .attr("stroke", "black")
    .attr("stroke-dasharray", "4 2")

  //Add transparent clickable zones between lines
  svg.append("g")
    .attr("class", "decade-zones")
    .selectAll("rect")
    .data(decades)
    .enter()
    .append("rect")
    .attr("x", d => x(d))
    .attr("width", d => x(d + 10) ? x(d + 10) - x(d) : x.bandwidth() * 10)
    .attr("y", 0)
    .attr("height", height)
    .attr("fill", "transparent")
    .style("cursor", "pointer")
    .on("click", (event, startYear) => {
    const endYear = startYear + 9
    const filtered = rawDataGlobal.filter(d => {
        const year = d.release_date ? new Date(d.release_date).getFullYear() : null
        return year >= startYear && year <= endYear
    })

    showDecadeBreakdown(startYear, endYear, filtered, brandColor, brandMap, "#decade-breakdown")
    renderChart("yearly", filtered)
    })
}

function showDecadeBreakdown(startYear, endYear, data, brandColor, brandMap, containerSelector) {
    const container = d3.select(containerSelector)
    container.html("") //Clear previous visualizations

    //title
    container.append("h3")
        .text(`Breakdown: ${startYear}–${endYear}`)
        .style("margin-bottom", "10px")
        .style("font-family", "sans-serif")

    //New columns for better use for more indepth analysis
    const data_1 = inter_data(data, brandMap)
    const validGames = data_1.filter(d => d.title && d.publisher && d.total_sales > 0)
    const zeroSalesGames = data_1.filter(d => d.total_sales === 0)
    const title = `${zeroSalesGames.length} Games with No Sales Data`

    const columnConfig = [
        { label: "Title", key: "title" },
        { label: "Console", key: "console" },
        { label: "Publisher", key: "publisher" },
        { label: "Release Year", key: "release_year" }
    ]

    const chartRow = container.append("div")
        .attr("class", "chart-row")
        .style("display", "flex")
        .style("gap", "30px")
        .style("margin-bottom", "20px")

    const tableWrapper = container.append("div")
        .attr("class", "table-row")
        .style("display", "flex")
        .style("gap", "20px")
        .style("margin-top", "20px")

    const gameTableDiv = tableWrapper.append("div")
        .attr("class", "game-table")
        .style("flex", "1")
        .style("max-height", "250px")
        .style("overflow-y", "auto")
        .style("border", "1px solid #ccc")
        .style("padding", "10px")
        .style("background", "#f9f9f9")

    const missingTableDiv = tableWrapper.append("div")
        .attr("class", "zero-sales-table")
        .style("flex", "1")
        .style("max-height", "250px")
        .style("overflow-y", "auto")
        .style("border", "1px solid #e57373")
        .style("padding", "10px")
        .style("background", "#fff4f4")

    
    renderTopGameSummary("#decade-summary", data_1)
    showPieByBrand(data_1,brandColor, chartRow.append("div").attr("class", "pie-left"))
    showSalesBar(data_1, chartRow.append("div").attr("class", "bar-center"), brandColor)//toggle by genre/console/brand
    showPieByGenre(data_1, chartRow.append("div").attr("class", "pie-right"))
    createSortableTable(validGames, columnConfig, gameTableDiv, brandColor, "Decade Breakdown of Games")
    createSortableTable(zeroSalesGames, columnConfig, missingTableDiv, brandColor, title)

    //Future charts can plug in here:
    // showRatingHistogram(enriched, "#decade-breakdown")
    // showPublisherImpact(enriched, "#decade-breakdown")
}

function inter_data(data, brandMap) {
    function assignBrand(console) {
        for (const [brand, consoles] of Object.entries(brandMap)) {
        if (consoles.includes(console)) return brand
        }
        return 'Other'
    }

    return data.map(d => {
        const total_sales =
        (+d.na_sales || 0) +
        (+d.jp_sales || 0) +
        (+d.eu_sales || d.pal_sales || 0) +
        (+d.other_sales || 0)

        return {
        ...d,
        brand: assignBrand(d.console),
        total_sales: total_sales,
        vsg_score: +d.vsg_score || null,
        user_score: +d.user_score || null,
        crit_score: +d.crit_score || null,
        release_year: d.release_date ? new Date(d.release_date).getFullYear() : null
        }
    })
}

function showPieByBrand(data, brandColor, containerSelector) {
    const brandTotals = d3.rollup(
        data,
        v => d3.sum(v, d => d.total_sales || 0),
        d => d.brand
    )

    const pieData = Array.from(brandTotals, ([key, value]) => ({ brand: key, sales: value }))
        .filter(d => d.sales > 0)

    const releasesByBrandData = Array.from(
        d3.rollup(data, v => v.length, d => d.brand),
        ([brand, count]) => ({ brand: brand || "Unknown", value: count })
    )
    
    renderTogglePieChart(containerSelector, {
        titleSales: "Sales by Brand ▼",
        titleReleases: "Releases by Brand ▼",
        dataSales: pieData,
        dataReleases: releasesByBrandData,
        drawFn: drawPieChart,
        colorScale: brandColor
    })
}

function showPieByGenre(data, containerSelector) {
    const size = 300

    // Step 1: Roll up total sales by genre
    const genreTotals = d3.rollup(
        data,
        v => d3.sum(v, d => d.total_sales || 0),
        d => d.genre
    )

    const pieData = Array.from(genreTotals, ([genre, sales]) => ({
        genre: genre || "Unknown",
        sales: sales
    })).filter(d => d.sales > 0)

    const releasesByGenreData = Array.from(
        d3.rollup(
            data,
            v => v.length,
            d => d.genre
        ),
        ([genre, count]) => ({ genre: genre || "Unknown", value: count })
    )

    const genres = Array.from(
        new Set(data.map(d => d.genre || "Unknown"))
    )

    const genreColor = d3.scaleOrdinal()
        .domain(genres)
        .range(d3.schemeCategory10)

    renderTogglePieChart(containerSelector, {
        titleSales: "Sales by Genre ▼",
        titleReleases: "Releases by Genre ▼",
        dataSales: pieData,
        dataReleases: releasesByGenreData,
        drawFn: drawPieChart,
        colorScale: genreColor
    })
}

function renderTogglePieChart(container, config) {
    const { titleSales, titleReleases, dataSales, dataReleases, drawFn, colorScale } = config
    let showingSales = true

    const title = container.append("h4")
        .text(titleSales)
        .style("cursor", "pointer")
        .on("click", toggle)

    const chartGroup = container.append("g")
    
    function toggle() {
        showingSales = !showingSales
        title.text(showingSales ? titleSales : titleReleases)
        drawFn(chartGroup, showingSales ? dataSales : dataReleases, colorScale)
    }

    // initial render
    drawFn(chartGroup, dataSales, colorScale)
}

function drawPieChart(group, pieData, colorScale) {
    const size = 300
    group.selectAll("*").remove()

    const pie = d3.pie()
        .sort(null)
        .value(d => d.sales || d.value)

    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(size / 2)

    const outerArc = d3.arc()
        .innerRadius(size / 2 * 0.8)
        .outerRadius(size / 2 * 1.1)

    const svg = group
        .append("svg")
        .attr("width", size + 80)
        .attr("height", size + 80)
        .append("g")
        .attr("transform", `translate(${(size + 80) / 2}, ${(size + 80) / 2})`)

    let tooltip = d3.select("body").select("#tooltip")

    if (tooltip.empty()) {
        tooltip = d3.select("body").append("div")
            .attr("id", "tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background", "white")
            .style("border", "1px solid #ccc")
            .style("padding", "6px")
            .style("border-radius", "4px")
            .style("font-size", "12px")
            .style("box-shadow", "0 0 6px rgba(0,0,0,0.2)")
            .style("pointer-events", "none")
    }

    svg.selectAll("path")
        .data(pie(pieData))
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", d => colorScale(d.data.brand || d.data.genre))
        .on("mouseover", function (event, d) {
            const total = d3.sum(pieData, d => d.sales || d.value);
            const percent = ((d.data.sales || d.data.value) / total * 100).toFixed(1);
            tooltip
                .style("visibility", "visible")
                .html(`<strong>${d.data.brand || d.data.genre}</strong><br>${percent}%`);
        })
        .on("mousemove", function (event) {
            tooltip
                .style("top", (event.pageY + 10) + "px")
                .style("left", (event.pageX + 10) + "px")
        })
        .on("mouseout", function () {
            tooltip.style("visibility", "hidden")
        })

    svg.selectAll("path")
        .data(pie(pieData))
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", d => colorScale(d.data.brand || d.data.genre))

    svg.selectAll("text")
        .data(pie(pieData))
        .enter()
        .append("text")
        .attr("transform", d => `translate(${outerArc.centroid(d)})`)
        .attr("dy", "0.35em")
        .attr("text-anchor", d => (midAngle(d) < Math.PI ? "start" : "end"))
        .text(d => d.data.brand || d.data.genre)
        .attr("transform", d => {
            const [x, y] = outerArc.centroid(d)
            const scale = 1.1
            let angle = (midAngle(d) * 180 / Math.PI) - 90
            if (angle > 90 || angle < -90) {
                angle += 180;
            }
            return `translate(${x * scale},${y * scale}) rotate(${angle})`
            })
        .attr("text-anchor", "middle")
        .style("font-size", "13px")
        .style("font-weight", "bold")
        .style("fill", "#333")
        .style("paint-order", "stroke")
        .style("stroke", "#fff")
        .style("stroke-width", "2px")

    function midAngle(d) {
        return (d.startAngle + d.endAngle) / 2
    }
}

function showSalesBar(data, containerSelector, brandColor) {
    //console.log("sales bar")
    const width = 600
    const height = 300
    const margin = { top: 10, right: 20, bottom: 70, left: 60 }

    const groupOptions = ["brand", "genre", "console"]
    let currentGroup = "brand"

    const titleBar = containerSelector.append("h3")
        .attr("class", "chart-title")
        .style("text-align", "center")
        .style("font-size", "20px")
        .style("font-family", "sans-serif")
        .style("cursor", "pointer")
        .style("margin-bottom", "10px")
        .text(`▼ Total Sales by ${capitalize(currentGroup)}`)
        .on("click", () => {
            const nextIndex = (groupOptions.indexOf(currentGroup) + 1) % groupOptions.length
            currentGroup = groupOptions[nextIndex]
            titleBar.text(`▼ Total Sales by ${capitalize(currentGroup)}`)
            updateChart(currentGroup)
        })

    function capitalize(word) {
        return word[0].toUpperCase() + word.slice(1)
    }

    const svg = containerSelector
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`)

    updateChart(currentGroup)  // default

    function updateChart(groupBy) {
        svg.selectAll("*").remove()  // clear existing bars

        const regions = ["na_sales", "jp_sales", "pal_sales", "other_sales"]
        const stackKeys = regions

        const grouped = d3.rollup(data,
            v => regions.reduce((acc, r) => {
                acc[r] = d3.sum(v, d => +d[r] || 0)
                return acc
            }, {}),
            d => d[groupBy]
        )

        const stackData = Array.from(grouped, ([key, vals]) => {
            vals.key = key
            return vals
        })

        const series = d3.stack().keys(stackKeys)(stackData)

        const regionColor = d3.scaleOrdinal()
            .domain(stackKeys)
            .range(["#4CAF50", "#2196F3", "#FF9800", "#9E9E9E"])  // NA, JP, PAL, Other

        const legend = svg.append("g")
            .attr("transform", `translate(${width - 100}, 0)`)

        stackKeys.forEach((region, i) => {
        const row = legend.append("g").attr("transform", `translate(0, ${i * 20})`)
        row.append("rect").attr("width", 12).attr("height", 12).attr("fill", regionColor(region))
        row.append("text")
            .attr("x", 18)
            .attr("y", 10)
            .text(region.replace("_sales", "").toUpperCase())
            .style("font-size", "12px")
        })

        const totals = d3.rollup(
            data,
            v => d3.sum(v, d => d.total_sales || 0),
            d => d[groupBy]
        )

        const barData = Array.from(totals, ([key, val]) => ({
            key: key || "Unknown",
            sales: val
        })).sort((a, b) => b.sales - a.sales)

        const x = d3.scaleBand()
            .domain(barData.map(d => d.key))
            .range([0, width])
            .padding(0.2)

        const maxStack = d3.max(series, stack =>
            d3.max(stack, d => d[1])
        )

        const y = d3.scaleLinear()
            .domain([0, maxStack])
            .range([height, 0])
            .nice()

        svg.append("g")
            .selectAll("g")
            .data(series)
            .enter()
            .append("g")
            .attr("fill", d => regionColor(d.key))  // 🔁 color by region
            .selectAll("rect")
            .data(d => d)
            .enter()
            .append("rect")
            .attr("x", d => x(d.data.key))
            .attr("y", d => y(d[1]))
            .attr("height", d => y(d[0]) - y(d[1]))
            .attr("width", x.bandwidth())

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end")

        svg.append("g")
            .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format(".2s")))
    }//end of updatechart function
}

function createSortableTable(data, columns, containerSelection, brandColor, titleText) {
    containerSelection.html("")  // Clear previous content

    console.log("Container:", containerSelection)

    containerSelection.append("h3")
        .text(titleText)
        .style("margin-bottom", "0.5em")
        .style("font-weight", "bold")
        .style("font-family", "sans-serif")

    let currentSort = { key: null, asc: true }

    // Create table element
    const table = containerSelection.append("table")
        .style("border-collapse", "collapse")
        .style("width", "100%")
        .style("font-family", "sans-serif")

    const thead = table.append("thead")
    const tbody = table.append("tbody")

    // Build headers
    thead.append("tr")
        .selectAll("th")
        .data(columns)
        .enter()
        .append("th")
        .text(d => d.label)
        .style("cursor", "pointer")
        .style("border-bottom", "2px solid #444")
        .style("text-align", "left")
        .style("padding", "8px")
        .on("click", function(event, d) {
        if (currentSort.key === d.key) {
            currentSort.asc = !currentSort.asc
        } else {
            currentSort.key = d.key
            currentSort.asc = true
        }

        const arrow = currentSort.asc ? " ↑" : " ↓"

        // Reset all headers
        thead.selectAll("th").text(col => col.label)
        d3.select(this).text(d.label + arrow)

        updateTable()
        })

    function updateTable() {
        const sorted = [...data].sort((a, b) => {
        const valA = a[currentSort.key]
        const valB = b[currentSort.key]
        return currentSort.asc
            ? d3.ascending(valA, valB)
            : d3.descending(valA, valB)
        })

        tbody.selectAll("tr").remove()

        const rows = tbody.selectAll("tr")
        .data(sorted)
        .enter()
        .append("tr")
        .style("background-color", d => {
            const base = brandColor(d.brand)
            return base ? d3.color(base).brighter(1.4).formatHex() : "#f9f9f9"
        })
        .style("border-left", d => `4px solid ${brandColor(d.brand) || "#ccc"}`)

        rows.selectAll("td")
        .data(d => columns.map(col => d[col.key]))
        .enter()
        .append("td")
        .text(d => d ?? "")
        .style("padding", "8px")
        .style("border-bottom", "1px solid #ccc")
    }

    updateTable()
}

function renderTopGameSummary(containerSelector, data) {
    const container = d3.select(containerSelector)
    container.html("")

    function getAverageScore(game) {
        const scores = ['user_score', 'vsg_score', 'crit_score']
        .map(key => game[key])
        .filter(score => typeof score === 'number' && score > 0)
        if (scores.length === 0) return null
        return scores.reduce((sum, s) => sum + s, 0) / scores.length
    }

    const completeGames = data.filter(game =>
        game.title &&
        game.console &&
        game.publisher &&
        typeof game.total_sales === 'number' &&
        game.total_sales > 0
    )

    const mostSold = [...completeGames].sort((a, b) => b.total_sales - a.total_sales)[0]

    const ratedGames = completeGames.map(game => ({
        ...game,
        average_score: getAverageScore(game)
    })).filter(game => typeof game.average_score === 'number')

    const highestRated = [...ratedGames].sort((a, b) => b.average_score - a.average_score)[0]

    function formatSales(game) {
        const regions = [
        { key: 'na_sales', label: 'NA' },
        { key: 'jp_sales', label: 'JP' },
        { key: 'eu_sales', label: 'EU' },
        { key: 'other_sales', label: 'Other' }
        ]
        return regions
        .map(r => `${r.label}: ${Number(game[r.key] || 0).toFixed(2)}M`)
        .join(', ')
    }

    if (mostSold) {
        container.append("p")
        .html(`
            <strong>Most Sold Game:</strong> ${mostSold.title}  
            <strong>Console:</strong> ${mostSold.console}  
            <strong>Publisher:</strong> ${mostSold.publisher}  
            <strong>Units Sold:</strong> ${mostSold.total_sales.toFixed(1)}M  
            <strong>Region Sales:</strong> ${formatSales(mostSold)}  
            <strong>Avg Score:</strong> ${getAverageScore(mostSold)?.toFixed(1) ?? 'N/A'}
        `)
        .style("font-family", "sans-serif")
        .style("margin-bottom", "6px")
        .style("line-height", "1.4")
    }

    if (highestRated) {
        container.append("p")
        .html(`
            <strong>Highest Rated Game:</strong> ${highestRated.title}  
            <strong>Console:</strong> ${highestRated.console}  
            <strong>Publisher:</strong> ${highestRated.publisher}  
            <strong>Units Sold:</strong> ${highestRated.total_sales.toFixed(1)}M  
            <strong>Avg Score:</strong> ${highestRated.average_score.toFixed(1)}  
            <strong>User:</strong> ${highestRated.user_score}  
            <strong>Critic:</strong> ${highestRated.crit_score}  
            <strong>VSG:</strong> ${highestRated.vsg_score}
        `)
        .style("font-family", "sans-serif")
        .style("margin-bottom", "10px")
        .style("line-height", "1.4")
    }
}


