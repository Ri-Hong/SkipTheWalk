import { NextRequest, NextResponse } from 'next/server';

// Define the expected structure of the request body
interface OrderRequestBody {
  type: string;
  size: string;
  toppings: string[];
  deliveryLocation: string;
  deliveryRoom: string;
  creditCardNumber: string;
  expiryDate: string;
  cvc: string;
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
  };
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
    creditCardNumber,
    expiryDate,
    cvc,
  } = body;

  console.log("creditCardNumber", creditCardNumber);
  console.log("expiryDate", expiryDate);
  console.log("cvc", cvc);

  // Handle the order (you can add logic here, such as saving to the database)

  // Send back a success response with the order details
  return NextResponse.json<OrderResponse>({
    message: 'Order received successfully!',
    orderDetails: {
      type,
      size,
      toppings,
      deliveryLocation,
      deliveryRoom
    },
  });
}
