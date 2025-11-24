import TopicController from "../controllers/topics.controller";
import { exec } from "../helpers/global.helper";
import { Router, Request, Response } from "express";
import { authenticatorHandler } from "../middlewares/authenticator.middleware"
import { topicValidation } from '../validation/topic.validation';
const TopicRoute: Router = Router();


TopicRoute.post("/newtopic", exec(authenticatorHandler), exec(topicValidation), exec(TopicController.createPostTopic));

TopicRoute.get("/topic", exec(authenticatorHandler), exec(TopicController.getAllTopic));

export default TopicRoute;
