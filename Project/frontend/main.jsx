import "./style.css";
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import './style.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { useGeographic } from 'ol/proj';
import {Feature} from 'ol';
import { fromLonLat, toLonLat } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Point } from 'ol/geom';
import Style from 'ol/style/Style';
import Circle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Icon from 'ol/style/Icon';
import Overlay from 'ol/Overlay.js';
import { LineString } from 'ol/geom';
import Stroke from 'ol/style/Stroke';
import generateLine from './generateShortestDistanceLineFromPoints';
import generateTrafficLines from './generateTrafficLinesFromPoints';

const cluj_coordinates = [23.5885, 46.7705];
// const street_lamp_coordinates = [[23.532301783561707, 46.78753213916576], 
                           // [23.531609773635864, 46.78776721370488],
                           // [23.530338406562805, 46.78790311570447],
                           // [23.530311584472656, 46.78790311570447],
                           // [23.530048727989197, 46.788097785538554], 
                           // [23.53099286556244, 46.788347549577594], 
                           // [23.532537817955017, 46.78907112414839], 
                           // [23.53143811225891, 46.79041540438098], 
                           // [23.53121280670166, 46.79054762685257], 
                           // [23.530837297439575, 46.790837780582194], 
                           // [23.530611991882324, 46.791076513490566], 
                           // [23.53073537349701, 46.79114629675607], 
                           // [23.55368435382843, 46.78504175522207], 
                           // [23.539634943008423, 46.78581312539711], 
                           // [23.54771912097931, 46.785838837545924], 
                           // [23.547783493995667, 46.785926993391456], 
                           // [23.540305495262146, 46.78594168601833], 
                           // [23.539522290229797, 46.786018822243705]];
const ip = "192.168.1.223"
async function fetchLampCoordinates() {
  return await fetch(`http://${ip}:5000/api/lamp-coords`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
   .then((response) => response.json())
   .then((data) => {
      // console.log("DATA: ", data);
      return data;
    });
}


async function fetchPOIS() {
  return await fetch(`http://${ip}:5000/data`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      // console.log("AICI: ", data);
      return data;
    });
}

async function fetchPOISShop() {
  return await fetch(`http://${ip}:5000/dataShop`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("AICI: ", data);
      return data;
    });
}
async function fetchPOISTourism() {
  return await fetch(`http://${ip}:5000/dataTourism`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("AICI: ", data);
      return data;
    });
}
async function fetchPOISRestaurant() {
  return await fetch(`http://${ip}:5000/dataRestaurant`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("AICI: ", data);
      return data;
    });
}

// Event listener for filter checkboxes to show or remove POIs based on the selected filters
document.querySelectorAll('.poi-filter').forEach(checkbox => {
  checkbox.addEventListener('change', async function() {
    // Remove all POIs first to avoid multiple layers

    // Check which filters are checked and show the corresponding POIs
    if (document.querySelector('.poi-filter[value="shop"]').checked) {
      await showPOISShop();
    }
    else{
      removePOISSHOP();
    }
    if (document.querySelector('.poi-filter[value="tourism"]').checked) {
      await showPOISTourism();
    }
    else{
      removePOISTOURISM();
    }
    if (document.querySelector('.poi-filter[value="restaurant"]').checked) {
      await showPOISRestaurant();
    }
    else{
      removePOISRESTAURANT()
    }
  });
});

// Function to remove all POIs from the map
function removePOIs() {
  map.getLayers().forEach(layer => {
    if (poiLayer || shopLayer || tourismLayer || restaurantLayer) {
      map.removeLayer(poiLayer);
      map.removeLayer(shopLayer);
      map.removeLayer(tourismLayer);
      map.removeLayer(restaurantLayer);
    }
  });
}

function removePOISSHOP() {
  map.getLayers().forEach(layer => {
      map.removeLayer(shopLayer);
    
  });
}

function removePOISTOURISM() {
  map.getLayers().forEach(layer => {
      map.removeLayer(tourismLayer);
    
  });
}

function removePOISRESTAURANT() {
  map.getLayers().forEach(layer => {
      map.removeLayer(restaurantLayer);
    
  });
}

// Function to display all POIs of type 'shop'
var shopLayer = null;
async function showPOISShop() {
  const shops = await fetchPOISShop();

  const features = shops["elements"].map((shop) => {
    // Create a feature for each shop
    const feature = new Feature({
      geometry: new Point(fromLonLat([shop["lon"], shop["lat"]])),
      name: `${shop["tags"]["name"]}`,
      tags: shop["tags"], // Store tags for later use in the popup
    });
  
    // Bind popup to each feature
    const poiInfo = generatePOIInfo(shop["tags"]); // Generate POI information
    feature.set('popup', poiInfo); // Store popup content directly in the feature
  
    return feature;
  });
  
  // Function to generate the popup content for a given feature's tags
  function generatePOIInfo(tags) {
    let poiInfo = "";
    if (tags['name']) poiInfo += `<strong>Name:</strong> ${tags['name']}<br>`;
    if (tags['addr:street']) poiInfo += `<strong>Street:</strong> ${tags['addr:street']}<br>`;
    if (tags['addr:city']) poiInfo += `<strong>City:</strong> ${tags['addr:city']}<br>`;
    if (tags['addr:country']) poiInfo += `<strong>Country:</strong> ${tags['addr:country']}<br>`;
    if (tags['contact:phone']) poiInfo += `<strong>Phone:</strong> ${tags['contact:phone']}<br>`;
    if (tags['website']) poiInfo += `<strong>Website:</strong> <a href="${tags['website']}" target="_blank">${tags['website']}</a><br>`;
    return poiInfo;
  }

  const vectorSource = new VectorSource({
    features: features,
  });

  shopLayer = new VectorLayer({
    source: vectorSource,
    style: new Style({
      image: new Icon({
        src: './poi2.png',
      }),
    }),
  });

  map.addLayer(shopLayer);
}

// Function to display all POIs of type 'tourism'
var tourismLayer = null;
async function showPOISTourism() {
  const tourism = await fetchPOISTourism();

  const features = tourism["elements"].map((touristSpot) => {
    return new Feature({
      geometry: new Point(fromLonLat([touristSpot["lon"], touristSpot["lat"]])),
      name: `${touristSpot["tags"]["name"]}`,
    });
  });

  const vectorSource = new VectorSource({
    features: features,
  });

  tourismLayer = new VectorLayer({
    source: vectorSource,
    style: new Style({
      image: new Icon({
        src: './poi2.png',
      }),
    }),
  });

  map.on("singleclick", (event) => {
    let popupDisplayed = false;
  
    map.forEachFeatureAtPixel(event.pixel, (feature) => {
      if (feature && feature.getGeometry().getType() === "Point") {
        const coordinates = feature.getGeometry().getCoordinates();
  
        // Access the tags object
        const tags = feature.get("tags") || {};  // Ensure we're accessing the tags object
  
        // Access the properties directly from the feature
        const stopName = feature.get("name") || "No name available";
        const street = feature.get("addr:street") || "No street available";
        const city = feature.get("addr:city") || "No city available";
        const country = feature.get("addr:country") || "No country available";
        const tourismType = feature.get("tourism") || "No tourism type available";
        const website = tags["website"] || "No website available";
        const internetAccess = tags["internet_access"] || "No internet access available";
        const stars = tags["stars"] || "No stars available";
  
        // Update the popup content with more details
        popupElement.innerHTML = `
          <strong>Name:</strong> ${stopName}<br>
          <strong>Street:</strong> ${street}<br>
          <strong>City:</strong> ${city}<br>
          <strong>Country:</strong> ${country}<br>
          <strong>Tourism Type:</strong> ${tourismType}<br>
          <strong>Website:</strong> <a href="${website}" target="_blank">${website}</a><br>
          <strong>Internet Access:</strong> ${internetAccess}<br>
          <strong>Stars:</strong> ${stars}<br>
        `;
  
        // Set the position of the popup and display it
        popup.setPosition(coordinates);
        popupElement.style.display = "block";
        popupDisplayed = true;
      }
    });
  
    if (!popupDisplayed) {
      popupElement.style.display = "none";
      popup.setPosition(undefined);
    }
});


  map.addLayer(tourismLayer);
}

// Function to display all POIs of type 'restaurant'
var restaurantLayer = null;
async function showPOISRestaurant() {
  const restaurants = await fetchPOISRestaurant();

  const features = restaurants["elements"].map((restaurant) => {
    return new Feature({
      geometry: new Point(fromLonLat([restaurant["lon"], restaurant["lat"]])),
      name: `${restaurant["tags"]["name"]}`,
    });
  });

  const vectorSource = new VectorSource({
    features: features,
  });

  restaurantLayer = new VectorLayer({
    source: vectorSource,
    style: new Style({
      image: new Icon({
        src: './poi2.png',
      }),
    }),
  });

  map.addLayer(restaurantLayer);
}




var lampLayer = null;
async function displayLampCoordinates() {
  const street_lamp_coordinates = await fetchLampCoordinates();
  // console.log("COORDINATES: ", street_lamp_coordinates)
  const features = street_lamp_coordinates.map((coord) => {
    return new Feature({
      geometry: new Point(fromLonLat(coord))
    })
  });
  const vectorSource = new VectorSource({
    features: features,
  });

  lampLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
          image: new Icon({
            src: './street_lamp.png',
          }), 
      }),
  });

  map.addLayer(lampLayer)
}

////////////////////TEST

///////////////POPUP FOR BUS STOPS

// async function displayRouteShapeTest() {
  // const shape_coordinates = await fetchShapeCoordinates();

  // const features = shape_coordinates.map((item) => {
      // return [item["shape_pt_lon"], item["shape_pt_lat"]]
  // })

  // const line = generateTrafficLines(features)
  // console.log("LINE: ", line)
  // console.log("FEATURES: ", features);

  // map.addLayer(line)
// }

// displayRouteShapeTest();

////////////////////END OF TEST
const osmLayer = new TileLayer({
  source: new OSM()
});

const trafficLayer = new VectorLayer({
  source: new VectorSource()
});

// const clujExtent = [minLon, minLat, maxLon, maxLat];

const view = new View({
  center: fromLonLat(cluj_coordinates),
  minZoom: 12,
  zoom: 13,
  maxZoom: 21,
  // extent: clujExtent,
  constrainResolution: true,
  constrainOnlyCenter: false
});


// Activăm coordonatele geografice (lon, lat)
// useGeographic();

const map = new Map({
  target: 'map',
  layers: [osmLayer],
  view: view
});

// await showPOIS();
///////////PART OF TEST -> POPUP FOR BUS STOPS

const popupElement = document.createElement('div');
popupElement.id = 'popup';
popupElement.style.position = 'absolute';
popupElement.style.backgroundColor = 'white';
popupElement.style.padding = '10px';
popupElement.style.border = '1px solid black';
popupElement.style.borderRadius = '5px';
popupElement.style.display = 'none';

document.body.appendChild(popupElement);
const popup = new Overlay({
  element: popupElement,
  positioning: 'bottom-center',
  stopEvent: false,
});
map.addOverlay(popup);

///////////END OF PART OF TEST
// displayLampCoordinates();
// await fetchShapeCoordinates();

// let selectedTextbox = null;

// document.querySelectorAll('input[type="text"]').forEach((textbox) => {
  // textbox.addEventListener('click', () => {
    // selectedTextbox = textbox;
  // });
// });

document.getElementById('calculateButton').addEventListener('click', () => {
  calculateShortestDistance();
});

var existingLineLayer = null;
async function calculateShortestDistance() {
  var coordinate_1 = document.getElementById("start_coord").value;
  var coordinate_2 = document.getElementById("destination_coord").value;

  const payload = {
    coordinate_1: coordinate_1,
    coordinate_2: coordinate_2,
    street_lamp_coordinates: await fetchLampCoordinates() 
  };

  // console.log("PAYLOAD: ", payload);

  fetch(`http://${ip}:5000/api/calculate-distance/${1 - document.getElementById("lightning").value + 0.1}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
    .then((response) => response.json())
    .then((data) => {
      // console.log(data);
      const points = data[0];
      if (points) {
        if (existingLineLayer != null) {
          console.log('Removing existing line layer:', existingLineLayer);
          map.removeLayer(existingLineLayer);
        }

        const line = generateLine(points, "blue", 5, 10);
        console.log('Adding new line layer:', line);
        map.addLayer(line);

        existingLineLayer = line;
      }
      console.log(`Estimated time to arrive is: ${data[1] / (3 * 1000 / 60)} minutes`)
    });
}

map.on('singleclick', function (event) {
  const coordinates = event.coordinate;
  const lonLat = toLonLat(coordinates);

  // if (selectedTextbox) {
    // selectedTextbox.value = `${lonLat[0]}, ${lonLat[1]}`;
    // // selectedTextbox = null;
  // }

  const feature = map.forEachFeatureAtPixel(event.pixel, (feature) => feature);

  if (feature) {
    const averageSpeed = feature.get('averageSpeed');
    
    if (averageSpeed !== undefined) {
      alert(`Average speed for this jam: ${averageSpeed} km/h`);
    } /* else {
      alert("Clicked feature is not a traffic line.");
    } */
  }
  else {
    console.log("SALUT")
    // if (selectedTextbox) {
      // const payload = {
        // point: [lonLat[0], lonLat[1]],
      // };

      // const marker = new VectorLayer({
        // source: new VectorSource({
          // features: [
            // new Feature({
              // geometry: new Point(fromLonLat(payload['point']))
            // })
          // ]
        // }),
        // style: new Style({
          // image: new Icon({
            // anchor: [0.5, 46],
            // anchorXUnits: 'fraction',
            // anchorYUnits: 'pixels',
            // src: selectedTextbox.id === 'start' ? 'pinG.png' : 'pinM.png', // Use custom icons
            // scale: 0.05
          // }),
        // })
      // });
      // marker.setZIndex(9999);

      // // map.getLayers().forEach(layer => {
        // // if (layer instanceof VectorLayer) {
          // // map.removeLayer(layer);
        // // }
      // // });

      // map.addLayer(marker);

      // selectedTextbox = null;
    // }
  }
});
var line = null;
var stops_points = null;
async function fetchShapeCoordinates() {
  return await fetch(`http://${ip}:5000/api/shape-coords/${selectedValue}/${searchInput.value}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
   .then((response) => response.json())
   .then((data) => {
      const points = data[1].map((item) => {
        return [item["shape_pt_lon"], item["shape_pt_lat"]]
      })
      // console.log("AIC: ", points);

      line = generateLine(points, data[2], 3, 0);

      // console.log("STOPS: ", data[2])

      const stops= data[2].map((item) => {
        return new Feature({
          geometry: new Point(fromLonLat([item["stop_lon"], item["stop_lat"]])),
          name: item["stop_name"],
        })
      });
      const vectorSource = new VectorSource({
        features: stops,
      });

      stops_points = new VectorLayer({
        source: vectorSource,
        style: new Style({
            image: new Circle({
                radius: 5,
                fill: new Fill({ color: data[2] }),
                stroke: new Stroke({ color: 'black', width: 1 }),
            }),
        }),
      });

      map.addLayer(stops_points)
      
      map.on("singleclick", (event) => {
        let popupDisplayed = false;
        map.forEachFeatureAtPixel(event.pixel, (feature) => {
          if (feature && feature.getGeometry().getType() === "Point") {
            const coordinates = feature.getGeometry().getCoordinates();
            const stopName = feature.get("name") || "No name available";

            popupElement.innerHTML = stopName;
            popup.setPosition(coordinates);
            popupElement.style.display = "block";
            popupDisplayed = true;
          }
        });

      if (!popupDisplayed) {
        popupElement.style.display = "none";
        popup.setPosition(undefined);
      }
      });

      map.addLayer(line);
      // return data;
    });
  }

async function fetchRouteShortnames() {
  return fetch(`http://${ip}:5000/api/get-all-route-shortnames`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
   .then((response) => response.json())
   .then((data) => {
      // console.log(data);
      return data;
    });
}

const socket = io(`http://${ip}:5000`);

var allSuggestions = []
async function fetchSuggestionsAndLog() {
  try {
    allSuggestions = await fetchRouteShortnames();
    // console.log("Fetched suggestions:", allSuggestions);
  } catch (error) {
    // console.error("Error fetching suggestions:", error);
  }
}

fetchSuggestionsAndLog();


const searchInput = document.getElementById("search");
const suggestionsDatalist = document.getElementById("suggestions");

if (allSuggestions) {
  searchInput.addEventListener("input", function() {
    const query = searchInput.value.toLowerCase();
    const filteredSuggestions = allSuggestions.filter(item => item.toLowerCase().includes(query));

    suggestionsDatalist.innerHTML = "";

    filteredSuggestions.forEach(suggestion => {
      const option = document.createElement("option");
      option.value = suggestion;
      suggestionsDatalist.appendChild(option);
    });
  });
} 

let selectedValue = null;

const buttons = document.querySelectorAll('.toggle-button');

buttons.forEach(button => {
  button.addEventListener('click', () => {
    buttons.forEach(btn => btn.classList.remove('active'));

    button.classList.add('active');

    selectedValue = button.dataset.value;
    // console.log('Selected Value:', selectedValue);
  });
});

const button = document.querySelector('.get-buses');
button.addEventListener('click', async () => {

if (selectedValue != null) {
  map.removeLayer(line);
  map.removeLayer(stops_points);
  await fetchShapeCoordinates();

}
})

socket.on('connect', () => {
  console.log('Connected to Socket.IO server');
  socket.emit("get_waze_data");
  socket.emit("get_buses");
});

socket.on("waze_data_response", (data) => {
  trafficLayer.getSource().clear();

  for (let i = 0; i < data["jams"].length; i++) {
    const layer = generateTrafficLines(data["jams"][i]["line"], "red", 5);
    // console.log(data["jams"][i]["line"])
    const averageSpeedForTrafficJam = data["jams"][i]["speedKMH"];

    layer.getSource().getFeatures().forEach((feature) => {
      feature.set('averageSpeed', averageSpeedForTrafficJam);
    });

    trafficLayer.getSource().addFeatures(layer.getSource().getFeatures());
  }
});

const busesVectorLayer = new VectorLayer({
  source: new VectorSource(),
  style: new Style({
    image: new Circle({
      radius: 5,
      fill: new Fill({ color: 'yellow' }),
      stroke: new Stroke({ color: 'black', width: 1 }),
    }),
  }),
});

socket.on("buses", (data) => {
  // console.log("BUS DATA: ", data);
  // console.log("AICIIIIIIIIIII", data["30"])
  busesVectorLayer.getSource().clear();
  
  const searchInput = document.getElementById("search").value;
  // console.log("AICI:", searchInput.value);
  if (searchInput && selectedValue) {
  const coordinates_and_details = data[searchInput]
    .filter((bus) => bus[1] == selectedValue)
    .map((bus) => [[bus[0]["longitude"], bus[0]["latitude"]], bus[0]["speed"], bus[0]["timestamp"]]);
  // console.log(coordinates_and_details);

  const customStyle = new Style({
    image: new Icon({
      src: "./bus.png",
      scale: 0.1,
      // anchor: [0.5, 0.5],
      // anchorXUnits: 'fraction',
      // anchorYUnits: 'pixels',  
    }),
  });

  const features = coordinates_and_details.map((coord) => {
    const startTime = new Date(coord[2]);

    const feature = new Feature({
      geometry: new Point(fromLonLat(coord[0])),
      name: `${coord[1]} km/h\n 0 seconds ago` 
    });

    feature.setStyle(customStyle);

    setInterval(() => {
      const currentTime = new Date();
      const secondsAgo = Math.floor((currentTime - startTime) / 1000);
      feature.set('name', `${coord[1]} km/h\n ${secondsAgo} seconds ago`);
      feature.changed();
    }, 1000);

    return feature;
  });

  busesVectorLayer.getSource().addFeatures(features);
  busesVectorLayer.setZIndex(1000);
  
  }
})
if (!map.getLayers().getArray().includes(busesVectorLayer)) {
  map.addLayer(busesVectorLayer);
}

function removeLampCoordinates() {
  map.getLayers().forEach(layer => {
    // console.log(layer)
    if (lampLayer) {
      map.removeLayer(lampLayer);
    }
  });
}

document.getElementById('lamps').addEventListener('change', async function() {
  if (this.checked) {
    // console.log(this.checked)
    displayLampCoordinates();
  } else {
    removeLampCoordinates();
  }
});

// document.getElementById('pois').addEventListener('change', async function() {
  // if (this.checked) {
    // console.log(this.checked);
    // showFilteredPOIs(); // This will display the filtered POIs based on the checkbox values
  // } else {
    // removePOIS(); // Remove POIs when checkbox is unchecked
  // }
// });

// document.getElementById('applyFilters').addEventListener('click', async function() {
  // showFilteredPOIs(); // Apply the filters when the button is clicked
// });

async function showFilteredPOIs() {
  // Clear previously displayed POIs before applying new filters
  removePOIS();

  // Get selected filters (checked checkboxes)
  const selectedFilters = Array.from(document.querySelectorAll('.poi-filter:checked')).map(input => input.value);

  // Check if the "pois" checkbox is checked
  const poisChecked = document.getElementById('pois').checked;

  if (poisChecked && selectedFilters.length > 0) {
    if (selectedFilters.includes("shop")) {
      await showPOISShop(); // Show POIs of type shop
    }
    if (selectedFilters.includes("tourism")) {
      await showPOISTourism(); // Show POIs of type tourism
    }
    if (selectedFilters.includes("restaurant")) {
      await showPOISRestaurant(); // Show POIs of type restaurant
    }
  }
}


const modeIcons = document.querySelectorAll('.mode-icon');

modeIcons.forEach((icon) => {
  icon.addEventListener('click', function () {
    modeIcons.forEach((icon) => icon.classList.remove('active'));

    this.classList.add('active');

    if (this.id === 'car-icon') {
      document.getElementById('bus-controls').classList.add('hidden');
      document.getElementById('common-controls').classList.remove('hidden');
    } else if (this.id === 'bus-icon') {
      document.getElementById('bus-controls').classList.remove('hidden');
      document.getElementById('common-controls').classList.add('hidden');
    }
  });
});

function updateLightningValue(value) {
  document.getElementById('lightning-value-box').textContent = value;
}
const slider = document.getElementById('lightning');
slider.addEventListener('input', (event) => updateLightningValue(event.target.value));


document.getElementById('layerSwitcher').addEventListener('change', (event) => {
  const selectedLayer = event.target.value;

  if (selectedLayer === 'osm') {
    map.getLayers().clear();
    map.addLayer(osmLayer);
    // map.addLayer(vectorLayer);
    // displayLampCoordinates();
  } else if (selectedLayer === 'traffic') {
    map.getLayers().clear();
    map.addLayer(osmLayer);
    map.addLayer(trafficLayer);
  } else if (selectedLayer === 'buses') {
    // console.log("DA")
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Enter bus info";
    input.style.margin = "10px"; 
    document.body.appendChild(input);
  }
});

// Obținem coordonatele utilizatorului (dacă există)
let userCoordinates = null;
navigator.geolocation.getCurrentPosition(position => {
  userCoordinates = {
    longitude: position.coords.longitude,
    latitude: position.coords.latitude
  };
});

// Funcție generică pentru a adăuga un marker pe hartă
// (putem specifica ce icon are, pentru plecare sau destinație)
function addMarker(coords, iconSrc) {
  const iconFeature = new Feature({
    geometry: new Point(coords), // coords e deja [lon, lat] deoarece useGeographic() e activ
  });

  iconFeature.setStyle(new Style({
    image: new Icon({
      anchor: [0.5, 1],
      src: iconSrc,
      scale: 0.3
    })
  }));

  const vectorSource = new VectorSource({
    features: [iconFeature],
  });

  const markerLayer = new VectorLayer({
    source: vectorSource,
  });
  markerLayer.setZIndex(9999);

  map.addLayer(markerLayer);
}

// Funcția care face reverse geocoding
// Dând un [lon, lat], returnează o promisiune cu textul locației
async function reverseGeocode(lon, lat) {
  // console.log(lon, lat);
  // [lon, lat] = toLonLat([lon, lat]);
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?access_token=pk.eyJ1IjoiYWxleGlhaWxhcmlhIiwiYSI6ImNtMzNqYWVzYTFkc3UybXNqMngza3RmbDkifQ.0HkT93BsyBdnahBbF_voKg`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // console.log(data);
    if (data.features && data.features.length > 0) {
      // Luăm prima sugestie
      // console.log(data.features[0].place_name);
      return data.features[0].place_name;
    } else {
      return 'Locație necunoscută';
    }
  } catch (error) {
    console.error('Eroare la reverse geocoding:', error);
    return 'Eroare la determinarea locației';
  }
}

// Variabile care rețin starea curentă - dacă utilizatorul a ales pinul de start sau pinul de destinație
let isPickingStart = false;
let isPickingDestination = false;

// Referințe la iconițele de plecare/destinație din HTML
const startPin = document.getElementById('start-pin');
const startCoordinates = document.getElementById('start_coord');
const destinationPin = document.getElementById('destination-pin');
const destinationCoordinates = document.getElementById('destination_coord');

// Când apeși pe pinul de plecare
startPin.addEventListener('click', () => {
  isPickingStart = true;
  isPickingDestination = false;
  // Opțional: poți adăuga un highlight pinului selectat, dacă dorești
});

// Când apeși pe pinul de destinație
destinationPin.addEventListener('click', () => {
  isPickingStart = false;
  isPickingDestination = true;
  // Opțional: poți adăuga un highlight pinului selectat, dacă dorești
});

// Când se face click pe hartă, verificăm dacă a fost selectat pin de start sau destinație
map.on('click', async (evt) => {
  // Coordonatele click-ului (lon, lat), deoarece useGeographic() e activ
  // var [lon, lat] = evt.coordinate;
  // console.log(lon, lat);
  const [x, y] = evt.coordinate;
  // console.log("Projected coordinates (EPSG:3857):", x, y);

  const [lon, lat] = toLonLat([x, y]);
  // console.log("Geographic coordinates (EPSG:4326):", lon, lat);
  // Dacă e pin de plecare
  if (isPickingStart) {
    const locationName = await reverseGeocode(lon, lat);
    // Adăugăm marker cu iconița de plecare
    addMarker([x, y], 'pin.png');
    // Completăm input-ul "start"
    const startInput = document.getElementById('start');
    startInput.value = locationName;
    startCoordinates.value = `${lon},${lat}`;

    // Resetăm starea
    isPickingStart = false;
  }

  // Dacă e pin de destinație
  if (isPickingDestination) {
    const locationName = await reverseGeocode(lon, lat);
    // Adăugăm marker cu iconița de destinație
    addMarker([x, y], 'pin.png');
    // Completăm input-ul "destination"
    const destInput = document.getElementById('destination');
    destInput.value = locationName;
    // console.log("AIIICICICICICICI", lon, lat);
    destinationCoordinates.value = `${lon},${lat}`;

    // Resetăm starea
    isPickingDestination = false;
  }
});

// -------------------- FUNCȚIONALITATEA EXISTENTĂ DE AUTOCOMPLETE -------------------- //

// Funcția pentru afișarea sugestiilor
function showSuggestions(suggestions, suggestionsContainer) {
  suggestionsContainer.innerHTML = ''; // Curățăm lista de sugestii

  suggestions.forEach((suggestion) => {
    const li = document.createElement('li');

    // Div pentru titlu
    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = suggestion.place_name;

    // Div pentru detalii (dacă există)
    const details = document.createElement('div');
    details.className = 'details';
    details.textContent = suggestion.properties?.address || 'Adresa necunoscută';

    li.appendChild(title);
    li.appendChild(details);

    // Stocăm coordonatele locației
    li.dataset.coords = JSON.stringify(suggestion.geometry.coordinates);

    suggestionsContainer.appendChild(li);
  });

  if (suggestions.length > 0) {
    suggestionsContainer.style.display = 'block';
  } else {
    suggestionsContainer.style.display = 'none';
  }
}

// Variabilă pentru a ține evidența inputului activ (start sau destination)
let activeInput = null;

// Funcție de inițializare a căutării pentru un anumit câmp
function initializeSearch(inputId, suggestionsId) {
  const searchInput = document.getElementById(inputId);
  const suggestionsContainer = document.getElementById(suggestionsId);

  // Eveniment de focus => reținem ce câmp este activ
  searchInput.addEventListener('focus', () => {
    activeInput = searchInput;
  });

  searchInput.addEventListener('input', async (event) => {
    const query = event.target.value.trim();
    if (query.length > 2) {
      // Aproximăm proximitatea la locul unde e utilizatorul, dacă există
      const proximity = userCoordinates ? `${userCoordinates.longitude},${userCoordinates.latitude}` : '';
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=pk.eyJ1IjoiYWxleGlhaWxhcmlhIiwiYSI6ImNtMzNqYWVzYTFkc3UybXNqMngza3RmbDkifQ.0HkT93BsyBdnahBbF_voKg&proximity=${proximity}`;

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.features && data.features.length > 0) {
          showSuggestions(data.features, suggestionsContainer);
        } else {
          console.log('Nu au fost găsite sugestii pentru:', query);
          suggestionsContainer.style.display = 'none';
        }
      } catch (error) {
        console.error('Eroare la preluarea datelor:', error);
        suggestionsContainer.style.display = 'none';
      }
    } else {
      suggestionsContainer.style.display = 'none';
    }
  });

  // Click în afara listei de sugestii => o ascundem
  document.addEventListener('click', (event) => {
    if (!suggestionsContainer.contains(event.target) && event.target !== searchInput) {
      suggestionsContainer.style.display = 'none';
    }
  });

  // Gestionăm click pe fiecare sugestie
  suggestionsContainer.addEventListener('click', (event) => {
    const li = event.target.closest('li');
    if (li) {
      const coords = JSON.parse(li.dataset.coords);
      // Adăugăm marker (folosim același icon generic exemplu, îl poți schimba dacă vrei altă iconiță pentru autocomplete)
      addMarker(coords, 'https://openlayers.org/en/latest/examples/data/icon.png');

      // Umplem câmpul activ (start sau destination)
      if (activeInput) {
        activeInput.value = li.querySelector('.title').textContent;
      }

      suggestionsContainer.style.display = 'none';
    }
  });
}

// Inițializăm căutarea pentru ambele câmpuri
initializeSearch('start', 'suggestions-start');
initializeSearch('destination', 'suggestions-destination');

const reactAppContainer = document.createElement("div");
reactAppContainer.id = "react-app-container";
document.body.appendChild(reactAppContainer);
ReactDOM.render(<App />, reactAppContainer);