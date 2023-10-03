const fs = require('fs');
const express = require("express");
const cors = require('cors')
const { spawn } = require("child_process");
var configData = JSON.parse(fs.readFileSync('./aws-exports.json'));


const app = express();
const port = 3000;

app.use(cors());
app.use(express.json())

var workerList = [];
var workerLog = [];
var workloadStarted = false;

// AWS Variables
var AWS = require('aws-sdk');
AWS.config.update({region: configData.aws_region});
var elasticache = new AWS.ElastiCache();



//--################################################################################################################
//--------------------------------------------  REDIS 
//--################################################################################################################

var historyMetrics = 50;
var statsData = {
                    rps : Array(50).fill(null),
                    avg_latency_ms : Array(50).fill(null),
                    min_latency_ms : Array(50).fill(null),
                    p50_latency_ms : Array(50).fill(null),
                    p95_latency_ms : Array(50).fill(null),
                    p99_latency_ms : Array(50).fill(null),
                    max_latency_ms: Array(50).fill(null)
                }

var statDataList = {
        name : "",
        GET : statsData,
        SET : statsData
};


var workerObj1 = {};
var workerObj2 = {};
var workerLog1 = {};
var workerLog2 = {};

function initWorkload() {
    workerObj1 = {};
    workerObj2 = {};
    
    workerLog1 = {
                        name : "",
                        GET : {
                                    rps : Array(50).fill(null),
                                    avg_latency_ms : Array(50).fill(null),
                                    min_latency_ms : Array(50).fill(null),
                                    p50_latency_ms : Array(50).fill(null),
                                    p95_latency_ms : Array(50).fill(null),
                                    p99_latency_ms : Array(50).fill(null),
                                    max_latency_ms: Array(50).fill(null)
                                },
                        SET : {
                                    rps : Array(50).fill(null),
                                    avg_latency_ms : Array(50).fill(null),
                                    min_latency_ms : Array(50).fill(null),
                                    p50_latency_ms : Array(50).fill(null),
                                    p95_latency_ms : Array(50).fill(null),
                                    p99_latency_ms : Array(50).fill(null),
                                    max_latency_ms: Array(50).fill(null)
                                }
        
    };
    
    workerLog2 = {
                        name : "",
                        GET : {
                                    rps : Array(50).fill(null),
                                    avg_latency_ms : Array(50).fill(null),
                                    min_latency_ms : Array(50).fill(null),
                                    p50_latency_ms : Array(50).fill(null),
                                    p95_latency_ms : Array(50).fill(null),
                                    p99_latency_ms : Array(50).fill(null),
                                    max_latency_ms: Array(50).fill(null)
                                },
                        SET : {
                                    rps : Array(50).fill(null),
                                    avg_latency_ms : Array(50).fill(null),
                                    min_latency_ms : Array(50).fill(null),
                                    p50_latency_ms : Array(50).fill(null),
                                    p95_latency_ms : Array(50).fill(null),
                                    p99_latency_ms : Array(50).fill(null),
                                    max_latency_ms: Array(50).fill(null)
                                }
        
    };

}

initWorkload();

function createWorker(node1, node2){

    initWorkload();
    workloadStarted = true;
    //-- NODE1
    workerLog1.name = node1.id;
    workerObj1 = spawn("./redis-benchmark.sh", 
                         [
                             node1.host, 
                             node1.port,
                             node1.clients,
                             node1.shards,
                             node1.randomize,
                             node1.payload,
                             node1.threads,
                             node1.pipeline
                          ], 
                         {'detached':true}
                        );
    
    
    workerObj1.stdout.on("data", data1 => {
        
        var recordRaw1 = `${data1}`;
        if ( recordRaw1.substring(1,4)=="SET" || recordRaw1.substring(1,4)=="GET" ){
            var record1 = recordRaw1.replaceAll('"','').replace(/[\r\n]+/gm, " ").split(",");
            
            //console.log("R1 :" + recordRaw1);
                    
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
    
    //-- NODE2
    workerLog2.name = node2.id;
    workerObj2 = spawn("./redis-benchmark.sh", 
                         [
                             node2.host, 
                             node2.port,
                             node2.clients,
                             node2.shards,
                             node2.randomize,
                             node2.payload,
                             node2.threads,
                             node2.pipeline
                          ], 
                         {'detached':true}
                        );
    
    
    workerObj2.stdout.on("data", data => {
        
        var recordRaw = `${data}`;
        if ( recordRaw.substring(1,4)=="SET" || recordRaw.substring(1,4)=="GET" ){
            var record = recordRaw.replaceAll('"','').replace(/[\r\n]+/gm, " ").split(",");
            
            //console.log("R2 :" + recordRaw);
                    
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



function stopWorker(workerId){
    
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



app.get("/api/workload/stop/", async (req, res) => {
    
    /*
    const params = req.query;
    for (let index of Object.keys(params)) {
            stopWorker(params[index].id);
            workloadIds = workloadIds + params[index].id + ","
    }
    */
    try {
        stopWorker();
        res.status(200).send( { message : "Workload has been terminated" , status : { workloadStarted : workloadStarted } });
    }
    catch(err) {
        console.log(err);
        res.status(401).send("Workload has not been started");
    }
    
    
    
    
});



app.get("/api/workload/create/", async (req, res) => {
 
    const params = req.query;
    
    /*
    for (let index of Object.keys(params)) {
            createWorker(params[index]);
            workloadIds = workloadIds + params[index].id + ","
    }
    */
    
    try {
        createWorker(params['srv01'],params['srv02']);
        res.status(200).send("Workload has been started");
    }
    catch (err) {
        console.log(err);
        res.status(401).send("Workload has not been started");
    }
    
    
    
   
   
});



app.get("/api/workload/output/", async (req, res) => {
    
    const params = req.query;
    var result = [];
    /*
    for (let index of Object.keys(params)) {
            //console.log(params[index].id);
            if ((params[index].id in workerLog)) {
                result.push(workerLog[params[index].id]);
                //console.log(workerLog[params[index].id]['name']);
            }
            else {
                result.push(statDataList);
            }
    }
    */
    
    result.push(workerLog1);
    result.push(workerLog2);
    
    res.status(200).send({ data : result, status : { workloadStarted : workloadStarted } });  
    
});


//--################################################################################################################
//-------------------------------------------- AWS
//--################################################################################################################


// AWS : Elasticache List nodes
app.get("/api/elasticache/cluster/list", (req,res)=>{

/*
    // Token Validation
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);
    
    if (cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid"});
*/

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
//--------------------------------------------  APP GENERAL
//--################################################################################################################



app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});


