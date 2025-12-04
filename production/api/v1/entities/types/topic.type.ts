export type CreateTopic = {
    id: number;
    user_id: number;
    name: string;
}


export type DeleteTopicType = {
    topic_id: number | string;
    user_id: number;
};
