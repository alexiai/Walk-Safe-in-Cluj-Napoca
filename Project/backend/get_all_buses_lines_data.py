from collections import defaultdict
import json


if __name__ == "__main__":
    with open("./output.json") as file:
        data = json.load(file) 

    new_list = defaultdict(list)

    lines_set = set()
    for line in data["vehicles"]:
        if line["route_short_name"] not in lines_set:
            lines_set.add(line["route_short_name"])

        new_list[line["route_short_name"]].append(line)
    
    for line_name in sorted(lines_set):
        with open(f"./buses_lines_data/line_{line_name}.json", "w") as output:
            json.dump(new_list[line_name], output, indent=4)