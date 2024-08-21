import { NoneEmptyString } from "../../data/non-empty-string";
import { Media } from "../media/media.model";
import { Tag } from "../tag/tag.model";
import { User } from "../user/model/user.model";
import { PostId } from "./field-types/post-id";

export interface Post {
  id: PostId;
  caption: NoneEmptyString;
  author: User;
  media: Media[];
  mentions?: User[];
  tags?: Tag[];
}

export interface CreatePost {
  caption: NoneEmptyString;
  author: User;
  media: Media[];
  mentions?: User[];
  tags?: Tag[];
}
