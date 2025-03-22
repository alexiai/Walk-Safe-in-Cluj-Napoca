from collections import  defaultdict
import json


def read_files(trips_file, routes_file, vehicles_file):
    with open(trips_file) as trips_file_data:
        trips = json.load(trips_file_data)
    with open(routes_file) as routes_file_data:
        routes = json.load(routes_file_data) 
    with open(vehicles_file) as vehicles_file_data:
        vehicles = json.load(vehicles_file_data)

    return trips, routes, vehicles


if __name__ == "__main__":
    trips_file = "./trips.json"
    routes_file = "./routes.json"
    vehicles_file = "./vehicles.json"
    trips, routes, vehicles = read_files(trips_file=trips_file, routes_file=routes_file, vehicles_file=vehicles_file)

    """
    This makes a json file that groups vehicles by route id's.
    """
    new_structured_json_file = defaultdict(list) 
    for route in routes:
        route_id = str("route_id")
        for trip in trips:
            trip_id = trip["trip_id"]
            for vehicle in vehicles:
                if vehicle["route_id"] == route["route_id"] and vehicle["trip_id"] == trip_id and\
                    vehicle["vehicle_type"] == 3:
                    vehicle["direction_id"] = trip["direction_id"]
                    vehicle["route_short_name"] = route["route_short_name"]
                    # vehicle["route_short_name"] = route["route_short_name"]
                    new_structured_json_file["vehicles"].append(vehicle)
        # new_structured_json_file[route_id] = route["route_id"]
        # new_structured_json_file[route_id].append(route["route_short_name"])
    
    with open("./output.json", "w") as output:
        json.dump(new_structured_json_file, output, indent=4)