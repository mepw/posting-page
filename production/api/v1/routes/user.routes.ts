import { Router } from "express";
import { exec } from "../helpers/global.helper";
import UserController from "../controllers/users.controller"

const AuthRoute: Router = Router();
AuthRoute.get("/user", exec(UserController.getUserId));
AuthRoute.post("/logout", exec(UserController.logOutUser));
AuthRouteq.post("/refresh", exec(UserController.refreshToken));
export default AuthRoute;