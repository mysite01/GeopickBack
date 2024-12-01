import mongoose, { Types } from 'mongoose';
import { User, IUser } from '../model/UserModel';
import { UserResource } from 'src/Resources';

/**
 * Erstellt einen neuen Benutzer
 */
export async function createUser(userResource: UserResource): Promise<UserResource> {
    try {
        const existingUser = await User.findOne({ name: userResource.name }).exec();
        if (existingUser) {
            throw new Error("Benutzername existiert bereits.");
        }

        const user = new User({
            name: userResource.name,
            password: userResource.password, // Passwort wird im Model gehasht
            createdAt: new Date(),
        });

        const savedUser = await user.save();

        return {
            id: savedUser._id.toString(),
            name: savedUser.name,
            createdAt: savedUser.createdAt,
        };
    } catch (error: any) {
        throw new Error(`Fehler beim Erstellen des Benutzers: ${error.message}`);
    }
}

/**
 * Löscht einen Benutzer anhand der ID
 */
export async function deleteUser(id: string): Promise<boolean> {
    const result = await User.findByIdAndDelete(id);
    return result !== null;  // Gibt `true` zurück, wenn ein Benutzer gelöscht wurde, `false` wenn kein Benutzer gefunden wurde
}
/**
 * Holt alle Benutzer anhand der ID
 */
export async function getUserById(userId: string): Promise<UserResource> {
    try {
        const user = await User.findById(userId).exec();

        if (!user) {
            throw new Error("Benutzer nicht gefunden");
        }

        return {
            id: (user._id as Types.ObjectId).toString(), // _id explizit als ObjectId behandeln und in einen String umwandeln
            name: user.name,
            password: user.password,
            createdAt: user.createdAt
        };
    } catch (error) {
        throw new Error("Fehler beim Abrufen des Benutzers");
    }
}

/**
 * 
 * @param name 
 * @returns 
 */
export async function getUserByName(name: string): Promise<UserResource> {
    try {
        const user = await User.findOne({ name }).exec();

        if (!user) {
            throw new Error("Benutzer nicht gefunden");
        }

        return {
            id: (user._id as Types.ObjectId).toString(), // _id explizit als ObjectId behandeln und in einen String umwandeln
            name: user.name,
            password: user.password,
            createdAt: user.createdAt
        };
    } catch (error) {
        throw new Error("Fehler beim Abrufen des Benutzers");
    }
}


