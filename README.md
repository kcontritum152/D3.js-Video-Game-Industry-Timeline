# Interactive Video Game Industry Timeline (1971–2020)

An interactive data visualization dashboard exploring the evolution of the global video game industry from 1971 to 2020. Built with D3.js and powered by Kaggle sales data, the project enables users to explore long-term trends in revenue, genre popularity, platform dominance, and regional performance through an intuitive, decade-based interface.

## Project Motivation

The video game industry has grown from a niche hobby into one of the most economically and culturally significant entertainment sectors worldwide. Despite the abundance of historical data, tools for holistic, exploratory analysis across decades remain limited.

This project was driven by curiosity:

- How have genres, platforms, and brands evolved over time?

- When did certain consoles or publishers dominate the market?

- How can we still learn from incomplete or missing sales data?

By combining interactive visualizations with flexible views, this dashboard provides a scalable way to explore the historical arc of gaming through data.

## Technologies Used

- D3.js – Interactive data visualizations

- JavaScript / HTML / CSS

- Kaggle Video Game Sales Dataset (2020)

- Custom data preprocessing and revenue estimation heuristics

## Core Features
1. Timeline Stacked Bar Chart (1971–2020)

- Displays cumulative or annual estimated revenue

- Brand-coded colors:

  - Nintendo (Red)

  - Sony (Blue)

  - Microsoft (Green)

- Vertical decade separators for temporal context

2. Decade Zoom Interaction

Clicking a decade:

- Switches to annual revenue

- Reveals detailed decade-specific breakdowns:

  - Brand

  - Console

  - Genre

  - Ratings

- Highlights:

  - Highest-selling game

  - Highest-rated game

3. Dual-Mode Pie Charts

Each pie chart can toggle between:

- Sales by category

- Number of releases by category

This design ensures games with missing sales data are still represented.

- Brand Pie Chart

- Genre Pie Chart

4. Interactive Bar Charts

Switchable views:

- Sales by brand

- Sales by genre

- Sales by console

Region-specific color encoding shows:

- North America

- Europe (PAL)

- Japan

- Other regions

5. Sortable Data Tables

Two synchronized tables:

- Games with sales data

- Games without sales data

Features:

- Sortable columns

- Brand-based row coloring

- Supports verification and granular inspection

## Key Findings
1971–1980

- Sparse sales data

- Cartridge-based platforms dominate

- Genre diversity already present

- Shooters appear most profitable among available data

1981–1990

- Nintendo dominates recorded sales

- Strong North American presence

- Early appearances of Sony and Microsoft

- Rise of platformers, shooters, and adventure games

1991–2000

- Sony’s ascent with the PlayStation

- Increased data completeness

- Expansion of genre diversity

- Europe becomes a major contributor to sales

2001–2010

- Decline of cartridge platforms

- Growth of Microsoft with Xbox

- Emergence of mobile and Apple platforms

- Adventure games resurge

2011–2020

- Sony leads reported sales

- More balanced release distribution

- Japan shows strong preference for visual novels

- Role-playing, sports, shooters, and action games dominate

## Data Considerations

- Significant missing sales data, especially in early decades

- Visual bias mitigated through:

  - Secondary views (release counts vs. sales)

  - Paired visualizations

- Emphasizes exploration over absolute certainty

📚 References & Data Sources

1. B. Brannen, Video Game Sales 2020 Dataset, Kaggle

2. E. Meeks & M. Heer, Stacked Graphs—Geometry & Aesthetics, IEEE TVCG

3. DASCA, Impactful Data Visualizations with D3.js

4. CodezUp, Interactive Visualizations with D3.js

5. Kong et al., Graphical Histories for Visualization, IEEE TVCG

6. Kandel et al., Research Directions in Data Wrangling, IEEE TVCG

7. D3 Graph Gallery – Pie Chart Examples

8. Mike Bostock, Stacked Bar Chart, Observable

🚀 Future Extensions

- ESRB rating distributions

- Publisher-level trend analysis

- Inflation-adjusted revenue estimates

- Mobile-first interaction design

## License

This project is intended for educational and research purposes. Dataset ownership and licensing remain with the original Kaggle source.
