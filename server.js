const app = require("./app")

const port = 4000;
process.on("uncaughtException",(err)=>{
    console.log("error", err.message)
    process.exit(1);
} ) 

const server = app.listen(port, ()=>{
    console.log("Server is runing............ .")
})
// unhandle Promise Rejection 
process.on("unhandledRejection",(err)=>{
    console.log("erro:", err.message );
    server.close(()=>{
        process.exit(1);
    })
})