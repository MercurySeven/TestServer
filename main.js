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



const typeDefs = gql`  
  type File {
    filename: String!
    mimetype: String!
    encoding: String!
  }

  type FileDB {
      Nome: String!
      DataUltimaModifica: String!
  }
  
  type Query {
    GetAllFiles: [FileDB]
  }
  
  type Mutation {
    singleUpload(file: Upload!, datetime: String!): File!
  }
`;

const resolvers = {
    Query: {
        GetAllFiles: () => query("SELECT * FROM files")
    },
    Mutation: {
        singleUpload: (parent, args) => {
            return args.file.then(file => {
                const { createReadStream, filename, mimetype } = file

                const nomefile = filename
                const data = args.datetime //2021-02-25 18:04:22
                console.log("Ricevuto il file: " + nomefile)
                console.log("Ultima modifica: " + data)

                const fileStream = createReadStream()

                if (!fs.existsSync("./uploadedFiles")) {
                    fs.mkdirSync("./uploadedFiles");
                }

                try {
                    if (fs.existsSync("./uploadedFiles/" + filename)) {
                        //file esiste fai un update
                        query("UPDATE `files` SET `DataUltimaModifica` = '" + data + "' WHERE `Nome` = '" + nomefile + "';")
                    } else {
                        query("INSERT INTO `files` (`Nome`, `DataUltimaModifica`) VALUES ('" + nomefile + "', '" + data + "');")
                    }

                } catch (err) {
                    console.error(err)
                }

                fileStream.pipe(fs.createWriteStream(`./uploadedFiles/${filename}`))
                return file;
            });
        }
    },
};


const server = new ApolloServer({ typeDefs, resolvers });

server.listen({ port: 5000 }).then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});