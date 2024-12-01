import { User } from "../model/UserModel";
import jwt from "jsonwebtoken";

/**
 * Prüft Name und Passwort. Bei Erfolg wird die Benutzer-ID und ein JWT zurückgegeben.
 */
export async function login(name: string, password: string): Promise<{ id: string; token: string } | false> {
    const user = await User.findOne({ name }).exec();

    if (user && await user.isCorrectPassword(password)) {

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error("Umgebungsvariable JWT_SECRET ist nicht gesetzt.");
        }
        const expiresIn = "1h"; // Token läuft nach 1 Stunde ab
        const token = jwt.sign(
            { id: user._id.toString(),
                name:user.name,
             }, // Payload
            secret,
            { expiresIn }
        );

        return {
            id: user._id.toString(),
            token,
        };
    }

    return false; // Login fehlgeschlagen
}

/**
 * Registriert einen neuen Benutzer.
 * Überprüft, ob der Name bereits existiert, und speichert den Benutzer, falls nicht.
 */
export async function register(name: string, password: string): Promise<{ id: string }> {
    const existingUser = await User.findOne({ name }).exec();

    if (existingUser) {
        throw new Error("Ein Benutzer mit diesem Namen existiert bereits.");
    }

    const newUser = new User({
        name,
        password,
        createdAt: new Date(),
    });

    const savedUser = await newUser.save();

    return {
        id: savedUser._id.toString(),
    };
}
