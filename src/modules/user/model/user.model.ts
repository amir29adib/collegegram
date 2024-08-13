import { Email } from "../../../data/email";
import { UserId } from "./user-user-id";
import { Username } from "./user-username";
import { UUID } from "../../../data/uuid";

export interface User {
  id: UserId;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  bio?: string;
  username: Username;
  password: string;
  email: Email;
  is_private?: boolean;
}

export interface CreateUser {
  username: Username;
  email: Email;
  password: string;
}

export interface UpdateUser {
  first_name?: string;
  last_name?: string;
  avatar_id?: UUID;
  bio?: string;
  password?: string;
  email?: Email;
  is_private?: boolean;
}

export interface LoginMiddleware {
  id: UserId;
  username: Username;
}

export interface ResetPassword {
  userId: UserId;
  resetToken: string;
  dateTime: Date;
}

export interface UserProfile {
  userId: UserId;
  avatar_url?: string;
  username: Username;
  first_name?: string;
  following: number;
  follower: number;
  posts: number;
  bio?: string;
}
