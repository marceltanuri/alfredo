import requests
from htmldom import htmldom
import sys
import os
from bs4 import BeautifulSoup
import urllib.parse
from dateUtil import getBudgetPeriod
from configUtil import getValue


host = "https://ind.millenniumbcp.pt"

print("================ Alfredo Budget Control ============")

## start with welcome page. cookies are collected here
print("Accessing Millennium auth page...")
session = requests.Session() 
path = '/pt/particulares/Pages/Welcome.aspx'
authPage = session.get(host + path)
print(authPage)


## prepare request to username call
path = '/_layouts/BCP.SDC.FEP.Foundation.Presentation/Login.aspx'
encodedUserCode = getValue("millenium_user_encoded")

# send username and, if success, access password page
print("Sending username...")
passwordPage = session.post(host+path, data="k="+encodedUserCode,headers={'Content-Type': 'application/x-www-form-urlencoded'})
print(passwordPage)

## read password positions challenge
passwordChalange = passwordPage.text.index("lblPosition_1")
if passwordChalange <0:
      print("ERROR: It was not possible to read password page. Operation canceled")
dom = htmldom.HtmlDom()
dom = dom.createDom(passwordPage.text)
lblPosition_1 = dom.find("#lblPosition_1")
lblPosition_2 = dom.find("#lblPosition_2")
lblPosition_3 = dom.find("#lblPosition_3")

print("Resolving password challenge...")
## fill password
password = getValue("millennium_password")
keyPosition_1 = password[int(list(lblPosition_1.text())[0]) -1]
keyPosition_2 = password[int(list(lblPosition_2.text())[0]) -1]
keyPosition_3 = password[int(list(lblPosition_3.text())[0]) -1]

## collect other form data needed to complete action
soup = BeautifulSoup(passwordPage.text, 'html.parser')
_PFEPINTERACTIONID = formData = urllib.parse.quote(soup.find(attrs={"id" : "PFEPINTERACTIONID"})['value'])
_REQUESTDIGEST = urllib.parse.quote(soup.find(attrs={"id" : "__REQUESTDIGEST"})['value'])
_VIEWSTATE = urllib.parse.quote(soup.find(attrs={"id" : "__VIEWSTATE"})['value'], safe='')
_VIEWSTATE1 = urllib.parse.quote(soup.find(attrs={"id" : "__VIEWSTATE1"})['value'], safe='')
_VIEWSTATE2 = urllib.parse.quote(soup.find(attrs={"id" : "__VIEWSTATE2"})['value'], safe='')
_VIEWSTATE3 = urllib.parse.quote(soup.find(attrs={"id" : "__VIEWSTATE3"})['value'], safe='')
_VIEWSTATE4 = urllib.parse.quote(soup.find(attrs={"id" : "__VIEWSTATE4"})['value'], safe='')
_VIEWSTATE5 = urllib.parse.quote(soup.find(attrs={"id" : "__VIEWSTATE5"})['value'], safe='')
_VIEWSTATE6 = urllib.parse.quote(soup.find(attrs={"id" : "__VIEWSTATE6"})['value'], safe='')
_VIEWSTATE7 = urllib.parse.quote(soup.find(attrs={"id" : "__VIEWSTATE7"})['value'], safe='')
_VIEWSTATE8 = urllib.parse.quote(soup.find(attrs={"id" : "__VIEWSTATE8"})['value'], safe='')
_VIEWSTATE9 = urllib.parse.quote(soup.find(attrs={"id" : "__VIEWSTATE9"})['value'], safe='')
_VIEWSTATE10 = urllib.parse.quote(soup.find(attrs={"id" : "__VIEWSTATE10"})['value'], safe='')
_VIEWSTATE11 = urllib.parse.quote(soup.find(attrs={"id" : "__VIEWSTATE11"})['value'], safe='')
_VIEWSTATEGENERATOR = urllib.parse.quote(soup.find(attrs={"id" : "__VIEWSTATEGENERATOR"})['value'], safe='')
_EVENTVALIDATION = urllib.parse.quote(soup.find(attrs={"id" : "__EVENTVALIDATION"})['value'], safe='')

## build form data
formData = 'PFEPINTERACTIONID='+_PFEPINTERACTIONID+'&MSOWebPartPage_PostbackSource=&MSOTlPn_SelectedWpId=&MSOTlPn_View=0&MSOTlPn_ShowSettings=False&MSOGallery_SelectedLibrary=&MSOGallery_FilterString=&MSOTlPn_Button=none&__LASTFOCUS=&MSOSPWebPartManager_DisplayModeName=Browse&MSOSPWebPartManager_ExitingDesignMode=false&__EVENTTARGET=btnValidate&__EVENTARGUMENT=&MSOWebPartPage_Shared=&MSOLayout_LayoutChanges=&MSOLayout_InDesignMode=&MSOSPWebPartManager_OldDisplayModeName=Browse&MSOSPWebPartManager_StartWebPartEditingName=false&MSOSPWebPartManager_EndWebPartEditing=false&__REQUESTDIGEST='+_REQUESTDIGEST+'&__VIEWSTATEFIELDCOUNT=12&__VIEWSTATE='+_VIEWSTATE+'&__VIEWSTATE1='+_VIEWSTATE1+'&__VIEWSTATE2='+_VIEWSTATE2+'&__VIEWSTATE3='+_VIEWSTATE3+'&__VIEWSTATE4='+_VIEWSTATE4+'&__VIEWSTATE5='+_VIEWSTATE5+'&__VIEWSTATE6='+_VIEWSTATE6+'&__VIEWSTATE7='+_VIEWSTATE7+'&__VIEWSTATE8='+_VIEWSTATE8+'&__VIEWSTATE9='+_VIEWSTATE9+'&__VIEWSTATE10='+_VIEWSTATE10+'&__VIEWSTATE11='+_VIEWSTATE11+'&__VIEWSTATEGENERATOR='+ _VIEWSTATEGENERATOR +'&__VIEWSTATEENCRYPTED=&__EVENTVALIDATION='+_EVENTVALIDATION+'&txtPosition_1='+keyPosition_1+'&txtPosition_2='+keyPosition_2+'&txtPosition_3='+keyPosition_3+'&IsTheLastInput=Fix+IE+bug&hdnBrowserInfo=Mozilla%2F5.0+%28Windows+NT+10.0%3B+Win64%3B+x64%29+AppleWebKit%2F537.36+%28KHTML%2C+like+Gecko%29+Chrome%2F96.0.4664.110+Safari%2F537.36%7C%3BPortable+Document+Format%3BPortable+Document+Format%3BPortable+Document+Format%3BPortable+Document+Format%3BPortable+Document+Format%7C1098x618%7C24%7C%7C%7C%7C%7CWin32%7Cen-US%7CGMT+Standard+Time&hdnInputText=&hdnCardNumber=&sfingerprintIdPrint='

## send password and, if success, receive access to private area
path="/_layouts/BCP.SDC.FEP.Foundation.Presentation/Login.aspx"
print("Sending passowrd challenge...")
privatePage = session.post(host+path, data=formData,headers={'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'})
print(privatePage)

## prepare formdata to access CSV exporter service
date_format = "%Y-%m-%d"
period = getBudgetPeriod(date_format, sys.argv)
date_end = period.get("end")
date_start = period.get("start")

path="/pt/accounts/Pages/ExcelFile.handl?Rev=1640162662010"

formData = 'ExportCSV=True&ID_CONTA=0&HASH_CONTA=dcc7e98cbefe5ffa34b0bd132b2c8192&ExportFilters={"dataValorInicio":{"ano":0,"mes":0,"dia":0},"dataValorFim":{"ano":0,"mes":0,"dia":0},"dataMovimInicio":{"ano":'+str(date_start.year)+',"mes":'+str(date_start.month)+',"dia":'+str(date_start.day)+'},"dataMovimFim":{"ano":'+str(date_end.year)+',"mes":'+str(date_end.month)+',"dia":'+str(date_end.day)+'},"numChequeInicio":0,"numChequeFim":0,"importanciaInicio":0,"importanciaFim":0,"descricao":"","tipoMovimento":"T","flagOrdena":"D","descritivoIni":"","descritivoFim":""}&ExportType=1&'
print(formData)

## call CSV exporter service and, if success, receive a byte array
print("Requesting CSV file...")
downloadFile = session.post(host+path, data=formData,headers={'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'},  allow_redirects=True)
print(downloadFile)

##save response to file
print("Saving copy of CSV file...")
dir_path = os.path.dirname(os.path.realpath(__file__))
path = dir_path + '/../../temp'

# Check whether the specified path exists or not
if not os.path.exists(path):
      os.makedirs(path)
open(path+'/transactions.csv', 'wb').write(downloadFile.content)

sys.exit(0)