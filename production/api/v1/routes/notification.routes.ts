import notificiations from "../controllers/notifications.controller";
import { NotificationsValidation } from "../validation/notification.validation";
import { exec } from "../helpers/global.helper";
import { Router, Request, Response } from "express";

const NotificationRoute: Router = Router();

NotificationRoute.get("/notifications", exec(notificiations.getAllNotifications));
NotificationRoute.get("/notifications", exec(NotificationsValidation), exec(notificiations.getNotificationByUserId));
export default NotificationRoute;

