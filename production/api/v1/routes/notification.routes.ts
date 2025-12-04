import { Router } from "express";
import { exec } from "../helpers/global.helper";
import notificiations from "../controllers/notifications.controller";

const NotificationRoute: Router = Router();

NotificationRoute.get("/notifications", exec(notificiations.getAllNotifications));

export default NotificationRoute;