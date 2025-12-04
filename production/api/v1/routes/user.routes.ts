import { Router } from "express";
import { exec } from "../helpers/global.helper";
import UserController from "../controllers/users.controller"
import { validateSignUpUser } from "../validation/user.validation";
const AuthRoute: Router = Router();
AuthRoute.get("/user", exec(UserController.getUserId));
AuthRoute.post("/logout", exec(UserController.logOutUser));
AuthRoute.put("/edit/:id", validateSignUpUser, exec(UserController.editUserDetails));
AuthRoute.get("/all", exec(UserController.getAllUser));
export default AuthRoute;