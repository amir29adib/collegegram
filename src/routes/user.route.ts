import { Router } from "express";
import { UserService } from "../modules/user/user.service";
import { toUsername, Username } from "../modules/user/model/user-username";
import { EditProfileDto } from "../modules/user/dto/edit-profile.dto";
import { MBToBytes, uploadSingleFile } from "../utilities/upload";
import { PositiveInt } from "../data/int";
import { MediaService } from "../modules/media/media.service";
import { NoneEmptyString } from "../data/non-empty-string";
import { imageMIMEs, MIME } from "../modules/media/field-types/mime";
import { handleExpress } from "../utilities/handle-express";
import { UserId } from "../modules/user/model/user-user-id";
import { PostService } from "../modules/post/post.service";
import { date } from "zod";

export const makeUserRouter = (
  userService: UserService,
  mediaService: MediaService,
  postService: PostService
) => {
  const app = Router();

  app.patch(
    "/profile",
    uploadSingleFile(
      "users/avatar",
      "avatar",
      imageMIMEs,
      MBToBytes(5 as PositiveInt)
    ),
    async (req, res, next) => {
      try {
        const dto = EditProfileDto.parse(req.body);
        if (req.file) {
          const avatar = await mediaService.create({
            name: req.file.filename as NoneEmptyString,
            mime: req.file.mimetype as MIME,
            size: req.file.size,
            path: req.file.path,
          });
          await userService.updateAvatar(req.user, avatar);
        }
        await userService.editProfile(req.user, dto);
        res.json({ ok: true, data: {} });
      } catch (e) {
        next(e);
      }
    }
  );

  app.get("/profile", (req, res) => {
    const username = (req.query.username as Username) ?? req.user.username;
    handleExpress(res, () =>
      userService.userProfile(username, req.user, postService)
    );
  });

  app.get("/:username", (req, res) => {
    const username: Username = toUsername(req.params.username);
    const user = userService.findByUsername(username);
    res.status(200).send(user);
  });

  app.post("/follow/:followingId", async (req, res, next) => {
    try {
      await userService.followUser(
        req.user.id,
        req.params.followingId as UserId
      );
      res.status(200).json({ ok: true, data: {} });
    } catch (e) {
      next(e);
    }
  });

  app.delete("/unfollow/:followingId", async (req, res, next) => {
    try {
      await userService.unfollowUser(
        req.user.id,
        req.params.followingId as UserId
      );
      res.status(200).json({ ok: true, data: {} });
    } catch (e) {
      next(e);
    }
  });

  app.get("/:userId/followers", async (req, res) => {
    const userId: UserId = req.params.userId as UserId;
    try {
      const followers = await userService.getFollowers(userId);
      res.status(200).json({ ok: true, data: { followers } });
    } catch (error) {
      res
        .status(500)
        .json({ message: "مشکلی در دریافت لیست فالوورها رخ داد." });
    }
  });

  app.get("/:userId/followings", async (req, res) => {
    const userId: UserId = req.params.userId as UserId;
    try {
      const following = await userService.getFollowing(userId);
      res.status(200).json({ ok: true, data: { following } });
    } catch (error) {
      res
        .status(500)
        .json({ message: "مشکلی در دریافت لیست فالویینگ‌ها رخ داد." });
    }
  });
  return app;
};
