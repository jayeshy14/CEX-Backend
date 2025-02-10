const swaggerAutogen = require("swagger-autogen");

const swagger = swaggerAutogen();
const file = "./swagger-docs/swagger.json";
const endpoint = ["./index.js"];
const doc = {
  info: {
    title: "Cryptocurrencies Exchange API Documentation",
    version: "0.0.1",
  },
  host: "localhost:3000",
};

swagger(file, endpoint, doc).then(() => {
  import("./index.js");
});
