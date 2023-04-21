import certifi
import requests

try:
    print('Checking connection...')
    test = requests.get('https://hbcartaoticket.unicre.pt')
    print('Connection OK.')
except requests.exceptions.SSLError as err:
    print('SSL Error. Adding custom certs to Certifi store...')
    cafile = "/etc/ssl/certs/ca-certificates.crt"
    print(cafile)
    with open('consolidate.pem', 'rb') as infile:
        customca = infile.read()
    with open(cafile, 'ab') as outfile:
        outfile.write(customca)
    print('That might have worked.')