// pages/api/slack-interactions.js
export default async function handler(req: any, res: any) {
    const { payload } = req.body; // Slack sends the payload as a string, so you'll need to parse it
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
    }
  
    res.status(200).end(); // Respond to Slack to acknowledge the action
  }
  