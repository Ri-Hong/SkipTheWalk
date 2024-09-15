import {Address,Order,Customer,Item,Payment,NearbyStores,Tracking} from 'dominos';
import {useInternational,canada} from 'dominos/utils/urls.js';
useInternational(canada);
import express from 'express';
const app = express();
app.use(express.json());

// console.dir(urls);

function create_customer() {
    const customer = new Customer(
        {
            address: create_address('Phillip St','263', 'Waterloo', 'ON', 'N2L 3G1', 'leave at front desk of Engineering building 7'),
            firstName: 'John',
            lastName: 'Doe',
            phone: '647-555-5555',
            email: 'john@doe.ca'
        }
    );
    return customer;
}

async function find_closest_store(customer) {
    let storeID=0;
    let distance=100;
    const nearbyStores=await new NearbyStores(customer.address);

    for(const store of nearbyStores.stores){
        if(
            store.IsOnlineCapable
            && store.IsDeliveryStore
            && store.IsOpen
            && store.ServiceIsOpen.Delivery
            && store.MinDistance<distance
        ){
            distance=store.MinDistance;
            storeID=store.StoreID;
        }
    }

    if(storeID==0){
        throw ReferenceError('No Open Stores');
    }
    return storeID;
}

async function create_order(customer,storeID,pizza) {
    const order=new Order(customer);
    order.storeID=storeID;
    order.addItem(pizza);
    await order.validate();
    return order;
}

async function complete_payment(order,customer,number,expiration,securityCode,postalCode,tipAmount) {
    const myCard=new Payment(
        {
            amount:order.amountsBreakdown.customer,

            number:number,
            expiration:expiration,
            securityCode:securityCode,
            postalCode:postalCode,
            tipAmount:tipAmount
        }
    );

    order.payments.push(myCard);
    try{
        await order.place();

        console.log('\n\nPlaced Order\n\n');
        console.dir(order,{depth:3});

        const tracking=new Tracking();

        const trackingResult=await tracking.byPhone(customer.phone);

        console.dir(trackingResult,{depth:1});
    }catch(err){
        console.trace(err);
        console.log('\n\nFailed Order Probably Bad Card, here is order.priceResponse the raw response from Dominos\n\n');
        console.dir(
            order.placeResponse,
            {depth:5}
        );
    }
}

function create_address(streetName,streetNumber,city,region,postalCode,deliveryInstructions) {
    const address = new Address(
        {
            streetName:streetName,
            streetNumber:streetNumber,
            city:city,
            region:region,
            postalCode:postalCode,
            deliveryInstructions:deliveryInstructions
        }
    );
    return address;
}

async function test_order() {
    //extra cheese thin crust pizza
    const pizza=new Item(
        {
            //16 inch hand tossed crust
            code:'16SCREEN',
            options:{
                //sauce, whole pizza : normal
                X: {'1/1' : '1'},
                //cheese, whole pizza  : double
                C: {'1/1' : '1.5'},
                //pepperoni, whole pizza : double
                P: {'1/2' : '1.5'}
            }
        }
    );
    let streetName = 'Phillip St';
    let streetNumber = '263';
    let city = 'Waterloo';
    let region = 'ON';
    let postalCode = 'N2L 3G1';
    let deliveryInstructions = 'leave at front desk of Engineering building 7';
    let firstName = 'John';
    let lastName = 'Doe';
    let phone = '647-555-5555';
    let email = 'john@doe.ca';
    let number='4100-1234-2234-3234';
    let expiration='01/35';
    let securityCode='867';
    let tipAmount=4;
    let customer = create_customer(streetName, streetNumber, city, region, postalCode, deliveryInstructions, firstName, lastName, phone, email);
    let storeID = await find_closest_store(customer);
    let order = await create_order(customer, storeID, pizza);
    console.log(await order.price());
    // await complete_payment(order, customer, number, expiration, securityCode, postalCode, tipAmount);
}

// test_order();

// app.post('/order', async (req, res) => {
//     const pizza=new Item(
//         {
//             //16 inch hand tossed crust
//             code:'16SCREEN',
//             options:{
//                 //sauce, whole pizza : normal
//                 X: {'1/1' : '1'},
//                 //cheese, whole pizza  : double
//                 C: {'1/1' : '1.5'},
//                 //pepperoni, whole pizza : double
//                 P: {'1/2' : '1.5'}
//             }
//         }
//     );
//     // const pizza = new Item(req.body.pizza);
//     let customer = create_customer(req.body.address.streetName, req.body.address.streetNumber, req.body.address.city, req.body.address.region, req.body.address.postalCode, req.body.address.deliveryInstructions, req.body.firstName, req.body.lastName, req.body.phone, req.body.email);
//     let storeID = await find_closest_store(customer);
//     let order = await create_order(customer, storeID, pizza);
//     console.log(await order.price());
//     // await complete_payment(order, customer, req.body.number, req.body.expiration, req.body.securityCode, req.body.postalCode, req.body.tipAmount);
//     res.send('Order placed');
// });

// For simplicity, storing orders in memory
let orders = {};
let orderIdCounter = 1;

app.post('/order', async (req, res) => {
    // Create a new order
    const orderId = orderIdCounter++;
    let customer = create_customer(
        req.body.address.streetName,
        req.body.address.streetNumber,
        req.body.address.city,
        req.body.address.region,
        req.body.address.postalCode,
        req.body.address.deliveryInstructions,
        req.body.firstName,
        req.body.lastName,
        req.body.phone,
        req.body.email
    );
    let storeID = await find_closest_store(customer);
    let pizza = new Item(req.body.pizza);
    let order = await create_order(customer, storeID, pizza);

    // Store the order with a unique ID
    orders[orderId] = { order, customer, pizza };

    res.json({ message: 'Order placed', orderId, price: await order.price() });
});

app.get('/order/:id', (req, res) => {
    // Retrieve the order
    const orderId = req.params.id;
    const order = orders[orderId];
    if (order) {
        res.json(order);
    } else {
        res.status(404).json({ error: "Order not found" });
    }
});

app.put('/order/:id', async (req, res) => {
    // Update the order
    const orderId = req.params.id;
    const existingOrder = orders[orderId];
    if (!existingOrder) {
        return res.status(404).json({ error: "Order not found" });
    }

    let customer = create_customer(
        req.body.address.streetName,
        req.body.address.streetNumber,
        req.body.address.city,
        req.body.address.region,
        req.body.address.postalCode,
        req.body.address.deliveryInstructions,
        req.body.firstName,
        req.body.lastName,
        req.body.phone,
        req.body.email
    );
    let storeID = await find_closest_store(customer);
    let pizza = new Item(req.body.pizza);
    let updatedOrder = await create_order(customer, storeID, pizza);

    // Update stored order
    orders[orderId] = { order: updatedOrder, customer, pizza };
    res.json({ message: 'Order updated', orderId, price: await updatedOrder.price() });
});

app.delete('/order/:id', (req, res) => {
    // Delete the order
    const orderId = req.params.id;
    if (orders[orderId]) {
        delete orders[orderId];
        res.json({ message: 'Order deleted' });
    } else {
        res.status(404).json({ error: "Order not found" });
    }
});


app.listen(3000, () => {
    console.log("Node.js server is running on port 3000");
});