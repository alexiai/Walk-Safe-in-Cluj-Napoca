import {Feature, Map, View} from 'ol';
import { fromLonLat, toLonLat } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Style from 'ol/style/Style';
import { LineString } from 'ol/geom';
import Stroke from 'ol/style/Stroke';

const generateTrafficLines = (points, color, width) => {
  // console.log("HERE: ", points);
  const transformedPoints = points.map((point) => fromLonLat([point["x"], point["y"]]));
  // console.log("Transformed Points:", transformedPoints);

  const lineString = new LineString(transformedPoints);
  // console.log("LineString Coordinates:", lineString.getCoordinates());

  const lineFeature = new Feature({
    geometry: lineString,
  });

  lineFeature.setStyle(
    new Style({
      stroke: new Stroke({
        color: color,
        width: width,
      }),
    })
  );

  const vectorSource = new VectorSource({
    features: [lineFeature],
  });

  const vectorLayer = new VectorLayer({
    source: vectorSource,
  });
  // console.log("VECTOR LAYER: ", vectorLayer);
  return vectorLayer;
}

export default generateTrafficLines; 