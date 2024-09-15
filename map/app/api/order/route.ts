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

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

if (!SLACK_WEBHOOK_URL) {
  throw new Error("SLACK_WEBHOOK_URL is not defined in the environment variables.");
}

// Function to format the orderTime in a more human-readable format
function formatOrderTime(dateString: string): string {
  const date = new Date(dateString);

  // Create a DateTimeFormat object for Toronto time (Eastern Time)
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'America/Toronto', // Eastern Time Zone
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true, // Use 12-hour format
  };

  return new Intl.DateTimeFormat('en-CA', options).format(date);
}

// Example usage inside orderPizza
const orderTime = new Date().toISOString();
const prettyOrderTime = formatOrderTime(orderTime); // Format the order time


// Function to send a message to Slack
async function sendSlackMessage(orderDetails: Omit<OrderRequestBody, 'creditCardNumber' | 'expiryDate' | 'cvc'>) {
  const { type, size, toppings, deliveryLocation, deliveryRoom, orderTime } = orderDetails;

  const deliveryLink = `https://skip-the-walk.vercel.app/?room=${deliveryRoom}`;

  // Create the Slack message payload
  const payload = {
    text: `*New Order Received!*\n\n*Type*: ${type}\n*Size*: ${size}\n*Toppings*: ${toppings.join(', ')}\n*Delivery Location*: ${deliveryLocation}\n*Delivery Room*: ${deliveryRoom}\n*Order Time*: ${prettyOrderTime}\n*Route*: ${deliveryLink}`,
  };  

  try {
    const response = await fetch(SLACK_WEBHOOK_URL as string, {
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

  // Log the raw request
  console.log("Incoming request:", req);

  // Try to parse the body
  const body: OrderRequestBody = await req.json();
  console.log("Parsed body:", body);

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
