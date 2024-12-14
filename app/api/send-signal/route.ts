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
    const { channel, signalType, direction, margin, takeProfit, price } = body;

    let message = "";

    // Format the message based on channel and signal type
    if (channel === "alerts") {
      if (signalType === "trade entry" || signalType === "reentry") {
        message = formatAlertMessage(direction, margin);
      } else if (signalType === "exit") {
        message = "Exit signal sent.";
      } else if (signalType === "opposite direction entry") {
        message = formatAlertMessage(direction, margin, price, "ReEntry");
      }
    } else if (channel === "signals") {
      if (signalType === "trade entry") {
        message = formatSignalMessage(
          direction,
          price,
          takeProfit,
          margin,
          1, // Example ROI multiplier
        );
      } else if (signalType === "stop loss") {
        message = formatStopLossMessage(direction, price);
      } else if (signalType === "trailing stop loss") {
        message = formatStopLossMessage(direction, price, "Trailing ");
      } else if (signalType === "reentry") {
        message = formatSignalMessage(
          direction,
          price,
          null,
          margin,
          1,
          "ReEntry",
        );
      } else if (signalType === "exit") {
        message = "Exit signal sent.";
      }
    } else {
      throw new Error("Invalid channel or signal type.");
    }

    // Send message to Discord
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
