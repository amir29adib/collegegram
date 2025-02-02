import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import { PostId } from "../model/post-id";
import { UserEntity } from "../../user/entity/user.entity";
import { MediaEntity } from "../../media/entity/media.entity";
import { TagEntity } from "../../tag/tag.entity";
import { UserId } from "../../user/model/user-user-id";
import { CommentEntity } from "../comment/entity/comment.entity";
import { BookmarkEntity } from "../bookmark/entity/bookmark.entity";
import { LikePostEntity } from "../like-post/entity/like-post-entity";
import { MentionEntity } from "../mention/entity/mention.entity";

@Entity("posts")
export class PostEntity {
  @PrimaryColumn("uuid")
  id!: PostId;

  @Index()
  @Column()
  authorId!: UserId;

  @ManyToOne(() => UserEntity, (author) => author.posts, { nullable: false })
  author!: UserEntity;

  @Column("text", { nullable: true })
  caption!: string;

  @Column()
  closeFriendsOnly!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => MentionEntity, (mention) => mention.post)
  mentions!: MentionEntity[];

  @OneToMany(() => LikePostEntity, (likepost) => likepost.post)
  likes!: LikePostEntity[];

  @ManyToMany(() => MediaEntity)
  @JoinTable()
  media!: MediaEntity[];

  @ManyToMany(() => TagEntity, (tag) => tag.posts)
  @JoinTable()
  tags!: TagEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.post)
  comments!: CommentEntity[];

  @OneToMany(() => BookmarkEntity, (bookmark) => bookmark.post)
  bookmarks!: BookmarkEntity[];
}
