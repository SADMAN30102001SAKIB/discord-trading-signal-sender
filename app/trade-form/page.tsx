"use client";

import { useState } from "react";
import Modal from "../components/Modal";

const TradeForm = () => {
  const [channel, setChannel] = useState("");
  const [signalType, setSignalType] = useState("");
  const [formData, setFormData] = useState({
    coin: "ETH",
    direction: "LONG",
    margin: "",
    takeProfit: 1,
    entryPrice: "",
    slPrice: "",
    entry1stPrice: "",
  });
  const [modalMessage, setModalMessage] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleChannelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setChannel(e.target.value);
    setSignalType("");
    setFormData({
      coin: "ETH",
      direction: "LONG",
      margin: "",
      takeProfit: 1,
      entryPrice: "",
      slPrice: "",
      entry1stPrice: "",
    });
  };

  const handleSignalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSignalType(e.target.value);
  };

  const sendSignal = async (data: {
    coin: string;
    direction: string;
    margin: string;
    takeProfit: number;
    entryPrice: string;
    slPrice: string;
    entry1stPrice: string;
  }) => {
    const response = await fetch("/api/send-signal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel, signalType, ...data }),
    });

    if (response.ok) {
      setModalMessage("Signal sent successfully!");
    } else {
      setModalMessage("Failed to send signal.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.entryPrice &&
      channel === "signals" &&
      (signalType === "trade entry" || signalType === "reentry")
    ) {
      const { coin } = formData;
      const url =
        coin === "ETH"
          ? "https://api.coinbase.com/v2/prices/ETH-USD/spot"
          : "https://api.coinbase.com/v2/prices/BTC-USD/spot";

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);

        if (response.ok) {
          const data = await response.json();
          const updatedFormData = {
            ...formData,
            entryPrice: data.data.amount,
          };
          await sendSignal(updatedFormData);
        } else {
          setModalMessage(
            `Error fetching price, status code: ${response.status}`,
          );
          return;
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          setModalMessage("API Request timed out.");
        } else {
          setModalMessage(`Error fetching price: ${error}`);
        }
        return;
      }
    } else {
      await sendSignal(formData);
    }
  };

  const renderFormFields = () => {
    if (channel === "alerts") {
      switch (signalType) {
        case "trade entry":
        case "reentry":
          return (
            <>
              <select
                name="direction"
                value={formData.direction}
                onChange={handleInputChange}
                className="input">
                <option value="LONG">LONG</option>
                <option value="SHORT">SHORT</option>
              </select>
              <input
                type="number"
                name="margin"
                placeholder="Margin Percentage"
                value={formData.margin}
                onChange={handleInputChange}
                className="input"
                required
              />
              <input
                type="number"
                name="entryPrice"
                placeholder="Entry Price (optional)"
                value={formData.entryPrice}
                onChange={handleInputChange}
                className="input"
              />
            </>
          );
        case "exit":
          return null;
        case "opposite direction entry":
          return (
            <input
              type="number"
              name="margin"
              placeholder="Margin Percentage (optional)"
              value={formData.margin}
              onChange={handleInputChange}
              className="input"
            />
          );
      }
    } else if (channel === "signals") {
      switch (signalType) {
        case "trade entry":
        case "reentry":
          return (
            <>
              <select
                name="direction"
                value={formData.direction}
                onChange={handleInputChange}
                className="input">
                <option value="LONG">LONG</option>
                <option value="SHORT">SHORT</option>
              </select>
              <input
                type="number"
                name="margin"
                placeholder="Margin Percentage"
                value={formData.margin}
                onChange={handleInputChange}
                className="input"
                required
              />
              <div className="flex items-center space-x-2">
                <label className="text-gray-600 font-medium">TP(%)</label>
                <input
                  type="number"
                  name="takeProfit"
                  placeholder="Take Profit Percentage (optional)"
                  value={formData.takeProfit}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>
              {signalType === "reentry" && (
                <input
                  type="number"
                  name="entry1stPrice"
                  placeholder="1st Entry Price"
                  value={formData.entry1stPrice}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              )}
              <input
                type="number"
                name="entryPrice"
                placeholder="Entry Price (optional)"
                value={formData.entryPrice}
                onChange={handleInputChange}
                className="input"
              />
            </>
          );
        case "stop loss":
        case "trailing stop loss":
          return (
            <>
              <select
                name="direction"
                value={formData.direction}
                onChange={handleInputChange}
                className="input">
                <option value="LONG">LONG</option>
                <option value="SHORT">SHORT</option>
              </select>
              <input
                type="number"
                name="slPrice"
                placeholder={
                  signalType == "stop loss" ? "SL Price" : "New SL Price"
                }
                value={formData.slPrice}
                onChange={handleInputChange}
                className="input"
                required
              />
            </>
          );
        case "exit":
          return (
            <input
              type="number"
              name="margin"
              placeholder="Loss Percentage (optional)"
              value={formData.margin}
              onChange={handleInputChange}
              className="input"
            />
          );
      }
    }
    return null;
  };

  return (
    <div className="bg-gray-100 min-h-screen flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Send Trading Signal
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-600 font-medium mb-1">
              Select Coin
            </label>
            <select
              name="coin"
              value={formData.coin}
              onChange={handleInputChange}
              className="input">
              <option value="ETH">ETH</option>
              <option value="BTC">BTC</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-600 font-medium mb-1">
              Select Channel
            </label>
            <select
              value={channel}
              onChange={handleChannelChange}
              className="select">
              <option value="">Select Channel</option>
              <option value="alerts">Alerts Channel</option>
              <option value="signals">Signals Channel</option>
            </select>
          </div>

          {channel && (
            <div>
              <label className="block text-gray-600 font-medium mb-1">
                Select Signal Type
              </label>
              <select
                value={signalType}
                onChange={handleSignalChange}
                className="select">
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
                    <option value="reentry">Reentry</option>
                    <option value="stop loss">Stop Loss</option>
                    <option value="trailing stop loss">
                      Trailing Stop Loss
                    </option>
                    <option value="exit">Exit</option>
                  </>
                )}
              </select>
            </div>
          )}

          {renderFormFields()}

          {signalType && (
            <button
              type="submit"
              className="w-full py-2 bg-blue-500 text-white font-medium text-center rounded hover:bg-blue-600">
              Send Signal
            </button>
          )}
        </form>
      </div>

      {modalMessage && (
        <Modal message={modalMessage} onClose={() => setModalMessage(null)} />
      )}
    </div>
  );
};

export default TradeForm;
