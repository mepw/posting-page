import AuthController from "../controllers/users.controller";
import { exec } from "../helpers/global.helper";
import { validateSignUpUser, validateVerifyLogin } from "../validation/user.validation";
import { Router, Request, Response } from "express";
import {authenticatorHandler} from "../middlewares/authenticator.middleware";
import Dashboard from "../controllers/users.controller"
import PostController from "../controllers/posts.controller";
import CommentController from "../controllers/comments.controller";

const UnAuthRoute: Router = Router();

UnAuthRoute.post("/signup", validateSignUpUser, exec(AuthController.userSignUp));
UnAuthRoute.post("/login", validateVerifyLogin, exec(AuthController.userLogIn));

export default UnAuthRoute;
