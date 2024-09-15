import { NextRequest, NextResponse } from 'next/server';

// Handler for Slack interaction when the button is clicked
export async function POST(req: NextRequest) {
  try {
    // Log incoming request for debugging
    console.log('Received Slack interaction request:', req);

    // Parse the incoming request as form data
    const body = await req.formData(); // Slack sends interactions as `application/x-www-form-urlencoded`
    const payloadString = body.get('payload') as string; // The payload is inside the `payload` field

    // Log the payload for debugging
    console.log('Received payload:', payloadString);

    // Parse the payload JSON
    const payload = JSON.parse(payloadString);

    // Get the action object (button interaction)
    const action = payload.actions[0]; 

    // Get the name of the user who clicked the button
    const userName = payload.user.name; 

    // Check if the action is the "accept_order" button
    if (action.name === 'accept_order' && action.value === 'accept') {
      // Create a follow-up message indicating the order was accepted
      const acceptedMessage = {
        text: `:white_check_mark: *${userName} has accepted this order!*`,
      };

      // Send the follow-up message back to Slack using response_url
      const response = await fetch(payload.response_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(acceptedMessage),
      });

      // Check if the response was successful
      if (!response.ok) {
        console.error('Error responding to Slack interaction:', response.statusText);
        return NextResponse.json({ message: 'Failed to send follow-up message.' }, { status: 500 });
      }

      // Return success response to Slack
      return NextResponse.json({ message: 'Order accepted!' });
    }

    // If no valid action, return no action taken
    return NextResponse.json({ message: 'No action taken.' });
  } catch (error) {
    // Log the error for debugging
    console.error('Error handling Slack interaction:', error);

    // Return a 500 error if something goes wrong
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
