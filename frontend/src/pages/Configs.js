
const domain = window.location.hostname;
var wsProtocol = "";

console.log(window.location.protocol);

if (window.location.protocol=="http:")
    wsProtocol = "ws";
else
    wsProtocol = "wss";


export const configuration = 
{
    "apps-settings": {
        "refresh-interval": 5*1000,
        "api-url": "",
        "release" : "0.1.0",
        "application-title": "AWS ElasticCache - Workload Comparation Tool",
        "socket-url": wsProtocol + "://" + domain + ":3003",
    },
    "colors": {
        "fonts" : {
            "metric102" : "#4595dd",
            "metric101" : "#e59400",
            "metric100" : "#e59400",
        },
        "lines" : {
            "separator100" : "#737c85"
            
        }
    }
    
};

export const modulesInfo = {
    "default" : { title: 'Demo Data Types', description: 'This demo show how use data types.' },
    "dt01" : { title: 'Counter Type', description: 'This demo show how use incremental values types.' },
    "dt02" : { title: 'LeaderBoard', description: 'This demo show how use leader board values types.' }
};

export const SideMainLayoutHeader = { text: 'Workload Models', href: '#/' };

export const SideMainLayoutMenu = [
    {
      text: 'Resources',
      type: 'section',
      defaultExpanded: true,
      items: [
          { type: "link", text: "Simple Model", href: "/?codeid=dt01" },
          { type: "link", text: "Complex Model", href: "/?codeid=dt02" },
          { type: "link", text: "Settings", href: "/?codeid=dt01" },
      ],
    },
    { type: "divider" },
    {
          type: "link",
          text: "Documentation",
          href: "https://github.com/rlunar/redis-tool-box",
          external: true,
          externalIconAriaLabel: "Opens in a new tab"
    }
  ];


export const breadCrumbs = [{text: 'Service',href: '#',},{text: 'Resource search',href: '#',},];



  