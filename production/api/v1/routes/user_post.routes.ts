import PostController from "../controllers/post.controller";
import { exec } from "../helpers/global.helper";
import { } from "../validation/user.validation";
import { Router, Request, Response } from "express";
import { authenticatorHandler } from "../middlewares/authenticator.middleware"
const PostRoute: Router = Router();

PostRoute.post("/newpost", exec(authenticatorHandler),exec(PostController.createPost));
PostRoute.get("/post", exec(authenticatorHandler), exec(PostController.getAllPost));


export default PostRoute;
