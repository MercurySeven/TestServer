from gql import gql, Client
from gql.transport.aiohttp import AIOHTTPTransport
import datetime

transport = AIOHTTPTransport(url='http://127.0.0.1:8080/')

client = Client(transport=transport)

query = gql('''
  mutation SingleUpload($file: Upload!, $datetime: String!) {
    singleUpload(file: $file, datetime: $datetime) {
      filename
      mimetype
      encoding
    }
  }
''')

with open("vai.txt", "rb") as f:

    x = datetime.datetime.now()

    params = {
        "file": f,
        "datetime": x.strftime("%Y-%m-%d %H:%M:%S")
    }

    result = client.execute(
        query, variable_values=params, upload_files=True
    )

    print(result)
