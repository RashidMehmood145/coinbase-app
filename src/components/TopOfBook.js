import React from "react";

function TopOfBook({ data }) {
  if (!data) return <div>Loading top of book data...</div>;

  // const spread = parseFloat(data.best_ask) - parseFloat(data.best_bid);

  return (
    <div className="top-of-book">
      <h3>Top of Book</h3>
      <div className="bitContainer">
        <div className="best-bid">
          <p>
            Best Bid: {data.best_bid} ({data.best_bid_size})
          </p>
        </div>
        <div className="best-ask">
          <p>
            Best Ask: {data.best_ask} ({data.best_ask_size})
          </p>
        </div>
      </div>

      {/* <div className="extras">
        <p>Spread: {spread.toFixed(2)}</p>
        <p>24h Volume: {data.volume_24h}</p>
      </div> */}
    </div>
  );
}

export default TopOfBook;
