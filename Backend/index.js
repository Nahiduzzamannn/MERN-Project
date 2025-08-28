const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const {DbConnection} = require('./DB/connection');
DbConnection();
corsOptions={
    origin:'*',
    credentials:true,
  
};
app.use(express.json());
app.use(cors(corsOptions));
app.use(cors());


app.get("/home", (req,res)=>{
    res.send("Server is running...");
});




port=process.env.PORT ||8000;
app.listen(port,()=>{
    console.log(`Server is running on ${port}`);
})