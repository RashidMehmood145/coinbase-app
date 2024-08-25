// components/RealTimePriceChart.js
import React, { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';

function RealTimePriceChart({ pair, data }) {
  const url = process.env.REACT_APP_API_URL || "https://api.pro.coinbase.com";
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
          textColor: 'rgba(33, 56, 77, 1)',
        },
        grid: {
          vertLines: {
            color: 'rgba(197, 203, 206, 0.5)',
          },
          horzLines: {
            color: 'rgba(197, 203, 206, 0.5)',
          },
        },
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
        },
        crosshair: {
          mode: 1, // Use 1 for 'Normal' mode
        },
      });

      seriesRef.current = chartRef.current.addLineSeries();
    }

    // Fetch historical data here and update the chart
    fetchHistoricalData();

    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [pair]);

  useEffect(() => {
    if (data && data.time && data.price && seriesRef.current) {
      seriesRef.current.update({
        time: new Date(data.time).getTime() / 1000,
        value: parseFloat(data.price),
      });
    }
  }, [data]);

  const fetchHistoricalData = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

      const response = await fetch(
        `${url}/products/${pair}/candles?start=${startDate.toISOString()}&end=${endDate.toISOString()}&granularity=3600`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch historical data');
      }

      const historicalData = await response.json();

      // Format the data for the chart
      const formattedData = historicalData.map(candle => ({
        time: candle[0], // Unix timestamp
        value: candle[4], // Closing price
      }));

      // Sort the data by time in ascending order
      formattedData.sort((a, b) => a.time - b.time);

      // Set the historical data on the chart
      seriesRef.current.setData(formattedData);

    } catch (error) {
      console.error('Error fetching historical data:', error);
    }
  };

  return <div className="chart" ref={chartContainerRef} />;
}

export default RealTimePriceChart;