import osmnx as ox
import networkx as nx
import rasterio
import rasterio.plot
import matplotlib.pyplot as plt

with rasterio.open('esa_small_city_2.tif') as dataset:
    raster_data = dataset.read(1)
    raster_bounds = dataset.bounds
    raster_extent = [raster_bounds.left, raster_bounds.right, raster_bounds.bottom, raster_bounds.top]

cluj_graph = ox.graph_from_place("Cluj-Napoca, Romania", network_type="all", simplify=True)

fig, ax = plt.subplots(figsize=(12, 10))

ax.imshow(raster_data, extent=raster_extent, cmap='viridis', alpha=0.6)
ax.set_title("Cluj-Napoca: Raster Data with Street Network", fontsize=16)

ox.plot_graph(cluj_graph, ax=ax, node_size=0, edge_color='red', edge_linewidth=0.5, show=False, close=False)

ax.set_xlabel("Longitude")
ax.set_ylabel("Latitude")
plt.colorbar(plt.cm.ScalarMappable(cmap="viridis"), ax=ax, label="Pixel Value")
plt.show()
