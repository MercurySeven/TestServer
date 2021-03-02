from gql import gql, Client
from gql.transport.aiohttp import AIOHTTPTransport
import datetime
import base64

transport = AIOHTTPTransport(url='http://127.0.0.1:80/')

client = Client(transport=transport)

query = gql('''
query {
  DownloadFile(fileName : "vai.txt") {
    Base64
  }
}
''')

result = client.execute(query)["DownloadFile"]["Base64"]
result = client.execute(query)["DownloadFile"]["DataUltimaModifica"]
print(result)

base64_bytes = result.encode('ascii')

with open("scaricati/vai.txt", "wb") as fh:
    fh.write(base64.decodebytes(base64_bytes))
