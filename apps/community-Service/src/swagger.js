import swaggerAutogen from "swagger-autogen";

const doc = {
    info: {
        title: "Community Service API",
        description: "Automatically  generated Swagger docs",
        version: "1.0.0",
    },
    host: "localhost:6003",
    schemes:["http"],
};

const outputFile = "./swagger-output.json";
const endpointFile = ["./routes/community.routes.ts"];

swaggerAutogen()(outputFile, endpointFile, doc);