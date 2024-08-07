import { v4 } from "uuid";
import {
  CreateUser,
  User,
} from "../../../../src/modules/user/model/user.model";
import { IUserRepository } from "../../../../src/modules/user/user.repository";
import { UserId } from "../../../../src/modules/user/model/user-user-id";
import { Username } from "../../../../src/modules/user/model/user-username";
import { Email } from "../../../../src/data/email";

export class MockUserRepository implements IUserRepository {
  private users: User[] = [];
  async create(user: CreateUser): Promise<User> {
    const newUser = { ...user, id: v4() as UserId };
    this.users.push(newUser);
    return newUser;
  }
  async findByUsername(username: Username): Promise<User | null> {
    return this.users.find((user) => user.username === username) ?? null;
  }
  async findByEmail(email: Email): Promise<User | null> {
    return this.users.find((user) => user.email === email) ?? null;
  }
}
