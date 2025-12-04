import { Application } from "express";
import { authenticatorHandler } from "../middlewares/authenticator.middleware";
import UnauthRoute from "../routes/unauth.routes";
import UserRoute from "../routes/user.routes";
import PostRoute from "./user_post.routes";
import CommentRoute from "./user_comment.routes";
import TopicRoute from "../routes/topic.routes";
import SubTopicRoute from "../routes/sub_topic.routes";
import NotificationRoute from "../routes/notification.routes";

export default (App: Application) => {
    App.use(`/api/v1/unauth`, UnauthRoute);
    App.use(authenticatorHandler);
    App.use(`/api/v1/user`, UserRoute);
    App.use(`/api/v1/post`, PostRoute);
    App.use(`/api/v1/comment`, CommentRoute);
    App.use(`/api/v1/topic`, TopicRoute);
    App.use(`/api/v1/subtopic`, SubTopicRoute);
    App.use(`/api/v1/notifications`, NotificationRoute);
}
