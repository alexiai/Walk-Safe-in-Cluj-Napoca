import osmnx as ox
import geopandas as gpd
import rasterio
from shapely.geometry import Point
import numpy as np
import matplotlib.pyplot as plt

place_name = "Cluj-Napoca, Romania"
graph = ox.graph_from_place(place_name, network_type='all')

nodes, edges = ox.graph_to_gdfs(graph)

raster_path = "./esa_small_city_2.tif"
src = rasterio.open(raster_path)

raster_data = src.read(1)

threshold = 0.2
vegetation_mask = raster_data > threshold

buffer_distance = 50

edges['buffered_geometry'] = edges.geometry.buffer(buffer_distance)

def check_vegetation_in_buffer(buffer_geom, vegetation_mask, src):
    minx, miny, maxx, maxy = buffer_geom.bounds
    window = rasterio.windows.Window.from_slices((miny, maxy), (minx, maxx))
    
    vegetation_data = src.read(1, window=window)
    
    vegetation_mask_in_window = vegetation_data > 0
    
    vegetation_percentage = np.sum(vegetation_mask_in_window) / vegetation_mask_in_window.size
    return vegetation_percentage

edges['vegetation_level'] = edges['buffered_geometry'].apply(
    lambda buf: check_vegetation_in_buffer(buf, vegetation_mask, src)
)

edges.plot(column='vegetation_level', cmap='Greens', legend=True, figsize=(10, 10))
plt.title(f"Vegetation Level in {place_name}")
plt.show()
