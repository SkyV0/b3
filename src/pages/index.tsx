import { createSSGHelpers } from "@trpc/react/ssg";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { unstable_getServerSession as getServerSession } from "next-auth";
import React from "react";
import superjson from "superjson";

import Main from "../../src/components/Home/Main";
import Sidebar from "../../src/components/Home/Sidebar";
import Navbar from "../../src/components/Layout/Navbar";
import Meta from "../../src/components/Shared/Meta";
import { prisma } from "../server/db/client";
import { appRouter } from "../server/router";
import { authOptions } from "./api/auth/[...nextauth]";

const Home: NextPage<HomeProps> = ({
  suggestedAccounts,
  followingAccounts,
  origin,
}) => {
  return (
    <>
      <Meta
        title="Just B3 - B3 Known, B3 Loved, B3 You"
        description="Just B3 - Just B3"
        image="/favicon.png"
      />
      <Navbar />
      <div className="flex justify-center mx-4">
        <div className="w-full max-w-[1150px] flex">
          <Sidebar
            suggestedAccounts={suggestedAccounts!}
            followingAccounts={followingAccounts!}
          />
          <Main origin={origin!} />
        </div>
      </div>
    </>
  );
};

export default Home;

type HomeProps = InferGetServerSidePropsType<typeof getServerSideProps>;

export const getServerSideProps = async ({
  req,
  res,
  query,
}: GetServerSidePropsContext) => {
  const session = await getServerSession(req, res, authOptions);

  const isFetchingFollowing = Boolean(Number(query.following));

  if (isFetchingFollowing && !session?.user?.email) {
    return {
      redirect: {
        destination: "/sign-in",
        permanent: true,
      },
      props: {},
    };
  }

  const ssg = createSSGHelpers({
    router: appRouter,
    ctx: {
      req: undefined,
      res: undefined,
      prisma,
      session,
    },
    transformer: superjson,
  });

  const [suggestedAccounts, followingAccounts] = await Promise.all([
    prisma.user.findMany({
      take: 20,
      where: {
        email: {
          not: session?.user?.email,
        },
      },
      select: {
        id: true,
        image: true,
        name: true,
      },
    }),
    session?.user
      ? prisma.follow.findMany({
          where: {
            // @ts-ignore
            followerId: session?.user?.id,
          },
          select: {
            following: {
              select: {
                id: true,
                image: true,
                name: true,
              },
            },
          },
        })
      : Promise.resolve([]),
    isFetchingFollowing
      ? ssg.fetchInfiniteQuery("video.following", {})
      : ssg.fetchInfiniteQuery("video.for-you", {}),
  ]);

  return {
    props: {
      trpcState: ssg.dehydrate(),
      session,
      suggestedAccounts,
      followingAccounts: followingAccounts.map((item) => item.following),
      origin: `${
        req.headers.host?.includes("localhost") ? "http" : "https"
      }://${req.headers.host}`,
    },
  };
};

// import { NextApiRequest, NextApiResponse } from 'next';
// import Stripe from 'stripe';

// import { CURRENCY, MAX_AMOUNT,MIN_AMOUNT } from '../config';
// import { formatAmountForStripe } from '../utils/stripe-helpers';
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   // https://github.com/stripe/stripe-node#configuration
//   apiVersion: '2022-08-01',
// });

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   if (req.method === 'POST') {
//     const { amount }: { amount: number } = req.body;
//     try {
//       // Validate the amount that was passed from the client.
//       if (!(amount >= MIN_AMOUNT && amount <= MAX_AMOUNT)) {
//         throw new Error('Invalid amount.');
//       }
//       // Create PaymentIntent from body params.
//       const params: Stripe.PaymentIntentCreateParams = {
//         payment_method_types: ['card'],
//         amount: formatAmountForStripe(amount, CURRENCY),
//         currency: CURRENCY,
//       };
//       const payment_intent: Stripe.PaymentIntent = await stripe.paymentIntents.create(
//         params
//       );

//       res.status(200).json(payment_intent);
//     } catch (err) {
//       res.status(500).json({ statusCode: 500, message: err });
//     }
//   } else {
//     res.setHeader('Allow', 'POST');
//     res.status(405).end('Method Not Allowed');
//   }
// }