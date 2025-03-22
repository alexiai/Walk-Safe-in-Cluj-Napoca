from flask import Flask, render_template, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
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

# @app.route('/')
# def index():
    # return render_template('index.html')

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
out center;
"""

@app.route('/dataShop')
def get_dataShop():
    response = requests.get(OVERPASS_API_URL, params={'data': QUERYSHOP})
    return jsonify(response.json())


if __name__ == "__main__":
    app.run(debug=True)