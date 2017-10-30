const express = require('express')
const app = express()
const port = 3000

var mysql = require('mysql');

var con = mysql.createConnection({     // This program uses the express middleware and contains various routes to perform specific operations
  host: "localhost",
  user: "root",       
  password: "root"
});

con.connect(function(err) {                // Creating a Mysql connection
  if (err) throw err;
  console.log("Connected!");
  con.query("SHOW DATABASES", function (err, result) {
    if (err) 
        console.log('Error occured');
    var db = false;
    for(var row of result)       // Check if database exists
        {
            var name = row.Database;
            if(name == "mydb")
                {
                console.log("Database exist");
                db = true;
                break;
                }
        }
        if(db == false)
        con.query("CREATE DATABASE mydb", function (err, result) {    // Create Db named mydb
            if (err) throw err;
            console.log("Database created");
        });
  });
});

app.get('/', (request, response) => {
  response.send('<h1>Hello from Express!</h1>')
})

app.get('/createdata', (req, res) => {
    con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "root",
        database : "mydb"
      });
var sql = "CREATE TABLE site_data (site_id int,power int, dsu_id int)"; // Create table site_data
    con.query(sql, function (err, result) {
        if (err){
            console.log("Table exists");
            res.send('Table exists');
        }
        else
            {
        console.log("Table created");
        res.send('Table Created');
            }
    });
    var site_id = [1,2,3,4];    // Insert data into table
    var power = [234,443,232,111];
    var dsu_id = [1,1,1,2];
    var query= [];
    for(var i=0; i< 4;i++)
    {
        query[i] = "INSERT INTO site_data (site_id, power,dsu_id) VALUES (" + site_id[i] +"," + 
        power[i] + "," + dsu_id[i] + ")";
        console.log(query[i]);
        con.query(query[i], function (err, result) {
            if (err) throw err;
            console.log("1 record inserted");
          });
    }
})


app.get('/writedata', (req, res) => {
    con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "root",
        database : "mydb"
      });
      var sql = "CREATE TABLE dsu_data (dsu_id int, total_power int)"; // Create table dsu_data
      con.query(sql, function (err, result) {
          if (err){
              console.log("Table exists");
              res.send('Table exists');
          }
          else
              {
          console.log("Table created");
          res.send('Table Created');
              }
      });
    
 
    var sql = "SELECT distinct dsu_id FROM site_data;"; // Select distinct id from site_data
    var dsu_ids=[];
    con.query(sql, function (err, result) {
        if (err){
            console.log("Table doesnt exists");
        }
        else
        {
            var x=0;
            for(var row of result)
            {
                dsu_ids.push(row.dsu_id);          //Store ids in an array
            }
            console.log(dsu_ids.length);
            for(var i=0; i< dsu_ids.length;i++)
            {
               var query = "SELECT dsu_id,sum(power) as power FROM site_data where dsu_id="+ dsu_ids[i];
               // Query to calculate total power per id
                con.query(query, function (err, result) {
                    if (err) throw err;
                    writepower(result[0].dsu_id,result[0].power, function(status){
                        console.log(status);
                    }
                    );
                  });
                
            }
        }
    });   
});

function writepower(dsu_id,total_power,callback)
{        // Writing or inserting total power per id into table

    setInterval(function()       // Write data to table after 1 s interval
    {
    con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "root",
        database : "mydb"
      });
      var status ="";
      query = "INSERT INTO dsu_data (dsu_id,total_power) VALUES (" + dsu_id +"," + 
      total_power+ ")";
      con.query(query, function (err, result) {
          if (err) {
            status = "error occured";
            callback(status);
          }
          console.log("1 record inserted");
          status = "1 record inserted";
          callback(status);
        });
   
   
    }, 1000);

}

app.get('/read', (req, res) => {
    con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "root",
        database : "mydb"
      });

    var sql = "SELECT * FROM dsu_data;"; // View table dsu
    var dsu_ids=[];
    con.query(sql, function (err, result) {
        if (err){
            console.log("Table doesnt exists");
        }
        else
        {
            var x=0;
            var str ="";
            for(var row of result)
            {
                str  = str + "{ dsu_id : "+ row.dsu_id +", total_power:" +row.total_power+ "} " ;               
            }
            console.log(str);
            res.json(str);
           
        }
    });   
})


app.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
})