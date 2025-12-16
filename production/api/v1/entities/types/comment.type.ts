export type CreatePostComment = {
    id: number;
    user_id: number;
    post_id: number;
    comment: string;
    last_name: string;
    first_name: string;
    title: string;
}

export type InsertedComment = {
  id: number;
  post_id: number; 
};