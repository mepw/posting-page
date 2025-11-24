import PostController from "../controllers/posts.controller";
import { exec } from "../helpers/global.helper";
import { } from "../validation/user.validation";
import { Router, Request, Response } from "express";
import { authenticatorHandler  } from "../middlewares/authenticator.middleware";
import {postValidation} from "../validation/post.validation"
const PostRoute: Router = Router();

PostRoute.post("/newpost", exec(authenticatorHandler),exec(postValidation), exec(PostController.createPost));
PostRoute.get("/post", exec(authenticatorHandler), exec(PostController.getAllPost));
PostRoute.put("/edit/:id", exec(authenticatorHandler), exec(PostController.updatePost));
PostRoute.delete("/delete/:id", exec(authenticatorHandler), exec(PostController.deletePost));
export default PostRoute;
