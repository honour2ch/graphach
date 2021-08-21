from flask import Flask
from flask import jsonify
from urllib.request import urlopen
import json

app = Flask(__name__)

@app.route('/api/boards')
def api_boards():
    return jsonify(
            ['b']
        )

@app.route('/api/<string:board_id>/threads')
def api_threads(board_id):
    url = f'https://2ch.hk/{board_id}/1.json'
    print(url)
    response = urlopen(url)
    data_json = json.loads(response.read())
    return jsonify(
                data_json
            )

@app.route('/api/data')
def api_get_data():
    return jsonify([])

if __name__ == '__main__':
   app.run(host='0.0.0.0')