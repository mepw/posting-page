export type CreatePostComment = {
    id: number;
    user_id: number;
    post_id: number;
    comment: string;
}

export type InsertedComment = {
  id: number;
  post_id: number; 
};