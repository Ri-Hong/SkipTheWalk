#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import fetch from 'node-fetch';
import fs from 'fs';
import ejs from 'ejs';
const program = new Command();

// Path to the config file
const configFilePath = './config.json';

// Function to handle pizza order and collect all necessary information
async function orderPizza() {
  let config = {};

  // Check if config file exists
  if (fs.existsSync(configFilePath)) {
    // Read the config file
    const configData = fs.readFileSync(configFilePath, 'utf-8');
    config = JSON.parse(configData);
    console.log('Using saved configuration from config.json');
  } else {
    console.log('No config file found. Please run `stw config` first.');
    return;
  }

  // Pizza-related questions only
  const pizzaQuestions = [
    {
      type: 'list',
      name: 'type',
      message: 'Choose your pizza type:',
      choices: ['Margherita', 'Pepperoni', 'BBQ Chicken', 'Vegetarian', 'Hawaiian'],
    },
    {
      type: 'list',
      name: 'size',
      message: 'Choose your pizza size:',
      choices: ['Small', 'Medium', 'Large'],
    },
    {
      type: 'checkbox',
      name: 'toppings',
      message: 'Choose your toppings:',
      choices: ['Mushrooms', 'Onions', 'Sausage', 'Bacon', 'Extra Cheese', 'Peppers', 'Olives'],
    },
  ];

  // Ask for pizza details only
  const pizzaAnswers = await inquirer.prompt(pizzaQuestions);

  // Combine pizza details into a list of individual strings
  const pizzaDetails = [
    pizzaAnswers.type, 
    pizzaAnswers.size, 
    ...(pizzaAnswers.toppings || [])  // Ensure toppings is always an array
  ];

  // Add a timestamp to track the order time
  const orderTime = new Date().toISOString();

  // Combine the saved configuration and pizza order details
  const orderDetails = {
    ...config, // Non-pizza details from config file
    pizzaDetails,
    orderTime,
  };

  // Send the data to the API with pizza information and orderTime included
  const apiUrl = `https://skip-the-walk.vercel.app/api/order`;
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderDetails),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Order placed successfully:', data);
    } else {
      console.error('Failed to place order:', response.statusText);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Function to handle the configuration setup
async function setupConfig() {
  const configQuestions = [
    {
      type: 'input',
      name: 'firstName',
      message: 'Enter your first name:',
      validate: (input) => input ? true : 'First name is required',
    },
    {
      type: 'input',
      name: 'lastName',
      message: 'Enter your last name:',
      validate: (input) => input ? true : 'Last name is required',
    },
    {
      type: 'input',
      name: 'email',
      message: 'Enter your email:',
      validate: (input) => /\S+@\S+\.\S+/.test(input) ? true : 'Invalid email format',
    },
    {
      type: 'input',
      name: 'phoneNumber',
      message: 'Enter your phone number:',
      validate: (input) => /^\d{10,15}$/.test(input) ? true : 'Phone number must contain only digits and be 10-15 digits long',
    },
    {
      type: 'input',
      name: 'street',
      message: 'Enter your street address:',
      validate: (input) => input ? true : 'Street address is required',
    },
    {
      type: 'input',
      name: 'city',
      message: 'Enter your city:',
      validate: (input) => input ? true : 'City is required',
    },
    {
      type: 'input',
      name: 'region',
      message: 'Enter your region/state:',
      validate: (input) => input ? true : 'Region/state is required',
    },
    {
      type: 'input',
      name: 'postalCode',
      message: 'Enter your postal code:',
      validate: (input) => input ? true : 'Postal code is required',
    },
    // Payment information
    {
      type: 'input',
      name: 'creditCardNumber',
      message: 'Enter your credit card number:',
      validate: (input) => /^\d{16}$/.test(input) ? true : 'Invalid credit card number',
    },
    {
      type: 'input',
      name: 'creditCardCvv',
      message: 'Enter your credit card CVV:',
      validate: (input) => /^\d{3}$/.test(input) ? true : 'Invalid CVV number',
    },
    {
      type: 'input',
      name: 'creditCardDate',
      message: 'Enter your card expiry date (MM/YY):',
      validate: (input) => /^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(input) ? true : 'Invalid expiry date format',
    },
    {
      type: 'input',
      name: 'creditCardPostalCode',
      message: 'Enter your credit card postal code:',
      validate: (input) => input ? true : 'Postal code is required',
    },
  ];

  // Ask all the non-pizza-related questions and save the answers in a config file
  const answers = await inquirer.prompt(configQuestions);
  fs.writeFileSync(configFilePath, JSON.stringify(answers, null, 2));

  console.log('Configuration saved successfully!');
}

program
  .command('order')
  .description('Order a pizza')
  .action(orderPizza);

program
  .command('config')
  .description('Set up your pizza ordering configuration')
  .action(setupConfig);

program.parse(process.argv);
