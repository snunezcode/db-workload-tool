import {useState,useEffect,useRef} from 'react';
import Chart from 'react-apexcharts';

function ChartDonut({series, labels, height, width="100%", title, }) {

    var options = {
              chart: {
                type: 'donut',
                height: height,
              },
              legend: {
                position: 'bottom'
              },
              responsive: [{
                breakpoint: 480,
                options: {
                  chart: {
                    width: 200
                  },
                  legend: {
                    position: 'bottom'
                  }
                }
              }],
              labels: labels
            };
            
    return (
            <div>
                <Chart options={options} series={series} type="donut" width={width} height={height} />
            </div>
           );
}

export default ChartDonut;