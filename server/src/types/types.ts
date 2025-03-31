export interface ApiResponse<T>{
    success?:boolean;
    message?:string;
    data?:T;
    error?:string | object
}

export const successResponse=<T>(message?:string,data?:T):ApiResponse<T>=>(
    {
        success:true,
        message,
        data
    }
)

export const errorResponse=(message?:string,error?:string | object):ApiResponse<never>=>({
    success:false,
    message,
    error
})