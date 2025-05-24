const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser'); 

const path = require('path');
const app = express();
app.use(express.static(path.join(__dirname, 'public')));

const PORT = 4000;

app.use(cors());
app.use(bodyParser.json())

app.use('/api/products', require('./routes/products'));

app.listen(PORT, ()=>{
    console.log("Server is running on http://localhost:"+PORT);
})