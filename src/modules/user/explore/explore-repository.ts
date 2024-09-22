import { Brackets, DataSource } from "typeorm";
import {
  PaginatedResult,
  PaginationDto,
  paginationInfo,
  paginationSkip,
} from "../../../data/pagination";
import { User } from "../model/user.model";
import { PostEntity } from "../../post/entity/post.entity";
import { BLOCKED, FOLLOWING } from "../follow/model/follow.model";
import { Explore } from "./model/explore-model";

export interface IExploreRepository {
  findPostsByUserIds(
    authenticatedUser: User,
    pagination: PaginationDto
  ): Promise<PaginatedResult<{ posts: Explore[] }>>;
}

export class ExploreRepository implements IExploreRepository {
  constructor(private dataSource: DataSource) {}

  async findPostsByUserIds(
    authenticatedUser: User,
    pagination: PaginationDto
  ): Promise<PaginatedResult<{ posts: Explore[] }>> {
    console.log(
      this.dataSource.manager
        .getRepository(PostEntity)
        .createQueryBuilder("post")
        .select([
          "post.id",
          "post.authorId",
          "post.createdAt",
          "post.closeFriendsOnly",
        ])
        .leftJoinAndSelect("post.author", "author")
        .leftJoinAndSelect("post.media", "media")
        .leftJoinAndSelect("post.comments", "comment")
        .leftJoinAndSelect("post.bookmarks", "bookmark")
        .leftJoinAndSelect("post.likes", "like")
        .innerJoinAndSelect(
          "author.followers",
          "follower",
          "follower.followingStatus = :following"
        )
        .leftJoinAndSelect(
          "author.followings",
          "following",
          "following.followingId = :authenticatedId"
        )
        .where(
          "following.followingStatus IS NULL OR following.followingStatus != :blocked"
        )
        .andWhere("(follower.followerId = :authenticatedId)")
        .andWhere(
          new Brackets((qb) =>
            qb
              .where("post.closeFriendsOnly = 0")
              .orWhere(
                `EXISTS(SELECT 1 FROM follows WHERE follows.followingId = post.authorId AND follows.followerId = :authenticatedId AND follows.isCloseFriend = 1 AND follows.followingStatus = :following)`
              )
          )
        )
        .setParameters({
          authenticatedId: authenticatedUser.id,
          following: FOLLOWING,
          blocked: BLOCKED,
        })
        .orderBy("post.createdAt", "DESC")
        .skip(paginationSkip(pagination))
        .take(pagination.limit)
        .getQueryAndParameters()
    );
    const [posts, count] = await this.dataSource.manager
      .getRepository(PostEntity)
      .createQueryBuilder("post")
      .select([
        "post.id",
        "post.authorId",
        "post.createdAt",
        "post.closeFriendsOnly",
      ])
      .leftJoinAndSelect("post.author", "author")
      .leftJoinAndSelect("post.media", "media")
      .leftJoinAndSelect("post.comments", "comment")
      .leftJoinAndSelect("post.bookmarks", "bookmark")
      .leftJoinAndSelect("post.likes", "like")
      .innerJoinAndSelect(
        "author.followers",
        "follower",
        "follower.followingStatus = :following"
      )
      .leftJoinAndSelect(
        "author.followings",
        "following",
        "following.followingId = :authenticatedId"
      )
      .where(
        "following.followingStatus IS NULL OR following.followingStatus != :blocked"
      )
      .andWhere("(follower.followerId = :authenticatedId)")
      .andWhere(
        new Brackets((qb) =>
          qb
            .where("post.closeFriendsOnly = 0")
            .orWhere(
              `EXISTS(SELECT 1 FROM follows WHERE follows.followingId = post.authorId AND follows.followerId = :authenticatedId AND follows.isCloseFriend = 1 AND follows.followingStatus = :following)`
            )
        )
      )
      .setParameters({
        authenticatedId: authenticatedUser.id,
        following: FOLLOWING,
        blocked: BLOCKED,
      })
      .orderBy("post.createdAt", "DESC")
      .skip(paginationSkip(pagination))
      .take(pagination.limit)
      .getManyAndCount();
    const { nextPage, totalPages } = paginationInfo(count, pagination);
    return {
      posts: posts.map((post) => {
        return {
          id: post.id,
          author: {
            id: post.author.id,
            firstName: post.author.firstName,
            lastName: post.author.lastName,
            username: post.author.username,
            avatar: post.author.avatar,
            followersCount: post.author.followers.length,
            isCloseFriend: post.author.followings.some(
              (following) =>
                following.followingId === authenticatedUser.id &&
                following.isCloseFriend
            ),
          },
          media: post.media.map((media) => media.url),
          likesCount: post.likes.length,
          isLiked: post.likes.some(
            (like) => like.userId === authenticatedUser.id
          ),
          bookmarksCount: post.bookmarks.length,
          isBookmarked: post.bookmarks.some(
            (bookmark) => bookmark.userId === authenticatedUser.id
          ),
          commentsCount: post.comments.length,
          closeFriendsOnly: post.closeFriendsOnly,
        };
      }),
      nextPage,
      totalPages,
    };
  }
}
