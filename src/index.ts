import dotenv from 'dotenv';
dotenv.config(); // .env-Datei laden

import http from "http";
import mongoose from 'mongoose';
import app from "./app";

import { GameResource, POIResource } from "src/Resources";
import { Types } from "mongoose";
import * as GameService from "./services/GameService";
import * as POIService from "./services/POIService"
import { WebSocketServer, WebSocket } from 'ws';



async function createExampleGame() {
    const poi1: POIResource = { name: "Point", lat: 52.520008, long: 13.404954, beschreibung: "Alexanderplatz", punkte: 100}
    const poi2: POIResource = { name: "Point", lat: 52.516275, long: 13.377704, beschreibung: "Brandenburger Tor", punkte: 100}

    const poi1FullData = await POIService.createPOI(poi1)
    const poi2FullData = await POIService.createPOI(poi2)

    const gameData: GameResource = {
        title: "Berlin Sehenswürdigkeiten",
        beschreibung: "Einige der bekanntesten Sehenswürdigkeiten in Berlin",
        poilId: [poi1FullData.id!, poi2FullData.id!],
        maxTeam: 5,
        userId: new Types.ObjectId().toString(),
    };
    await GameService.createGame(gameData)
}

const clients: Set<WebSocket> = new Set();

function broadcast(data: any) {
    const jsonData = JSON.stringify(data);
    clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(jsonData);
        }
    });
}

async function setup() {
    console.log("USE_SSL:", process.env.USE_SSL);
    console.log("HTTP_PORT:", process.env.HTTP_PORT);
    console.log("JWT_SECRET:", process.env.JWT_SECRET);

    let mongodURI = "memory"
    if (!mongodURI) {
        console.error(`Cannot start`);
        process.exit(1);
    }

    if (mongodURI === "memory") {
        console.info("Start MongoMemoryServer");
        const MMS = await import('mongodb-memory-server');
        const mongo = await MMS.MongoMemoryServer.create();
        mongodURI = mongo.getUri();
    }

    console.info(`Connecting to MongoDB at ${mongodURI}`);
    await mongoose.connect(mongodURI);

    await createExampleGame();

    const httpPort = process.env.HTTP_PORT ? parseInt(process.env.HTTP_PORT) : 3443;
    const httpServer = http.createServer(app);

    const wss = new WebSocketServer({ server: httpServer });

    wss.on("connection", (ws: WebSocket) => {
        console.info("Ein neuer Client hat sich verbunden.");
        clients.add(ws);
      
        ws.on("message", (message) => {
          try {
            console.info(`Nachricht empfangen: ${message}`);
            const data = JSON.parse(message.toString());
            console.info("Parsed message:", data); // Debugging-Ausgabe
      
            if (data.type === "join") {
              console.info(`${data.playerName} ist Team ${data.teamId} beigetreten.`);
              broadcast({
                type: "join",
                playerId: data.playerId,
                playerName: data.playerName,
                teamId: data.teamId,
              });
            } else if (data.type === "leave") {
              console.info(`${data.playerName} hat Team ${data.teamId} verlassen.`);
              broadcast({
                type: "leave",
                playerId: data.playerId,
                playerName: data.playerName,
                teamId: data.teamId,
              });
            }
          } catch (error) {
            console.error("Fehler beim Verarbeiten der Nachricht:", error);
          }
        });
      
        ws.on("close", () => {
          console.info("Ein Client hat die Verbindung geschlossen.");
          clients.delete(ws);
        });
      });
      

    

    function startHttpServer() {
        httpServer.listen(httpPort, () => {
            console.info(`Listening for HTTP at http://localhost:${httpPort}`);
        });
    }

    httpServer.on('error', (err) => {
        if (err instanceof Error && (err as any).code === 'EADDRINUSE') {
            console.error('Address in use, retrying...');
            setTimeout(() => {
                httpServer.close();
                startHttpServer();
            }, 1000);
        } else {
            console.error(`Server error: ${err.message}`);
        }
    });

    startHttpServer();

    process.on('SIGINT', () => {
        console.info('Received SIGINT. Shutting down gracefully...');
        httpServer.close(() => {
            console.info('Server closed.');
            process.exit(0);
        });
    });
}

setup();