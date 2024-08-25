export const getFormat = (pastData) => {
    return new Promise((res, rej) => {
        try {
          const candles = pastData?.slice(0, 1000);
          if (!candles) throw new Error("Invalid pastData");
    
          const newCandles = candles.map((candle) => {
            const [timestamp, low, high, open, close] = candle.map(Number);
    
            // Convert Unix timestamp to JavaScript Date object
            const date = new Date(timestamp * 1000);
    
            // Prepare candlestick chart data
            const dataEntry = [
              date,  // X-axis (Date object)
              low,   // Y-axis (low price)
              open,  // Y-axis (open price)
              close, // Y-axis (close price)
              high   // Y-axis (high price)
            ];
    
            return dataEntry;
          });
    
          newCandles.reverse();
          newCandles.unshift(["Date", "Low", "Open", "Close", "High"]);
    
          res(newCandles);
        } catch (error) {
          console.error("Error processing data:", error);
          rej(error);
        }
      });
  };
  