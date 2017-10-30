const express = require('express')
const app = express()
const port = 3000

var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  acquireTimeout: 1000000
});
var x=0;
app.get('/', (request, response) => {
  response.send('<h1>Hello from Express!</h1>')
})


setInterval(function(){
    console.log('CALCULATING POWER AND WRITING TO TABLE DSU AFTER 1S INTERVAL');

    if(x>0)
        {
            con.destroy();
            con = mysql.createConnection({
                host: "localhost",
                user: "root",
                password: "root",
                acquireTimeout: 1000000
            });
    }
    x++;

con.connect(function(err) {                // Creating a Mysql connection
    if (err) {
        console.log('Connection exists');
      
    }
    console.log("Connected!");
    con.query("SHOW DATABASES", function (err, result) {
      if (err) 
        {
          console.log('Error occured or Connection Timeout restart server');
        }
      else
      {
      var db = false;
      for(var row of result) {      // Check if database exists
              var name = row.Database;
              if(name == "mydb"){
                  console.log("Database exist");
                  db = true;
                  break;
                  }
          }
       
          if(db == false)
            {
          con.query("CREATE DATABASE mydb", function (err, result) {    // Create Db named mydb
              if (err) throw err;
              else
             {
              console.log("Database created");
              con = mysql.createConnection({
                host: "localhost",
                user: "root",
                password: "root",
                database : "mydb"
              });
              create_site_data(function(status){  // Create table site_data and insert data
                console.log('here', status);
                if(status == "Data already exists in table site_data")
                    console.log("Data already exists in table site_data");
                else{
               
                    create_dsu_data(function(status1){
                        
                    if(status1 == "Table exists or error occured" || "Table created dsu_data" )
                    {
                       calculatepower(function(data){
                        console.log("Records inserted into dsu_data");
                     })
                     }
                        })
                }
              });     
            }
          });
        }
        else {
            con = mysql.createConnection({
                host: "localhost",
                user: "root",
                password: "root",
                database : "mydb"
              });
            create_site_data(function(status){ // Create table site_data and insert data
                if(status == "Data already exists in table site_data")
                    console.log("Data already exists in table site_data");
                else{
                  
                    create_dsu_data(function(status1){

                        if(status1 == "Table exists or error occured" || "Table created dsu_data" )
                        {
                            calculatepower(function(data){
                              
                                    console.log("Record inserted into dsu_data");
                            })
                
                        }
                    })
                }
            });          
        }

        }
    });
  });


  
},1000);



function create_site_data(callback)
{
      
var sql = "CREATE TABLE site_data (site_id int,power int, dsu_id int )"; // Create table site_data
    con.query(sql, function (err, result) {
        if (err){
            console.log("Table site_data exists");
        } 
        else
        {
             console.log("Table site_data created");
        }

        // Insert data into table
         var values = [[1,234,1],[2,443,1],[3,232,1],[4,111,2]];
        var query= "";
        var x=0;
                    query = query + "INSERT INTO site_data (site_id, power,dsu_id) VALUES ?";
                  //  console.log(query[i]);
                  console.log(query);
                    con.query(query,[values], function (err, result) {
                        if (err){
                            console.log(err);
                            callback("Data already exists in table site_data");
                        }
                        else{
                     callback("Number of records inserted: " + result.affectedRows);
                        }
                    });
                
    });
}
 
function create_dsu_data(callback){
 
      var sql = "CREATE TABLE dsu_data (dsu_id int, total_power int)"; // Create table dsu_data
      con.query(sql, function (err, result) {
          if (err){
          
                callback("Table exists or error occured");
          }
          else
              {
                callback("Table created dsu_data");
              }
      });
    }
    
function calculatepower(callback)
 {

    var sql = "SELECT distinct dsu_id FROM site_data;"; // Select distinct id from site_data
    var dsu_ids=[];
    con.query(sql, function (err, result) {
        if (err){
            console.log("Table doesnt exists" , err);
        }
        else {
            var x=0;
            for(var row of result)      // Iterate the result for the above query
            {
                dsu_ids.push(row.dsu_id);          //Store distinct ids in an array
            }
            var query1="DELETE FROM dsu_data;";
            con.query(query1, function (err, result) {
                if (err)
                    console.log(err);
            for(var id of dsu_ids)
            {
               var query = "SELECT dsu_id,sum(power) as power FROM site_data where dsu_id="+ id;
               // Query to calculate total power per dsu_id
              
                con.query(query, function (err, result) {
                    if (err) 
                        console.log('Failed to read Table site_data');
                    writepower(result[0].dsu_id,result[0].power, function(data){
                        if(data == "Record inserted")
                            callback("Record inserted");
                    }
                    );
                  });
                
            }      
        });
                  
        }
    });   
}


function writepower(dsu_id,total_power,callback)
{        // Writing or inserting total power per id into table
      // Write data to table after 1 s interval
      var status ="";
    
      query = "INSERT INTO dsu_data (dsu_id,total_power) VALUES (" + dsu_id +"," + 
      total_power+ ")";  // Query to write power into dsu_data table
      con.query(query, function (err, result) {
          if (err) {
            status = "error occured";
            callback(status);
          }
          status = "Record inserted";
          callback(status);
        });
    
}

app.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
})