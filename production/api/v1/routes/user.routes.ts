import { Router } from "express";
import { exec } from "../helpers/global.helper";
import UserController from "../controllers/users.controller"

const AuthRoute: Router = Router();
AuthRoute.get("/user", exec(UserController.getUser));


export default AuthRoute;