import { PaginationDto } from "../../../data/pagination";
import { NotFound } from "../../../utilities/http-error";
import { UserId } from "../../user/model/user-user-id";
import { UserService } from "../../user/user.service";
import { ShowPosts } from "../model/post.model";
import { PostService } from "../post.service";
import { IBookmarkRepository } from "./bookmark.repository";
import { CreateBookmarkDto } from "./dto/create-bookmark.dto";
import { DeleteBookmarkDto } from "./dto/delete-bookmark.dto";

export class BookmarkService {
  constructor(private bookmarkRepo: IBookmarkRepository) {}

  async createBookmark(
    dto: CreateBookmarkDto,
    userService: UserService,
    postService: PostService
  ): Promise<void> {
    if (!(await postService.findPostById(dto.postId))) {
      throw new NotFound("Post not found");
    }
    if (!(await userService.getUserBy(dto.userId))) {
      throw new NotFound("User not found");
    }

    await this.bookmarkRepo.create(dto);
  }

  async deleteBookmark(
    dto: DeleteBookmarkDto,
    userService: UserService,
    postService: PostService
  ): Promise<void> {
    if (!(await postService.findPostById(dto.postId))) {
      throw new NotFound("Post not found");
    }
    if (!(await userService.getUserBy(dto.userId))) {
      throw new NotFound("User not found");
    }

    await this.bookmarkRepo.delete(dto);
  }

  async getBookmarks(
    authenticatedId: UserId,
    paginationDto: PaginationDto
  ): Promise<ShowPosts> {
    return await this.bookmarkRepo.userBookmarks(
      authenticatedId,
      paginationDto
    );
  }
}
