import CommentController from "../controllers/comment.controller";
import { exec } from "../helpers/global.helper";
import { } from "../validation/user.validation";
import { Router, Request, Response } from "express";
import { authenticatorHandler } from "../middlewares/authenticator.middleware"
import {commentValidation} from "../validation/comment.validation";
const CommentRoute: Router = Router();


CommentRoute.post("/newcomment", exec(authenticatorHandler),exec(commentValidation), exec(CommentController.createComment));


export default CommentRoute;
