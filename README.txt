Write a nodejs program that will run on a 1 second interval. The program must read from the site_data table and write the aggregate power for each dsu_id into a dsu_data table.

Methodology
Mysql npm module was used in the program which is also a driver for mysql. To start a connection requires configuration which was done by providing details such as credentials, host, etc. and then the connection was opened.
Firstly, a check for database named mydb was done using the query SHOW DBS. If database doesn�t exists, database was created using the query CREATE DATABASE mydb. After creating the database, the second step was to create a table named site_data and insert data into it by using SQL queries CREATE AND INSERT. So, the method named create_site_data creates and inserts data into the table.
The third step was to create a new table named dsu_data which was performed by the method name create_dsu_data. 
To calculated the total power per dsu_id a method named calculatepower() was written and the following procedure was followed.
�	A SQL query was executed to get the distinct dsu_ids and was stored into an array. SELECT distinct dsu_id FROM site_data;
�	Then the array was iterated over and another query was executed to calculate aggregrate power using SUM method per dsu_id. SELECT dsu_id,sum(power) as power FROM site_data where dsu_id= .
�	Now, after each iteration the result of the above query was written to the table dsu_data by the method writepower() which executed the following SQL query  INSERT INTO dsu_data (dsu_id,total_power) VALUES (1, 909 ).
All these queries were wrapped inside a setInterval method which executes the code inside after a regular interval which was set to 1 second. The code is properly commented to understand the flow and the things related to it.
To execute the project requires installing of npm modules using npm i and node server.js


 
CODE :
The main functions or methods in the code.
Method create_site_data

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
This method creates a new table named site_data and inserts data into it.

Method create_dsu_data


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
    
To create a new table dus_data having columns as dsu_id and power.

Method calculatepower
To calculate the power per dus_id and it calls the method writepower method to write agggregrate power per id.
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


Method writepower
This method takes two paramters such as dsu_id , power and inserts it into the table dsu_data.

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

