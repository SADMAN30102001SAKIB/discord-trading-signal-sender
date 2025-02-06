import fetch from "node-fetch";

const BOT_TOKEN = "MTI5ODY0NjAzNzYyMzQ3MjIxMQ.G0grfe.adIxz6IaPlpGkB_Xlgqz9KwKzeoXygOCqFfaa8";

const DISCORD_WEBHOOKS = {
  alerts: "https://discord.com/api/v10/channels/1301207032690380830/messages",
  signals: "https://discord.com/api/v10/channels/1299863972010393752/messages",
  test: "https://discord.com/api/v10/channels/1314510111133270047/messages",
};

export const sendToDiscord = async (
  channel: keyof typeof DISCORD_WEBHOOKS,
  message: string,
) => {
  const webhookUrl = DISCORD_WEBHOOKS[channel];

  if (!webhookUrl) {
    return `Invalid channel: ${channel}`;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: message }),
    });

    if (response.ok) {
      return "Signal sent successfully.";
    } else {
      const error = await response.text();
      return `Failed to send message: ${error}`;
    }
  } catch (error) {
    return `Error sending message: ${error}`;
  }
};

export const formatAlertMessage = (
  coin: string,
  action: string,
  marginPercent: number,
  entryPrice?: number,
  reEntry: string = "",
) => {
  if (!entryPrice) {
    return `
<@&1293979151266742354> **Heads-Up!**
**🔔 Potential ${reEntry}Signal - ${coin == "ETH" ? "Ethereum" : "Bitcoin"}**

📊 **Direction**: ${action}
💥 **Leverage**: Cross ${coin == "ETH" ? "50x" : "100x"}

💼 **Prepare to USE ${
      marginPercent || "?"
    }% MARGIN** if the official signal confirms ✅

⚠️ **Note**: *This is just a prediction!*
So, prepare yourself & have patience. An official signal might or might not come.
    `;
  }

  return `
<@&1293979151266742354> **Heads-Up!**
**🔔 Potential ${reEntry}Signal - ${coin == "ETH" ? "Ethereum" : "Bitcoin"}**

📊 **Direction**: ${action}
💥 **Leverage**: Cross ${coin == "ETH" ? "50x" : "100x"}

🔸 **Possible Entry Price**: $${entryPrice}
(*This price is subject to change and taken from Coinbase ${coin}-USD*)

💼 **Prepare to USE ${
    marginPercent || "?"
  }% MARGIN** if the official signal confirms ✅

⚠️ **Note**: *This is just a prediction!*
So, prepare yourself & have patience. An official signal might or might not come.
    `;
};

export const formatSignalMessage = (
  coin: string,
  action: string,
  entryPrice: number,
  takeProfit: number,
  marginPercent: number,
  reEntry: string = "",
  entry1stPrice: number = 0,
) => {
  const formatNumber = (value: unknown) => {
    const parsedValue = typeof value === "string" ? parseFloat(value) : value;

    if (typeof parsedValue !== "number" || isNaN(parsedValue)) {
      throw new TypeError(`Invalid number passed to formatNumber: ${value}`);
    }

    return parseFloat(parsedValue.toFixed(2));
  };

  if (reEntry === "ReEntry") {
    return `
**${coin === "ETH" ? "🔷  Ethereum" : "🪙  Bitcoin"}**

📊 **Direction**: ${action}
💥 **Leverage**: Cross ${coin === "ETH" ? "50x" : "100x"}

⚠️ **Note**: *This is a 2nd entry!*
🔸 **2nd Entry Price**: $${formatNumber(entryPrice)}
🔹 **Take Profit (${
      coin === "ETH" ? takeProfit * 50 : takeProfit * 100
    }% ROI)**: $${formatNumber(
      action === "LONG"
        ? ((parseFloat(entryPrice.toString()) +
            parseFloat(entry1stPrice.toString())) /
            2) *
            (1 + takeProfit / 100)
        : ((parseFloat(entryPrice.toString()) +
            parseFloat(entry1stPrice.toString())) /
            2) *
            (1 - takeProfit / 100),
    )}
 (*These prices are taken from Coinbase ${coin}-USD*)

💼 **USE ${marginPercent}% MARGIN** of your total capital ✅

⚠️ **Stop Loss**: *We'll update very soon.*


<@&1293979151266742354>
    `;
  }

  return `
**${coin === "ETH" ? "🔷  Ethereum" : "🪙  Bitcoin"}**

📊 **Direction**: ${action}
💥 **Leverage**: Cross ${coin === "ETH" ? "50x" : "100x"}

🔸 **Entry Price**: $${formatNumber(entryPrice)}
🔹 **Take Profit (${
    coin === "ETH" ? takeProfit * 50 : takeProfit * 100
  }% ROI)**: $${formatNumber(
    action === "LONG"
      ? entryPrice * (1 + takeProfit / 100)
      : entryPrice * (1 - takeProfit / 100),
  )}
 (*These prices are taken from Coinbase ${coin}-USD*)

💼 **USE ${marginPercent}% MARGIN** of your total capital ✅
⚠️ **Note**: *If we need a 2nd entry, then we'll update.*

⚠️ **Stop Loss**: *We'll update very soon.*


<@&1293979151266742354>
    `;
};

export const formatStopLossMessage = (
  action: string,
  stopLossPrice: number,
  msgPrefix: string = "",
) => {
  const direction = action === "LONG" ? "below" : "above";
  return `
🛑 **${msgPrefix}Stop Loss Update**

📉 Exit **if candle closes ${direction}** $${stopLossPrice} on the 5-minute candlestick chart. 💡
(*If the Stop Loss needs to trail or an early exit is required, then we'll notify.*)


<@&1293979151266742354>
  `;
};
