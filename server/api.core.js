const fs = require('fs');
const express = require("express");
const cors = require('cors')
const { spawn } = require("child_process");
const { exec } = require('node:child_process');
var configData = JSON.parse(fs.readFileSync('./aws-exports.json'));

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json())

var workerList = [];
var workerLog = [];
var workloadStarted = false;

var operationTypeCatalog = ["SET","GET","RPUSH","ZADD","XADD"];
                                                                            

// AWS Variables
var AWS = require('aws-sdk');
AWS.config.update({region: configData.aws_region});
var elasticache = new AWS.ElastiCache();


// Security Variables
const jwt = require('jsonwebtoken');
var jwkToPem = require('jwk-to-pem');
var request = require('request');
var pems;
var issCognitoIdp = "https://cognito-idp." + configData.aws_region + ".amazonaws.com/" + configData.aws_cognito_user_pool_id;



// Startup - Download PEMs Keys
gatherPemKeys(issCognitoIdp);



//--################################################################################################################
//--------------------------------------------  SECURITY 
//--################################################################################################################

//-- Gather PEMs keys from Cognito
function gatherPemKeys(iss)
{

    if (!pems) {
        //Download the JWKs and save it as PEM
        return new Promise((resolve, reject) => {
                    request({
                       url: iss + '/.well-known/jwks.json',
                       json: true
                     }, function (error, response, body) {
                         
                        if (!error && response.statusCode === 200) {
                            pems = {};
                            var keys = body['keys'];
                            for(var i = 0; i < keys.length; i++) {
                                //Convert each key to PEM
                                var key_id = keys[i].kid;
                                var modulus = keys[i].n;
                                var exponent = keys[i].e;
                                var key_type = keys[i].kty;
                                var jwk = { kty: key_type, n: modulus, e: exponent};
                                var pem = jwkToPem(jwk);
                                pems[key_id] = pem;
                            }
                        } else {
                            //Unable to download JWKs, fail the call
                            console.log("error");
                        }
                        
                        resolve(body);
                        
                    });
        });
        
        } 
    
    
}


//-- Validate Cognito Token
function verifyTokenCognito(token) {

   try {
        //Fail if the token is not jwt
        var decodedJwt = jwt.decode(token, {complete: true});
        if (!decodedJwt) {
            console.log("Not a valid JWT token");
            return {isValid : false, session_id: ""};
        }
        
        
        if (decodedJwt.payload.iss != issCognitoIdp) {
            console.log("invalid issuer");
            return {isValid : false, session_id: ""};
        }
        
        //Reject the jwt if it's not an 'Access Token'
        if (decodedJwt.payload.token_use != 'access') {
            console.log("Not an access token");
            return {isValid : false, session_id: ""};
        }
    
        //Get the kid from the token and retrieve corresponding PEM
        var kid = decodedJwt.header.kid;
        var pem = pems[kid];
        if (!pem) {
            console.log('Invalid access token');
            return {isValid : false, session_id: ""};
        }

        const decoded = jwt.verify(token, pem, { issuer: issCognitoIdp });
        return {isValid : true, session_id: ""};
    }
    catch (ex) { 
        console.log("Unauthorized Token");
        return {isValid : false, session_id: ""};
    }
    
};



//--################################################################################################################
//--------------------------------------------  REDIS 
//--################################################################################################################

// Redis Variables
var historyMetrics = 50;


// Variables Model1
var workerObj1 = {};
var workerObj2 = {};
var workerLog1 = {};
var workerLog2 = {};




//--######################## STARTUP SECTION ###########################

// StartUp Function
initWorkloadRedisModel1();




//--######################## FUNCTION SECTION ###########################


// REDIS : Init Variables Model 1
function initWorkloadRedisModel1() {
    
    workerObj1 = {};
    workerObj2 = {};
    
    workerLog1['name'] = "";
    workerLog2['name'] = "";
    
    operationTypeCatalog.forEach(function(item) {
                workerLog1[item] = {
                    rps : Array(50).fill(null),
                    avg_latency_ms : Array(50).fill(null),
                    min_latency_ms : Array(50).fill(null),
                    p50_latency_ms : Array(50).fill(null),
                    p95_latency_ms : Array(50).fill(null),
                    p99_latency_ms : Array(50).fill(null),
                    max_latency_ms: Array(50).fill(null),
                    rpsTotal : 0,
                    eventsTotal : 0,
                    avgTotal : 0
                };
                
                workerLog2[item] = {
                    rps : Array(50).fill(null),
                    avg_latency_ms : Array(50).fill(null),
                    min_latency_ms : Array(50).fill(null),
                    p50_latency_ms : Array(50).fill(null),
                    p95_latency_ms : Array(50).fill(null),
                    p99_latency_ms : Array(50).fill(null),
                    max_latency_ms: Array(50).fill(null),
                    rpsTotal : 0,
                    eventsTotal : 0,
                    avgTotal : 0
                };
                
    });
    
}





// REDIS : Start Worker Model 1 - Node 1
async function startWorkerRedisModel1Node1(node1){

    var runId = formatDate(new Date())
    var cmdParameters;
    
    if (node1.customSettings =='false')
        cmdParameters = "-h " + node1.host + " -p " + node1.port + "  -c " + node1.clients + " -n " + String( 10 * parseFloat(node1.shards) * parseFloat(node1.randomize))  + " -r " + node1.randomize +  " -d " + node1.payload + "  -P " + node1.pipeline + " -t " + node1.opTypes + " -q --csv -l " + (node1.clusterMode == 'true' ? "--cluster" : "");
    else
        cmdParameters = "-h " + node1.host + " -p " + node1.port + "  " + node1.customCommand;
    
   
    //-- NODE1
    workerLog1.name = node1.id;
    workerObj1 = spawn("./redis-benchmark.sh", [cmdParameters, runId + "." + node1.id + ".1.csv"],{'detached':true});
    
    
    
    workerObj1.stdout.on("data", data1 => {
        
        var recordRaw1 = `${data1}`;
        if ( operationTypeCatalog.includes(recordRaw1.substring(1,4)) || operationTypeCatalog.includes(recordRaw1.substring(1,5)) || operationTypeCatalog.includes(recordRaw1.substring(1,6))  ){
            var record1 = recordRaw1.replaceAll('"','').replace(/[\r\n]+/gm, " ").split(",");
        
            workerLog1[record1[0]]['rpsTotal'] = workerLog1[record1[0]]['rpsTotal'] + parseFloat(record1[1]);
            workerLog1[record1[0]]['avgTotal'] = workerLog1[record1[0]]['avgTotal'] + parseFloat(record1[2]);
            workerLog1[record1[0]]['eventsTotal'] = workerLog1[record1[0]]['eventsTotal'] + 1;
            
            workerLog1[record1[0]]['rps'].push(parseFloat(record1[1]));
            workerLog1[record1[0]]['rps'] = workerLog1[record1[0]]['rps'].slice(workerLog1[record1[0]]['rps'].length - historyMetrics)
            
            workerLog1[record1[0]]['avg_latency_ms'].push(parseFloat(record1[2]));
            workerLog1[record1[0]]['avg_latency_ms'] = workerLog1[record1[0]]['avg_latency_ms'].slice(workerLog1[record1[0]]['avg_latency_ms'].length - historyMetrics)
            
            workerLog1[record1[0]]['min_latency_ms'].push(parseFloat(record1[3]));
            workerLog1[record1[0]]['min_latency_ms'] = workerLog1[record1[0]]['min_latency_ms'].slice(workerLog1[record1[0]]['min_latency_ms'].length - historyMetrics)
            
            workerLog1[record1[0]]['p50_latency_ms'].push(parseFloat(record1[4]));
            workerLog1[record1[0]]['p50_latency_ms'] = workerLog1[record1[0]]['p50_latency_ms'].slice(workerLog1[record1[0]]['p50_latency_ms'].length - historyMetrics)
            
            workerLog1[record1[0]]['p95_latency_ms'].push(parseFloat(record1[5]));
            workerLog1[record1[0]]['p95_latency_ms'] = workerLog1[record1[0]]['p95_latency_ms'].slice(workerLog1[record1[0]]['p95_latency_ms'].length - historyMetrics)
            
            workerLog1[record1[0]]['p99_latency_ms'].push(parseFloat(record1[6]));
            workerLog1[record1[0]]['p99_latency_ms'] = workerLog1[record1[0]]['p99_latency_ms'].slice(workerLog1[record1[0]]['p99_latency_ms'].length - historyMetrics)
            
            workerLog1[record1[0]]['max_latency_ms'].push(parseFloat(record1[7]));
            workerLog1[record1[0]]['max_latency_ms'] = workerLog1[record1[0]]['max_latency_ms'].slice(workerLog1[record1[0]]['max_latency_ms'].length - historyMetrics)
            
        }
            
    });
    
    
    workerObj1.stderr.on("data", data => {
        console.log(`stderr: ${data}`);
    });
    
    workerObj1.on('error', (error) => {
        console.log(`error: ${error.message}`);
    });
    
    workerObj1.on("close", code => {
        console.log(`child process exited with code ${code}`);
    });
    
    console.log("ProcessId : " + String(workerObj1.pid) + " has been started ");
    
    
}



async function startWorkerRedisModel1Node2(node2){

    var runId = formatDate(new Date())
    var cmdParameters;
    

    //-- NODE2
    workerLog2.name = node2.id;
    
    if (node2.customSettings =='false')
        cmdParameters = "-h " + node2.host + " -p " + node2.port + "  -c " + node2.clients + " -n " + String( 10 * parseFloat(node2.shards) * parseFloat(node2.randomize))  + " -r " + node2.randomize +  " -d " + node2.payload + "  -P " + node2.pipeline + " -t " + node2.opTypes + " -q --csv -l " + (node2.clusterMode == 'true' ? "--cluster" : "");
    else
        cmdParameters = "-h " + node2.host + " -p " + node2.port + "  " + node2.customCommand;

    workerObj2 = spawn("./redis-benchmark.sh", [cmdParameters,runId + "." + node2.id + ".2.csv"],{'detached':true});
    workerObj2.stdout.on("data", data => {
        
        var recordRaw = `${data}`;
        
        if ( operationTypeCatalog.includes(recordRaw.substring(1,4)) || operationTypeCatalog.includes(recordRaw.substring(1,5)) || operationTypeCatalog.includes(recordRaw.substring(1,6))  ){
            var record = recordRaw.replaceAll('"','').replace(/[\r\n]+/gm, " ").split(",");
            
            workerLog2[record[0]]['rpsTotal'] = workerLog2[record[0]]['rpsTotal'] + parseFloat(record[1]);
            workerLog2[record[0]]['avgTotal'] = workerLog2[record[0]]['avgTotal'] + parseFloat(record[2]);
            workerLog2[record[0]]['eventsTotal'] = workerLog2[record[0]]['eventsTotal'] + 1;
            
                    
            workerLog2[record[0]]['rps'].push(parseFloat(record[1]));
            workerLog2[record[0]]['rps'] = workerLog2[record[0]]['rps'].slice(workerLog2[record[0]]['rps'].length - historyMetrics)
            
            workerLog2[record[0]]['avg_latency_ms'].push(parseFloat(record[2]));
            workerLog2[record[0]]['avg_latency_ms'] = workerLog2[record[0]]['avg_latency_ms'].slice(workerLog2[record[0]]['avg_latency_ms'].length - historyMetrics)
            
            workerLog2[record[0]]['min_latency_ms'].push(parseFloat(record[3]));
            workerLog2[record[0]]['min_latency_ms'] = workerLog2[record[0]]['min_latency_ms'].slice(workerLog2[record[0]]['min_latency_ms'].length - historyMetrics)
            
            workerLog2[record[0]]['p50_latency_ms'].push(parseFloat(record[4]));
            workerLog2[record[0]]['p50_latency_ms'] = workerLog2[record[0]]['p50_latency_ms'].slice(workerLog2[record[0]]['p50_latency_ms'].length - historyMetrics)
            
            workerLog2[record[0]]['p95_latency_ms'].push(parseFloat(record[5]));
            workerLog2[record[0]]['p95_latency_ms'] = workerLog2[record[0]]['p95_latency_ms'].slice(workerLog2[record[0]]['p95_latency_ms'].length - historyMetrics)
            
            workerLog2[record[0]]['p99_latency_ms'].push(parseFloat(record[6]));
            workerLog2[record[0]]['p99_latency_ms'] = workerLog2[record[0]]['p99_latency_ms'].slice(workerLog2[record[0]]['p99_latency_ms'].length - historyMetrics)
            
            workerLog2[record[0]]['max_latency_ms'].push(parseFloat(record[7]));
            workerLog2[record[0]]['max_latency_ms'] = workerLog2[record[0]]['max_latency_ms'].slice(workerLog2[record[0]]['max_latency_ms'].length - historyMetrics)
            
        }
            
    });
    
    
    workerObj2.stderr.on("data", data => {
        console.log(`stderr: ${data}`);
    });
    
    workerObj2.on('error', (error) => {
        console.log(`error: ${error.message}`);
    });
    
    workerObj2.on("close", code => {
        console.log(`child process exited with code ${code}`);
    });
    
    console.log("ProcessId : " + String(workerObj2.pid) + " has been started ");
    

    
}




// REDIS : Stop Worker Model 1
function stopWorkerRedisModel1(){
    
    try {
        workloadStarted = false;
        console.log("ProcessId : " + String(workerObj1.pid) + " has been stopped ");
        process.kill(-workerObj1.pid)
        console.log("ProcessId : " + String(workerObj2.pid) + " has been stopped ");
        process.kill(-workerObj2.pid)
        
    }
    catch(err){
        console.log(err);
    }
    
}


// REDIS : Stop Worker Model 2
function stopWorkerRedisModel2(){
    
    try {
        workloadStarted = false;
        console.log("ProcessId : " + String(workerObj1.pid) + " has been stopped ");
        process.kill(-workerObj1.pid);
        
    }
    catch(err){
        console.log(err);
    }
    
}



//--######################## API SECTION ###########################


//-- API : REDIS : Start Model - 1
app.get("/api/workload/redis/start/model/1/", async (req, res) => {

    // Token Validation
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);

    if (cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid"});
 
    const params = req.query;
    
    try {
            workloadStarted = true;
            initWorkloadRedisModel1();
            startWorkerRedisModel1Node1(params['srv01']);
            startWorkerRedisModel1Node2(params['srv02']);
            res.status(200).send("Workload has been started");
    }
    catch (err) {
        console.log(err);
        res.status(401).send("Workload has not been started");
    }
    
});



//-- API : REDIS : Start Model - 2
app.get("/api/workload/redis/start/model/2/", async (req, res) => {

    // Token Validation
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);

    if (cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid"});
 
    const params = req.query;
    
    try {
            workloadStarted = true;
            initWorkloadRedisModel1();
            startWorkerRedisModel1Node1(params['srv01']);
            res.status(200).send("Workload has been started");
    }
    catch (err) {
        console.log(err);
        res.status(401).send("Workload has not been started");
    }
    
});



//-- API : REDIS : Stop Model - 1
app.get("/api/workload/redis/stop/model/1/", async (req, res) => {
   
   // Token Validation
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);

    if (cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid"});
        
    try {
        workloadStarted = false;
        stopWorkerRedisModel1();
        res.status(200).send( { message : "Workload has been terminated" , status : { workloadStarted : workloadStarted } });
    }
    catch(err) {
        console.log(err);
        res.status(401).send("Workload has not been started");
    }
    
});


//-- API : REDIS : Stop Model - 2
app.get("/api/workload/redis/stop/model/2/", async (req, res) => {
   
   // Token Validation
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);

    if (cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid"});
        
    try {
        workloadStarted = false;
        stopWorkerRedisModel2();
        res.status(200).send( { message : "Workload has been terminated" , status : { workloadStarted : workloadStarted } });
    }
    catch(err) {
        console.log(err);
        res.status(401).send("Workload has not been started");
    }
    
});


//-- API : REDIS : Status Process Model 1
app.get("/api/workload/redis/terminate/model/1/", async (req, res) => {
    
    // Token Validation
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);

    if (cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid"});
        
    try {
            workloadStarted = false;
            exec("for pid in $(ps -ef | awk '/benchmark/ {print $2}'); do kill -9 $pid; done", (error, stdout, stderr) => {
                  if (error) {
                    console.error(`exec error: ${error}`);
                  }
                  res.status(200).send({ data : stdout });  
                  
            }); 
    }
    catch(err){
        console.log(err);
        res.status(401).send({ data : err });  
    }

});




//-- API : REDIS : Status Model - 1
app.get("/api/workload/redis/status/model/1/", async (req, res) => {
    
    // Token Validation
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);

    if (cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid"});
        
    var result = [];
    
    result.push(workerLog1);
    result.push(workerLog2);
    
    res.status(200).send({ data : result, status : { workloadStarted : workloadStarted } });  
    
});



//-- API : REDIS : Status Model - 2
app.get("/api/workload/redis/status/model/2/", async (req, res) => {
    
    // Token Validation
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);

    if (cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid"});
        
    var result = [];
    result.push(workerLog1);
    
    res.status(200).send({ data : result, status : { workloadStarted : workloadStarted } });  
    
});





//-- API : REDIS : Status Process
app.get("/api/workload/redis/status/process/", async (req, res) => {
    
    // Token Validation
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);

    if (cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid"});
        
    try {
            //exec('ps aux | head -1; ps aux | grep bench', (error, stdout, stderr) => {
            exec('ps -ef | grep bench', (error, stdout, stderr) => {
                  if (error) {
                    console.error(`exec error: ${error}`);
                  }
                  res.status(200).send({ data : stdout });  
                  
            }); 
    }
    catch(err){
        console.log(err);
        res.status(401).send({ data : err });  
    }
    


    
    
});



//--################################################################################################################
//-------------------------------------------- AWS
//--################################################################################################################


// AWS : Elasticache List nodes
app.get("/api/elasticache/cluster/list", (req,res)=>{

    // Token Validation
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);

    if (cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid"});
        
    var params = req.query;

    var parameter = {
      MaxRecords: 100,
      ReplicationGroupId: params.cluster
    };
    elasticache.describeReplicationGroups(parameter, function(err, data) {
      if (err) {
            console.log(err, err.stack); // an error occurred
            res.status(401).send({ ReplicationGroups : []});
      }
      else {
            //res.status(200).send({ csrfToken: req.csrfToken(), ReplicationGroups : data.ReplicationGroups})
            res.status(200).send({ ReplicationGroups : data.ReplicationGroups})
          }
    });


});


//--################################################################################################################
//--------------------------------------------  GENERAL FUNCTIONS
//--################################################################################################################



function padTo2Digits(num) {
  return num.toString().padStart(2, '0');
}

function formatDate(date) {
  return (
    [
      date.getFullYear(),
      padTo2Digits(date.getMonth() + 1),
      padTo2Digits(date.getDate()),
    ].join('') +
    '.' +
    [
      padTo2Digits(date.getHours()),
      padTo2Digits(date.getMinutes()),
      padTo2Digits(date.getSeconds()),
    ].join('')
  );
}


//--################################################################################################################
//--------------------------------------------  APP GENERAL
//--################################################################################################################



app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});


