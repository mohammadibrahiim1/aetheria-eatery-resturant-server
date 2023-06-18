const express = require("express");
const Stripe = require("stripe");
// const stripe = Stripe()
require("dotenv").config();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
// console.log(stripe);

const router = express.Router();

router.post("/create-checkout-session", async (req, res) => {
  const line_items = req.body.cart.map((item) => {
    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          images: [item.image],
          description: item.description,
          metadata: {
            id: item.id,
          },
        },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    };
  });
  const session = await stripe.checkout.sessions.create({
    line_items,
    phone_number_collection: {
      enabled: true,
    },
    //  [
    //   {
    //     price_data: {
    //       currency: "usd",
    //       product_data: {
    //         name: "T-shirt",
    //       },
    //       unit_amount: 4000,
    //     },
    //     quantity: 2,
    //   },
    //   {
    //     price_data: {
    //       currency: "usd",
    //       product_data: {
    //         name: "T-shirt",
    //       },
    //       unit_amount: 2000,
    //     },
    //     quantity: 1,
    //   },
    // ],
    mode: "payment",
    success_url: "https://etheria-eatery.web.app/shop",
    cancel_url: "https://etheria-eatery.web.app/cart",
  });

  res.send({ url: session.url });
});

module.exports = router;
