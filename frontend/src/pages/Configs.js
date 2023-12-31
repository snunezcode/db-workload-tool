
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
        "application-title": " Real-time Database Workload Solution",
        "socket-url": wsProtocol + "://" + domain + ":3003",
        "version-code-url" : "https://version.code.ds.wwcs.aws.dev/",
    },
    "colors": {
        "fonts" : {
            "metric102" : "#4595dd",
            "metric101" : "#e59400",
            "metric100" : "#e59400",
        },
        "lines" : {
            "separator100" : "#737c85",
            "separator101" : "#e7eaea",
            
        }
    },
    "ui": {
        "library" : "@awsui/components-react/",
        "library-passive" : "@cloudscape-design/components/",
    }
    
};

export const SideMainLayoutHeader = { text: 'Workload Models', href: '/' };

export const SideMainLayoutMenu = [
    {
      text: 'ElastiCache for Redis',
      type: 'section',
      defaultExpanded: true,
      items: [
          { type: "link", text: "Single Model", href: "/elasticache/single" },
          { type: "link", text: "SideBySide Model", href: "/elasticache/side-by-side" },
          { type: "link", text: "Settings", href: "#" },
      ],
    },
    { type: "divider" },
    {
          type: "link",
          text: "Documentation",
          href: "https://github.com/snunezcode/db-workload-tool/",
          external: true,
          externalIconAriaLabel: "Opens in a new tab"
    }
  ];


export const breadCrumbs = [{text: 'Service',href: '#',},{text: 'Resource search',href: '#',},];



  