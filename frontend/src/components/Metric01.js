import {useState,useEffect} from 'react'
import * as awsui from '@cloudscape-design/design-tokens';
import Link from "@cloudscape-design/components/link";



function Metric({ value, title, precision, format=1, fontSizeTitle = "11px", fontSizeValue = "22px", fontColorTitle = "#C6C2C1", fontColorValue = "orange" }) {

    const [counterValue,setCountervalue] = useState(0);
    
    function updateMetrics(){
      try {
            switch (format) {
              case 1:
                setCountervalue(CustomFormatNumberRaw(value,precision));
                break;
                
              case 2:
                setCountervalue(CustomFormatNumberData(value,precision));
                break;
              
              case 3:
                setCountervalue(CustomFormatNumberRawInteger(value,0));
                break;
              
            }

      }
      catch{
        console.log('error');
      }
      
       
    }
    
    // eslint-disable-next-line
    useEffect(() => {
      updateMetrics();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);
    
    
    
    function CustomFormatNumberData(value,decimalLength) {
        if(value == 0) return '0';
        if(value < 1024) return parseFloat(value).toFixed(decimalLength);
        
        var k = 1024,
        sizes = ['', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZT', 'YB'],
        i = Math.floor(Math.log(value) / Math.log(k));
        return parseFloat((value / Math.pow(k, i)).toFixed(decimalLength)) + ' ' + sizes[i];
    }
    
    
    function CustomFormatNumberRaw(value,decimalLength) {
        if (value < 100 && decimalLength == 0 )
          decimalLength=2;
       
        if (value==0)
          decimalLength=0;

        return value.toLocaleString('en-US', {minimumFractionDigits:decimalLength, maximumFractionDigits:decimalLength}); 

    }
    
    function CustomFormatNumberRawInteger(value,decimalLength) {
        return value.toLocaleString('en-US', {minimumFractionDigits:decimalLength, maximumFractionDigits:decimalLength}); 
    }
    
    return (
            <div>
                <span style={{"font-size": fontSizeValue, "font-weight": "500","font-family": "Orbitron", "color": fontColorValue }}>
                    {counterValue}
                </span>
                <br/>
                <span style={{"font-size": fontSizeTitle,"font-weight": "450","font-family": "Verdana", }}>
                    {title}
                </span>
          
            </div>
           )
}

export default Metric
