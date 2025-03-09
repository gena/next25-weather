// Open this script into Google Earth Engine Code Editor: 
// https://code.earthengine.google.com/3f2b767a55dd70df842a91e578da4393

var geometry = /* color: #69d653 */ee.Geometry.Point([-62.08844282226651, 34.61320981665174]);

Map.setOptions('HYBRID')

var palettes = require('users/gena/packages:palettes')
var utils = require('users/gena/packages:utils')

var gl = require('users/gena/packages:gl').init()

var t = ee.Date('2023-09-08')

var images = ee.ImageCollection('projects/gcp-public-data-weathernext/assets/59572747_4_0')
  .filterDate(t, t.advance(6, 'hours'))
  .filter(ee.Filter.gt('forecast_hour', 0))
                  
print(images.size())

images = images.map(function(i) {
  return i.set({ 'system:time_start': ee.Date(i.get('system:time_start')).advance(i.get('forecast_hour'), 'hour').millis() })
})

var visParamsTemp = {
  min: -40.0,
  max: 35.0,
  palette: ['blue', 'purple', 'cyan', 'green', 'yellow', 'red'],
}

var visParamsPrecip = {
  min: 0.0,
  max: 0.05,
  palette: palettes.crameri.berlin[50]
}

var visPrecipMask = {
  min: 0.00005,
  max: 0.001
}

var properties = [
  'total_precipitation_6hr',
  '50_temperature',
  '10m_u_component_of_wind', 
  '10m_v_component_of_wind'
]

// query temperature values at a given location
var chartUV = ui.Chart.image.series({
  imageCollection: images.select(['10m_u_component_of_wind', '10m_v_component_of_wind']).limit(100), 
  region: geometry, 
  reducer: ee.Reducer.first(), 
  scale: 1000
}).setOptions({ title: 'wind speed (m/s)'})

var chartP = ui.Chart.image.series({
  imageCollection: images.select(['total_precipitation_6hr']).limit(100), 
  region: geometry, 
  reducer: ee.Reducer.first(), 
  scale: 1000
}).setOptions({ title: 'precipitation (mm)'})

var chartT = ui.Chart.image.series({
  imageCollection: images.select(['50_temperature']).limit(100), 
  region: geometry, 
  reducer: ee.Reducer.first(), 
  scale: 1000
}).setOptions({ title: 'temperature (K)'})

var panel = ui.Panel([
  chartUV,
  chartT,
  chartP
])

panel.style().set({ position: 'bottom-right', width: '300px', height: '700px' })

Map.add(panel)

// animate
var animation = require('users/gena/packages:animation')

images = images.map(function(i) { 
  i = i.resample('bilinear')
  
  var p = i.select('total_precipitation_6hr')

  var pRGB = p.visualize(visParamsPrecip)
  
  var weight = 0.6 // wegith of Hillshade vs RGB intensity (0 - flat, 1 - HS)
  var exaggeration = 2500 // vertical exaggeration
  var azimuth = 315 // Sun azimuth
  var zenith = 20 // Sun elevation
  var brightness = -0.05 // 0 - default
  var contrast = 0.05 // 0 - default
  var saturation = 0.8 // 1 - default
  var castShadows = false
  
  var uv = i.select(['10m_u_component_of_wind', '10m_v_component_of_wind'], ['x', 'y'])
    .multiply(2).float()
  
  var abs = uv.pow(2).reduce(ee.Reducer.sum()).sqrt()

  var uvRGB = abs
    .mask(abs.unitScale(7, 15))
    .visualize({ min: 10, max: 50, palette: palettes.crameri.vik[50].slice(10), opacity: 0.8 }).rename(['r', 'g', 'b']).float()

  var uvArrows = gl.renderArrows(gl.fragCoord, uv, Map.getScale(), 8, 15, 0.7)
  
  var bg = ee.Image(1).visualize({ palette: ['black'], opacity: 0.5, forceRgbOutput: true })

  // render P
  // print('Precipitation rate, min: 0, max: 0.05')
  // palettes.showPalette('', palettes.crameri.berlin[50])
  
  // return ee.ImageCollection([
  //     bg,
  //     utils.hillshadeRGB(
  //         p.updateMask(p.unitScale(visPrecipMask.min, visPrecipMask.max)).visualize(visParamsPrecip).blend(uvArrows), 
  //         p, 
  //     weight, exaggeration * 500, azimuth, zenith, contrast, brightness, saturation, castShadows),
  //   ]).mosaic()
  //   .set({ label: i.date().format('YYYY-MM-dd HH:mm').cat(' (').cat(ee.Number(i.get('forecast_hour')).format('%d')).cat(' hours)') })

  // render UV
  print('Velocity at 10m, min: 10, max: 50')
  palettes.showPalette('', palettes.crameri.vik[50].slice(10))

  return ee.ImageCollection([
      bg,
      utils.hillshadeRGB(
        uvRGB.blend(uvArrows), 
        abs,
      weight, exaggeration, azimuth, zenith, contrast, brightness, saturation, castShadows),
    ]).mosaic()
    .set({ label: i.date().format('YYYY-MM-dd HH:mm').cat(' (').cat(ee.Number(i.get('forecast_hour')).format('%d')).cat(' hours)') })
})

print(images.first())

animation.animate(images, {
  label: 'label',
  maxFrames: 50,
  preloadCount: 1,
  compact: true,
  timeStep: 150
  // hidePlay: true
})