import { DataSource, Repository } from "typeorm";
import { UpdateUser, User } from "../user/model/user.model";
import { CreateUser } from "../user/model/user.model";
import { UserEntity } from "./entity/user.entity";
import { Username } from "./model/user-username";
import { Email } from "../../data/email";
import { UserId } from "./model/user-user-id";
import { v4 } from "uuid";

export interface IUserRepository {
  create(user: CreateUser): Promise<User>;
  update(id: UserId, fields: UpdateUser): Promise<User | null>;
  findById(id: UserId): Promise<User | null>;
  findByUsername(username: Username): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
}

export class UserRepository implements IUserRepository {
  private repo: Repository<UserEntity>;

  constructor(dataSource: DataSource) {
    this.repo = dataSource.getRepository(UserEntity);
  }

  async create(user: CreateUser): Promise<User> {
    return await this.repo.save({ ...user, id: v4() });
  }

  async update(id: UserId, fields: UpdateUser): Promise<User | null> {
    return await this.repo.save({ ...fields, id });
  }

  async findById(id: UserId): Promise<User | null> {
    return await this.repo.findOneBy({ id });
  }

  async findByUsername(username: Username): Promise<User | null> {
    return await this.repo.findOne({ where: { username } });
  }

  async findByEmail(email: Email): Promise<User | null> {
    return await this.repo.findOne({ where: { email } });
  }
}
