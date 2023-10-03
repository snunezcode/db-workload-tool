import {useState,useEffect} from 'react'

import { SideMainLayoutHeader,SideMainLayoutMenu, breadCrumbs } from './Configs';

import CustomHeader from "../components/HeaderApp";
import AppLayout from "@cloudscape-design/components/app-layout";
import SideNavigation from '@cloudscape-design/components/side-navigation';
import ContentLayout from '@cloudscape-design/components/content-layout';
import { configuration } from './Configs';

import Button from "@cloudscape-design/components/button";
import Container from "@cloudscape-design/components/container";
import Header from "@cloudscape-design/components/header";
import Box from "@cloudscape-design/components/box";
import ColumnLayout from "@cloudscape-design/components/column-layout";
import Badge from "@cloudscape-design/components/badge";

import '@aws-amplify/ui-react/styles.css';

export const splitPanelI18nStrings: SplitPanelProps.I18nStrings = {
  preferencesTitle: 'Split panel preferences',
  preferencesPositionLabel: 'Split panel position',
  preferencesPositionDescription: 'Choose the default split panel position for the service.',
  preferencesPositionSide: 'Side',
  preferencesPositionBottom: 'Bottom',
  preferencesConfirm: 'Confirm',
  preferencesCancel: 'Cancel',
  closeButtonAriaLabel: 'Close panel',
  openButtonAriaLabel: 'Open panel',
  resizeHandleAriaLabel: 'Resize split panel',
};


function Home() {
  
  return (
      
    <div style={{"background-color": "#f2f3f3"}}>
      <CustomHeader/>
      <AppLayout
          navigationOpen={false}
          breadCrumbs={breadCrumbs}
          navigation={<SideNavigation items={SideMainLayoutMenu} header={SideMainLayoutHeader} activeHref={"/"} />}
          contentType="table"
          content={
              <ContentLayout 
                    header = {
                            <Header variant="h2"
                                    description={
                                      <>
                                      <br/>
                                      <div style={{"color": "white", "font-family": "arial,sans-serif", "font-size": "20px"}}>          
                                        Welcome to {configuration["apps-settings"]["application-title"]}
                                      </div>
                                      <br/>
                                      <div style={{"color": "white", "font-family": "arial,sans-serif", "font-size": "35px"}}>          
                                        Perform Real-Time Workload Testing on AWS Database Resources.
                                      </div>
                                      <br/>
                                      <Button variant="primary" href="/elasticache/simple" >Get Started</Button>
                                      <br/>
                                      <br/>
                                      <div style={{"color": "white"}}>          
                                        Generate Real-Time Database Workloads on your AWS Database instances and clusters, so you can quickly simulate real world loads and visualize how your system respond.
                                      </div>
                                      </>
                                      
                                      
                                    }
                              
                            >
                              
                            </Header>
                            
                          }
              >
            
              <div>
                    <ColumnLayout columns={2} >
                      
                      <div>
                          <Container
                                header = {
                                  <Header variant="h2">
                                    How it works?
                                  </Header>
                                  
                                }
                            >
                                  <div>
                                            <Badge>1</Badge> Select database resources for workload testing
                                            <br/>
                                            <br/>
                                            <Badge>2</Badge> Setup workload scenario
                                            <br/>
                                            <br/>
                                            <Badge>3</Badge> Start workload testing
                                            <br/>
                                            <br/>
                                            <Badge>4</Badge> Visualize on real-time workload metrics
                                  </div>
                        </Container>
                        
                    </div>
                    
                    <div>
                          <Container
                                header = {
                                  <Header variant="h2">
                                    Getting Started
                                  </Header>
                                  
                                }
                            >
                                  <div>
                                    <Box variant="p">
                                        Start performing database workloads for your AWS RDS instances or Amazon Aurora, ElastiCache, MemoryDB, DocumentDB clusters.
                                    </Box>
                                    <br/>
                                    <Button variant="primary" href="/elasticache/simple" >Get Started</Button>
                                    <br/>
                                    <br/>
                                  </div>
                        </Container>
                        
                    </div>
                    
                
                </ColumnLayout>
                <br/>
                <Container
                            header = {
                              <Header variant="h2">
                                Use cases
                              </Header>
                              
                            }
                        >
                               <ColumnLayout columns={1} variant="text-grid">
                                    <div>
                                      <Header variant="h3">
                                        Compare Database Architectures
                                      </Header>
                                      <Box variant="p">
                                        Perform workload testing to compare database architectures, different instance sizes or number of nodes.
                                      </Box>
                                    </div>
                                    <div>
                                      <Header variant="h3">
                                        Compare Database Versions
                                      </Header>
                                      <Box variant="p">
                                        Perform workload testing to compare database versions, minor or major releases.
                                      </Box>
                                    </div>
                                    <div>
                                      <Header variant="h3">
                                        Compare Database Configurations
                                      </Header>
                                      <Box variant="p">
                                        Perform workload testing to compare configurations parameters and database settings.
                                      </Box>
                                    </div>
                                    
                              </ColumnLayout>
      
                    </Container>
                    
                    
                </div>
                </ContentLayout>
              
          }
        />
        
    </div>
  );
}

export default Home;
