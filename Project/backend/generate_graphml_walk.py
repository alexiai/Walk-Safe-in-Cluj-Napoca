import osmnx as ox
import json
from shapely.geometry import Point, LineString
from geopy.distance import geodesic
import networkx as nx

place = "Cluj-Napoca, Romania"
custom_filter = (
    '["highway"~"footway|path|pedestrian|steps|living_street|cycleway|residential|unclassified|tertiary|secondary|service"]'
    '["highway"!~"motorway|motorway_link|trunk|primary|secondary_link"]'
)
# north, south, east, west = 46.807700, 46.773216, 23.590629, 23.497435
# west, south, east, north = 23.505845,46.776682,23.587454,46.802766
north, south, east, west = 46.825057, 46.719279, 23.754307, 23.429588
G = ox.graph_from_bbox(
    north=north,
    south=south,
    east=east,
    west=west,
    network_type="walk",
    simplify=False,
    # custom_filter=custom_filter,
)
gdf_edges = ox.graph_to_gdfs(G, nodes=False, edges=True)

with open("./lamp_coords.json") as lamp_coords_file:
    street_lamps = json.load(lamp_coords_file)

def is_lamp_near_edge(edge_geometry, street_lamps, radius=10):
    edge_geometry = LineString(edge_geometry)
    for lamp_coords in street_lamps:
        lamp_point = Point(lamp_coords[0], lamp_coords[1])

        closest_point = edge_geometry.interpolate(edge_geometry.project(lamp_point))

        distance = geodesic((lamp_coords[1], lamp_coords[0]), (closest_point.y, closest_point.x)).meters
        
        # print(f"Distance from lamp {lamp_point} to edge {closest_point}: {distance:.2f} meters")

        if distance <= radius:
            return True
    return False

def process_edge(edge_geometry):
    return "Yes" if is_lamp_near_edge(edge_geometry, street_lamps) else "No"

if __name__ == "__main__":
    print(f"Processing {len(gdf_edges)} edges...")

    results = [process_edge(edge_geometry) for edge_geometry in gdf_edges["geometry"]]

    gdf_edges["street_lamp_lit"] = results

    for idx, (u, v, key, data) in enumerate(G.edges(data=True, keys=True)):
        data['street_lamp_lit'] = gdf_edges.iloc[idx]['street_lamp_lit']
    # for idx, (u, v, k, data) in enumerate(G.edges(data=True, keys=True)):
        # data['id'] = idx


    nx.write_graphml(G, "cluj_napoca_graph_walk_with_lights.graphml")

    gdf_edges.to_file("cluj_napoca_graph_walk_with_lights.geojson", driver="GeoJSON")

    print("Processing complete. Graph and GeoDataFrame saved successfully.")
