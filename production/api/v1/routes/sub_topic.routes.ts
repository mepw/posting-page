import { subTopicValidation } from './../validation/sub_topic.validation';
import SubTopic from "../controllers/sub_topics.controller";
import { exec } from "../helpers/global.helper";
import { Router, Request, Response } from "express";
const SubTopicRoute: Router = Router();


SubTopicRoute.post("/newsubtopic",exec(subTopicValidation), exec(SubTopic.CreateSubTopic));
SubTopicRoute.get("/subtopic", exec(SubTopic.getAllSubTopic));

export default SubTopicRoute;
