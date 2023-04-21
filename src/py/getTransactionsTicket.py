import requests
import sys
from bs4 import BeautifulSoup
import json
import os
from dateUtil import getBudgetPeriod
from configUtil import getValue
from datetime import datetime


host = "https://hbcartaoticket.unicre.pt"
userAgent = {'User-Agent': 'Foo bar'}

## start with welcome page. cookies are collected here
session = requests.Session() 
path = '/'
print("Accessing Ticket auth page....")
print(host + path)
wpage = session.get(host + path, headers=userAgent)
print(wpage)

## prepare request to username call
path = ''
_user = getValue("ticket_user")
_pass = getValue("ticket_password")
formData = 'User='+_user+'&Password='+_pass

## send login request with password key
print("Sending username and password...")
privatePage = session.post(host+path, data=formData,headers={'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'Foo bar'},)
print(privatePage)

if privatePage.status_code != 200:
      sys.exit(0)
      
soup = BeautifulSoup(privatePage.text, 'html.parser')
_available = soup("label", class_="valueLabel")[1].text.replace("€","")

## prepare request for download call
date_format = "%Y-%m-%d"
period = getBudgetPeriod(date_format, sys.argv)
date_end = period.get("end")
date_start = period.get("start")

path="/HomePrivate/PartialTransactionsList"
queryString = 'dateFrom='+date_start.strftime(date_format)+'&dateTo='+date_end.strftime(date_format)

## download transactions html file
print("Requesting ticket transactions history...")
transactionsPage = session.get(host+path+"?"+queryString, allow_redirects=True, headers=userAgent)
print(transactionsPage)

print("Converting HTML table to JSON...")
soup = BeautifulSoup(transactionsPage.text, 'html.parser')
divs = soup.find_all("div", class_="table-content")

jsonObjs = []

dir_path = os.path.dirname(os.path.realpath(__file__))
path = dir_path + '/../../temp'
if os.path.exists(path + '/data_ticket.json'):
      os.remove(path + '/data_ticket.json')

for _div in divs:
      _date = _div.find("div").label.text
      _desc = _div("div", recursive=False)[1].label.text
      _cred = _div("div", recursive=False)[2].label.text
      _debt = _div("div", recursive=False)[3].label.text
      _type = "Debito"
      _value = "-" + _debt
      if _debt == "-":
            _type = "Credito"
            _value = _cred.replace("-","")

      _date = datetime.strptime(_date, '%Y-%m-%d')
      _date = _date.strftime('%d-%m-%Y')

      _json = {"Data lancamento": _date, "Data valor": _date, "Descricao": _desc, "Montante": _value.replace(" \u20ac","").replace(",","."), "Tipo": _type, "Saldo": _available}
      jsonObjs.append(_json)
      jsonList = {"data" : jsonObjs}

      with open(path + '/data_ticket.json', 'w', encoding='UTF-8') as outfile:
            json.dump(jsonList, outfile)
sys.exit(0)