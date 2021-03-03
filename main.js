const { ApolloServer, gql } = require('apollo-server');
const fs = require('fs')
const mysql = require("mysql");

const connection = mysql.createPool({
    connectionLimit: 20,
    host: "mysql-server",
    port: "3306",
    user: "root",
    password: "test",
    database: "drive"
});

function query(sql) {
    return new Promise((resolve, reject) => {
        console.log(sql)
        connection.query(sql, (error, results) => {
            if (error) return reject(error);
            return resolve(results);
        });
    })
}
function deleteQuery(sql) {
    console.log(sql)
    connection.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Number of records deleted: " + result.affectedRows);
    });
}

const typeDefs = gql`  
  
  type FileDB {
      Nome: String!
      DataUltimaModifica: String!
  }

  type FileBase64 {
    Nome: String!
    Base64: String!
    DataUltimaModifica: String!
  }
  
  type Query {
    GetAllFiles: [FileDB]
    DownloadFile(fileName: String!): FileBase64
  }

  type Mutation {
    singleUpload(fileName: String, base64: String!, datetime: String!): FileDB!
    removeFile(fileName: String!): FileDB
  }
`;

const resolvers = {
    Query: {
        GetAllFiles: () => query("SELECT * FROM files"),
        DownloadFile: async (_, { fileName }) => {
            console.log("Richiesta di download: " + fileName)
            if (!fs.existsSync("./uploadedFiles")) {
                fs.mkdirSync("./uploadedFiles");
            }

            const path = "./uploadedFiles/" + fileName

            try {
                if (fs.existsSync(path)) {

                    base64String = fs.readFileSync(path, { encoding: 'base64' });

                    let r = await query("SELECT * FROM files WHERE `Nome` = '" + fileName + "';")

                    console.log("Data ultima modifica: " + r[0]["DataUltimaModifica"])

                    return {
                        "Nome": fileName,
                        "Base64": base64String,
                        "DataUltimaModifica": r[0]["DataUltimaModifica"]
                    }
                }
                return {
                    "Nome": fileName,
                    "Base64": "-1",
                    "DataUltimaModifica": "-1"
                }
            } catch (err) {
                console.error(err)
                return {
                    "Nome": fileName,
                    "Base64": "-1",
                    "DataUltimaModifica": "-1"
                }
            }
        }
    },
    Mutation: {
        removeFile: (parent, args) => {
            if (!fs.existsSync("./uploadedFiles")) {
                fs.mkdirSync("./uploadedFiles");
            }

            const path = "./uploadedFiles/" + args.fileName

            try {
                if (fs.existsSync(path)) {
                    fs.unlinkSync(path);
                    deleteQuery("DELETE FROM files WHERE `Nome` = '" + args.fileName + "';");
                    return {
                        "Nome": args.fileName,
                        "DataUltimaModifica": "Dovevi informati prima!"
                    }
                }
                return {
                    "Nome": "File inesistente",
                    "DataUltimaModifica": "Data inesistente"
                }
            } catch (err) {
                console.error(err)
                return {
                    "Nome": "Fail",
                    "DataUltimaModifica": "9999-99-99"
                }
            }

        },
        singleUpload: (parent, args) => {

            if (!fs.existsSync("./uploadedFiles")) {
                fs.mkdirSync("./uploadedFiles");
            }
            const path = "./uploadedFiles/" + args.fileName

            try {
                if (fs.existsSync(path)) {
                    //file esiste fai un update
                    query("UPDATE `files` SET `DataUltimaModifica` = '" + data + "' WHERE `Nome` = '" + nomefile + "';")
                } else {
                    query("INSERT INTO `files` (`Nome`, `DataUltimaModifica`) VALUES ('" + nomefile + "', '" + data + "');")
                }
                const data = args.datetime //2021-02-25 18:04:22
                const base64String = args.base64
                fs.writeFile(path, base64String, { encoding: 'base64' }, function (err) {
                    console.log('File creato');
                });

                return {
                    "Nome": args.fileName,
                    "DataUltimaModifica": args.datetime
                }

            } catch (err) {
                console.error(err)
            }
        }
    },
};


const server = new ApolloServer({
    typeDefs,
    resolvers
});

server.listen({ port: 5000 }).then(({ url }) => {
    console.log(`Server ready at ${url}`);
});