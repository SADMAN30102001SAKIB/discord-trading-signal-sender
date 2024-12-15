"use client";

import { useState } from "react";
import Modal from "../components/Modal";

const TradeForm = () => {
  const [channel, setChannel] = useState("");
  const [signalType, setSignalType] = useState("");
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    if (e.target.name == "coin" && e.target.value == "BTC") {
      setFormData({
        ...formData,
        takeProfit: 0.5,
        [e.target.name]: e.target.value,
      });
    } else if (e.target.name == "coin" && e.target.value == "ETH") {
      setFormData({
        ...formData,
        takeProfit: 1,
        [e.target.name]: e.target.value,
      });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleChannelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setChannel(e.target.value);
    setSignalType("");
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
    setSignalType(e.target.value);
    if (e.target.value == "opposite direction entry") {
      setFormData({
        ...formData,
        margin: 0,
      });
    } else {
      setFormData({
        ...formData,
        margin: formData.margin == 0 ? 1 : formData.margin,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (formData.margin <= 0 || formData.takeProfit <= 0) {
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
              <div className="flex items-center space-x-2">
                <label className="text-gray-600 font-medium">Margin(%)</label>
                <input
                  type="number"
                  name="margin"
                  placeholder="Margin Percentage"
                  value={formData.margin}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>
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
            <div className="flex items-center space-x-2">
              <label className="text-gray-600 font-medium">Margin(%)</label>
              <input
                type="number"
                name="margin"
                placeholder="Margin Percentage (optional)"
                value={formData.margin ? formData.margin : ""}
                onChange={handleInputChange}
                className="input"
              />
            </div>
          );
      }
    } else if (channel === "signals" || channel === "test") {
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
              <div className="flex items-center space-x-2">
                <label className="text-gray-600 font-medium">Margin(%)</label>
                <input
                  type="number"
                  name="margin"
                  placeholder="Margin Percentage"
                  value={formData.margin}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>
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
              name="loss"
              placeholder="Loss Percentage (optional)"
              value={formData.loss}
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
              <option value="test">Test Channel</option>
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
                {(channel === "signals" || channel === "test") && (
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
              className={`w-full py-2 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              } text-white font-medium text-center rounded`}
              disabled={loading}>
              {loading ? "Sending..." : "Send Signal"}
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
