# Google Cloud NEXT'25 Weather Demo
This repository contains resources used for the Google Cloud NEXT'25 weather demo.

This repository contains Google Earth Engine scripts and Google BigQuery Notebooks demonstraing WeatherNext Graph and Gen weather forecasts. See https://deepmind.google/technologies/weathernext/ for more information about these models and datasets.

# Google Earth Engine:  WeatherNext Graph precipitation and velocity field at 10m

[scripts/render-weathernext-graph.js](scripts/render-weathernext-graph.js)

![WeatherNext Graph Precipitation and Velocity](https://github.com/gena/next25-weather/blob/main/images/ee-weathernext-graph-p-zoom2.1.gif)

# Google Earth Engine: WeatherNext Gen temperature across 50 ensembles

[scripts/render-weathernext-gen.js](scripts/render-weathernext-gen.js)

![WeatherNext Gen Temperature](https://github.com/gena/next25-weather/blob/main/images/ee-weathernext-gen-T.gif)

# Google BigQuery: WeatherNext Graph example

[notebooks/weathernext-bigquery-simple.ipynb](notebooks/weathernext-bigquery-simple.ipynb)

Temperature for New York
![Temperature for New York](https://github.com/gena/next25-weather/blob/main/images/bq-weathernext-graph-t-newyork.png)

Precipitation for Chicago
![Precipitation for Chicago](https://github.com/gena/next25-weather/blob/main/images/bq-weathernext-graph-p-chicago.png)

Temperature and Wind Velocity for London
![Temperature and Wind Velocity for London](https://github.com/gena/next25-weather/blob/main/images/bq-weathernext-graph-uv-temp-london.png)

Map showing temperature distribution for Colorado for a single forecast time
![Map showing temperature for Colorado](https://github.com/gena/next25-weather/blob/main/images/bq-weathernext-graph-map-colorado.png)
