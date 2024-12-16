"use client";

import { useState } from "react";
import Modal from "../components/Modal";

const TradeForm = () => {
  const [channel, setChannel] = useState("Alerts");
  const [signalType, setSignalType] = useState("trade entry");
  const [formData, setFormData] = useState({
    coin: "ETH",
    direction: "LONG",
    margin: 1,
    takeProfit: 1,
    entryPrice: "",
    slPrice: "",
    entry1stPrice: "",
    loss: "",
  });
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCoinChange = (coin: string) => {
    setFormData({
      ...formData,
      coin,
      takeProfit: coin === "BTC" ? 0.5 : 1,
    });
  };

  const handleChannelChange = (newChannel: string) => {
    setChannel(newChannel);
    setSignalType("trade entry");
    setFormData({
      coin: formData.coin,
      direction: formData.direction,
      margin: 1,
      takeProfit: formData.takeProfit,
      entryPrice: "",
      slPrice: "",
      entry1stPrice: "",
      loss: "",
    });
  };

  const handleSignalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSignalType = e.target.value;
    setSignalType(newSignalType);
    setFormData({
      ...formData,
      margin: newSignalType === "opposite direction entry" ? 0 : 1,
    });
  };

  const handleDirectionChange = (newDirection: string) => {
    setFormData({ ...formData, direction: newDirection });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (
      signalType !== "opposite direction entry" &&
      (formData.margin <= 0 || formData.takeProfit <= 0)
    ) {
      setModalMessage("Please provide positive values.");
      setLoading(false);
      return;
    }

    let password = localStorage.getItem("password");

    if (!password) {
      password = prompt("Enter your password:");
      if (!password) {
        setModalMessage("Password is required.");
        setLoading(false);
        return;
      }
    }

    try {
      const response = await fetch("/api/send-signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel, signalType, ...formData, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setModalMessage(data.msg);

        if (data.msg !== "incorrect password") {
          localStorage.setItem("password", password);
        } else {
          localStorage.removeItem("password");
        }
      } else {
        const error = await response.json();
        setModalMessage(error.message || "Failed to send signal!");
      }
    } catch (err) {
      setModalMessage("An unexpected error occurred: " + err);
    } finally {
      setLoading(false);
    }
  };

  const renderFormFields = () => {
    if (channel === "Alerts") {
      switch (signalType) {
        case "trade entry":
        case "reentry":
          return (
            <>
              <div className="flex space-x-4">
                {["LONG", "SHORT"].map(dir => (
                  <button
                    key={dir}
                    type="button"
                    onClick={() => handleDirectionChange(dir)}
                    className={`px-4 py-2 rounded-lg ${
                      formData.direction === dir
                        ? "bg-[#5865f2] text-white"
                        : "bg-[#4f545c] text-[#dcddde] hover:bg-[#4f545c]/80"
                    }`}>
                    {dir}
                  </button>
                ))}
              </div>
              <div className="flex items-center space-x-2 mt-4">
                <label className="text-[#dcddde] font-medium">Margin(%)</label>
                <input
                  type="number"
                  name="margin"
                  placeholder="Margin Percentage"
                  value={formData.margin}
                  onChange={handleInputChange}
                  className="input no-spinner"
                  required
                />
              </div>
              <input
                type="number"
                name="entryPrice"
                placeholder="Entry Price (optional)"
                value={formData.entryPrice}
                onChange={handleInputChange}
                className="input mt-4 no-spinner"
              />
            </>
          );
        case "exit":
          return null;
        case "opposite direction entry":
          return (
            <div className="flex items-center space-x-2 mt-4">
              <label className="text-[#dcddde] font-medium">Margin(%)</label>
              <input
                type="number"
                name="margin"
                placeholder="Margin Percentage (optional)"
                value={formData.margin ? formData.margin : ""}
                onChange={handleInputChange}
                className="input no-spinner"
              />
            </div>
          );
      }
    } else if (channel === "Signals" || channel === "Test") {
      switch (signalType) {
        case "trade entry":
        case "reentry":
          return (
            <>
              <div className="flex space-x-4">
                {["LONG", "SHORT"].map(dir => (
                  <button
                    key={dir}
                    type="button"
                    onClick={() => handleDirectionChange(dir)}
                    className={`px-4 py-2 rounded-lg ${
                      formData.direction === dir
                        ? "bg-[#5865f2] text-white"
                        : "bg-[#4f545c] text-[#dcddde] hover:bg-[#4f545c]/80"
                    }`}>
                    {dir}
                  </button>
                ))}
              </div>
              <div className="flex items-center space-x-2 mt-4">
                <label className="text-[#dcddde] font-medium">Margin(%)</label>
                <input
                  type="number"
                  name="margin"
                  placeholder="Margin Percentage"
                  value={formData.margin}
                  onChange={handleInputChange}
                  className="input no-spinner"
                  required
                />
              </div>
              <div className="flex items-center space-x-2 mt-4">
                <label className="text-[#dcddde] font-medium">TP(%)</label>
                <input
                  type="number"
                  name="takeProfit"
                  placeholder="Take Profit Percentage (optional)"
                  value={formData.takeProfit}
                  onChange={handleInputChange}
                  className="input no-spinner"
                />
              </div>
              {signalType === "reentry" && (
                <input
                  type="number"
                  name="entry1stPrice"
                  placeholder="1st Entry Price"
                  value={formData.entry1stPrice}
                  onChange={handleInputChange}
                  className="input mt-4 no-spinner"
                  required
                />
              )}
              <input
                type="number"
                name="entryPrice"
                placeholder="Entry Price (optional)"
                value={formData.entryPrice}
                onChange={handleInputChange}
                className="input mt-4 no-spinner"
              />
            </>
          );
        case "stop loss":
        case "trailing stop loss":
          return (
            <>
              <div className="flex space-x-4">
                {["LONG", "SHORT"].map(dir => (
                  <button
                    key={dir}
                    type="button"
                    onClick={() => handleDirectionChange(dir)}
                    className={`px-4 py-2 rounded-lg ${
                      formData.direction === dir
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-800"
                    }`}>
                    {dir}
                  </button>
                ))}
              </div>
              <input
                type="number"
                name="slPrice"
                placeholder={
                  signalType === "stop loss" ? "SL Price" : "New SL Price"
                }
                value={formData.slPrice}
                onChange={handleInputChange}
                className="input mt-4 no-spinner"
                required
              />
            </>
          );
        case "exit":
          return (
            <input
              type="number"
              name="loss"
              placeholder="Loss Percentage (optional)"
              value={formData.loss}
              onChange={handleInputChange}
              className="input no-spinner"
            />
          );
      }
    }
    return null;
  };

  return (
    <div className="bg-[#36393f] min-h-screen flex justify-center items-center">
      <div className="bg-[#2f3136] p-6 rounded-lg shadow-md w-full max-w-sm border border-[#202225]">
        <h1 className="text-2xl font-bold text-center text-white mb-6">
          🚀 Send Trading Signal
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[#b9bbbe] font-medium mb-1">
              Select Coin
            </label>
            <div className="flex space-x-4">
              {["ETH", "BTC"].map(coin => (
                <button
                  key={coin}
                  type="button"
                  onClick={() => handleCoinChange(coin)}
                  className={`px-4 py-2 rounded-lg ${
                    formData.coin === coin
                      ? "bg-[#5865f2] text-white"
                      : "bg-[#4f545c] text-[#dcddde] hover:bg-[#4f545c]/80"
                  }`}>
                  {coin}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[#b9bbbe] font-medium mb-1">
              Select Channel
            </label>
            <div className="flex space-x-4">
              {["Alerts", "Signals", "Test"].map(ch => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => handleChannelChange(ch)}
                  className={`px-4 py-2 rounded-lg ${
                    channel === ch
                      ? "bg-[#5865f2] text-white"
                      : "bg-[#4f545c] text-[#dcddde] hover:bg-[#4f545c]/80"
                  }`}>
                  {ch}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[#b9bbbe] font-medium mb-1">
              Select Signal Type
            </label>
            <select
              value={signalType}
              onChange={handleSignalChange}
              className="w-full bg-[#2f3136] text-[#dcddde] border-2 border-[#ccc] rounded-lg p-2 focus:outline-none">
              {channel === "Alerts" && (
                <>
                  <option value="trade entry">Trade Entry</option>
                  <option value="reentry">Reentry</option>
                  <option value="exit">Exit</option>
                  <option value="opposite direction entry">
                    Opposite Direction Entry
                  </option>
                </>
              )}
              {(channel === "Signals" || channel === "Test") && (
                <>
                  <option value="trade entry">Trade Entry</option>
                  <option value="reentry">Reentry</option>
                  <option value="stop loss">Stop Loss</option>
                  <option value="trailing stop loss">Trailing Stop Loss</option>
                  <option value="exit">Exit</option>
                </>
              )}
            </select>
          </div>
          {renderFormFields()}
          <button
            type="submit"
            className={`w-full mt-6 py-2 px-4 rounded-lg text-white font-medium ${
              loading
                ? "bg-[#4f545c] cursor-not-allowed"
                : "bg-[#5865f2] hover:bg-[#4752c4]"
            }`}
            disabled={loading}>
            {loading ? "Submitting..." : "Send Signal"}
          </button>
        </form>
        {modalMessage && (
          <Modal message={modalMessage} onClose={() => setModalMessage(null)} />
        )}
      </div>
    </div>
  );
};

export default TradeForm;
