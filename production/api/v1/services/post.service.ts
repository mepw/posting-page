import PostModel from "../models/post.model";
import { CreatePostType, UpdatePostType, DeletePostType } from "../entities/types/post.type";
import { ResponseDataInterface } from "../entities/interfaces/global.interface";
class UserPost extends PostModel {
    /**
     * DOCU: This function creates a new post record. 
     *       It validates the title, checks for duplicates, calls the PostModel to insert the post,
     *       and returns the created post along with status. 
     * Last updated at: Nov 20, 2025 
     * @param params - Object containing post data including title, description, and user_id
     * @returns response_data - JSON containing status, created post result, and/or error message
     * @author Keith
     */
    createPost = async (params: CreatePostType): Promise<ResponseDataInterface<CreatePostType>> => {
        const response_data: ResponseDataInterface<CreatePostType> = { status: false, error: null, result: undefined };

        try{
            const post_model = new PostModel();
            const { new_user_post } = await post_model.fetchModel<{ id: number }>({
                fields_to_select: `id`,
                where_params: `title = $1`,
                where_values: [params.title],
            });

            if(new_user_post.length){
                throw new Error("Post with this title already exists.");
            }

            const create_new_post = await post_model.createNewPost(params);

            if(!create_new_post){
               throw new Error("Failed to create post.");
            }
            else{
                response_data.status = true;
                response_data.result = create_new_post;
            }
        }
        catch(error){
            response_data.error = (error as Error).message || 'error in service create post';
        }

        return response_data;
    };

    /**
     * DOCU: This function retrieves all posts along with user and comment details. 
     *       It calls the PostModel to fetch the posts and returns them with status. 
     * Last updated at: Nov 20, 2025 
     * @returns response_data - JSON containing status, array of posts with user/comments, and/or error message
     * @author Keith
     */
    getAllPost = async (sort_option?: string): Promise<ResponseDataInterface<CreatePostType[]>> => {
        const response_data: ResponseDataInterface<CreatePostType[]> = {status: false,error: null,result: undefined };

        try{
            const post_model = new PostModel(); 
            let order_by = "posts.id DESC";

            if(sort_option === "title_asc"){
                order_by = "posts.title ASC";
            }
            else if(sort_option === "title_desc"){
                order_by = "posts.title DESC";
            }
            else if(sort_option === "date_asc"){
                order_by = "posts.id ASC";
            }
            else if(sort_option === "date_desc"){
                order_by = "posts.id DESC";
            }
            
            const post_result = await post_model.fetchModel<CreatePostType>({
                fields_to_select: `
                    posts.id AS post_id,
                    posts.user_id AS post_user_id,
                    posts.title,
                    posts.description,
                    topics.id AS topic_id,
                    topics.name AS topic_name,
                    sub_topics.id AS subtopic_id,   
                    sub_topics.name AS subtopic_name,
                    users.first_name AS post_user_first_name,
                    users.last_name AS post_user_last_name,
                    post_comments.id AS comment_id,
                    post_comments.comment AS comment_text,
                    comment_user.first_name AS comment_user_first_name,
                    comment_user.last_name AS comment_user_last_name
            `,
                join_statement: `
                    INNER JOIN user_stories.users ON posts.user_id = users.id
                    LEFT JOIN user_stories.post_comments ON posts.id = post_comments.post_id
                    LEFT JOIN user_stories.topics ON posts.topic_id = topics.id
                    LEFT JOIN user_stories.sub_topics ON posts.sub_topic_id = sub_topics.id
                    LEFT JOIN user_stories.users AS comment_user ON post_comments.user_id = comment_user.id
            `,
                order_by: order_by,
            });

            if(!post_result.new_user_post.length){
                throw new Error("No posts found.");
            }
            else{
                response_data.status = true;
                response_data.result = post_result.new_user_post;
            }
        }
        catch(error){
            response_data.error = (error as Error).message || 'error in service get all posts';
        }

        return response_data;
    };

    /**
     * DOCU: This function updates an existing post. 
     *       It constructs the updated post object, calls the PostModel to update the record,
     *       and returns the updated post along with status. 
     * Last updated at: Nov 20, 2025 
     * @param params - Object containing post ID, title, and description
     * @returns response_data - JSON containing status, updated post result, and/or error message
     * @author Keith
     */
    updatePost = async (params: UpdatePostType): Promise<ResponseDataInterface<UpdatePostType>> => {
        const response_data: ResponseDataInterface<UpdatePostType> = { status: false, error: null, result: undefined };

        try{
            const post_model = new PostModel();
            const update_post_result = await post_model.updateUserPost(
                `title = $1, description = $2, topic_id = $3, sub_topic_id = $4`,
                `id = $5`, 
                [params.title, params.description, params.post_topic_id, params.post_sub_topic_id], 
                [params.id]
            );

            if(!update_post_result){
                throw new Error("update not successful");
            }
            else{
                response_data.status = true;
                response_data.result = params;
            }
        }
        catch(error){
            response_data.error = (error as Error).message || 'error in service update post';
        }

        return response_data;
    };

    /**
     * DOCU: This function deletes a post by ID. 
     *       It calls the PostModel to delete the post and returns a boolean result along with status. 
     * Last updated at: Nov 20, 2025 
     * @param params - Object containing post ID
     * @returns response_data - JSON containing status, deletion result (true/false), and/or error message
     * @author Keith
     */
    deleteUserPost = async (params: DeletePostType): Promise<ResponseDataInterface<boolean>> => {
        const response_data: ResponseDataInterface<boolean> = { status: false, error: null, result: undefined };

        try{
            const post_model = new PostModel();
            const delete_result = await post_model.deletePost(
                `id = $1`,
                [params.id]
            );
            
            if(!delete_result){
                throw new Error("Failed to delete post.");
            }
            else{
                response_data.status = true;
                response_data.result = delete_result;
            }
        }
        catch(error){
            response_data.error = (error as Error).message || 'error in service delete post';
        }

        return response_data;
    };
}

export default UserPost;
