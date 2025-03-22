import json


with open("./shapes.json") as shapes_file:
    shapes_data = json.load(shapes_file)

# for thing in shapes_data:
    # print(thing)
shapes_data_for_a_single_route = [shape for shape in shapes_data if shape["shape_id"] == "16_0"]
# print(shapes_data_for_a_single_route)

with open("./testing_route_shapes.json", "w") as output:
    json.dump(shapes_data_for_a_single_route, output, indent=4)