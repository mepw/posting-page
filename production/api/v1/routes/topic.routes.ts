import TopicController from "../controllers/topics.controller";
import { exec } from "../helpers/global.helper";
import { Router, Request, Response } from "express";
import { topicValidation } from '../validation/topic.validation';
const TopicRoute: Router = Router();


TopicRoute.post("/newtopic", exec(topicValidation), exec(TopicController.createPostTopic));

TopicRoute.get("/topic", exec(TopicController.getAllTopic));
TopicRoute.delete("/delete/:id", exec(TopicController.deleteTopic));


export default TopicRoute;
