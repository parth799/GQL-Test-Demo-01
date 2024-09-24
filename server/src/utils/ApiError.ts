function ApiError(message:string, statusCode:Number) {
    const instance:any = new Error(message);
  
    instance.statusCode = statusCode;
  console.log("statusCode", );
  
    Object.setPrototypeOf(instance, ApiError.prototype);
  
    return instance;
  }
  
  ApiError.prototype = Object.create(Error.prototype);
  ApiError.prototype.constructor = ApiError;
  
  export default ApiError;
  