## Google Cloud NEXT'25 Weather Demo
This repository contains resources used to support [Weather API and WeatherNext demo session](https://staging-dot-gweb-cloudnext2025-staging.appspot.com/next/25/session-library?demo=AIAPP-107#all) at the [Google Cloud NEXT'25](https://cloud.withgoogle.com/next/25).

This repository contains Google Earth Engine scripts and Google BigQuery Notebooks demonstraing WeatherNext Graph and Gen weather forecasts. See https://deepmind.google/technologies/weathernext/ for more information about these models and datasets.

### Google Earth Engine: rendering [WeatherNext Graph](https://developers.google.com/earth-engine/datasets/catalog/projects_gcp-public-data-weathernext_assets_126478713_1_0) precipitation and velocity field at 10m

```javascript
var t = ee.Date('2023-09-08')

var images = ee.ImageCollection('projects/gcp-public-data-weathernext/assets/59572747_4_0')
  .filterDate(t, t.advance(6, 'hours'))
  .filter(ee.Filter.gt('forecast_hour', 0))
```

[scripts/render-weathernext-graph.js](scripts/render-weathernext-graph.js) or open the [script](https://code.earthengine.google.com/3f2b767a55dd70df842a91e578da4393) in the EE Code Editor

![WeatherNext Graph Precipitation and Velocity](https://github.com/gena/next25-weather/blob/main/images/ee-weathernext-graph-p-zoom2.1.gif)

### Google Earth Engine: rendering [WeatherNext Gen](https://developers.google.com/earth-engine/datasets/catalog/projects_gcp-public-data-weathernext_assets_126478713_1_0) temperature across 50 ensembles

[scripts/render-weathernext-gen.js](scripts/render-weathernext-gen.js) or open the [script](https://code.earthengine.google.com/08440c3505220645e0bdbd8b58299770) in the EE Code Editor

![WeatherNext Gen Temperature](https://github.com/gena/next25-weather/blob/main/images/ee-weathernext-gen-T.gif)

### Google BigQuery: querying, analyzing, and visualizing [WeatherNext Graph](https://console.cloud.google.com/bigquery/analytics-hub/discovery/projects/gcp-public-data-weathernext/locations/us/dataExchanges/weathernext_19397e1bcb7/listings/weathernext_graph_forecasts_19398be87ec) data

[notebooks/weathernext-bigquery-simple.ipynb](notebooks/weathernext-bigquery-simple.ipynb)

Temperature for New York

```sql
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
