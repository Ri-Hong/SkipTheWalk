import { NextRequest, NextResponse } from 'next/server';

// Handler for Slack interaction when the button is clicked
export async function POST(req: NextRequest) {
  try {
    // Parse the incoming request
    const body = await req.formData(); // Slack sends interactions as `application/x-www-form-urlencoded`
    const payload = JSON.parse(body.get('payload') as string); // The payload is inside the `payload` field

    const action = payload.actions[0]; // Get the action object (button interaction)
    const userName = payload.user.name; // Get the name of the user who clicked the button

    if (action.name === 'accept_order' && action.value === 'accept') {
      // Respond with a message indicating that the order was accepted
      const acceptedMessage = {
        text: `:white_check_mark: *${userName} has accepted this order!*`,
      };

      // Send the follow-up message back to Slack
      const response = await fetch(payload.response_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(acceptedMessage),
      });

      if (!response.ok) {
        console.error('Error responding to Slack interaction:', response.statusText);
        return NextResponse.json({ message: 'Failed to send follow-up message.' }, { status: 500 });
      }
    }

    return NextResponse.json({ message: 'Order accepted!' });
  } catch (error) {
    console.error('Error handling Slack interaction:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
