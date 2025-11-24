import { subTopicValidation } from './../validation/sub_topic.validation';
import SubTopic from "../controllers/sub_topics.controller";
import { exec } from "../helpers/global.helper";
import { Router, Request, Response } from "express";
import { authenticatorHandler } from "../middlewares/authenticator.middleware"
import {commentValidation} from "../validation/comment.validation";
const SubTopicRoute: Router = Router();


SubTopicRoute.post("/newsubtopic", exec(authenticatorHandler),exec(subTopicValidation), exec(SubTopic.CreateSubTopic));
SubTopicRoute.get("/subtopic", exec(authenticatorHandler), exec(SubTopic.getAllSubTopic));

export default SubTopicRoute;
