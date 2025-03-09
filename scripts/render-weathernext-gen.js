// Open this script into Google Earth Engine Code Editor: 
// https://code.earthengine.google.com/08440c3505220645e0bdbd8b58299770

var geometry = /* color: #d63000 */ee.Geometry.Point([-91.68317265418968, 52.58594833175398]);

var palettes = require('users/gena/packages:palettes')
var animation = require('users/gena/packages:animation')

Map.setOptions('HYBRID')

var images = ee.ImageCollection('projects/gcp-public-data-weathernext/assets/126478713_1_0')

images = images.filterDate('2025-01-23', '2025-01-24')

print(images.first())

var times = images.aggregate_array('system:time_start').distinct()
var forecast_hours = images.aggregate_array('forecast_hour').distinct()

images = images
  .filter(ee.Filter.eq('system:time_start', times.get(0))) // first forecast 

var t = images.select('2m_temperature')

print('Ensembles: ', t.filter(ee.Filter.eq('forecast_hour', 12)).size())

// show temperature across all ensemble members
t = t.map(function(i) {
  return i.set({ 'system:time_start': i.date().advance(i.get('forecast_hour'), 'hour').millis() })
})

// std dev of temperatures
Map.addLayer(t.reduce(ee.Reducer.stdDev()), { min: 0, max: 8 }, 'stdDev T across all ensembles and 12h', false)


var valuesAllFeatures = t.map(function(i) {
  return ee.Feature(geometry, i.reduceRegion(ee.Reducer.first(), geometry, 10)).set({ 
    'ensemble_member': i.get('ensemble_member'),
    'system:time_start': i.get('system:time_start')
  })
})

var chart1 = ui.Chart.feature.groups({
  features: valuesAllFeatures, 
  xProperty: 'system:time_start', 
  yProperty: '2m_temperature', 
  seriesProperty: 'ensemble_member'
}).setOptions({
  lineWidth: 1
})
  
// generate chart across multiple ensembles
var tPercentiles = forecast_hours.map(function(h) {
  var current = t.filter(ee.Filter.eq('forecast_hour', h))
  
  return current.reduce(ee.Reducer.percentile([0, 2, 25, 50, 75, 98, 100]))
    .set({ 
      'system:time_start': current.first().date().millis(),
      'forecast_hour': h
    })
})

tPercentiles = ee.ImageCollection(tPercentiles)

var forecasts = t.filter(ee.Filter.eq('forecast_hour', 60)) // 50 forecasts at 120 hours

// Map.addLayer(forecast.first().select('2m_temperature'), { min: 223, max: 310, palette: palettes.crameri.berlin[50] }, 'first forecast temperature median', true, 0.75)

print('Temperature at 2m, min: 233, max: 310')
palettes.showPalette('', palettes.crameri.berlin[50])

var images = ee.List.sequence(0, 49).map(function(e) {
  return forecasts
    .filter(ee.Filter.eq('ensemble_member', ee.Number(e).format('%d'))).first()
    .visualize({ min: 223, max: 310, palette: palettes.crameri.berlin[50] })
    .set({ label: ee.String('ensemble member: ').cat(ee.Number(e).format('%d')) })
})

print(images)

animation.animate(images, {
  label: 'label',
  maxFrames: 50,
  preloadCount: 1,
  opacity: 0.75,
  compact: true,
  timeStep: 150
  // hidePlay: true
})

Map.addLayer(tPercentiles.first(), { min: 250, max: 300, bands: ['2m_temperature_p0', '2m_temperature_p50', '2m_temperature_p100'] }, 'first forecast hour percentiles', false)

// Map.addLayer(tPercentiles.first().select('2m_temperature_p50'), { min: 223, max: 310, palette: palettes.crameri.berlin[50] }, 'first forecast temperature median')
// Map.addLayer(tPercentiles.first().select('2m_temperature_p50'), { min: 223, max: 310, palette: palettes.crameri.berlin[50] }, 'first forecast temperature median')


var chart2 = ui.Chart.image.series(tPercentiles, geometry, ee.Reducer.first(), 10, 'system:time_start')

// create nices ranges chart (2% - 50% - 98%)
var tPercentilesFeatures = tPercentiles.map(function(i) {
  var v = i.reduceRegion({
    reducer: ee.Reducer.first(), 
    geometry: geometry, 
    scale: 10
  })
  
  return i.set({
    values: [
      i.get('forecast_hour'),
      v.get('2m_temperature_p50'),
      v.get('2m_temperature_p2'),
      v.get('2m_temperature_p98')     
    ]
  })
})

var tPercentilesValues = tPercentilesFeatures.aggregate_array('values')

tPercentilesValues.evaluate(function(values) {
  var dataTable = {
    cols: [
      {id: 'x', type: 'number'},
      {id: 'y_1', type: 'number'},
      {id: 'i0_1', type: 'number', role: 'interval'},
      {id: 'i1_1', type: 'number', role: 'interval'}
    ]
  };
  
  values = values.map(function(o) {
    return [o[0], o[1], o[2], o[3]]
  })
  
  dataTable.rows = values.map(function(row) {
    return { c: row.map(function(o) { return { v: o } }) }
  })

  var options = {  
      title: 'Values across all ensembles (2% - 50% - 98%)',
      curveType: 'function',  
      series: [{'color': '#fc8d59'}],
      legend: { position: 'none' },
      intervals: { 'style':'area' },  
      pointSize: 3,
      width: 500,
      connectSteps: false,
      vAxis: { title: 'temperature [K]' },
      hAxis: { title: 'forecast hour' }
  };  
  
  var chart3 = ui.Chart(dataTable, 'LineChart', options)
  
  var panel = ui.Panel([chart1, chart2, chart3], ui.Panel.Layout.flow('vertical'), { position: 'middle-right', width: '300px' })
  Map.add(panel)
})
