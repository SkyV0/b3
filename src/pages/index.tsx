import { createSSGHelpers } from "@trpc/react/ssg";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { unstable_getServerSession as getServerSession } from "next-auth";
import superjson from "superjson";

import Main from "@/components/Home/Main";
import Sidebar from "@/components/Home/Sidebar";
import Navbar from "@/components/Layout/Navbar";
import Meta from "@/components/Shared/Meta";
import { appRouter } from "@/server/router";
import { prisma } from "@/server/router/client";

import { authOptions } from "./api/auth/[...nextauth]";

const Home: NextPage<HomeProps> = ({
  suggestedAccounts,
  followingAccounts,
  origin,
}) => {
  return (
    <>
      <Meta
        title="Just B3 -"
        description="Just B3 - B3 loved, B3 known, B3 you"
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
