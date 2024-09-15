import { NextRequest, NextResponse } from 'next/server';

// Define the expected structure of the request body
interface OrderRequestBody {
  type: string;
  size: string;
  toppings: string[];
  deliveryLocation: string;
  deliveryRoom: string;
  orderTime: string;
}

// Define the response structures
interface OrderResponse {
  message: string;
  orderDetails: {
    type: string;
    size: string;
    toppings: string[];
    deliveryLocation: string;
    deliveryRoom: string;
    orderTime: string;
  };
}

const SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/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';

// Function to send a message to Slack
export async function sendSlackMessage(orderDetails: Omit<OrderRequestBody, 'creditCardNumber' | 'expiryDate' | 'cvc'>) {
  const { type, size, toppings, deliveryLocation, deliveryRoom, orderTime } = orderDetails;

  // Create the Slack message payload
  const payload = {
    text: `*New Order Received!*\n\n*Type*: ${type}\n*Size*: ${size}\n*Toppings*: ${toppings.join(', ')}\n*Delivery Location*: ${deliveryLocation}\n*Delivery Room*: ${deliveryRoom}\n*Order Time*: ${orderTime}`,
  };

  try {
    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('Error sending message to Slack:', response.statusText);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}


// POST handler for the API route
export async function POST(req: NextRequest) {
  const body: OrderRequestBody = await req.json();

  const {
    type,
    size,
    toppings,
    deliveryLocation,
    deliveryRoom,
    orderTime
  } = body;

  // Handle the order (you can add logic here, such as saving to the database)
  await sendSlackMessage({ type, size, toppings, deliveryLocation, deliveryRoom, orderTime });


  // Send back a success response with the order details
  return NextResponse.json<OrderResponse>({
    message: 'Order received successfully!',
    orderDetails: {
      type,
      size,
      toppings,
      deliveryLocation,
      deliveryRoom,
      orderTime
    },
  });
}
