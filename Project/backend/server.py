#!C:\Users\andre\anaconda3\envs\ox\python.exe
import osmnx as ox
from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
import heapq
import math
import networkx as nx
from geopy.distance import geodesic
import numpy as np
import requests, json, time
from scipy.spatial import cKDTree


cluj_napoca = nx.read_graphml("./cluj_graph_with_green_scores.graphml")

def convert_coordinates_to_float(graph):
    for _, data in graph.nodes(data=True):
        if isinstance(data['x'], str):
            data['x'] = float(data['x'])
        if isinstance(data['y'], str):
            data['y'] = float(data['y'])

def heuristic(curr_node, t, graph, factor):
    x1, y1 = float(graph.nodes[curr_node]['x']), float(graph.nodes[curr_node]['y'])
    x2, y2 = float(graph.nodes[t]['x']), float(graph.nodes[t]['y'])

    heuristic_distance = math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)

    if graph.nodes[curr_node].get('street_lamp_lit', 'No') == 'Yes':
        print(f"Street light at node {curr_node}, adjusting heuristic")
        heuristic_distance *= factor 

    if float(graph.nodes[curr_node].get('green_score', 0)) >= 1.0:
        print(f"Green zone at node {curr_node}, adjusting heuristic")
        heuristic_distance *= factor

    return heuristic_distance

speeds = []
def astar(graph, start, target, factor):
    global speeds
    q = []
    prev = {}
    dist = {start: 0}
    heapq.heappush(q, (0, start))

    while q:
        curr_dist, x = heapq.heappop(q)

        if x == target:
            break

        for y, edge_data in graph[x].items():
            # print("HERE :", edge_data)
            edge_attrs = edge_data[0]
            # print(edge_attrs)

            edge_weight = edge_attrs.get('length', 1)
            # print(f"Edge weight: {edge_weight}")
            # print(edge_attrs)
            street_lamp_lit = edge_attrs.get('street_lamp_lit', 'No')
            # print(street_lamp_lit)
            if street_lamp_lit == 'Yes':
                print(f"Street light found on edge from {x} to {y}, reducing weight")
                edge_weight = float(edge_weight) * factor 

            green_score = edge_attrs.get('green_score', 0.0)
            # print(street_lamp_lit)
            if float(green_score) >= 1.0:
                print(f"Green score found on edge from {x} to {y}, reducing weight")
                edge_weight = float(edge_weight) * factor 

            new_dist = curr_dist + float(edge_weight)

            if y not in dist or new_dist < dist[y]:
                dist[y] = new_dist
                prev[y] = x
                heapq.heappush(q, (new_dist + heuristic(y, target, graph, factor), y))

                if edge_attrs.get('maxspeed') != None:
                    # print("AICIIIIII")
                    # print(f"SPEEDS: {speeds}")
                    match edge_attrs.get("maxspeed"):
                        case "RO:urban":
                            speeds.append(50)
                        case "RO:rural":
                            speeds.append(90)
                        case "RO:trunk":
                            speeds.append(100)
                        case "RO:motorway":
                            speeds.append(130)

                        case _:
                            speeds.append(int(edge_attrs.get('maxspeed')))

    return prev

def reconstruct_path(graph, prev, start, target):
    path = []
    total_dist = 0
    current = target
    # print(graph)

    while current != start:
        path.append(current)
        prev_node = prev.get(current)
        if prev_node is None:
            return []

        edge_data = graph[prev_node][current]
        # print(float(edge_data.get('length', 1)))
        edge_length = float(edge_data.get('length', 1))
        total_dist += edge_length

        current = prev_node

    path.append(start)
    return path[::-1], total_dist


def find_closest_node(graph, clicked_point):
    closest_node = None
    min_distance = float('inf')

    for node in graph.nodes:
        distance = geodesic(clicked_point, (float(node['x']), float(node['y']))).meters

        if distance < min_distance:
            min_distance = distance
            closest_node = node
    
    return closest_node, min_distance

# prev = astar(cluj_napoca, start, end)
# path = reconstruct_path(prev, start, end)

# path_with_coordinates = [[float(cluj_napoca.nodes[el]['x']), float(cluj_napoca.nodes[el]['y'])] for el in path]
# print("Shortest path:", path_with_coordinates)

from flask_cors import CORS

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins=["http://localhost:5173", "*", "http://192.168.1.223:5173", "http://192.168.1.247:5173", "http://10.0.2.2:5173"])
CORS(app)

OVERPASS_API_URL = "https://overpass-api.de/api/interpreter"
QUERY = """
[out:json][timeout:25];
area[name="Cluj-Napoca"]->.boundary;
(

  node(area.boundary)["shop"];
  way(area.boundary)["shop"];
  relation(area.boundary)["shop"];

  node(area.boundary)["tourism"];
  way(area.boundary)["tourism"];
  relation(area.boundary)["tourism"];
);
out center;
"""

@app.route('/data')
def get_data():
    response = requests.get(OVERPASS_API_URL, params={'data': QUERY})
    return jsonify(response.json())

OVERPASS_API_URL = "https://overpass-api.de/api/interpreter"
QUERYSHOP = """
[out:json][timeout:25];
area[name="Cluj-Napoca"]->.boundary;
(
  node(area.boundary)["shop"];
  way(area.boundary)["shop"];
  relation(area.boundary)["shop"];
);
out center 100;
"""

@app.route('/dataShop')
def get_dataShop():
    response = requests.get(OVERPASS_API_URL, params={'data': QUERYSHOP})
    return jsonify(response.json())

OVERPASS_API_URL = "https://overpass-api.de/api/interpreter"
QUERYTOURISM = """
[out:json][timeout:25];
area[name="Cluj-Napoca"]->.boundary;
(
    node(area.boundary)["tourism"];
    way(area.boundary)["tourism"];
    relation(area.boundary)["tourism"];
);
out center 100;
"""

@app.route('/dataTourism')
def get_dataTourism():
    response = requests.get(OVERPASS_API_URL, params={'data': QUERYTOURISM})
    return jsonify(response.json())

OVERPASS_API_URL = "https://overpass-api.de/api/interpreter"
QUERYRESTAURANTS = """
[out:json][timeout:25];
area[name="Cluj-Napoca"]->.boundary;
(
    node(area.boundary)["amenity"="restaurant"];
    way(area.boundary)["amenity"="restaurant"];
    relation(area.boundary)["amenity"="restaurant"];
);
out center 100;
"""

@app.route('/dataRestaurant')
def get_dataRestaurant():
    response = requests.get(OVERPASS_API_URL, params={'data': QUERYRESTAURANTS})
    return jsonify(response.json())

from threading import Thread
from pprint import pprint

def fetch_data():
    while True:
        response = requests.get(
            "https://www.waze.com/row-partnerhub-api/partners/11315398994/waze-feeds/d15f3f75-64f0-4455-8bdd-a9b1fc1d1d44?format=1"
        ) 
        data = response.json()
        # json_response = json.dumps(data, ensure_ascii=False)
        # pprint(data)
        print("Fetched data...")
        socketio.emit('waze_data_response', data)
        time.sleep(300)

import subprocess
from collections import defaultdict
def fetch_buses():
    while True:
        command = ["python", "./fetch_vehicles.py"]
        subprocess.run(command)
        with open("./vehicles.json") as vehicles_file:
            vehicles_data = json.load(vehicles_file)
        
        with open("./routes.json") as routes_file:
            routes_data = json.load(routes_file)
        
        with open("./trips.json") as trips_file:
            trips_data = json.load(trips_file)
        
        buses = defaultdict(list) 
        for route in routes_data:
            for vehicle in vehicles_data:
                if vehicle["route_id"] == route["route_id"]:
                    vehicle_data = []
                    for trip in trips_data:
                        if trip["route_id"] == route["route_id"] and\
                           trip["trip_id"] == vehicle["trip_id"]:
                            vehicle_data.append(vehicle)
                            vehicle_data.append(trip["direction_id"])
                            buses[route["route_short_name"]].append(vehicle_data)

        # print(f"Buses: {buses}")
        socketio.emit("buses", buses)
        time.sleep(20)

@socketio.on('get_waze_data')
def handle_waze_data():
    thread = Thread(target=fetch_data)
    thread.daemon = True
    thread.start()

@socketio.on("get_buses")
def handle_line_30():
    thread = Thread(target=fetch_buses)
    thread.daemon = True
    thread.start()

@app.route('/')
def index():
    return "<p>Hello, world!</p>"

@app.route("/api/lamp-coords", methods=["POST"])
def get_lamp_coords():
    command = ["python", "./lamps.py"]
    subprocess.run(command)

    with open("./lamp_coords.json") as lamp_coords_file:
        lamp_coords = json.load(lamp_coords_file)
    
    return lamp_coords

################TEST
@app.route("/api/get-all-route-shortnames", methods=["POST"])
def get_route_shortnames():
    with open("./routes.json") as routes_file:
        routes_data = json.load(routes_file)
    
    routes_data_to_send = []
    for route in routes_data:
        routes_data_to_send.append(route["route_short_name"])
    
    return jsonify(routes_data_to_send), 200

@app.route("/api/shape-coords/<direction>/<route_short_name>", methods=["POST", "OPTIONS", "GET"])
def get_shape_coords(direction, route_short_name):
    # direction = request.args.get("direction")
    # route_short_name = request.args.get("route_short_name")
    print(f" Direction : {direction}, Route short name: {route_short_name}")

    with open("./routes.json", encoding='utf-8') as routes_file:
        routes_data = json.load(routes_file)

    with open("./trips.json", encoding='utf-8') as trips_file:
        trips_data = json.load(trips_file)

    with open("./shapes.json", encoding='utf-8') as shape_file:
        shape_data = json.load(shape_file)
    
    with open("./stops.json", encoding='utf-8') as stops_file:
        stops_data = json.load(stops_file)
    
    with open("./stop_times.json", encoding='utf-8') as stop_times_file:
        stop_times_data = json.load(stop_times_file)
    
    route_id = 0
    route_color = ""
    for route in routes_data:
        if route["route_short_name"] == route_short_name:
            route_id = route["route_id"]
            route_color = route["route_color"]
            break
    
    print(f"Route id: {route_id}")

    shape_id = 0
    trip_id = 0
    for trip in trips_data:
        if int(trip["route_id"]) == int(route_id) and int(trip["direction_id"]) == int(direction):
            shape_id = trip["shape_id"]
            trip_id = trip["trip_id"]
            break
    
    print(f"Shape id: {shape_id}")
    
    shape_coords = []
    for shape in shape_data:
        if int(shape["shape_id"]) == int(shape_id):
            shape_coords.append(shape)
    
    print(f"Shape coords: {shape_coords}")

    stops = []
    for stop_time in stop_times_data:
        if int(stop_time["trip_id"]) == int(trip_id):
            stops.append(stop_time)
    
    final_stops = []
    for stop in stops_data:
        for stop_2 in stops:
            if stop_2["stop_id"] == stop["stop_id"]:
                final_stops.append(stop)
        
    return jsonify(route_color, shape_coords, final_stops), 200


################END OF TEST

@app.route("/api/calculate-distance/<factor>", methods=["POST"])
def calculate_distance(factor):
    data = request.json
    # print("DATA", data)
    convert_coordinates_to_float(cluj_napoca)
    coordinate_1 = data['coordinate_1']
    coordinate_2 = data['coordinate_2']
    street_lamp_coordinates = data["street_lamp_coordinates"]

    coordinates_1 = [float(coord.strip()) for coord in coordinate_1.split(',')]
    coordinates_2 = [float(coord.strip()) for coord in coordinate_2.split(',')]
    
    # print("Coordinates 1:", coordinates_1)
    # print("Coordinates 2:", coordinates_2)
    # print(type(coordinates_1[0]), type(coordinates_1[1]))
    # print(type(coordinates_2[0]), type(coordinates_2[1]))  

    start_node = ox.nearest_nodes(
        cluj_napoca, 
        X=coordinates_1[0], 
        Y=coordinates_1[1]
    )
    end_node = ox.nearest_nodes(
        cluj_napoca, 
        X=coordinates_2[0], 
        Y=coordinates_2[1]
    )
    # print(start_node, end_node) 
    prev = astar(cluj_napoca, start_node, end_node, float(factor))

    # print(speeds)
    avg_speed = 0
    for speed in speeds:
        avg_speed += int(speed)
    avg_speed //= len(speeds) 

    path, total_distance = reconstruct_path(cluj_napoca, prev, start_node, end_node)
    path_with_coordinates = [[float(cluj_napoca.nodes[el]['x']), float(cluj_napoca.nodes[el]['y'])] for el in path]


    # print(path_with_coordinates)
    # print(speeds)
    return jsonify(path_with_coordinates, total_distance, avg_speed), 200 

if __name__ == '__main__':
    socketio.run(app, host="0.0.0.0", port=5000)
