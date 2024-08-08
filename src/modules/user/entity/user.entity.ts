import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import { Email } from "../../../data/email";
import { Username } from "../model/user-username";
import { Password } from "../model/user-password";
import { UserId } from "../model/user-user-id";

@Entity("users")
export class UserEntity {
  @PrimaryColumn("uuid")
  id!: UserId;

  @Column({ nullable: true })
  first_name!: string;

  @Column({ nullable: true })
  last_name!: string;

  @Column({ nullable: true })
  avatar_url!: string;

  @Column({ unique: true })
  email!: Email;

  @Column({ unique: true })
  username!: Username;

  @Column()
  password!: Password;

  @Column({ nullable: true })
  bio!: string;

  @Column({ default: false })
  is_private!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
