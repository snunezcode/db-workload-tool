import {useState,useEffect,useRef} from 'react'
import Axios from 'axios'
import { configuration } from './Configs';

import ColumnLayout from "@awsui/components-react/column-layout";
import FormField from "@awsui/components-react/form-field";
import Input from "@awsui/components-react/input";

import Toggle from "@cloudscape-design/components/toggle";
import Checkbox from "@awsui/components-react/checkbox";
import Multiselect from "@awsui/components-react/multiselect";
import Icon from "@awsui/components-react/icon";
import Select from "@awsui/components-react/select";
import ExpandableSection from "@awsui/components-react/expandable-section";
import SpaceBetween from "@awsui/components-react/space-between";
import Box from "@awsui/components-react/box";
import Button from "@awsui/components-react/button";
import Container from "@awsui/components-react/container";
import CustomHeader from "../components/Header";

import CompMetric01  from '../components/Metric01';
import ChartLine01  from '../components/ChartLine01';
import ChartDonut01  from '../components/ChartDonut01';
import ChartDonut02  from '../components/ChartDonut02';

import Header from "@awsui/components-react/header";
import '@aws-amplify/ui-react/styles.css';

function Application() {

    //-- Add Header Cognito Token
    Axios.defaults.headers.common['x-csrf-token'] = sessionStorage.getItem("x-csrf-token");
    Axios.defaults.headers.common['x-token-cognito'] = sessionStorage.getItem("x-token-cognito");
    Axios.defaults.withCredentials = true;
      
    var statStructure = {
                        rps : Array(50).fill(null),
                        avg_latency_ms : Array(50).fill(null),
                        min_latency_ms : Array(50).fill(null),
                        p50_latency_ms : Array(50).fill(null),
                        p95_latency_ms : Array(50).fill(null),
                        p99_latency_ms : Array(50).fill(null),
                        max_latency_ms: Array(50).fill(null)
    };
  
    var statStructureList = {
        name : "",
        GET : statStructure,
        SET : statStructure,
        RPUSH : statStructure,
        ZADD : statStructure,
        XADD : statStructure,
    };

    
    const [statMetrics,setStatMetrics] = useState([
                                                    statStructureList,
                                                    statStructureList
    ]);
    



    const [selectedOperationMetric,setSelectedOperationMetric] = useState({ label: "SET", value: "SET" });
    
    const [selectedCluster1,setSelectedCluster1] = useState({});
    const [selectedCluster2,setSelectedCluster2] = useState({});
 
    const optionCluster1 = useRef([]);
    const optionCluster2 = useRef([]);
 
    const workloadStarted = useRef(false);
    const [workloadState, setWorkloadState] = useState(new Date());
    const [clusterMode, setClusterMode] = useState(true);
   
    const inputClients = useRef(100);
    const inputShards = useRef(1);
    const inputRandomize = useRef(10000);
    const inputPayload = useRef(3);
    const inputThreads = useRef(1);
    const inputPipelines = useRef(1);
   
   
    const [selectedOpType,setSelectedOpType] = useState([
         {
          label: "SET",
          value: "SET"
        },
        {
          label: "GET",
          value: "GET"
        },
      ]);
  
    const [customCluster1, setCustomCluster1] = useState(false);
    const [customCluster2, setCustomCluster2] = useState(false);
    const [customSettings, setCustomSettings] = useState(false);

    const [customAlias1, setCustomAlias1] = useState("");
    const [customAlias2, setCustomAlias2] = useState("");
   
    const [customHost1, setCustomHost1] = useState("");
    const [customHost2, setCustomHost2] = useState("");
   
    const [customPort1, setCustomPort1] = useState("");
    const [customPort2, setCustomPort2] = useState("");
   
    const [customCommand, setCustomCommand] = useState("-p 6379 -c 100 -n 100000 -r 10000 -d 3 -P 1 -t SET,GET -q --csv -l --cluster");
   
   //-- Call API to Start Workload
   async function startWorkload (){

        try{
        
            var api_url = configuration["apps-settings"]["api-url"];
            var serverConnection1 = {};
            var serverConnection2 = {};
            var commandOptions = {};
            var workloadOperationTypes = ""
            
            selectedOpType.forEach(function(item) {
                workloadOperationTypes = workloadOperationTypes + item.value + ","
            });
            
            
            if (customCluster1){
                
                serverConnection1 = {
                                id : customAlias1,
                                host :  customHost1, 
                                port : customPort1
                    
                };
                
            }
            else
            {
                
                serverConnection1 = {
                                id : selectedCluster1['value'],
                                host :  selectedCluster1['host'], 
                                port : selectedCluster1['port']
                    
                };
                
            }
            
            
            if (customCluster2){
                
                serverConnection2 = {
                                id : customAlias2,
                                host :  customHost2, 
                                port : customPort2
                    
                };
                
            }
            else
            {
                
                serverConnection2 = {
                                id : selectedCluster2['value'],
                                host :  selectedCluster2['host'], 
                                port : selectedCluster2['port']
                    
                };
                
            }
            
            if (customSettings == true){
                
                commandOptions = {
                    clients : 0,
                    shards : 0, 
                    randomize : 0,
                    payload : 0,
                    threads : 0,
                    pipeline : 0,
                    opTypes : "",
                };  
                
                
            }
            else {
                  
                commandOptions = {
                    clients : inputClients.current.value,
                    shards : inputShards.current.value, 
                    randomize : inputRandomize.current.value,
                    payload : inputPayload.current.value,
                    threads : inputThreads.current.value,
                    pipeline : inputPipelines.current.value,
                    opTypes : workloadOperationTypes.slice(0, -1),
                };
            }
        
            var params = { srv01 : 
                                    {
                                        
                                        ...serverConnection1,
                                        ...commandOptions,
                                        customCommand : customCommand,
                                        customSettings : customSettings,
                                        clusterMode : clusterMode
                                    },
                        
                            srv02 : {
                                        ...serverConnection2,
                                        ...commandOptions,
                                        customCommand : customCommand,
                                        customSettings : customSettings,
                                        clusterMode : clusterMode
                                    }
            };
        
            console.log(params);
            
            Axios.get(`${api_url}/api/workload/redis/start/model/1/`,{
                      params: params, 
                  }).then((data)=>{
                   workloadStarted.current = true;
                   setWorkloadState(new Date());
                   
                     
              })
              .catch((err) => {
                  console.log('Timeout API Call : /api/workload/redis/start/model/1/' );
                  console.log(err);
                  
              });
              
            //sessionStorage.setItem("x-csrf-token", data.csrfToken );
        }
        catch{
        
          console.log('Timeout API error : /api/workload/redis/start/model/1/');                  
          
        }
       
    }
    
    
    
    //-- Call API to Stop Workload
    async function stopWorkload (){

        try{
        
            var api_url = configuration["apps-settings"]["api-url"];
            
        
            Axios.get(`${api_url}/api/workload/redis/stop/model/1/`).then((data)=>{
                   console.log(data);
              })
              .catch((err) => {
                  console.log('Timeout API Call : /api/workload/redis/stop/model/1/' );
                  console.log(err);
              });
        }
        catch{
        
          console.log('Timeout API error : /api/workload/redis/stop/model/1/');                  
          
        }
        
        workloadStarted.current = false;
        setWorkloadState(new Date());
        
        
    }
    
    
    //-- Call API to Terminate Workload
    async function terminateWorkload (){

        try{
        
            var api_url = configuration["apps-settings"]["api-url"];
            
        
            Axios.get(`${api_url}/api/workload/redis/terminate/model/1/`).then((data)=>{
                   console.log(data);
              })
              .catch((err) => {
                  console.log('Timeout API Call : /api/workload/redis/terminate/model/1/' );
                  console.log(err);
              });
            
        }
        catch{
          console.log('Timeout API error : /api/workload/redis/terminate/model/1/');                  
          
        }
        
        workloadStarted.current = false;
        setWorkloadState(new Date());
        
    }
    
    
    
   
   //-- Call API to Status Workload
   async function statusWorkload (){
        
            
        try{
        
            var api_url = configuration["apps-settings"]["api-url"];
        
            Axios.get(`${api_url}/api/workload/redis/status/model/1/`).then((data)=>{
                   
                   
                   workloadStarted.current = data.data.status.workloadStarted;
                   if (workloadStarted.current == true) {
                           setStatMetrics(data.data.data);
                   }
                           
              })
              .catch((err) => {
                  console.log('Timeout API Call : /api/workload/redis/status/model/1/' );
                  console.log(err);
                  
              });

        }
        catch{
        
          console.log('Timeout API error : /api/workload/redis/status/model/1/');                  
          
        }
        
    }
    
    
    //-- Call API to Gather Clusters Info
   async function gatherClusters (){
        
        var clusterItems=[];
        
        try{
                   
           
            const { data } = await Axios.get(`${configuration["apps-settings"]["api-url"]}/api/elasticache/cluster/list`);
            data.ReplicationGroups.forEach(function(item) {
                            
                            try{
                                  var endPoint;
                                  var port;
                                  if ( item['ClusterEnabled'] == true) {
                                      
                                      endPoint = item['ConfigurationEndpoint']['Address'];
                                      port = item['ConfigurationEndpoint']['Port'];
                                    
                                  }
                                  else {
                                    
                                      endPoint = item['NodeGroups'][0]['PrimaryEndpoint']['Address'];
                                      port = item['NodeGroups'][0]['PrimaryEndpoint']['Port'];
                                    
                                  }
                                  
                                  clusterItems.push(
                                                    {
                                                      label: item['ReplicationGroupId'],
                                                      value: item['ReplicationGroupId'],
                                                      tags: [item['CacheNodeType'], "Shards:" + String(item['NodeGroups'].length), "Nodes:" + String(item['MemberClusters'].length)],
                                                      host: endPoint,
                                                      port : port
                                                    }
                                                );
                                  
                                  
                            }
                            catch{
                              console.log('Timeout API error : /api/elasticache/cluster/list');                  
                            }
                            
                   
                          
            })
                                  
            
        }
        catch{
          console.log('Timeout API error : /api/elasticache/cluster/list');                  
        }
        
        optionCluster1.current = clusterItems;
        optionCluster2.current = clusterItems;
        
        if (clusterItems.length > 0 ) {
            setSelectedCluster1(clusterItems[0]);
            setSelectedCluster2(clusterItems[0]);
        }
    
    
    }
   
   
   
    function onClickStartWorkload(){
        
        startWorkload();
        
    }
    
    function onClickStopWorkload(){
        
        stopWorkload();
        
    }
    
    
    function onClickTerminateWorkload(){
        
        terminateWorkload();
        
    }
    
    
    
    useEffect(() => {
        gatherClusters();
    }, []);
    
    
    useEffect(() => {
        const id = setInterval(statusWorkload, configuration["apps-settings"]["refresh-interval"]);
        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    
  return (
    <div>
        <CustomHeader
            activeHref={"/elasticache/side-by-side"}
            content={
                
                <>
                <br />
                                <Container
                                    header={
                                        <Header
                                          variant="h2"
                                          description={"Model to compare two Amazon ElastiCache Clusters or another Redis engine using redis-benchmark tool."}
                                        >
                                          SideBySide Comparation Model
                                        </Header>
                                      }
                                >
                                        <br/>
                                        
                                        <ColumnLayout columns={2}>
                                            <FormField
                                                label="Cluster-1"
                                                description="Enter the first cluster for comparation process"
                                                stretch={true}
                                              >
                                                    
                                                    { customCluster1 === false &&
                                                        <table style={{"width":"100%"}}>
                                                            <tr> 
                                                                <td style={{"width":"100%"}}>
                                                                    <Select
                                                                            disabled={(workloadStarted.current)}
                                                                            selectedOption={selectedCluster1}
                                                                            onChange={({ detail }) => {
                                                                                    setSelectedCluster1(detail.selectedOption)
                                                                                    }
                                                                                }
                                                                            options={optionCluster1.current}
                                                                    />
                                                                </td>
                                                            </tr> 
                                                        </table> 
                                                    }
                                                    { customCluster1 === true &&
                                                        <table style={{"width":"100%"}}>
                                                            <tr> 
                                                                 <td style={{"width":"10%"}}>
                                                                    <FormField
                                                                        stretch={true}
                                                                    >
                                                                        
                                                                        <Input
                                                                          disabled={(workloadStarted.current)}
                                                                          onChange={({ detail }) => setCustomAlias1(detail.value)}
                                                                          value={customAlias1}
                                                                          placeholder="Alias"
                                                                        />
                                                                        
                                                                    </FormField>
                                                                
                                                                    
                                                                </td>   
                                                                <td style={{"width":"65%"}}>
                                                                    <FormField
                                                                        stretch={true}
                                                                    >
                                                                        
                                                                        <Input
                                                                          disabled={(workloadStarted.current)}
                                                                          onChange={({ detail }) => setCustomHost1(detail.value)}
                                                                          value={customHost1}
                                                                          placeholder="host"
                                                                        />
                                                                        
                                                                    </FormField>
                                                                
                                                                    
                                                                </td>   
                                                                <td style={{"width":"25%"}}>
                                                                    <FormField
                                                                        stretch={true}
                                                                    >
                                                                        
                                                                        <Input
                                                                          disabled={(workloadStarted.current)}
                                                                          onChange={({ detail }) => setCustomPort1(detail.value)}
                                                                          value={customPort1}
                                                                          placeholder="port"
                                                                        />
                                                                        
                                                                    </FormField>
                                                                    
                                                                    
                                                                </td>   
                                                            </tr>
                                                        </table>
                                                    }
                                                    
                                                    <br/>
                                                    <Checkbox
                                                      onChange={({ detail }) =>
                                                        setCustomCluster1(detail.checked)
                                                      }
                                                      checked={customCluster1}
                                                      disabled={(workloadStarted.current)}
                                                    >
                                                      Custom Connection
                                                    </Checkbox>
                                                    
                                            </FormField>
                                            <FormField
                                                label="Cluster-2"
                                                description="Enter the second cluster for comparation process"
                                                stretch={true}
                                              >
                                                    
                                                    { customCluster2 === false &&
                                                        <table style={{"width":"100%"}}>
                                                            <tr> 
                                                                <td style={{"width":"100%"}}>
                                                                    <Select
                                                                            disabled={(workloadStarted.current)}
                                                                            selectedOption={selectedCluster2}
                                                                            onChange={({ detail }) => {
                                                                                    setSelectedCluster2(detail.selectedOption)
                                                                                    }
                                                                                }
                                                                            options={optionCluster2.current}
                                                                    />
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    }
                                                    { customCluster2 === true &&
                                                        <table style={{"width":"100%"}}>
                                                            <tr> 
                                                                <td style={{"width":"10%"}}>
                                                                    <FormField
                                                                        stretch={true}
                                                                    >
                                                                        
                                                                        <Input
                                                                          disabled={(workloadStarted.current)}
                                                                          onChange={({ detail }) => setCustomAlias2(detail.value)}
                                                                          value={customAlias2}
                                                                          placeholder="Alias"
                                                                        />
                                                                        
                                                                    </FormField>
                                                                
                                                                    
                                                                </td>   
                                                                <td style={{"width":"65%"}}>
                                                                    <FormField
                                                                        stretch={true}
                                                                    >
                                                                        
                                                                        <Input
                                                                          disabled={(workloadStarted.current)}
                                                                          onChange={({ detail }) => setCustomHost2(detail.value)}
                                                                          value={customHost2}
                                                                          placeholder="host"
                                                                        />
                                                                        
                                                                    </FormField>
                                                                
                                                                    
                                                                </td>   
                                                                <td style={{"width":"25%"}}>
                                                                    <FormField
                                                                        stretch={true}
                                                                    >
                                                                        
                                                                        <Input
                                                                          disabled={(workloadStarted.current)}
                                                                          onChange={({ detail }) => setCustomPort2(detail.value)}
                                                                          value={customPort2}
                                                                          placeholder="port"
                                                                        />
                                                                        
                                                                    </FormField>
                                                                    
                                                                    
                                                                </td>   
                                                            </tr>
                                                        </table>
                                                    }
                                                    
                                                    <br/>
                                                    <Checkbox
                                                      onChange={({ detail }) =>
                                                        setCustomCluster2(detail.checked)
                                                      }
                                                      checked={customCluster2}
                                                      disabled={(workloadStarted.current)}
                                                    >
                                                      Custom Connection
                                                    </Checkbox>
                                                    
                                            </FormField>
                                        </ColumnLayout>
                                        <br/>            
        
                                        <ExpandableSection 
                                            headerText="Additional configuration"
                                        >   
                                        
                                            <Checkbox
                                                      onChange={({ detail }) =>
                                                        setCustomSettings(detail.checked)
                                                      }
                                                      checked={customSettings}
                                                      disabled={(workloadStarted.current)}
                                                    >
                                                      Custom Settings
                                            </Checkbox>
                                            <br/>
                                            { customSettings === true &&
                                                <FormField
                                                    label="Command Parameters"
                                                    description="Enter the parameters for redis-benchmark command"
                                                    stretch={true}
                                                >
                                                    
                                                    <Input
                                                      disabled={(workloadStarted.current)}
                                                      onChange={({ detail }) => setCustomCommand(detail.value)}
                                                      value={customCommand}
                                                      placeholder="Parameters "
                                                    />
                                                                        
                                                </FormField>
                                            }
                                            { customSettings === false &&
                                                <>
                                                <table style={{"width":"100%"}}>
                                                    <tr> 
                                                        <td style={{"width":"25%", "padding-left": "1em"}}>  
                                                                <FormField
                                                                    label="Clients"
                                                                    description="Number of clients"
                                                                    stretch={true}
                                                                  >
                                                                   <input type="number" ref={inputClients} disabled={(workloadStarted.current)} defaultValue="100" />
                                                                </FormField>
                                                        </td>
                                                        <td style={{"width":"25%", "padding-left": "1em"}}>  
                                                                <FormField
                                                                    label="Shards"
                                                                    description="Number of shards"
                                                                    stretch={true}
                                                                  >
                                                                        <input type="number" ref={inputShards} disabled={(workloadStarted.current)} defaultValue="1" />
                                                                </FormField>
                                                        </td> 
                                                        <td style={{"width":"25%", "padding-left": "1em"}}>  
                                                                <FormField
                                                                    label="Randomize"
                                                                    description="Random keyspace length"
                                                                    stretch={true}
                                                                  >
                                                                        <input type="number" ref={inputRandomize} disabled={(workloadStarted.current)} defaultValue="10000" />
                                                                </FormField>
                                                        </td> 
                                                        <td style={{"width":"25%", "padding-left": "1em"}}>  
                                                                <FormField
                                                                    label="Payload"
                                                                    description="Data size payload"
                                                                    stretch={true}
                                                                  > 
                                                                        <input type="number" ref={inputPayload} disabled={(workloadStarted.current)} defaultValue="3" />
                                                                            
                                                                </FormField>
                                                        </td> 
                                                    </tr> 
                                                </table>
                                                <br/>
                                                <table style={{"width":"100%"}}>
                                                
                                                    <tr> 
                                                        <td style={{"width":"25%", "padding-left": "1em"}}>  
                                                                <FormField
                                                                    label="Threads"
                                                                    description="Number of threads"
                                                                    stretch={true}
                                                                  >
                                                                        <input type="number" ref={inputThreads}  disabled={(workloadStarted.current)} defaultValue="1" />
                                                                </FormField>
                                                        </td>
                                                        <td style={{"width":"25%", "padding-left": "1em"}}>  
                                                                <FormField
                                                                    label="Pipelines"
                                                                    description="Number of pipelines"
                                                                    stretch={true}
                                                                  >
                                                                        <input type="number" ref={inputPipelines} disabled={(workloadStarted.current)} defaultValue="1" />
                                                                </FormField>
                                                        </td>
                                                        <td style={{"width":"25%", "padding-left": "1em"}}>  
                                                                <FormField
                                                                    label="Clustering"
                                                                    description="Cluster Mode"
                                                                    stretch={true}
                                                                  >
                                                                        
                                                                        <Toggle
                                                                              disabled={(workloadStarted.current)}
                                                                              onChange={({ detail }) =>
                                                                                setClusterMode(detail.checked)
                                                                              }
                                                                              checked={clusterMode}
                                                                            >
                                                                             { clusterMode == true ? "Enabled" : "Disabled"} 
                                                                        </Toggle>
                                                            
                                                                </FormField>
                                                        </td> 
                                                        <td style={{"width":"25%", "padding-left": "1em"}}>  
                                                                <FormField
                                                                    label="Status"
                                                                    description="Workload process status"
                                                                    stretch={true}
                                                                  >
                                                                        
                                                                            { workloadStarted.current === true &&
                                                                                <>
                                                                                <Icon size="medium" name="status-in-progress" /> Running
                                                                                </>
                                                                            }
                                                                            { workloadStarted.current === false &&
                                                                                <>
                                                                                <Icon size="medium" name="status-stopped" /> Stopped
                                                                                </>
                                                                            }
                                                                        
                                                                </FormField>
                                                        </td> 
                                                    </tr> 
                                                </table> 
                                                <br/> 
                                                <table style={{"width":"30%"}}>
                                                    <tr> 
                                                        <td style={{"width":"30%", "padding-left": "1em"}}>  
                                                             <FormField
                                                                    label="Operation Types"
                                                                    description="Workload operations types"
                                                                    stretch={true}
                                                                  >
                                                                    <Multiselect
                                                                          disabled={(workloadStarted.current)}
                                                                          selectedOptions={selectedOpType}
                                                                          onChange={({ detail }) => {
                                                                                setSelectedOpType(detail.selectedOptions);
                                                                                
                                                                                if (detail.selectedOptions.length > 0)
                                                                                    setSelectedOperationMetric(detail.selectedOptions[0]);
                                                                                else 
                                                                                    setSelectedOperationMetric({});
                                                                            }
                                                                            
                                                                          }
                                                                          options={[
                                                                            { label: "SET", value: "SET" },
                                                                            { label: "GET", value: "GET" },
                                                                            { label: "RPUSH", value: "RPUSH"},
                                                                            { label: "ZADD", value: "ZADD" },
                                                                            { label: "XADD", value: "XADD" }
                                                                          ]}
                                                                          placeholder="Choose options"
                                                                        />
                                                            </FormField>
                                                        </td> 
                                                    </tr>
                                                </table> 
                                                </>
                                            }
                                            
                                            
                                        </ExpandableSection>
                                        <br/>
                                        <Box float="right">
                                              <SpaceBetween direction="horizontal" size="xs">
                                                <Button variant="secondary" onClick={onClickTerminateWorkload}>Terminate Workload</Button>
                                                <Button disabled={!(workloadStarted.current)}  variant="primary" onClick={onClickStopWorkload}>Stop Workload</Button>
                                                <Button disabled={workloadStarted.current}  variant="primary" onClick={onClickStartWorkload}>Start Workload</Button>
                                              </SpaceBetween>
                                        </Box>
                                </Container>
                                <br/>
                                <Container
                                    
                                    header={
                                        <Header
                                          variant="h2"
                                        >
                                          Performance Metrics
                                        </Header>
                                      }
                                
                                >
                                    
                                    <table style={{"width":"20%"}}>
                                        <tr> 
                                            <td style={{"width":"20%", "padding-left": "1em"}}>
                                                <FormField
                                                    label="Operation Type"
                                                    stretch={true}
                                                  >
                                                            
                                                            <Select
                                                              selectedOption={selectedOperationMetric}
                                                              onChange={({ detail }) =>
                                                                setSelectedOperationMetric(detail.selectedOption)
                                                              }
                                                              options={[
                                                                    { label: "SET", value: "SET" },
                                                                    { label: "GET", value: "GET" },
                                                                    { label: "RPUSH", value: "RPUSH"},
                                                                    { label: "ZADD", value: "ZADD" },
                                                                    { label: "XADD", value: "XADD" }
                                                               ]}
                                                            />
                                                            
                                                            
                                                </FormField>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <br/>
                                    <hr color={configuration.colors.lines.separator101}/>
                                    <table style={{"width":"100%"}}>
                                        <tr> 
                                            <td style={{"width":"15%", "padding-left": "1em"}}>  
                                                <Box variant="h4">Summary</Box>
                                            </td>
                                        </tr>
                                    </table>
                                    <table style={{"width":"100%"}}>
                                        <tr> 
                                            <td style={{"width":"20%", "padding-left": "1em"}}>  
                                                <ChartDonut01 series={JSON.stringify([ 
                                                                           ( statMetrics[0][selectedOperationMetric['value']]['rpsTotal'] || 0),
                                                                           ( statMetrics[1][selectedOperationMetric['value']]['rpsTotal'] || 0), 
                                                                    ])} 
                                                                    labels={JSON.stringify([statMetrics[0]['name'],statMetrics[1]['name']])}
                                                                    height="250px" 
                                                                    width="250px" 
                                                                    title={"Total Requests"}
                                                />
                                            </td>
                                            <td style={{"width":"40%", "padding-left": "1em", "border-left": "1px solid " + configuration.colors.lines.separator101}}>  
                                                    <Box variant="h1">{statMetrics[0]['name']}</Box>
                                                    <Box color="text-body-secondary">Cluster</Box>
                                                    <br/>
                                                    <br/>
                                                    <table style={{"width":"100%"}}>
                                                        <tr> 
                                                            <td style={{"width":"33%", "padding-left": "0em", }}>  
                                                                <CompMetric01 
                                                                    value={ ( statMetrics[0][selectedOperationMetric['value']]['rpsTotal'] / statMetrics[0][selectedOperationMetric['value']]['eventsTotal']) || 0}
                                                                    title={"Requests/sec"}
                                                                    precision={0}
                                                                    format={3}
                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                    fontSizeValue={"20px"}
                                                               />
                                                            </td>
                                                            <td style={{"width":"33%", "padding-left": "0em", }}>  
                                                                <CompMetric01 
                                                                    value={ statMetrics[0][selectedOperationMetric['value']]['rpsTotal'] || 0}
                                                                    title={"Total Requests"}
                                                                    precision={0}
                                                                    format={3}
                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                    fontSizeValue={"20px"}
                                                               />
                                                            </td>
                                                            <td style={{"width":"33%", "padding-left": "0em"}}>  
                                                                <CompMetric01 
                                                                    value={ statMetrics[0][selectedOperationMetric['value']]['eventsTotal'] || 0}
                                                                    title={"Total Events"}
                                                                    precision={0}
                                                                    format={3}
                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                    fontSizeValue={"20px"}
                                                               />
                                                            </td>
                                                        </tr>
                                                    </table>
                                            </td>
                                            <td style={{"width":"40%", "padding-left": "1em", "border-left": "1px solid " + configuration.colors.lines.separator101}}>  
                                                    <Box variant="h1">{statMetrics[1]['name']}</Box>
                                                    <Box color="text-body-secondary">Cluster</Box>
                                                    <br/>
                                                    <br/>
                                                    <table style={{"width":"100%"}}>
                                                        <tr> 
                                                            <td style={{"width":"33%", "padding-left": "0em", }}>  
                                                                <CompMetric01 
                                                                    value={ ( statMetrics[1][selectedOperationMetric['value']]['rpsTotal'] / statMetrics[1][selectedOperationMetric['value']]['eventsTotal']) || 0}
                                                                    title={"Requests/sec"}
                                                                    precision={0}
                                                                    format={3}
                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                    fontSizeValue={"20px"}
                                                               />
                                                            </td>
                                                            <td style={{"width":"33%", "padding-left": "0em"}}>  
                                                                <CompMetric01 
                                                                    value={ statMetrics[1][selectedOperationMetric['value']]['rpsTotal'] || 0}
                                                                    title={"Total Requests"}
                                                                    precision={0}
                                                                    format={3}
                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                    fontSizeValue={"20px"}
                                                               />
                                                            </td>
                                                            <td style={{"width":"33%", "padding-left": "0em"}}>  
                                                                <CompMetric01 
                                                                    value={ statMetrics[1][selectedOperationMetric['value']]['eventsTotal'] || 0}
                                                                    title={"Total Events"}
                                                                    precision={0}
                                                                    format={3}
                                                                    fontColorValue={configuration.colors.fonts.metric100}
                                                                    fontSizeValue={"20px"}
                                                               />
                                                            </td>
                                                            
                                                        </tr>
                                                    </table>
                                            </td>
                                        </tr>
                                    </table> 
                                    
                                    
                                    <br/>
                                    <hr color={configuration.colors.lines.separator101}/>
                                    <table style={{"width":"100%"}}>
                                        <tr> 
                                            <td style={{"width":"15%", "padding-left": "1em"}}>  
                                                <Box variant="h4">Requests/sec</Box>
                                            </td>
                                        </tr>
                                    </table>
                                    <table style={{"width":"100%"}}>
                                        <tr> 
                                            <td style={{"width":"15%", "padding-left": "1em"}}>  
                                                    <CompMetric01 
                                                        value={ statMetrics[0][selectedOperationMetric['value']]['rps'][statMetrics[0][selectedOperationMetric['value']]['rps'].length-1] || 0}
                                                        title={statMetrics[0]['name']}
                                                        precision={0}
                                                        format={3}
                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                        fontSizeValue={"24px"}
                                                    />
                                            </td>
                                            <td style={{"width":"15%", "padding-left": "1em"}}>  
                                                    <CompMetric01 
                                                        value={ statMetrics[1][selectedOperationMetric['value']]['rps'][statMetrics[1][selectedOperationMetric['value']]['rps'].length-1] || 0}
                                                        title={statMetrics[1]['name']}
                                                        precision={0}
                                                        format={3}
                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                        fontSizeValue={"24px"}
                                                    />
                                            </td>
                                            <td style={{"width":"20%", "border-left": "1px solid " + configuration.colors.lines.separator101, "padding-left": "1em"}}>  
                                                 <ChartDonut01 series={JSON.stringify([
                                                                           (statMetrics[0][selectedOperationMetric['value']]['rps'][statMetrics[0][selectedOperationMetric['value']]['rps'].length-1] || 0) ,     
                                                                           (statMetrics[1][selectedOperationMetric['value']]['rps'][statMetrics[1][selectedOperationMetric['value']]['rps'].length-1] || 0) ,     
                                                                    ])} 
                                                                    labels={JSON.stringify([statMetrics[0]['name'],statMetrics[1]['name']])}
                                                                    height="280px" 
                                                                    width="280px" 
                                                />
                                            </td>
                                            <td style={{"width":"50%", "border-left": "1px solid " + configuration.colors.lines.separator101, "padding-left": "1em"}}>  
                                                <ChartLine01 series={JSON.stringify([
                                                                            { name : statMetrics[0]['name'], data :  statMetrics[0][selectedOperationMetric['value']]['rps'] },
                                                                            { name : statMetrics[1]['name'],data :  statMetrics[1][selectedOperationMetric['value']]['rps'] }
                                                                            
                                                                    ])} 
                                                title={"Requests/sec"} height="180px" />
                                            </td>
                                        </tr>
                                    </table> 
                                    
                                    <br/>
                                    <hr color={configuration.colors.lines.separator101}/>
                                    <table style={{"width":"100%"}}>
                                        <tr> 
                                            <td style={{"width":"15%", "padding-left": "1em"}}>  
                                                <Box variant="h4">Latency Average (ms)</Box>
                                            </td>
                                        </tr>
                                    </table>
                                    <table style={{"width":"100%"}}>
                                        <tr> 
                                            <td style={{"width":"15%", "padding-left": "1em"}}>  
                                                    <CompMetric01 
                                                        value={ statMetrics[0][selectedOperationMetric['value']]['avg_latency_ms'][statMetrics[0][selectedOperationMetric['value']]['avg_latency_ms'].length-1] || 0}
                                                        title={statMetrics[0]['name']}
                                                        precision={3}
                                                        format={1}
                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                        fontSizeValue={"24px"}
                                                    />
                                            </td>
                                            <td style={{"width":"15%", "padding-left": "1em"}}>  
                                                    <CompMetric01 
                                                        value={ statMetrics[1][selectedOperationMetric['value']]['avg_latency_ms'][statMetrics[1][selectedOperationMetric['value']]['avg_latency_ms'].length-1] || 0}
                                                        title={statMetrics[1]['name']}
                                                        precision={3}
                                                        format={1}
                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                        fontSizeValue={"24px"}
                                                    />
                                            </td>
                                            <td style={{"width":"20%", "border-left": "1px solid " + configuration.colors.lines.separator101, "padding-left": "1em"}}>  
                                                 <ChartDonut01 series={JSON.stringify([
                                                                           (statMetrics[0][selectedOperationMetric['value']]['avg_latency_ms'][statMetrics[0][selectedOperationMetric['value']]['avg_latency_ms'].length-1] || 0) ,     
                                                                           (statMetrics[1][selectedOperationMetric['value']]['avg_latency_ms'][statMetrics[1][selectedOperationMetric['value']]['avg_latency_ms'].length-1] || 0) ,     
                                                                    ])} 
                                                                    labels={JSON.stringify([statMetrics[0]['name'],statMetrics[1]['name']])}
                                                                    height="280px" 
                                                                    width="280px" 
                                                />
                                            </td>
                                            <td style={{"width":"50%", "border-left": "1px solid " + configuration.colors.lines.separator101, "padding-left": "1em"}}>  
                                                <ChartLine01 series={JSON.stringify([
                                                                            { name : statMetrics[0]['name'], data :  statMetrics[0][selectedOperationMetric['value']]['avg_latency_ms'] },
                                                                            { name : statMetrics[1]['name'],data :  statMetrics[1][selectedOperationMetric['value']]['avg_latency_ms'] }
                                                                            
                                                                    ])} 
                                                title={"Latency (ms)"} height="180px" />
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    
                                    
                                    
                                    <br/>
                                    <hr color={configuration.colors.lines.separator101}/>
                                    <table style={{"width":"100%"}}>
                                        <tr> 
                                            <td style={{"width":"15%", "padding-left": "1em"}}>  
                                                <Box variant="h4">Latency Minimum (ms)</Box>
                                            </td>
                                        </tr>
                                    </table>
                                    <br/> 
                                    <table style={{"width":"100%"}}>
                                        <tr> 
                                            <td style={{"width":"15%", "padding-left": "1em"}}>  
                                                    <CompMetric01 
                                                        value={ statMetrics[0][selectedOperationMetric['value']]['min_latency_ms'][statMetrics[0][selectedOperationMetric['value']]['min_latency_ms'].length-1] || 0}
                                                        title={statMetrics[0]['name']}
                                                        precision={3}
                                                        format={1}
                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                        fontSizeValue={"24px"}
                                                    />
                                            </td>
                                            <td style={{"width":"15%", "padding-left": "1em"}}>  
                                                    <CompMetric01 
                                                        value={ statMetrics[1][selectedOperationMetric['value']]['min_latency_ms'][statMetrics[1][selectedOperationMetric['value']]['min_latency_ms'].length-1] || 0}
                                                        title={statMetrics[1]['name']}
                                                        precision={3}
                                                        format={1}
                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                        fontSizeValue={"24px"}
                                                    />
                                            </td>
                                            <td style={{"width":"20%", "border-left": "1px solid " + configuration.colors.lines.separator101, "padding-left": "1em"}}>  
                                                 <ChartDonut01 series={JSON.stringify([
                                                                           (statMetrics[0][selectedOperationMetric['value']]['min_latency_ms'][statMetrics[0][selectedOperationMetric['value']]['min_latency_ms'].length-1] || 0) ,     
                                                                           (statMetrics[1][selectedOperationMetric['value']]['min_latency_ms'][statMetrics[1][selectedOperationMetric['value']]['min_latency_ms'].length-1] || 0) ,     
                                                                    ])} 
                                                                    labels={JSON.stringify([statMetrics[0]['name'],statMetrics[1]['name']])}
                                                                    height="280px" 
                                                                    width="280px" 
                                                />
                                            </td>
                                            <td style={{"width":"50%", "border-left": "1px solid " + configuration.colors.lines.separator101, "padding-left": "1em"}}>  
                                                <ChartLine01 series={JSON.stringify([
                                                                            { name : statMetrics[0]['name'], data :  statMetrics[0][selectedOperationMetric['value']]['min_latency_ms'] },
                                                                            { name : statMetrics[1]['name'],data :  statMetrics[1][selectedOperationMetric['value']]['min_latency_ms'] }
                                                                            
                                                                    ])} 
                                                title={"Latency (ms)"} height="180px" />
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    
                                    <br/>
                                    <hr color={configuration.colors.lines.separator101}/>
                                    <table style={{"width":"100%"}}>
                                        <tr> 
                                            <td style={{"width":"15%", "padding-left": "1em"}}>  
                                                <Box variant="h4">Latency Maximum (ms)</Box>
                                            </td>
                                        </tr>
                                    </table>
                                    <br/> 
                                    <table style={{"width":"100%"}}>
                                        <tr> 
                                            <td style={{"width":"15%", "padding-left": "1em"}}>  
                                                    <CompMetric01 
                                                        value={ statMetrics[0][selectedOperationMetric['value']]['max_latency_ms'][statMetrics[0][selectedOperationMetric['value']]['max_latency_ms'].length-1] || 0}
                                                        title={statMetrics[0]['name']}
                                                        precision={3}
                                                        format={1}
                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                        fontSizeValue={"24px"}
                                                    />
                                            </td>
                                            <td style={{"width":"15%", "padding-left": "1em"}}>  
                                                    <CompMetric01 
                                                        value={ statMetrics[1][selectedOperationMetric['value']]['max_latency_ms'][statMetrics[1][selectedOperationMetric['value']]['max_latency_ms'].length-1] || 0}
                                                        title={statMetrics[1]['name']}
                                                        precision={3}
                                                        format={1}
                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                        fontSizeValue={"24px"}
                                                    />
                                            </td>
                                            <td style={{"width":"20%", "border-left": "1px solid " + configuration.colors.lines.separator101, "padding-left": "1em"}}>  
                                                 <ChartDonut01 series={JSON.stringify([
                                                                           (statMetrics[0][selectedOperationMetric['value']]['max_latency_ms'][statMetrics[0][selectedOperationMetric['value']]['max_latency_ms'].length-1] || 0) ,     
                                                                           (statMetrics[1][selectedOperationMetric['value']]['max_latency_ms'][statMetrics[1][selectedOperationMetric['value']]['max_latency_ms'].length-1] || 0) ,     
                                                                    ])} 
                                                                    labels={JSON.stringify([statMetrics[0]['name'],statMetrics[1]['name']])}
                                                                    height="280px" 
                                                                    width="280px" 
                                                />
                                            </td>
                                            <td style={{"width":"50%", "border-left": "1px solid " + configuration.colors.lines.separator101, "padding-left": "1em"}}>  
                                                <ChartLine01 series={JSON.stringify([
                                                                            { name : statMetrics[0]['name'], data :  statMetrics[0][selectedOperationMetric['value']]['max_latency_ms'] },
                                                                            { name : statMetrics[1]['name'],data :  statMetrics[1][selectedOperationMetric['value']]['max_latency_ms'] }
                                                                            
                                                                    ])} 
                                                title={"Latency (ms)"} height="180px" />
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    
                                    
                                    <br/>
                                    <hr color={configuration.colors.lines.separator101}/>
                                    <table style={{"width":"100%"}}>
                                        <tr> 
                                            <td style={{"width":"15%", "padding-left": "1em"}}>  
                                                <Box variant="h4">Latency P50 (ms)</Box>
                                            </td>
                                        </tr>
                                    </table>
                                    <br/> 
                                    <table style={{"width":"100%"}}>
                                        <tr> 
                                            <td style={{"width":"15%", "padding-left": "1em"}}>  
                                                    <CompMetric01 
                                                        value={ statMetrics[0][selectedOperationMetric['value']]['p50_latency_ms'][statMetrics[0][selectedOperationMetric['value']]['p50_latency_ms'].length-1] || 0}
                                                        title={statMetrics[0]['name']}
                                                        precision={3}
                                                        format={1}
                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                        fontSizeValue={"24px"}
                                                    />
                                            </td>
                                            <td style={{"width":"15%", "padding-left": "1em"}}>  
                                                    <CompMetric01 
                                                        value={ statMetrics[1][selectedOperationMetric['value']]['p50_latency_ms'][statMetrics[1][selectedOperationMetric['value']]['p50_latency_ms'].length-1] || 0}
                                                        title={statMetrics[1]['name']}
                                                        precision={3}
                                                        format={1}
                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                        fontSizeValue={"24px"}
                                                    />
                                            </td>
                                            <td style={{"width":"20%", "border-left": "1px solid " + configuration.colors.lines.separator101, "padding-left": "1em"}}>  
                                                 <ChartDonut01 series={JSON.stringify([
                                                                           (statMetrics[0][selectedOperationMetric['value']]['p50_latency_ms'][statMetrics[0][selectedOperationMetric['value']]['p50_latency_ms'].length-1] || 0) ,     
                                                                           (statMetrics[1][selectedOperationMetric['value']]['p50_latency_ms'][statMetrics[1][selectedOperationMetric['value']]['p50_latency_ms'].length-1] || 0) ,     
                                                                    ])} 
                                                                    labels={JSON.stringify([statMetrics[0]['name'],statMetrics[1]['name']])}
                                                                    height="280px" 
                                                                    width="280px" 
                                                />
                                            </td>
                                            <td style={{"width":"50%", "border-left": "1px solid " + configuration.colors.lines.separator101, "padding-left": "1em"}}>  
                                                <ChartLine01 series={JSON.stringify([
                                                                            { name : statMetrics[0]['name'], data :  statMetrics[0][selectedOperationMetric['value']]['p50_latency_ms'] },
                                                                            { name : statMetrics[1]['name'],data :  statMetrics[1][selectedOperationMetric['value']]['p50_latency_ms'] }
                                                                            
                                                                    ])} 
                                                title={"Latency (ms)"} height="180px" />
                                            </td>
                                        </tr>
                                    </table> 
                                    
                                    
                                    
                                    <br/>
                                    <hr color={configuration.colors.lines.separator101}/>
                                    <table style={{"width":"100%"}}>
                                        <tr> 
                                            <td style={{"width":"15%", "padding-left": "1em"}}>  
                                                <Box variant="h4">Latency P95 (ms)</Box>
                                            </td>
                                        </tr>
                                    </table>
                                    <br/> 
                                    <table style={{"width":"100%"}}>
                                        <tr> 
                                            <td style={{"width":"15%", "padding-left": "1em"}}>  
                                                    <CompMetric01 
                                                        value={ statMetrics[0][selectedOperationMetric['value']]['p95_latency_ms'][statMetrics[0][selectedOperationMetric['value']]['p95_latency_ms'].length-1] || 0}
                                                        title={statMetrics[0]['name']}
                                                        precision={3}
                                                        format={1}
                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                        fontSizeValue={"24px"}
                                                    />
                                            </td>
                                            <td style={{"width":"15%", "padding-left": "1em"}}>  
                                                    <CompMetric01 
                                                        value={ statMetrics[1][selectedOperationMetric['value']]['p95_latency_ms'][statMetrics[1][selectedOperationMetric['value']]['p95_latency_ms'].length-1] || 0}
                                                        title={statMetrics[1]['name']}
                                                        precision={3}
                                                        format={1}
                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                        fontSizeValue={"24px"}
                                                    />
                                            </td>
                                            <td style={{"width":"20%", "border-left": "1px solid " + configuration.colors.lines.separator101, "padding-left": "1em"}}>  
                                                 <ChartDonut01 series={JSON.stringify([
                                                                           (statMetrics[0][selectedOperationMetric['value']]['p95_latency_ms'][statMetrics[0][selectedOperationMetric['value']]['p95_latency_ms'].length-1] || 0) ,     
                                                                           (statMetrics[1][selectedOperationMetric['value']]['p95_latency_ms'][statMetrics[1][selectedOperationMetric['value']]['p95_latency_ms'].length-1] || 0) ,     
                                                                    ])} 
                                                                    labels={JSON.stringify([statMetrics[0]['name'],statMetrics[1]['name']])}
                                                                    height="280px" 
                                                                    width="280px" 
                                                />
                                            </td>
                                            <td style={{"width":"50%", "border-left": "1px solid " + configuration.colors.lines.separator101, "padding-left": "1em"}}>  
                                                <ChartLine01 series={JSON.stringify([
                                                                            { name : statMetrics[0]['name'], data :  statMetrics[0][selectedOperationMetric['value']]['p95_latency_ms'] },
                                                                            { name : statMetrics[1]['name'],data :  statMetrics[1][selectedOperationMetric['value']]['p95_latency_ms'] }
                                                                            
                                                                    ])} 
                                                title={"Latency (ms)"} height="180px" />
                                            </td>
                                        </tr>
                                    </table> 
                                    
                                    
                                    <br/>
                                    <hr color={configuration.colors.lines.separator101}/>
                                    <table style={{"width":"100%"}}>
                                        <tr> 
                                            <td style={{"width":"15%", "padding-left": "1em"}}>  
                                                <Box variant="h4">Latency P99 (ms)</Box>
                                            </td>
                                        </tr>
                                    </table>
                                    <br/> 
                                    <table style={{"width":"100%"}}>
                                        <tr> 
                                            <td style={{"width":"15%", "padding-left": "1em"}}>  
                                                    <CompMetric01 
                                                        value={ statMetrics[0][selectedOperationMetric['value']]['p99_latency_ms'][statMetrics[0][selectedOperationMetric['value']]['p99_latency_ms'].length-1] || 0}
                                                        title={statMetrics[0]['name']}
                                                        precision={3}
                                                        format={1}
                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                        fontSizeValue={"24px"}
                                                    />
                                            </td>
                                            <td style={{"width":"15%", "padding-left": "1em"}}>  
                                                    <CompMetric01 
                                                        value={ statMetrics[1][selectedOperationMetric['value']]['p99_latency_ms'][statMetrics[1][selectedOperationMetric['value']]['p99_latency_ms'].length-1] || 0}
                                                        title={statMetrics[1]['name']}
                                                        precision={3}
                                                        format={1}
                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                        fontSizeValue={"24px"}
                                                    />
                                            </td>
                                            <td style={{"width":"20%", "border-left": "1px solid " + configuration.colors.lines.separator101, "padding-left": "1em"}}>  
                                                 <ChartDonut01 series={JSON.stringify([
                                                                           (statMetrics[0][selectedOperationMetric['value']]['p99_latency_ms'][statMetrics[0][selectedOperationMetric['value']]['p99_latency_ms'].length-1] || 0) ,     
                                                                           (statMetrics[1][selectedOperationMetric['value']]['p99_latency_ms'][statMetrics[1][selectedOperationMetric['value']]['p99_latency_ms'].length-1] || 0) ,     
                                                                    ])} 
                                                                    labels={JSON.stringify([statMetrics[0]['name'],statMetrics[1]['name']])}
                                                                    height="280px" 
                                                                    width="280px" 
                                                />
                                            </td>
                                            <td style={{"width":"50%", "border-left": "1px solid " + configuration.colors.lines.separator101, "padding-left": "1em"}}>  
                                                <ChartLine01 series={JSON.stringify([
                                                                            { name : statMetrics[0]['name'], data :  statMetrics[0][selectedOperationMetric['value']]['p99_latency_ms'] },
                                                                            { name : statMetrics[1]['name'],data :  statMetrics[1][selectedOperationMetric['value']]['p99_latency_ms'] }
                                                                            
                                                                    ])} 
                                                title={"Latency (ms)"} height="180px" />
                                            </td>
                                        </tr>
                                    </table> 
                                    
                                    
                                </Container>
                            
                                
                                
                                <br/>
                                
         
                </>
                
                
                
            }
        />
    </div>
  );
}

export default Application;

