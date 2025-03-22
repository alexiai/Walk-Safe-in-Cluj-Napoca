import osmnx as ox
import json
from shapely.geometry import Point, LineString
from pyproj import CRS, Transformer
from geopy.distance import geodesic

place = "Cluj-Napoca, Romania"
G = ox.graph_from_place(place, network_type="drive", simplify=False)
gdf_edges = ox.graph_to_gdfs(G, nodes=False, edges=True)

with open("./lamp_coords.json") as lamp_coords_file:
    street_lamps = json.load(lamp_coords_file)

def distance_to_line(point, line):
    closest_point = line.interpolate(line.project(point))
    return geodesic((point.y, point.x), (closest_point.y, closest_point.x)).meters

def is_lamp_near_edge(edge_geometry, street_lamps, radius=7):
    coords = list(edge_geometry.coords)
    
    for lamp_coords in street_lamps:
        lamp_point = Point(lamp_coords[0], lamp_coords[1])
        
        segment = LineString([coords[0], coords[1]])
        
        distance = distance_to_line(lamp_point, segment) 
        # print(f"Distance between lamp and segment: {distance} meters")
        
        if distance <= radius:
            print(f"Road segment {segment} is within {radius} meters of the lamp.")
            return True

    return False

gdf_edges['street_lamp_lit'] = gdf_edges['geometry'].apply(
    lambda x: 'Yes' if is_lamp_near_edge(x, street_lamps) else 'No'
)

ox.save_graphml(G, filepath="cluj_napoca_with_lamps.graphml")

gdf_edges.to_file("cluj_napoca_with_lamps_edges.geojson", driver="GeoJSON")
