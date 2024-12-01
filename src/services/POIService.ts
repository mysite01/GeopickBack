import { POI } from "../model/POIModel";
import { POIResource } from "../Resources";
import mongoose from "mongoose";

/**
 * Erstellt einen neuen POI
 */
export async function createPOI(poiData: POIResource): Promise<POIResource> {
    const poi = new POI({
        name: poiData.name,
        lat: poiData.lat,
        long: poiData.long,
        beschreibung: poiData.beschreibung,
        punkte: poiData.punkte,
    });

    const savedPOI = await poi.save();

    return {
        id: savedPOI._id.toString(),
        name: savedPOI.name,
        lat: savedPOI.lat,
        long: savedPOI.long,
        beschreibung: savedPOI.beschreibung,
        punkte: savedPOI.punkte,
    };
}

/**
 * Löscht einen POI anhand der ID
 */
export async function deletePOI(id: string): Promise<void> {
    const result = await POI.findByIdAndDelete(id).exec();
    if (!result) {
        throw new Error(`POI mit der ID ${id} konnte nicht gelöscht werden.`);
    }
}

export async function getPOIById(id: string): Promise<POIResource> {
    const poi = await POI.findById(id).exec();
    if (!poi) {
        throw new Error(`POI mit der ID ${id} wurde nicht gefunden.`);
    }
    return {
        id: poi._id.toString(),
        name: poi.name,
        lat: poi.lat,
        long: poi.long,
        beschreibung: poi.beschreibung,
        punkte: poi.punkte,
    };
}

export async function getAllPOIs(): Promise<POIResource[]> {
    const pois = await POI.find().exec();
    return pois.map(poi => ({
        id: poi._id.toString(),
        name: poi.name,
        lat: poi.lat,
        long: poi.long,
        beschreibung: poi.beschreibung,
        punkte: poi.punkte,
    }));
}
