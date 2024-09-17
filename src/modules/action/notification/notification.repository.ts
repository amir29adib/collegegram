import { DataSource, In, Not, Repository } from "typeorm";
import { NotificationEntity } from "./entity/notification.entity";
import { GetNotificationsDto } from "./dto/get-notifications.dto";
import {
  PaginatedResult,
  paginationInfo,
  paginationSkip,
} from "../../../data/pagination";
import { CommentRepository } from "../../post/comment/comment.repository";
import { CommentId } from "../../post/comment/model/comment-id";
import { ActionType } from "../model/action-type";
import { UUID } from "../../../data/uuid";
import { NotificationId } from "./model/notification-id";
import { SeenNotificationsDto } from "./dto/seen-notifications.dto";
import { UserId } from "../../user/model/user-user-id";
import { NotificationType } from "./model/notification-type";
import { FollowRepository } from "../../user/follow/follow.repository";
import { FollowId } from "../../user/follow/model/follow-id.model";

export interface INotificationRepository {
  getAllWithAction(
    dto: GetNotificationsDto
  ): Promise<PaginatedResult<{ notifications: NotificationEntity[] }>>;
  getRelatedEntityByType(
    actionType: ActionType,
    entityId: UUID
  ): Promise<unknown | null>;
  seen(
    dto: SeenNotificationsDto
  ): Promise<{ seenNotificationsStatus: boolean }>;
  countInvalidSeenNotifications(
    notificationIds: NotificationId[],
    receiverId: UserId
  ): Promise<number>;
  countUnseen(receiverId: UserId): Promise<number>;
  countUnseenByType(
    receiverId: UserId,
    notificationType: NotificationType
  ): Promise<number>;
}

export class NotificationRepository implements INotificationRepository {
  private repo: Repository<NotificationEntity>;

  constructor(private dataSource: DataSource) {
    this.repo = this.dataSource.getRepository(NotificationEntity);
  }

  async getAllWithAction(
    dto: GetNotificationsDto
  ): Promise<PaginatedResult<{ notifications: NotificationEntity[] }>> {
    const result = await this.repo
      .createQueryBuilder("notification")
      .leftJoinAndSelect("notification.action", "action")
      .leftJoinAndSelect("action.media", "media")
      .select([
        "notification.id",
        "action.mediaId",
        "action.type",
        "action.actorId",
        "action.actionDate",
        "action.entityId",
        "notification.receiverId",
        "notification.isSeen",
      ])
      .where("notification.receiverId = :receiverId", {
        receiverId: dto.receiverId,
      })
      .andWhere("notification.notificationType = :notificationType", {
        notificationType: dto.notificationType,
      })
      .orderBy("action.actionDate", "DESC")
      .take(dto.limit)
      .skip(paginationSkip({ limit: dto.limit, page: dto.page }))
      .getManyAndCount();

    const { nextPage, totalPages } = paginationInfo(result[1], {
      limit: dto.limit,
      page: dto.page,
    });

    return { notifications: result[0], nextPage, totalPages };
  }

  async getRelatedEntityByType(
    actionType: ActionType,
    entityId: UUID
  ): Promise<unknown | null> {
    const commentRepo = new CommentRepository(this.dataSource);
    const followRepo = new FollowRepository(this.dataSource);

    switch (actionType) {
      case "comment":
        return await commentRepo.getCommentForNotificationById(
          entityId as CommentId
        );

      case "acceptFollow":
        return await followRepo.getFollowForNotificationById(
          entityId as FollowId
        );

      case "requestFollow":
        return await followRepo.getFollowForNotificationById(
          entityId as FollowId
        );

      case "follow":
        return await followRepo.getFollowForNotificationById(
          entityId as FollowId
        );

      default:
        return null;
    }
  }

  async seen(
    dto: SeenNotificationsDto
  ): Promise<{ seenNotificationsStatus: boolean }> {
    return {
      seenNotificationsStatus:
        (
          await this.repo.update(
            { id: In(dto.notificationIds), receiverId: dto.receiverId },
            { isSeen: true }
          )
        ).affected === dto.notificationIds.length,
    };
  }

  async countInvalidSeenNotifications(
    notificationIds: NotificationId[],
    receiverId: UserId
  ): Promise<number> {
    return await this.repo.count({
      where: {
        id: In(notificationIds),
        receiverId: Not(receiverId),
      },
    });
  }

  async countUnseen(receiverId: UserId): Promise<number> {
    return await this.repo.count({
      where: { receiverId, isSeen: false },
    });
  }

  async countUnseenByType(
    receiverId: UserId,
    notificationType: NotificationType
  ): Promise<number> {
    return await this.repo.count({
      where: { receiverId, notificationType: notificationType, isSeen: false },
    });
  }
}
