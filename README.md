## Google Cloud NEXT'25 Weather Demo
This repository contains resources used for the Google Cloud NEXT'25 weather demo.

This repository contains Google Earth Engine scripts and Google BigQuery Notebooks demonstraing WeatherNext Graph and Gen weather forecasts. See https://deepmind.google/technologies/weathernext/ for more information about these models and datasets.

### Google Earth Engine: rendering WeatherNext Graph precipitation and velocity field at 10m

[scripts/render-weathernext-graph.js](scripts/render-weathernext-graph.js)

![WeatherNext Graph Precipitation and Velocity](https://github.com/gena/next25-weather/blob/main/images/ee-weathernext-graph-p-zoom2.1.gif)

### Google Earth Engine: rendering WeatherNext Gen temperature across 50 ensembles

[scripts/render-weathernext-gen.js](scripts/render-weathernext-gen.js)

![WeatherNext Gen Temperature](https://github.com/gena/next25-weather/blob/main/images/ee-weathernext-gen-T.gif)

### Google BigQuery: querying, analyzing, and visualizing WeatherNext Graph data

[notebooks/weathernext-bigquery-simple.ipynb](notebooks/weathernext-bigquery-simple.ipynb)

Temperature for New York

```sql
%%bigquery ny_temps --project {project_id}
SELECT
    t2.time AS time,
    t2.`2m_temperature` as `2m_temperature`
  FROM
    `gcp-public-data-weathernext.WeatherNext.59572747_4_0` AS t1, t1.forecast AS t2
  WHERE ST_INTERSECTS(t1.geography_polygon, ST_GEOGFROMTEXT('POLYGON((-70.66 40.64, -73.85 40.64, -73.85 40.89, -70.66 40.89, -70.66 40.64))'))  # New York City
   AND t1.init_time = TIMESTAMP('2024-10-17 00:00:00 UTC')
  ORDER BY t2.time
```

![Temperature for New York](https://github.com/gena/next25-weather/blob/main/images/bq-weathernext-graph-t-newyork.png)

Precipitation for Chicago
![Precipitation for Chicago](https://github.com/gena/next25-weather/blob/main/images/bq-weathernext-graph-p-chicago.png)

Temperature and Wind Velocity for London
![Temperature and Wind Velocity for London](https://github.com/gena/next25-weather/blob/main/images/bq-weathernext-graph-uv-temp-london.png)

Map showing temperature distribution for Colorado for a single forecast time
![Map showing temperature for Colorado](https://github.com/gena/next25-weather/blob/main/images/bq-weathernext-graph-map-colorado.png)
