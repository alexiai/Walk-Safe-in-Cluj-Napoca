import osmnx as ox

# Bounding box for Cluj-Napoca

north, south, east, west = 46.807700, 46.773216, 23.590629, 23.497435
# Load walkable graph within this bounding box
G = ox.graph_from_bbox(north=north,
    south=south,
    east=east,
    west=west, network_type='walk')

# Plot the graph
ox.plot_graph(G)
