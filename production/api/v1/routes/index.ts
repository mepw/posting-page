/* Vendors modules */
import { Application } from 'express';

import { authenticatorHandler } from '../middlewares/authenticator.middleware';
import { authenticatorWithExempt } from "../middlewares/authenticator.middleware";

/* Constants */
import { API } from '../../../configs/constants/env.constant'
import UnauthRoute from '../routes/unauth.routes';
import UserRoute from '../routes/user.routes';
import PostRoute from './user_post.routes';
import CommentRoute from './user_comment.routes'
import TopicRoute from '../routes/topic.routes'
import SubTopicRoute from '../routes/sub_topic.routes';
/* Routes */

export default (App: Application) => {
    /* All Public routes should added in 1 single route file */
    App.use(`/api/v1/unauth`, UnauthRoute);

    /* Authentication handler */
    // App.use(authenticatorHandler); 
    App.use(authenticatorWithExempt);
    /* Add your protected routes here */
    App.use(`/api/v1/user`, UserRoute);
    App.use(`/api/v1/post`, PostRoute);
    App.use(`/api/v1/comment`, CommentRoute);
    App.use(`/api/v1/topic`, TopicRoute);
    App.use(`/api/v1/subtopic`, SubTopicRoute);
}

