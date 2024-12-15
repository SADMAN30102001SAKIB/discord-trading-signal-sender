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
      entryPrice,
      slPrice,
      entry1stPrice,
    } = body;

    console.log("Received signal:", body);

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
        message = "We Might Exit Now.";
      } else if (signalType === "opposite direction entry") {
        if (margin) {
          message =
            "Potential oposite direction entry with " + margin + "% margin";
        } else {
          message = "Potential oposite direction entry";
        }
      }
    } else if (channel === "signals") {
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
        message = "Exit Now.";
      }
    } else {
      throw new Error("Invalid channel or signal type.");
    }

    await sendToDiscord(channel, message);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process request." },
      { status: 500 },
    );
  }
}
