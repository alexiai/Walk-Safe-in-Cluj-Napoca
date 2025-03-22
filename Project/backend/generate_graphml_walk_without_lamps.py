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

if __name__ == "__main__":
    print(f"Processing {len(gdf_edges)} edges...")

    # results = ["dummy" for edge_geometries in gdf_edges["geometry"]]

    # gdf_edges["dummy_value"] = results

    nx.write_graphml(G, "cluj_napoca_graph_walk.graphml")

    gdf_edges.to_file("cluj_napoca_graph_walk.geojson", driver="GeoJSON")

    print("Processing complete. Graph and GeoDataFrame saved successfully.")