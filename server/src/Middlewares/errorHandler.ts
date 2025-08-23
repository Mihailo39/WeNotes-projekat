export function errorHandler(err:any, _req:any, res:any, _next:any){
  console.error(err);
  const status = err.statusCode || 500;
  res.status(status).json({ message: err.message || "Internal Server Error" });
}