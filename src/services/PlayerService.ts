import mongoose from "mongoose";
import { PlayerResource } from "../../src/Resources";
import { IPlayer, Player } from "../model/PlayerModel";


/**
 * gibt alle Spieler aus einem bestimmten Game als
 * Array zurück
 */
export async function getAllPlayers(): Promise<PlayerResource[]> {
    const playerList = await Player.find();
    
    const data = playerList.map(player => ({
        id: player._id.toString(),  
        nickName: player.nickName,
        host:player.host,
        teamId: "12354",
        createdAt: player.createdAt ? player.createdAt.toISOString() : new Date().toISOString(),
    }));

    return data;
}


   // throw new Error("not implemented yet")


/**
 * Liefert die PlayerResource mit angegebener Id.
 * Falls kein Player Gefunden wird, wird ein Fehler 
 * geworfen
 */
export async function getPlayer(id:string): Promise<PlayerResource> {
    const player = await Player.findById(id).exec();

    if (!player) {
        throw new Error(`Player mit ID ${id} nicht gefunden`);
    }

    const playerResource: PlayerResource = {
        id: player._id.toString(),
        nickName: player.nickName,
        teamId: "1234",
        createdAt: player.createdAt ? player.createdAt.toISOString() : new Date().toISOString(),
        host:player.host, 
    };

    return playerResource;
}


/**
 * Erzeugt einen Player
 * 
 */
export async function createPlayer(playerResource: PlayerResource):Promise<PlayerResource> {
    const neuerSpieler = new Player({
        nickName: playerResource.nickName,
        createdAt: new Date(),
        host: playerResource.host,
        teamId: playerResource.teamId,
    });
    const gespeicherterSpieler = await neuerSpieler.save();
    const spielerOhnePasswort: PlayerResource = {
        id: gespeicherterSpieler._id.toString(), 
        nickName: gespeicherterSpieler.nickName,  
        host:gespeicherterSpieler.host, 
        teamId: "12345",
        createdAt: gespeicherterSpieler.createdAt ? gespeicherterSpieler.createdAt.toISOString() : new Date().toISOString(), 
        
    };
    return spielerOhnePasswort;
}



/**
 * Löscht einen Player
 */
export async function deletePlayer(id:string):Promise<void> {
    const query = await Player.findByIdAndDelete(id).exec()
    if(!query){
        throw new Error(`Couldnt delete Eintrag with id ${id}`);
    }
}

/**
 * delete teamid in player
 */

export async function updateDeletePlayerInTeam(
    playerId: string,
    updatedData: { teamId: string; action: string }
): Promise<any> {
    try {
        const player = await Player.findById(playerId).exec();

        if (!player) {
            throw new Error("Spieler nicht gefunden");
        }

        if (updatedData.action === "remove") {
            player.teamId = undefined; 
            player.leftAtInTeam = new Date(); 

        } else if (updatedData.action === "add") {
            player.teamId = new mongoose.Types.ObjectId(updatedData.teamId); 
            player.joinedAtInTeam = new Date(); 

        } else {
            throw new Error("Ungültige Aktion");
        }

        const updatedPlayer = await player.save(); 
        return updatedPlayer;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Fehler beim Aktualisieren des Spielers: ${error.message}`);
        } else {
            throw new Error("Unbekannter Fehler beim Aktualisieren des Spielers");
        }
    }
}

/**
 * update teamid in player
 */
export async function updatePlayer(playerID: string, updatedData: Partial<IPlayer>): Promise<IPlayer | null> {
    try {
        updatedData.joinedAtInTeam = new Date();
        
        const updatedPlayer = await Player.findOneAndUpdate(
            { _id: playerID }, 
            updatedData,       
            { new: true }      
        ).exec();

        if (!updatedPlayer) {
            throw new Error("Spieler nicht gefunden");
        }

        console.log("Aktualisierter Spieler:", updatedPlayer);
        return updatedPlayer;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Fehler beim Update des Spielers: ${error.message}`);
        } else {
            throw new Error("Unbekannter Fehler beim Update des Spielers");
        }
    }
}


//get Player by teamId

export async function getPlayersByTeam(teamId: string): Promise<PlayerResource[]> {
    const playersInTeam = await Player.find({ teamId: teamId }).exec();

    if (!playersInTeam || playersInTeam.length === 0) {
        return [];
    }
    
    const playerResources: PlayerResource[] = playersInTeam.map(player => ({
        id: player._id.toString(),
        nickName: player.nickName,
        teamId: teamId,
        createdAt: player.createdAt ? player.createdAt.toISOString() : new Date().toISOString(),
        host: player.host,
    }));

    return playerResources;
}
