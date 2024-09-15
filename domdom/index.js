import {Order,Customer,Item,Payment,NearbyStores,Tracking} from 'dominos';
import {urls} from 'dominos';
import {useInternational,canada} from 'dominos/utils/urls.js';
useInternational(canada);

console.dir(urls);

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

const customer = new Customer(
    {
        address: '200 University Ave W, Waterloo, ON N2L 3G5',
        firstName: 'John',
        lastName: 'Doe',
        phone: '647-555-5555',
        email: 'john@doe.ca'
    }
);