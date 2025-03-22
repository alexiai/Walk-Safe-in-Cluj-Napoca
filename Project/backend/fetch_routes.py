import requests
import json


def read_env_file(env_file_path):
    with open(env_file_path) as env_file:
        env_file_data = json.load(env_file) 

    return env_file_data


url = "https://api.tranzy.ai/v1/opendata/routes" 
headers = {
    "Accept": "application/json",
    "X-API-KEY": read_env_file("./.env.json")["TRANZYAI_API_KEY"],
    "X-Agency-Id": read_env_file("./.env.json")["AGENCY_ID"],
}

response = requests.get(url, headers=headers)

response_data = response.json()

if response.status_code == 200:
    with open("routes.json", "w", encoding="utf-8") as f:
        json.dump(response_data, f, ensure_ascii=False, indent=4)
else:
    print("Error:", response.status_code, response.text)