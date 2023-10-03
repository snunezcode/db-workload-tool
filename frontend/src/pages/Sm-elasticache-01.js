import {useState,useEffect,useRef} from 'react'
import { createSearchParams } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import Axios from 'axios'
import { configuration, SideMainLayoutHeader,SideMainLayoutMenu, breadCrumbs } from './Configs';

import ColumnLayout from "@cloudscape-design/components/column-layout";
import FormField from "@cloudscape-design/components/form-field";
import Input from "@cloudscape-design/components/input";

import Icon from "@cloudscape-design/components/icon";
import Select from "@cloudscape-design/components/select";
import ExpandableSection from "@cloudscape-design/components/expandable-section";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import CustomHeader from "../components/HeaderApp";
import AppLayout from "@cloudscape-design/components/app-layout";
import SideNavigation from '@cloudscape-design/components/side-navigation';
import Container from "@cloudscape-design/components/container";

import CompMetric01  from '../components/Metric01';
import ChartLine01  from '../components/ChartLine01';
import ChartDonut01  from '../components/ChartDonut01';

import Header from "@cloudscape-design/components/header";
import '@aws-amplify/ui-react/styles.css';



function Application() {
  
  var timeNow = new Date();

  //-- Gather Parameters
  const [params] = useSearchParams();
  var paramCodeId = params.get("codeid");
    
  if (paramCodeId == null)
    paramCodeId = "default";

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
        SET : statStructure
};


  const [statMetrics,setStatMetrics] = useState([
                                                    statStructureList,
                                                    statStructureList
  ]);
    

    const [selectedCluster1,setSelectedCluster1] = useState({});
    const [selectedCluster2,setSelectedCluster2] = useState({});
 
   const optionCluster1 = useRef([]);
   const optionCluster2 = useRef([]);
 
   const workloadStarted = useRef(false);
   const [workloadState, setWorkloadState] = useState(false);
   
   const inputClients = useRef(100);
   const inputShards = useRef(1);
   const inputRandomize = useRef(10000);
   const inputPayload = useRef(3);
   const inputThreads = useRef(1);
   const inputPipelines = useRef(1);
   



   //-- Call API to create workload
   async function createWorkload (){

        try{
        
            var api_url = configuration["apps-settings"]["api-url"];
        
            var params = { srv01 : 
                                    {
                                        id : selectedCluster1['value'],
                                        host :  selectedCluster1['host'], 
                                        port : selectedCluster1['port'],
                                        clients : inputClients.current.value,
                                        shards : inputShards.current.value, 
                                        randomize : inputRandomize.current.value,
                                        payload : inputPayload.current.value,
                                        threads : inputThreads.current.value,
                                        pipeline : inputPipelines.current.value
                                    },
                        
                            srv02 : {
                                        id : selectedCluster2['value'],
                                        host :  selectedCluster2['host'], 
                                        port : selectedCluster2['port'],
                                        clients : inputClients.current.value,
                                        shards : inputShards.current.value, 
                                        randomize : inputRandomize.current.value,
                                        payload : inputPayload.current.value,
                                        threads : inputThreads.current.value,
                                        pipeline : inputPipelines.current.value
                                    }
            };
        
                    
            Axios.get(`${api_url}/api/workload/create/`,{
                      params: params, 
                  }).then((data)=>{
                   console.log(data);
                   workloadStarted.current = true;
                   setWorkloadState(true);
                   
                     
              })
              .catch((err) => {
                  console.log('Timeout API Call : /api/workload/create/' );
                  console.log(err);
                  
              });
              
            //sessionStorage.setItem("x-csrf-token", data.csrfToken );
        }
        catch{
        
          console.log('Timeout API error : /api/workload/create/');                  
          
        }
        
    }
    
   async function removeWorkload (){

        try{
        
            var api_url = configuration["apps-settings"]["api-url"];
        
            var params = [
                            {
                                id : "srv01"
                            },
                            {
                                id : "srv02"
                            },
            ];
        
            Axios.get(`${api_url}/api/workload/stop/`,{
                      params: params
                  }).then((data)=>{
                   console.log(data);
                   workloadStarted.current = false;
                   setWorkloadState(false);
              })
              .catch((err) => {
                  console.log('Timeout API Call : /api/workload/stop/' );
                  console.log(err);
                  
              });
        }
        catch{
        
          console.log('Timeout API error : /api/workload/stop/');                  
          
        }
        
    }
    


   //-- Call API to create workload
   async function gatherMetrics (){
        
            
        try{
        
            var api_url = configuration["apps-settings"]["api-url"];
        
            var params = [
                            {
                                id : "srv01"
                            },
                            {
                                id : "srv02"
                            },
            ];
        
            Axios.get(`${api_url}/api/workload/output/`,{
                      params: params
                  }).then((data)=>{
                   
                   //console.log(data);
                   workloadStarted.current = data.data.status['workloadStarted'];
                   if (workloadStarted.current == true)
                           setStatMetrics(data.data.data);
              })
              .catch((err) => {
                  console.log('Timeout API Call : /api/workload/output/' );
                  console.log(err);
                  
              });
              
              
            //sessionStorage.setItem("x-csrf-token", data.csrfToken );
        }
        catch{
        
          console.log('Timeout API error : /api/workload/output/');                  
          
        }
        
    }
    
    
    //-- Call API to gather clusters
   async function gatherClusters (){
        
        var clusterItems=[];
        
        try{
                   
           
            const { data } = await Axios.get(`${configuration["apps-settings"]["api-url"]}/api/elasticache/cluster/list`);
            //sessionStorage.setItem("x-csrf-token", data.csrfToken );
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
   
   
   
    function onClickCreateWorkload(){
        
        createWorkload();
        
    }
    
    function onClickRemoveWorkload(){
        
        removeWorkload();
        
    }
    
    
    
    useEffect(() => {
        gatherClusters();
    }, []);
    
    
    useEffect(() => {
        const id = setInterval(gatherMetrics, configuration["apps-settings"]["refresh-interval"]);
        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
  
    
  return (
    <div style={{"background-color": "#f2f3f3"}}>
        <CustomHeader/>
        <AppLayout
            breadCrumbs={breadCrumbs}
            navigation={<SideNavigation items={SideMainLayoutMenu} header={SideMainLayoutHeader} activeHref={"/rds/instances/"} />}
            contentType="table"
            content={
                <>
                <br />
                                <Container
                                    header={
                                        <Header
                                          variant="h2"
                                          description={"Model to compare two AWS ElastiCache Clusters using redis-benchmark tool."}
                                        >
                                          Simple Comparation Model
                                        </Header>
                                      }
                                >
                                <br/>
                                
                                <ColumnLayout columns={2}>
                                      <FormField
                                        label="Cluster-1"
                                        description="Select the firts cluster for comparation process"
                                        stretch={true}
                                      >
                                            
                                            
                                            <Select
                                                    disabled={(workloadStarted.current)}
                                                    selectedOption={selectedCluster1}
                                                    onChange={({ detail }) => {
                                                            setSelectedCluster1(detail.selectedOption)
                                                            }
                                                        }
                                                    options={optionCluster1.current}
                                            />
                                            
                                            
                                      </FormField>
                                      <FormField
                                        label="Cluster-2"
                                        description="Select the second cluster for comparation process"
                                        stretch={true}
                                      >
                                        
                                        <Select
                                                    disabled={(workloadStarted.current)}
                                                    selectedOption={selectedCluster2}
                                                    onChange={({ detail }) => {
                                                            setSelectedCluster2(detail.selectedOption)
                                                            }
                                                        }
                                                    options={optionCluster2.current}
                                        />
                                        
                                        
                                  </FormField>
                                </ColumnLayout>
                                            
                                <ColumnLayout columns={4}>  
                                    <FormField
                                        label="Clients"
                                        description="Indicate the number of clients"
                                        stretch={true}
                                      >
                                       <input type="number" ref={inputClients} disabled={(workloadStarted.current)} defaultValue="100" />
                                    </FormField>
                                    
                                    <FormField
                                        label="Shards"
                                        description="Indicate the number of shards"
                                        stretch={true}
                                      >
                                            <input type="number" ref={inputShards} disabled={(workloadStarted.current)} defaultValue="1" />
                                    </FormField>
                                    
                                    <FormField
                                        label="Randomize"
                                        description="Indicate the random keyspace length"
                                        stretch={true}
                                      >
                                            <input type="number" ref={inputRandomize} disabled={(workloadStarted.current)} defaultValue="10000" />
                                    </FormField>
                                    
                                    <FormField
                                        label="Payload"
                                        description="Indicate the data size payload"
                                        stretch={true}
                                      > 
                                                <input type="number" ref={inputPayload} disabled={(workloadStarted.current)} defaultValue="3" />
                                                
                                    </FormField>
                                </ColumnLayout>
                         
                         
                                <ColumnLayout columns={4}>
                                    <FormField
                                        label="Threads"
                                        description="Indicate the number of threads"
                                        stretch={true}
                                      >
                                            <input type="number" ref={inputThreads}  disabled={(workloadStarted.current)} defaultValue="1" />
                                    </FormField>
                                    
                                    <FormField
                                        label="Pipelines"
                                        description="Indicate the number of pipelines"
                                        stretch={true}
                                      >
                                            <input type="number" ref={inputPipelines} disabled={(workloadStarted.current)} defaultValue="1" />
                                    </FormField>
                                    
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
                                    
                                   
                                </ColumnLayout>
                         
                                <br/>
                                <Box float="right">
                                      <SpaceBetween direction="horizontal" size="xs">
                                        <Button disabled={!(workloadStarted.current)}  variant="primary" onClick={onClickRemoveWorkload}>Stop Workload</Button>
                                        <Button disabled={workloadStarted.current}  variant="primary" onClick={onClickCreateWorkload}>Start Workload</Button>
                                      </SpaceBetween>
                                </Box>
                                </Container>
                                <br/>
                                
                                
                                {/*   Type : rps  */}
                                <Container>
                                    <Box variant="h2">Requests/second</Box>
                                    <br/>
                                    <Box variant="h4">SET-Commands</Box>
                                    <table style={{"width":"100%"}}>
                                        <tr> 
                                            <td style={{"width":"15%", "padding-left": "1em"}}>  
                                                    <CompMetric01 
                                                        value={ statMetrics[0]['SET']['rps'][statMetrics[0]['SET']['rps'].length-1] || 0}
                                                        title={statMetrics[0]['name']}
                                                        precision={0}
                                                        format={3}
                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                        fontSizeValue={"24px"}
                                                    />
                                            </td>
                                            <td style={{"width":"15%", "padding-left": "1em"}}>  
                                                    <CompMetric01 
                                                        value={ statMetrics[1]['SET']['rps'][statMetrics[1]['SET']['rps'].length-1] || 0}
                                                        title={statMetrics[1]['name']}
                                                        precision={0}
                                                        format={3}
                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                        fontSizeValue={"24px"}
                                                    />
                                            </td>
                                            <td style={{"width":"20%", "border-left": "1px solid red", "padding-left": "1em"}}>  
                                                 <ChartDonut01 series={[
                                                                           (statMetrics[0]['SET']['rps'][statMetrics[0]['SET']['rps'].length-1] || 0) ,     
                                                                           (statMetrics[1]['SET']['rps'][statMetrics[1]['SET']['rps'].length-1] || 0) ,     
                                                                    ]} 
                                                                    labels={[statMetrics[0]['name'],statMetrics[1]['name']]}
                                                                    height="280px" 
                                                                    width="280px" 
                                                />
                                            </td>
                                            <td style={{"width":"50%", "border-left": "1px solid red", "padding-left": "1em"}}>  
                                                 <ChartLine01 series={[
                                                                            { name : statMetrics[0]['name'], data :  statMetrics[0]['SET']['rps'] },
                                                                            { name : statMetrics[1]['name'],data :  statMetrics[1]['SET']['rps'] }
                                                                            
                                                                    ]} 
                                                timestamp={timeNow.getTime()} title={"Requests/sec"} height="180px" />
                                            </td>
                                        </tr>
                                    </table> 
                                    <br/>
                                    <br/>
                                    <Box variant="h4">GET-Commands</Box>
                                    <table style={{"width":"100%"}}>
                                        <tr>
                                            
                                            <td style={{"width":"15%", "padding-left": "1em"}}>  
                                                    <CompMetric01 
                                                        value={ statMetrics[0]['GET']['rps'][statMetrics[0]['GET']['rps'].length-1] || 0}
                                                        title={statMetrics[0]['name']}
                                                        precision={0}
                                                        format={3}
                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                        fontSizeValue={"24px"}
                                                    />
                                            </td>
                                            <td style={{"width":"15%", "padding-left": "1em"}}>  
                                                    <CompMetric01 
                                                        value={ statMetrics[1]['GET']['rps'][statMetrics[1]['GET']['rps'].length-1] || 0}
                                                        title={statMetrics[1]['name']}
                                                        precision={0}
                                                        format={3}
                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                        fontSizeValue={"24px"}
                                                    />
                                            </td>
                                            <td style={{"width":"20%", "border-left": "1px solid red", "padding-left": "1em"}}>  
                                                 <ChartDonut01 series={[
                                                                           (statMetrics[0]['GET']['rps'][statMetrics[0]['GET']['rps'].length-1] || 0) ,     
                                                                           (statMetrics[1]['GET']['rps'][statMetrics[1]['GET']['rps'].length-1] || 0) ,     
                                                                    ]} 
                                                                    labels={[statMetrics[0]['name'],statMetrics[1]['name']]}
                                                                    height="280px" 
                                                                    width="280px" 
                                                />
                                            </td>
                                            <td style={{"width":"50%", "border-left": "1px solid red", "padding-left": "1em"}}>  
                                                 <ChartLine01 series={[
                                                                            { name : statMetrics[0]['name'], data :  statMetrics[0]['GET']['rps'] },
                                                                            { name : statMetrics[1]['name'],data :  statMetrics[1]['GET']['rps'] }
                                                                            
                                                                    ]} 
                                                timestamp={timeNow.getTime()} title={"Requests/sec"} height="180px" />
                                            </td>
                                        </tr>
                                    </table>  
                                </Container>
                                <br/>
                                {/*   Type : avg_latency_ms  */}
                                <Container>
                                    <Box variant="h2">Average latency (ms)</Box>
                                    <br/>
                                    <Box variant="h4">SET-Commands</Box>
                                    <table style={{"width":"100%"}}>
                                        <tr> 
                                            <td style={{"width":"15%", "padding-left": "1em"}}>  
                                                    <CompMetric01 
                                                        value={ statMetrics[0]['SET']['avg_latency_ms'][statMetrics[0]['SET']['avg_latency_ms'].length-1] || 0}
                                                        title={statMetrics[0]['name']}
                                                        precision={3}
                                                        format={1}
                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                        fontSizeValue={"24px"}
                                                    />
                                            </td>
                                            <td style={{"width":"15%", "padding-left": "1em"}}>  
                                                    <CompMetric01 
                                                        value={ statMetrics[1]['SET']['avg_latency_ms'][statMetrics[1]['SET']['avg_latency_ms'].length-1] || 0}
                                                        title={statMetrics[1]['name']}
                                                        precision={3}
                                                        format={1}
                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                        fontSizeValue={"24px"}
                                                    />
                                            </td>
                                            <td style={{"width":"20%", "border-left": "1px solid red", "padding-left": "1em"}}>  
                                                 <ChartDonut01 series={[
                                                                           (statMetrics[0]['SET']['avg_latency_ms'][statMetrics[0]['SET']['avg_latency_ms'].length-1] || 0) ,     
                                                                           (statMetrics[1]['SET']['avg_latency_ms'][statMetrics[1]['SET']['avg_latency_ms'].length-1] || 0) ,     
                                                                    ]} 
                                                                    labels={[statMetrics[0]['name'],statMetrics[1]['name']]}
                                                                    height="280px" 
                                                                    width="280px" 
                                                />
                                            </td>
                                            <td style={{"width":"50%", "border-left": "1px solid red", "padding-left": "1em"}}>  
                                                 <ChartLine01 series={[
                                                                            { name : statMetrics[0]['name'], data :  statMetrics[0]['SET']['avg_latency_ms'] },
                                                                            { name : statMetrics[1]['name'],data :  statMetrics[1]['SET']['avg_latency_ms'] }
                                                                            
                                                                    ]} 
                                                timestamp={timeNow.getTime()} title={"Latency(ms)"} height="180px" />
                                            </td>
                                        </tr>
                                    </table> 
                                    <br/>
                                    <br/>
                                    <Box variant="h4">GET-Commands</Box>
                                    <table style={{"width":"100%"}}>
                                        <tr> 
                                            <td style={{"width":"15%", "padding-left": "1em"}}>  
                                                    <CompMetric01 
                                                        value={ statMetrics[0]['GET']['avg_latency_ms'][statMetrics[0]['GET']['avg_latency_ms'].length-1] || 0}
                                                        title={statMetrics[0]['name']}
                                                        precision={3}
                                                        format={1}
                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                        fontSizeValue={"24px"}
                                                    />
                                            </td>
                                            <td style={{"width":"15%", "padding-left": "1em"}}>  
                                                    <CompMetric01 
                                                        value={ statMetrics[1]['GET']['avg_latency_ms'][statMetrics[1]['GET']['avg_latency_ms'].length-1] || 0}
                                                        title={statMetrics[1]['name']}
                                                        precision={3}
                                                        format={1}
                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                        fontSizeValue={"24px"}
                                                    />
                                            </td>
                                            <td style={{"width":"20%", "border-left": "1px solid red", "padding-left": "1em"}}>  
                                                 <ChartDonut01 series={[
                                                                           (statMetrics[0]['GET']['avg_latency_ms'][statMetrics[0]['GET']['avg_latency_ms'].length-1] || 0) ,     
                                                                           (statMetrics[1]['GET']['avg_latency_ms'][statMetrics[1]['GET']['avg_latency_ms'].length-1] || 0) ,     
                                                                    ]} 
                                                                    labels={[statMetrics[0]['name'],statMetrics[1]['name']]}
                                                                    height="280px" 
                                                                    width="280px" 
                                                />
                                            </td>
                                            <td style={{"width":"50%", "border-left": "1px solid red", "padding-left": "1em"}}>  
                                                 <ChartLine01 series={[
                                                                            { name : statMetrics[0]['name'], data :  statMetrics[0]['GET']['avg_latency_ms'] },
                                                                            { name : statMetrics[1]['name'],data :  statMetrics[1]['GET']['avg_latency_ms'] }
                                                                            
                                                                    ]} 
                                                timestamp={timeNow.getTime()} title={"Latency(ms)"} height="180px" />
                                            </td>
                                        </tr>
                                    </table>  
                                </Container>
                                <br/>
                                {/*   Type : max_latency_ms  */}
                                <Container>
                                    <Box variant="h2">Max latency (ms)</Box>
                                    <br/>
                                    <Box variant="h4">SET-Commands</Box>
                                    <table style={{"width":"100%"}}>
                                        <tr> 
                                            <td style={{"width":"15%", "padding-left": "1em"}}>  
                                                    <CompMetric01 
                                                        value={ statMetrics[0]['SET']['max_latency_ms'][statMetrics[0]['SET']['max_latency_ms'].length-1] || 0}
                                                        title={statMetrics[0]['name']}
                                                        precision={3}
                                                        format={1}
                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                        fontSizeValue={"24px"}
                                                    />
                                            </td>
                                            <td style={{"width":"15%", "padding-left": "1em"}}>  
                                                    <CompMetric01 
                                                        value={ statMetrics[1]['SET']['max_latency_ms'][statMetrics[1]['SET']['max_latency_ms'].length-1] || 0}
                                                        title={statMetrics[1]['name']}
                                                        precision={3}
                                                        format={1}
                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                        fontSizeValue={"24px"}
                                                    />
                                            </td>
                                            <td style={{"width":"20%", "border-left": "1px solid red", "padding-left": "1em"}}>  
                                                 <ChartDonut01 series={[
                                                                           (statMetrics[0]['SET']['max_latency_ms'][statMetrics[0]['SET']['max_latency_ms'].length-1] || 0) ,     
                                                                           (statMetrics[1]['SET']['max_latency_ms'][statMetrics[1]['SET']['max_latency_ms'].length-1] || 0) ,     
                                                                    ]} 
                                                                    labels={[statMetrics[0]['name'],statMetrics[1]['name']]}
                                                                    height="280px" 
                                                                    width="280px" 
                                                />
                                            </td>
                                            <td style={{"width":"50%", "border-left": "1px solid red", "padding-left": "1em"}}>  
                                                 <ChartLine01 series={[
                                                                            { name : statMetrics[0]['name'], data :  statMetrics[0]['SET']['max_latency_ms'] },
                                                                            { name : statMetrics[1]['name'],data :  statMetrics[1]['SET']['max_latency_ms'] }
                                                                            
                                                                    ]} 
                                                timestamp={timeNow.getTime()} title={"Latency(ms)"} height="180px" />
                                            </td>
                                        </tr>
                                    </table> 
                                    <br/>
                                    <br/>
                                    <Box variant="h4">GET-Commands</Box>
                                    <table style={{"width":"100%"}}>
                                        <tr> 
                                            <td style={{"width":"15%", "padding-left": "1em"}}>  
                                                    <CompMetric01 
                                                        value={ statMetrics[0]['GET']['max_latency_ms'][statMetrics[0]['GET']['max_latency_ms'].length-1] || 0}
                                                        title={statMetrics[0]['name']}
                                                        precision={3}
                                                        format={1}
                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                        fontSizeValue={"24px"}
                                                    />
                                            </td>
                                            <td style={{"width":"15%", "padding-left": "1em"}}>  
                                                    <CompMetric01 
                                                        value={ statMetrics[1]['GET']['max_latency_ms'][statMetrics[1]['GET']['max_latency_ms'].length-1] || 0}
                                                        title={statMetrics[1]['name']}
                                                        precision={3}
                                                        format={1}
                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                        fontSizeValue={"24px"}
                                                    />
                                            </td>
                                            <td style={{"width":"20%", "border-left": "1px solid red", "padding-left": "1em"}}>  
                                                 <ChartDonut01 series={[
                                                                           (statMetrics[0]['GET']['max_latency_ms'][statMetrics[0]['GET']['max_latency_ms'].length-1] || 0) ,     
                                                                           (statMetrics[1]['GET']['max_latency_ms'][statMetrics[1]['GET']['max_latency_ms'].length-1] || 0) ,     
                                                                    ]} 
                                                                    labels={[statMetrics[0]['name'],statMetrics[1]['name']]}
                                                                    height="280px" 
                                                                    width="280px" 
                                                />
                                            </td>
                                            <td style={{"width":"50%", "border-left": "1px solid red", "padding-left": "1em"}}>  
                                                 <ChartLine01 series={[
                                                                            { name : statMetrics[0]['name'], data :  statMetrics[0]['GET']['max_latency_ms'] },
                                                                            { name : statMetrics[1]['name'],data :  statMetrics[1]['GET']['max_latency_ms'] }
                                                                            
                                                                    ]} 
                                                timestamp={timeNow.getTime()} title={"Latency(ms)"} height="180px" />
                                            </td>
                                        </tr>
                                    </table>  
                                </Container>
                                <br/>
                                {/*   Type : min_latency_ms  */}
                                <Container>
                                    <Box variant="h2">Min latency (ms)</Box>
                                    <br/>
                                    <Box variant="h4">SET-Commands</Box>
                                    <table style={{"width":"100%"}}>
                                        <tr> 
                                            <td style={{"width":"15%", "padding-left": "1em"}}>  
                                                    <CompMetric01 
                                                        value={ statMetrics[0]['SET']['min_latency_ms'][statMetrics[0]['SET']['min_latency_ms'].length-1] || 0}
                                                        title={statMetrics[0]['name']}
                                                        precision={3}
                                                        format={1}
                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                        fontSizeValue={"24px"}
                                                    />
                                            </td>
                                            <td style={{"width":"15%", "padding-left": "1em"}}>  
                                                    <CompMetric01 
                                                        value={ statMetrics[1]['SET']['min_latency_ms'][statMetrics[1]['SET']['min_latency_ms'].length-1] || 0}
                                                        title={statMetrics[1]['name']}
                                                        precision={3}
                                                        format={1}
                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                        fontSizeValue={"24px"}
                                                    />
                                            </td>
                                            <td style={{"width":"20%", "border-left": "1px solid red", "padding-left": "1em"}}>  
                                                 <ChartDonut01 series={[
                                                                           (statMetrics[0]['SET']['min_latency_ms'][statMetrics[0]['SET']['min_latency_ms'].length-1] || 0) ,     
                                                                           (statMetrics[1]['SET']['min_latency_ms'][statMetrics[1]['SET']['min_latency_ms'].length-1] || 0) ,     
                                                                    ]} 
                                                                    labels={[statMetrics[0]['name'],statMetrics[1]['name']]}
                                                                    height="280px" 
                                                                    width="280px" 
                                                />
                                            </td>
                                            <td style={{"width":"50%", "border-left": "1px solid red", "padding-left": "1em"}}>  
                                                 <ChartLine01 series={[
                                                                            { name : statMetrics[0]['name'], data :  statMetrics[0]['SET']['min_latency_ms'] },
                                                                            { name : statMetrics[1]['name'],data :  statMetrics[1]['SET']['min_latency_ms'] }
                                                                            
                                                                    ]} 
                                                timestamp={timeNow.getTime()} title={"Latency(ms)"} height="180px" />
                                            </td>
                                        </tr>
                                    </table> 
                                    <br/>
                                    <br/>
                                    <Box variant="h4">GET-Commands</Box>
                                    <table style={{"width":"100%"}}>
                                        <tr> 
                                            <td style={{"width":"15%", "padding-left": "1em"}}>  
                                                    <CompMetric01 
                                                        value={ statMetrics[0]['GET']['min_latency_ms'][statMetrics[0]['GET']['min_latency_ms'].length-1] || 0}
                                                        title={statMetrics[0]['name']}
                                                        precision={3}
                                                        format={1}
                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                        fontSizeValue={"24px"}
                                                    />
                                            </td>
                                            <td style={{"width":"15%", "padding-left": "1em"}}>  
                                                    <CompMetric01 
                                                        value={ statMetrics[1]['GET']['min_latency_ms'][statMetrics[1]['GET']['min_latency_ms'].length-1] || 0}
                                                        title={statMetrics[1]['name']}
                                                        precision={3}
                                                        format={1}
                                                        fontColorValue={configuration.colors.fonts.metric100}
                                                        fontSizeValue={"24px"}
                                                    />
                                            </td>
                                            <td style={{"width":"20%", "border-left": "1px solid red", "padding-left": "1em"}}>  
                                                 <ChartDonut01 series={[
                                                                           (statMetrics[0]['GET']['min_latency_ms'][statMetrics[0]['GET']['min_latency_ms'].length-1] || 0) ,     
                                                                           (statMetrics[1]['GET']['min_latency_ms'][statMetrics[1]['GET']['min_latency_ms'].length-1] || 0) ,     
                                                                    ]} 
                                                                    labels={[statMetrics[0]['name'],statMetrics[1]['name']]}
                                                                    height="280px" 
                                                                    width="280px" 
                                                />
                                            </td>
                                            <td style={{"width":"50%", "border-left": "1px solid red", "padding-left": "1em"}}>  
                                                 <ChartLine01 series={[
                                                                            { name : statMetrics[0]['name'], data :  statMetrics[0]['GET']['min_latency_ms'] },
                                                                            { name : statMetrics[1]['name'],data :  statMetrics[1]['GET']['min_latency_ms'] }
                                                                            
                                                                    ]} 
                                                timestamp={timeNow.getTime()} title={"Latency(ms)"} height="180px" />
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

