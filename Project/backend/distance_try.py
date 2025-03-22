from shapely.geometry import Point, LineString
from geopy.distance import geodesic

lamp_point = Point([23.532301783561707, 46.78753213916576])
lamp_point = Point([23.6030199, 46.7494102])

segment = LineString([[23.6030199, 46.7494002], [23.6035458, 46.74953]])

def distance_to_line(point, line):
    closest_point = line.interpolate(line.project(point))
    return geodesic((point.y, point.x), (closest_point.y, closest_point.x)).meters

distance = distance_to_line(lamp_point, segment)
print(f"Distance in meters: {distance}")
