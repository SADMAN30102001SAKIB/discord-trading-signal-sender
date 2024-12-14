import fetch from "node-fetch";

const BOT_TOKEN =
  "MTI5ODY0NjAzNzYyMzQ3MjIxMQ.GzH5NJ.LlcTX81prQy3uz5aILsfmx885_n66kWqIJqlAQ";

const DISCORD_WEBHOOKS = {
  alerts: "https://discord.com/api/v10/channels/1301207032690380830/messages",
  signals: "https://discord.com/api/v10/channels/1314510111133270047/messages",
};

export const sendToDiscord = async (
  channel: keyof typeof DISCORD_WEBHOOKS,
  message: string,
) => {
  const webhookUrl = DISCORD_WEBHOOKS[channel];

  if (!webhookUrl) {
    throw new Error(`Invalid channel: ${channel}`);
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content: message }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send message: ${error}`);
  }
};

// Message formatting for alerts channel
export const formatAlertMessage = (
  action: string,
  marginPercent?: number,
  price?: number,
  reEntry: string = "",
) => {
  if (!price) {
    return `
<@&SUBSCRIBER_ROLE_ID> **Heads-Up!**
**🔔 Potential ${reEntry ? reEntry + " " : ""}Signal - Ethereum**

📊 **Direction**: ${action.toUpperCase()}
💥 **Leverage**: Cross 50x

💼 **Prepare to USE ${
      marginPercent || "?"
    }% MARGIN** if the official signal confirms ✅

⚠️ **Note**: *This is just a prediction!*
So, prepare yourself & have patience. An official signal might or might not come.
    `;
  }

  return `
<@&SUBSCRIBER_ROLE_ID> **Heads-Up!**
**🔔 Potential ${reEntry ? reEntry + " " : ""}Signal - Ethereum**

📊 **Direction**: ${action.toUpperCase()}
💥 **Leverage**: Cross 50x

🔸 **Possible Entry Price**: $${price}
(*This price is subject to change and taken from Coinbase BTC-USD*)

💼 **Prepare to USE ${
    marginPercent || "?"
  }% MARGIN** if the official signal confirms ✅

⚠️ **Note**: *This is just a prediction!*
So, prepare yourself & have patience. An official signal might or might not come.
    `;
};

// Message formatting for signals channel
export const formatSignalMessage = (
  action: string,
  price: number,
  takeProfit: number | null,
  marginPercent: number,
  roi: number,
  reEntry: string = "",
) => {
  if (reEntry === "ReEntry") {
    return `
**🔷  Ethereum**

📊 **Direction**: ${action.toUpperCase()}
💥 **Leverage**: Cross 50x

⚠️ **Note**: *This is a 2nd entry!*
🔸 **2nd Entry Price**: $${price}
🔹 **Take Profit (${roi * 50}% ROI)**: $${takeProfit}

💼 **USE ${marginPercent}% MARGIN** of your total capital ✅

⚠️ **Stop Loss**: *We'll update very soon.*

<@&SUBSCRIBER_ROLE_ID>
    `;
  }

  return `
**🔷  Ethereum**

📊 **Direction**: ${action.toUpperCase()}
💥 **Leverage**: Cross 50x

🔸 **Entry Price**: $${price}
🔹 **Take Profit (${roi * 50}% ROI)**: $${takeProfit}

💼 **USE ${marginPercent}% MARGIN** of your total capital ✅

⚠️ **Stop Loss**: *We'll update very soon.*

<@&SUBSCRIBER_ROLE_ID>
    `;
};

// Stop loss/trailing stop loss message
export const formatStopLossMessage = (
  action: string,
  stopLossPrice: number,
  msgPrefix: string = "",
) => {
  const direction = action === "b" ? "below" : "above";
  return `
🛑 **${msgPrefix}Stop Loss Update**

📉 Exit **if candle closes ${direction}** $${stopLossPrice} on the 5-minute candlestick chart. 💡

(*If the Stop Loss needs to trail or an early exit is required, then we'll notify.*)

<@&SUBSCRIBER_ROLE_ID>
  `;
};
