import CommentController from "../controllers/comment.controller";
import { exec } from "../helpers/global.helper";
import { } from "../validation/user.validation";
import { Router, Request, Response } from "express";
import { authenticatorHandler } from "../middlewares/authenticator.middleware"
const CommentRoute: Router = Router();


CommentRoute.post("/newcomment", exec(authenticatorHandler), exec(CommentController.createComment));


export default CommentRoute;
