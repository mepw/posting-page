import CommentController from "../controllers/comments.controller";
import { exec } from "../helpers/global.helper";
import { } from "../validation/user.validation";
import { Router, Request, Response } from "express";
import {commentValidation} from "../validation/comment.validation";
const CommentRoute: Router = Router();


CommentRoute.post("/newcomment", exec(commentValidation), exec(CommentController.createComment));


export default CommentRoute;
