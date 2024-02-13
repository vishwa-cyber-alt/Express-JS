var express = require('express');
var app = express();
var path = require('path'); 

app.get('/vishwa', function (req, res) {
  res.send('Hello World!'); 
});
app.get('/error',function(req,res){
  res.send('not found');
});

app.get('/clock', (req, res) => {
    res.sendFile(path.join(__dirname, 'clock.html'));
});

app.get('/404', (req, res) => {
  res.sendFile(path.join(__dirname, '404.html'));
});

app.listen(3000, function () {
  console.log('Vishwa your Server is Running on port 3000!');
});
