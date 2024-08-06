import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("users")
export class UserEntity {
  @PrimaryColumn("uuid")
  id!: string;

  @Column()
  first_name!: string;

  @Column()
  last_name!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ unique: true })
  username!: string;

  @Column()
  password!: string;

  @Column()
  bio!: string;

  @Column()
  is_private!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @Column()
  avatar_url!: string;

  @UpdateDateColumn()
  updatedAt!: Date;
}
