from gql import gql, Client
from gql.transport.aiohttp import AIOHTTPTransport
import datetime
import base64

transport = AIOHTTPTransport(url='http://127.0.0.1:80/')

client = Client(transport=transport)

query = gql('''
  mutation SingleUpload($fileName: String!, $base64: String!, $datetime: String!) {
    singleUpload(fileName: $fileName, base64: $base64, datetime: $datetime) {
      Nome
      DataUltimaModifica
    }
  }
''')

file_raw = open('Starship_SN8.mp4', 'rb')  # open binary file in read mode
base_64_encode = base64.b64encode(file_raw.read())
base_64_str = base_64_encode.decode("UTF-8")

x = datetime.datetime.now()

params = {
    "fileName": "video.mp4",
    "base64": base_64_str,
    "datetime": x.strftime("%Y-%m-%d %H:%M:%S")
}

result = client.execute(
    query, variable_values=params, upload_files=True
)

print(result)
