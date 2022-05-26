import csv
import json
import os
import re


header = []
jsonObjs = []

dir_path = os.path.dirname(os.path.realpath(__file__))
path = dir_path + '/../../temp'

with open(dir_path + '/../config/budget.json') as f:
    data = f.read()

budget = json.loads(data)

def getCategory(desc):

      for i in budget['data']:
            if i.get('regex') is not None:
                  if any(word in desc for word in i.get('regex')):
                        return i.get("desc")
      return "Outros"

print("Converting CSV to JSON...")
with open(path + '/transactions.csv', 'r', newline='', encoding='UTF-16 LE') as f:
      reader = csv.reader(f, delimiter=';')
      for i, row in enumerate(reader):
            if i == 12:
              header = row
              for count, h in enumerate(header):
                  header[count] = h.replace('\u00e7', 'c').replace('\u00e3','a')
            if i >= 13:
                  _json = {}
                  for j, col in enumerate(row):
                        _json[header[j]] = col.replace('\u00e7', 'c').replace('\u00e3','a').replace('\u00e9','e').replace('\u00ea','e' )
                  jsonObjs.append(_json)
      jsonList = {"data" : jsonObjs}
      
      with open(path + '/data.json', 'w', encoding='UTF-8') as outfile:
            json.dump(jsonList, outfile)

f.close()