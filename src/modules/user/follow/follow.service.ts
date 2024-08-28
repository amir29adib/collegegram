import {
  BadRequest,
  DuplicatedRecord,
  NotFound,
} from "../../../utilities/http-error";
import { UserId } from "../model/user-user-id";
import { UserService } from "../user.service";
import { GetFollowerListsDto } from "./dto/get-followers.dto";
import { GetFollowingListsDto } from "./dto/get-followings.dto";
import { IFollowRepository } from "./follow.repository";
import { Follow } from "./model/follow.model";
import { Follower } from "./model/follower";
import { Following } from "./model/following";

export class FollowService {
  constructor(private flwRepo: IFollowRepository) {}

  async followUser(
    followerId: UserId,
    followingId: UserId,
    userService: UserService
  ): Promise<Follow> {
    if (followerId == followingId) {
      throw new BadRequest("Dont follow yourself!");
    }

    const follower = await userService.getUserBy(followerId);
    const following = await userService.getUserBy(followingId);
    if (!follower || !following) {
      throw new NotFound("User not found!");
    }

    const followEntity = await this.getFollow(follower.id, following.id);
    if (followEntity) {
      throw new DuplicatedRecord("Follow record is duplicated!");
    }

    return await this.flwRepo.create({
      followerId: follower.id,
      followingId: following.id,
      requestStatus: following.is_private === true ? "pending" : "accepted",
    });
  }

  async getFollow(followerId: UserId, followingId: UserId) {
    return await this.flwRepo.findByFollowerAndFollowing(
      followerId,
      followingId
    );
  }

  async getFollowers(
    dto: GetFollowerListsDto
  ): Promise<{ followers: Follower[] }> {
    const followersEntities = await this.flwRepo.findFollowersByUser(dto);
    const followersUsers: Follower[] = await Promise.all(
      followersEntities.map(async (followerEntity) => {
        const followersCount = await this.getcountFollowers(followerEntity.id);

        return {
          id: followerEntity.id,
          avatar: followerEntity.avatar ? followerEntity.avatar.path : null,
          username: followerEntity.username,
          first_name: followerEntity.first_name,
          last_name: followerEntity.last_name,
          bio: followerEntity.bio,
          followersCount: followersCount,
        };
      })
    );

    return { followers: followersUsers };
  }

  async getcountFollowers(followerId: UserId): Promise<number> {
    return await this.flwRepo.countFollowers(followerId);
  }

  async getcountFollowing(followingId: UserId): Promise<number> {
    return await this.flwRepo.countFollowing(followingId);
  }

  async getFollowings(
    dto: GetFollowingListsDto
  ): Promise<{ followings: Following[] }> {
    const followingEntities = await this.flwRepo.findFollowingByUser(dto);

    const followingUsers = await Promise.all(
      followingEntities.map(async (followingEntity) => {
        const followersCount = await this.getcountFollowers(followingEntity.id);

        return {
          id: followingEntity.id,
          avatar: followingEntity.avatar ? followingEntity.avatar.path : null,
          username: followingEntity.username,
          first_name: followingEntity.first_name,
          last_name: followingEntity.last_name,
          bio: followingEntity.bio,
          followersCount: followersCount,
        };
      })
    );

    return { followings: followingUsers };
  }

  async unfollowUser(
    followerId: UserId,
    followingId: UserId,
    userService: UserService
  ): Promise<{ unfollowStatus: boolean }> {
    const follower = await userService.getUserBy(followerId);
    const following = await userService.getUserBy(followingId);

    if (!follower || !following) {
      throw new NotFound("User not found!");
    }

    const followEntity = await this.getFollow(follower.id, following.id);

    if (!followEntity) {
      throw new NotFound("Follow not found!");
    }

    return {
      unfollowStatus: await this.flwRepo.delete({
        followerId: followEntity.followerId,
        followingId: followEntity.followingId,
      }),
    };
  }
}
