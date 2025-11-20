import { Router } from "express";
import { exec } from "../helpers/global.helper";
import { paramsValidator } from "../middlewares/params_validator.middleware";
import { authenticatorHandler } from "../middlewares/authenticator.middleware"
import UserController from "../controllers/user.controller"

// import { signinSchema } from "../validations/auth.validation.schema";

const AuthRoute: Router = Router();
// All routes in unauth routes use exec() wrapper
// AuthRoute.post("/signup", exec(AuthController.signup));
// AuthRoute.post("/signin", exec(AuthController.signin));

// // Protected routes also use exec() - authentication enforced by route position

AuthRoute.get("/user", exec(authenticatorHandler), exec(UserController.getUser));

// UserRoute.post(
//     "/update-email",
//     // exec(paramsValidator(emailSchema)),
//     exec(UserController.updateEmail)
// );


export default AuthRoute;