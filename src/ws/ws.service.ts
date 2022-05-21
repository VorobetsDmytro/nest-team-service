import { Injectable } from "@nestjs/common";
import { Server } from "ws";

@Injectable()
export class WsService {
    private wss = new Server({port: process.env.WS_PORT || 8080});
    constructor() {
        this.wss.on('connection', (ws) => {
            console.log('Client connected.');
            ws.on('close', () => {
                console.log('Client disconected.');
            });
        });
    }
}