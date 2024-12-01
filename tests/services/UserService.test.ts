import { createUser, deleteUser, getUserById } from "../../src/services/UserService";
import { User } from '../../src/model/UserModel';
import { UserResource } from "../../src/Resources";
import { Types } from "mongoose"; 

describe("UserService Tests", () => {
    afterEach(async () => {
        await User.deleteMany({});
    });

    test("Create User", async () => {
        const userData: UserResource = {
            name: "John Doe",
            password: "password123",
            createdAt: new Date()
        };

        const createdUser = await createUser(userData);

        expect(createdUser).toBeTruthy();
        expect(createdUser.name).toBe(userData.name);
        expect(createdUser.password).not.toBe(userData.password);
        expect(createdUser).toHaveProperty("createdAt");
    });

    test("Get User by ID", async () => {
        const user = await User.create({
            name: "Jane Doe",
            password: "securepassword",
            createdAt: new Date()
        });

        const foundUser = await getUserById((user._id as Types.ObjectId).toString());
        expect(foundUser).toBeTruthy();
        expect(foundUser?.name).toBe(user.name);
        expect(foundUser?.password).toBe(user.password);
    });

    test("Delete User by ID", async () => {
        const user = await User.create({
            name: "Tom Doe",
            password: "anotherpassword",
            createdAt: new Date()
        });

        const userId = (user._id as Types.ObjectId).toString();

        await deleteUser(userId);
        const deletedUser = await User.findById(userId);
        expect(deletedUser).toBeNull();
    });
});
