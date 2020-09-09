const swaggerJSDoc = require('swagger-jsdoc');
const fs = require('fs');
const options = {
  definition: {
    openapi: '3.0.0', // Specification (optional, defaults to swagger: '2.0')
    info: {
      title: 'Plug-Custom-System', // Title (required)
      version: '1.0.0', // Version (required)
    },
  },
  // Path to the API docs
  apis: [
    './Src/Server/index.js',
    './Src/Server/Logic/Category/Category.js',
    './Src/Server/Logic/PluginProject/PluginProject.js',
    './Src/Server/Logic/Product/Product.js',
  ]
};
// Initialize swagger-jsdoc -> returns validated swagger spec in json format
const swaggerSpec = swaggerJSDoc(options);
fs.writeFileSync('./Src/Server/Public/Swagger/plug-custom-api.json', JSON.stringify(swaggerSpec), {
  encoding: 'utf-8'
});