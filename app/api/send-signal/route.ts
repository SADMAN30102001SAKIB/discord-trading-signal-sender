import { NextResponse } from "next/server";
import {
  sendToDiscord,
  formatAlertMessage,
  formatSignalMessage,
  formatStopLossMessage,
} from "@/lib/discordBot";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      channel,
      signalType,
      coin,
      direction,
      margin,
      takeProfit,
      slPrice,
      entry1stPrice,
      loss,
    } = body;
    let { entryPrice } = body;

    if (
      !entryPrice &&
      (channel === "signals" || channel === "test") &&
      (signalType === "trade entry" || signalType === "reentry")
    ) {
      const url = `https://api.coinbase.com/v2/prices/${coin}-USD/spot`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);

        if (response.ok) {
          const data = await response.json();
          if (data && data.data && data.data.amount) {
            entryPrice = data.data.amount;
          } else {
            return NextResponse.json({ msg: "Error: Invalid API response." });
          }
        } else {
          return NextResponse.json({
            msg: `Error fetching price, status code: ${response.status}`,
          });
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return NextResponse.json({
            msg: "API Request timed out.",
          });
        } else {
          return NextResponse.json({
            msg: `Error fetching price: ${error}`,
          });
        }
      }
    }

    let message = "";

    if (channel === "alerts") {
      if (signalType === "trade entry") {
        message = formatAlertMessage(coin, direction, margin, entryPrice);
      }
      if (signalType === "reentry") {
        message = formatAlertMessage(
          coin,
          direction,
          margin,
          entryPrice,
          "ReEntry ",
        );
      } else if (signalType === "exit") {
        message =
          "We Might Exit Now! Be Ready for the Official Signal. <@&1293979151266742354>";
      } else if (signalType === "opposite direction entry") {
        if (margin) {
          message = `We Might Exit Now & Take a New Trade in the Opposite Direction With ${margin}% Margin of Our Total Capital! Be Ready for the Official Signals. <@&1293979151266742354>`;
        } else {
          message =
            "We Might Exit Now & Take a New Trade in the Opposite Direction! Be Ready for the Official Signal. <@&1293979151266742354>";
        }
      }
    } else if (channel === "signals" || channel === "test") {
      if (signalType === "trade entry") {
        message = formatSignalMessage(
          coin,
          direction,
          entryPrice,
          takeProfit ? takeProfit : 1,
          margin,
        );
      } else if (signalType === "reentry") {
        message = formatSignalMessage(
          coin,
          direction,
          entryPrice,
          takeProfit ? takeProfit : 1,
          margin,
          "ReEntry",
          entry1stPrice,
        );
      } else if (signalType === "stop loss") {
        message = formatStopLossMessage(direction, slPrice);
      } else if (signalType === "trailing stop loss") {
        message = formatStopLossMessage(direction, slPrice, "Trailing ");
      } else if (signalType === "exit") {
        if (loss) {
          message = `Exit Now. We Took a Loss on This Trade, Reducing Our Total Capital by ${loss}% <@&1293979151266742354>`;
        } else {
          message = "Exit Now. <@&1293979151266742354>";
        }
      }
    } else {
      return NextResponse.json({ msg: "Invalid channel or signal type." });
    }

    const msg = await sendToDiscord(channel, message);

    return NextResponse.json({ msg: msg });
  } catch (error) {
    return NextResponse.json({
      msg: "Failed to process request: " + error,
    });
  }
}
