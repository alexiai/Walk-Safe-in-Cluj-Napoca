import json


if __name__ == "__main__":
    lamp_coords = [] 

    # with open("./mapillary-points (1).json") as lamp_file:
        # lamp_file_data = json.load(lamp_file)

    # for lamp in lamp_file_data["features"]:
        # lamp_coordinates = lamp["geometry"]["coordinates"]

        # if lamp_coordinates not in lamp_coords:
            # lamp_coords.append(lamp_coordinates)

    # with open("./mapillary-points (2).json") as lamp_file:
        # lamp_file_data = json.load(lamp_file)

    # for lamp in lamp_file_data["features"]:
        # lamp_coordinates = lamp["geometry"]["coordinates"]

        # if lamp_coordinates not in lamp_coords:
            # lamp_coords.append(lamp_coordinates)

    with open("./mapillary-points (7).json") as lamp_file:
        lamp_file_data = json.load(lamp_file)

    for lamp in lamp_file_data["features"]:
        lamp_coordinates = lamp["geometry"]["coordinates"]

        if lamp_coordinates not in lamp_coords:
            lamp_coords.append(lamp_coordinates)

    # with open("./mapillary-points (4).json") as lamp_file:
        # lamp_file_data = json.load(lamp_file)

    # for lamp in lamp_file_data["features"]:
        # lamp_coordinates = lamp["geometry"]["coordinates"]

        # if lamp_coordinates not in lamp_coords:
            # lamp_coords.append(lamp_coordinates)

    # with open("./mapillary-points (5).json") as lamp_file:
        # lamp_file_data = json.load(lamp_file)

    # for lamp in lamp_file_data["features"]:
        # lamp_coordinates = lamp["geometry"]["coordinates"]

        # if lamp_coordinates not in lamp_coords:
            # lamp_coords.append(lamp_coordinates)

    # with open("./mapillary-points (6).json") as lamp_file:
        # lamp_file_data = json.load(lamp_file)

    # for lamp in lamp_file_data["features"]:
        # lamp_coordinates = lamp["geometry"]["coordinates"]

        # if lamp_coordinates not in lamp_coords:
            # lamp_coords.append(lamp_coordinates)
    
    # print(lamp_coords)
    with open("./lamp_coords.json", "w") as output:
        json.dump(lamp_coords, output, indent=4)