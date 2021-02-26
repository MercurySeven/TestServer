from gql import gql, Client
from gql.transport.aiohttp import AIOHTTPTransport
import json

transport = AIOHTTPTransport(url='http://127.0.0.1:8080/')

client = Client(transport=transport)

query = gql('''
  query {
  GetAllFiles {
    DataUltimaModifica
    Nome
  }
}
''')

result = client.execute(query)["GetAllFiles"]
d: dict = {}
for items in result:
    print(items["Nome"] + " -> " + items["DataUltimaModifica"])
    d[items["Nome"]] = items["DataUltimaModifica"]
