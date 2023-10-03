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
                                        Gain Monitoring Insight and Take Action on AWS Database Resources.
                                      </div>
                                      <br/>
                                      <Button variant="primary" href="/rds/instances/" >Get Started</Button>
                                      <br/>
                                      <br/>
                                      <div style={{"color": "white"}}>          
                                        View performance data for AWS Database instances and clusters, so you can quickly identify and act on any issues that might impact database resources.
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
                                            <Badge>1</Badge> Connect to your AWS Database resorces.
                                            <br/>
                                            <br/>
                                            <Badge>2</Badge> Gather realtime performance database metrics from engine itself.
                                            <br/>
                                            <br/>
                                            <Badge>3</Badge> Extract performance from AWS Cloudwatch metrics and Enhanced Monitoring.
                                            <br/>
                                            <br/>
                                            <Badge>4</Badge> Consolidate all information into centralized dashboard.
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
                                        Start connecting to your AWS RDS instances or Amazon Aurora, ElastiCache, MemoryDB, DocumentDB clusters.
                                    </Box>
                                    <br/>
                                    <Button variant="primary" href="/rds/instances/" >Get Started</Button>
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
                                        Monitor instance performance
                                      </Header>
                                      <Box variant="p">
                                        Visualize performance data on realtime, and correlate data to understand and resolve the root cause of performance issues in your database resources.
                                      </Box>
                                    </div>
                                    <div>
                                      <Header variant="h3">
                                        Perform root cause analysis
                                      </Header>
                                      <Box variant="p">
                                        Analyze database and operating system metrics to speed up debugging and reduce overall mean time to resolution.
                                      </Box>
                                    </div>
                                    <div>
                                      <Header variant="h3">
                                        Optimize resources proactively
                                      </Header>
                                      <Box variant="p">
                                        Identify top consumer sessions, gather database statements and resource usages.
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
