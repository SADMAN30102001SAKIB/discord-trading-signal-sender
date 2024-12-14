"use client";

import { useState } from "react";

const TradeForm = () => {
  const [channel, setChannel] = useState("");
  const [signalType, setSignalType] = useState("");
  const [formData, setFormData] = useState({
    direction: "",
    margin: "",
    takeProfit: "",
    price: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleChannelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setChannel(e.target.value);
    setSignalType("");
    setFormData({ direction: "", margin: "", takeProfit: "", price: "" });
  };

  const handleSignalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSignalType(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // API call to send the signal
    const response = await fetch("/api/send-signal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel, signalType, ...formData }),
    });

    if (response.ok) {
      alert("Signal sent successfully!");
    } else {
      alert("Failed to send signal.");
    }
  };

  // Dynamic form rendering based on channel and signal type
  const renderFormFields = () => {
    if (channel === "alerts") {
      switch (signalType) {
        case "trade entry":
        case "reentry":
          return (
            <>
              <input
                type="text"
                name="direction"
                placeholder="Trade Direction (long/short)"
                value={formData.direction}
                onChange={handleInputChange}
              />
              <input
                type="number"
                name="margin"
                placeholder="Margin Percentage"
                value={formData.margin}
                onChange={handleInputChange}
              />
            </>
          );
        case "exit":
          return null; // No additional fields needed for exit
        case "opposite direction entry":
          return (
            <>
              <input
                type="number"
                name="margin"
                placeholder="Margin Percentage (optional)"
                value={formData.margin}
                onChange={handleInputChange}
              />
            </>
          );
      }
    } else if (channel === "signals") {
      switch (signalType) {
        case "trade entry":
          return (
            <>
              <input
                type="text"
                name="direction"
                placeholder="Trade Direction (long/short)"
                value={formData.direction}
                onChange={handleInputChange}
              />
              <input
                type="number"
                name="margin"
                placeholder="Margin Percentage"
                value={formData.margin}
                onChange={handleInputChange}
              />
              <input
                type="number"
                name="takeProfit"
                placeholder="Take Profit Percentage (optional)"
                value={formData.takeProfit}
                onChange={handleInputChange}
              />
              <input
                type="number"
                name="price"
                placeholder="Price (optional)"
                value={formData.price}
                onChange={handleInputChange}
              />
            </>
          );
        case "stop loss":
        case "trailing stop loss":
          return (
            <>
              <input
                type="text"
                name="direction"
                placeholder="Trade Direction (long/short)"
                value={formData.direction}
                onChange={handleInputChange}
              />
              <input
                type="number"
                name="price"
                placeholder="Price"
                value={formData.price}
                onChange={handleInputChange}
              />
            </>
          );
        case "reentry":
          return (
            <>
              <input
                type="text"
                name="direction"
                placeholder="Trade Direction (long/short)"
                value={formData.direction}
                onChange={handleInputChange}
              />
              <input
                type="number"
                name="margin"
                placeholder="Margin Percentage"
                value={formData.margin}
                onChange={handleInputChange}
              />
              <input
                type="number"
                name="price"
                placeholder="Price"
                value={formData.price}
                onChange={handleInputChange}
              />
            </>
          );
        case "exit":
          return (
            <>
              <input
                type="number"
                name="margin"
                placeholder="Percentage (optional)"
                value={formData.margin}
                onChange={handleInputChange}
              />
            </>
          );
      }
    }
    return null;
  };

  return (
    <div>
      <h1>Send Trading Signal</h1>
      <form onSubmit={handleSubmit}>
        <select value={channel} onChange={handleChannelChange}>
          <option value="">Select Channel</option>
          <option value="alerts">Alerts Channel</option>
          <option value="signals">Signals Channel</option>
        </select>

        {channel && (
          <select value={signalType} onChange={handleSignalChange}>
            <option value="">Select Signal Type</option>
            {channel === "alerts" && (
              <>
                <option value="trade entry">Trade Entry</option>
                <option value="reentry">Reentry</option>
                <option value="exit">Exit</option>
                <option value="opposite direction entry">
                  Opposite Direction Entry
                </option>
              </>
            )}
            {channel === "signals" && (
              <>
                <option value="trade entry">Trade Entry</option>
                <option value="stop loss">Stop Loss</option>
                <option value="trailing stop loss">Trailing Stop Loss</option>
                <option value="reentry">Reentry</option>
                <option value="exit">Exit</option>
              </>
            )}
          </select>
        )}

        {renderFormFields()}

        <button type="submit">Send Signal</button>
      </form>
    </div>
  );
};

export default TradeForm;
