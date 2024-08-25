import React, { useEffect, useRef } from "react";
import { createChart, CrosshairMode } from "lightweight-charts";

const CoinbaseWaterfall = ({ pastData, currentPrice, lastUpdate }) => {
  const chartContainerRef = useRef();
  const chartRef = useRef();
  const seriesRef = useRef();

  useEffect(() => {
    if (!chartRef.current) {
      chartRef.current = createChart(chartContainerRef.current, {
        width: 1000,
        height: 400,
        layout: {
          backgroundColor: '#ffffff',
          textColor: "rgba(33, 56, 77, 1)",
        },
        grid: {
          vertLines: {
            color: "rgba(197, 203, 206, 0.5)",
          },
          horzLines: {
            color: "rgba(197, 203, 206, 0.5)",
          },
        },
        crosshair: {
          mode: CrosshairMode.Normal,
        },
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
        },
        watermark: {
          visible: true,
        },
        logo: {
          visible: false,
        },
      });

      seriesRef.current = chartRef.current.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderUpColor: '#26a69a',
        borderDownColor: '#ef5350',
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350'
      });
    }

    if (pastData && pastData.length > 0) {
      const formattedPastData = pastData.map((d) => ({
        time: d[0],
        open: parseFloat(d[1]),
        high: parseFloat(d[2]),
        low: parseFloat(d[3]),
        close: parseFloat(d[4]),
      }));
      seriesRef.current.setData(formattedPastData);
    }
  }, [pastData]);

  useEffect(() => {
    if (seriesRef.current && currentPrice && lastUpdate && pastData.length > 0) {
      const lastCandle = pastData[pastData.length - 1];
      const currentTime = Math.floor(Date.now() / 1000);
      const candleTime = Math.floor(currentTime / 86400) * 86400;

      if (candleTime > lastCandle[0]) {
        // Add a new candle for the current day
        seriesRef.current.update({
          time: candleTime,
          open: parseFloat(lastCandle[4]),
          high: Math.max(parseFloat(lastCandle[4]), currentPrice),
          low: Math.min(parseFloat(lastCandle[4]), currentPrice),
          close: currentPrice,
        });
      } else {
        // Update the last candle
        seriesRef.current.update({
          time: lastCandle[0],
          open: parseFloat(lastCandle[1]),
          high: Math.max(parseFloat(lastCandle[2]), currentPrice),
          low: Math.min(parseFloat(lastCandle[3]), currentPrice),
          close: currentPrice,
        });
      }
    }
  }, [currentPrice, lastUpdate, pastData]);

  return (
    <div>
      {pastData ? (
        <div className="chart" ref={chartContainerRef}></div>
      ) : (
        "Loading chart..."
      )}
    </div>
  );
};

export default CoinbaseWaterfall;