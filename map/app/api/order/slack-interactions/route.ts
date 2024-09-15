import { NextRequest, NextResponse } from 'next/server';

// Slack Interaction Handler
export async function POST(req: NextRequest) {
  try {
    const body = await req.text(); // Slack sends the payload as x-www-form-urlencoded
    const parsedBody = new URLSearchParams(body);
    const payload = parsedBody.get('payload');
    
    if (!payload) {
      return NextResponse.json({ error: 'Missing payload' }, { status: 400 });
    }

    const interaction = JSON.parse(payload);

    if (interaction.actions[0].action_id === 'start_delivery') {
      // Send an update to change status to "In Progress" and show the "Delivered" button
      await fetch(interaction.response_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          replace_original: true,
          blocks: [
            {
              "type": "section",
              "text": {
                "type": "mrkdwn",
                "text": "Order Status: *In Progress*"
              }
            },
            {
              "type": "actions",
              "elements": [
                {
                  "type": "button",
                  "text": {
                    "type": "plain_text",
                    "text": "Mark as Delivered"
                  },
                  "style": "primary",
                  "action_id": "mark_delivered"
                }
              ]
            }
          ]
        })
      });

      return NextResponse.json({ message: 'Order marked as in progress' });

    } else if (interaction.actions[0].action_id === 'mark_delivered') {
      // Update the message to mark as delivered and remove buttons
      await fetch(interaction.response_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          replace_original: true,
          blocks: [
            {
              "type": "section",
              "text": {
                "type": "mrkdwn",
                "text": "Order Status: *Delivered*"
              }
            }
          ]
        })
      });

      return NextResponse.json({ message: 'Order marked as delivered' });
    }

    return NextResponse.json({ message: 'No valid action detected' });
  } catch (error) {
    console.error('Error processing Slack interaction:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
