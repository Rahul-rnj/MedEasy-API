import dotenv from 'dotenv';
import stripe from "stripe";
dotenv.config()
import express from 'express';
import dbConnect from '../config/dbConnect.js';
import userRoutes from '../routes/UsersRoute.js';
import { globalErrhandler, notFound } from '../middlewares/globalErrorHandler.js';
import productsRouter from '../routes/ProductRoute.js';
import categoriesRouter from '../routes/categoriesRouter.js';
import brandsRouter from '../routes/Brandrouter.js';
import reviewRouter from '../routes/reviewRouter.js';
import orderRouter from '../routes/ordersRouter.js';
import Order from '../models/Order.js';


//dbConnect
dbConnect()
const app = express();
//pass incoming data
app.use(express.json());

//stripe webhook
//stripe instance
const Stripe = new stripe(process.env.STRIPE_KEY);

// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = "whsec_42244a62ad2b251efc0dcc581f4ea43c64b901199382c778ffaec653312bccae";

app.post('/webhook', express.raw({type: 'application/json'}), async (request, response) => {
  const sig = request.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    console.log(event);
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }
  if (event.type === "checkout.session.completed") {
    //update the order
    const session = event.data.object;
    const { orderId } = session.metadata;
    const paymentStatus = session.payment_status;
    const paymentMethod = session.payment_method_types[0];
    const totalAmount = session.amount_total;
    const currency = session.currency;
    //find the order
    const order = await Order.findByIdAndUpdate(
      JSON.parse(orderId),
      {
        totalPrice: totalAmount / 100,
        currency,
        paymentMethod,
        paymentStatus,
      },
      {
        new: true,
      }
    );
    console.log(order);
  } else {
    return;
  }

  // Return a 200 response to acknowledge receipt of the event
  response.send();
});

//routes
app.use('/api/v1/users/', userRoutes);
app.use('/api/v1/products/', productsRouter);
app.use('/api/v1/categories/', categoriesRouter);
app.use('/api/v1/brands/', brandsRouter);
app.use('/api/v1/reviews/', reviewRouter);
app.use('/api/v1/orders/', orderRouter);


//err middlewares
app.use(notFound);
app.use(globalErrhandler);

export default app;
