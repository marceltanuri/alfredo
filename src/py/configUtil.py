import json
import os

dir_path = os.path.dirname(os.path.realpath(__file__))
with open(dir_path + '/../config/config.json') as f:
    data = f.read()

config = json.loads(data)

def getValue(key):
    return config[key]
