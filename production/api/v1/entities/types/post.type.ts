export type CreatePostType = {
    id?: number;
    user_id: number;
    title: string;
    description: string;
    post_topic_id: number | null;    
    post_sub_topic_id?: number | null;
    post_id: number
}


export type DeletePostType = {
    id: number;
    user_id: number;
};

export type UpdatePostType = {
    id: number;
    title?: string;
    description?: string;
};

export interface UserPostResult {
    post_id: number;
    title: string;
    description: string;
    post_user_first_name: string;
    post_user_last_name: string;
    comment_id: number | null;
    comment_text: string | null;
    comment_user_first_name: string | null;
}
