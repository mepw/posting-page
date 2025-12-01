import { Application } from "express";
import { authenticatorHandler } from "../middlewares/authenticator.middleware";
import UnauthRoute from "../routes/unauth.routes";
import UserRoute from "../routes/user.routes";
import PostRoute from "./user_post.routes";
import CommentRoute from "./user_comment.routes";
import TopicRoute from "../routes/topic.routes";
import SubTopicRoute from "../routes/sub_topic.routes";

export default (App: Application) => {
    App.use(`/api/v1/unauth`, UnauthRoute);
    App.use(`/api/v1/user`, authenticatorHandler, UserRoute);
    App.use(`/api/v1/post`, authenticatorHandler, PostRoute);
    App.use(`/api/v1/comment`, authenticatorHandler, CommentRoute);
    App.use(`/api/v1/topic`, authenticatorHandler, TopicRoute);
    App.use(`/api/v1/subtopic`, authenticatorHandler, SubTopicRoute);
}
