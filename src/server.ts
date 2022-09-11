import express from "express";
import http from "http";
import mongoose from "mongoose";
import { config } from "./config/config";
import Logging from "./library/logging";
import authorRoutes from './routes/Author';

const router = express();

mongoose
  .connect(config.mongo.url, { retryWrites: true, w: "majority" })
  .then(() => {
    Logging.info("Connected to mongoDB");
    StartServer();
  })
  .catch((err) => {
    Logging.error("Unable to connect:  ");
    Logging.error(err);
  });

// Only start the server if Mongo Connects //
const StartServer = () => {
  router.use((req, res, next) => {
    Logging.info(
      `Incoming -> Method: [${req.method}] - Url: [${req.url}] - IP: [${req.socket.remoteAddress}]
      - Status: [${res.statusCode}]`);

    res.on('finish', () => {
        Logging.info(`Incoming -> Method: [${req.method}] - Url: [${req.url}] - IP: [${req.socket.remoteAddress}]
        - Status: [${res.statusCode}]`)
    })

    next();
  });

  router.use(express.urlencoded({extended: true}));
  router.use(express.json());


  // Our API's Rules //
  router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 
    'Origin, X-requested-With, Content-Type, Accept, Authorization');

    if (req.method == 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }

    next();
  });


  // Routes //
  router.use('/authors', authorRoutes);


  // HealthCheck//
  router.get('/ping', (req, res, next) => res.status(200).json({ message: 'pong'}));


  // Eroor handling
  router.use((req, res, next) => {
    const error = new Error('not found');
    Logging.error(error);

    return res.status(404).json({ message: error.message});
  });

};
