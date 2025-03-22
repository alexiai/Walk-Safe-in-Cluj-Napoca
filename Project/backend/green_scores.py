import osmnx as ox
import geopandas as gpd
import rasterio
from rasterio import features
from shapely.geometry import shape
import numpy as np

cluj_graph = ox.graph_from_place("Cluj-Napoca, Romania", network_type="all", simplify=False)

nodes_gdf, edges_gdf = ox.graph_to_gdfs(cluj_graph, nodes=True, edges=True)

raster_path = 'esa_small_city_2.tif'
with rasterio.open(raster_path) as src:
    vegetation_data = src.read(1)
    transform = src.transform

# np.savetxt('vegetation_data.txt', vegetation_data, fmt='%d')

threshold = 10
vegetation_mask = vegetation_data == threshold 
# np.savetxt('vegetation_mask.txt', vegetation_mask, fmt='%d')

vegetation_polygons = list(features.shapes(vegetation_mask.astype(np.int32), transform=transform))

vegetation_gdf = gpd.GeoDataFrame(
    [{"geometry": shape(geom), "value": value} for geom, value in vegetation_polygons],
    crs="EPSG:4326"
)

buffer_distance = 1
vegetation_gdf = vegetation_gdf.to_crs(epsg=3346)
vegetation_gdf['geometry'] = vegetation_gdf.buffer(0)
vegetation_gdf['geometry'] = vegetation_gdf['geometry']

edges_gdf = edges_gdf.to_crs(vegetation_gdf.crs)


nr = 0
for idx, row in edges_gdf.iterrows():
    u, v, key = row.name
    
    edge_geom = row['geometry']
    # print(f"Edge {u}-{v} length: {edge_geom.length}") 

    green_score = 0 

    for veg_geom in vegetation_gdf['geometry']:
        if edge_geom.intersects(veg_geom):
            green_score = 1.0
            break
    
    cluj_graph[u][v][key]["green_score"] = green_score

    if green_score > 0:
        nr += 1
        print(nr)
        print(f"Green score for edge {u}-{v}: {green_score}")
    

print(f"Number of edges with green score: {nr}")

output_graphml_path = "cluj_graph_with_green_scores.graphml"
ox.save_graphml(cluj_graph, filepath=output_graphml_path)

print(f"Graph saved as {output_graphml_path}")
