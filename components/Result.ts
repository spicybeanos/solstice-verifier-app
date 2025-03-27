export interface Result<T,E>{
    success:boolean;
    result:T;
    error:E;
}