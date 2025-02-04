// https://dial.to/?action=solana-action:http://localhost:3000/api/vote
import {
  ActionGetResponse,
  ActionPostRequest,
  ACTIONS_CORS_HEADERS,
  createPostResponse,
} from "@solana/actions";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { Votingdapp } from "@/../anchor/target/types/votingdapp";
import { BN, Program } from "@coral-xyz/anchor";

import IDL from "@/../anchor/target/idl/votingdapp.json";

export const OPTIONS = { GET };

export async function GET(request: Request) {
  const actionMetdata: ActionGetResponse = {
    icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTs9FIYw_os1e1pZilBTjg7zokZCvtVW5HqsA&s",
    title: "Vote for your favorite type of peanut butter!",
    description: "Vote between crunchy and smooth peanut butter.",
    label: "Vote",
    links: {
      actions: [
        {
          type: "transaction",
          label: "Vote for Crunchy",
          href: "/api/vote?candidate=Crunchy",
        },
        {
          type: "transaction",
          label: "Vote for Smooth",
          href: "/api/vote?candidate=Smooth",
        },
      ],
    },
  };
  return Response.json(actionMetdata, { headers: ACTIONS_CORS_HEADERS });
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const candidate = url.searchParams.get("candidate");

  if (candidate != "Crunchy" && candidate != "Smooth") {
    return new Response("Invalid candidate", {
      status: 400,
      headers: ACTIONS_CORS_HEADERS,
    });
  }

  const connection = new Connection("http://127.0.0.1:8899", "confirmed");
  const programId = new PublicKey(
    "coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF"
  );
  const program = new Program<Votingdapp>(IDL as Votingdapp, programId, {
    connection,
  });

  const body: ActionPostRequest = await request.json();
  let voter;

  try {
    voter = new PublicKey(body.account);
  } catch (error) {
    return new Response("Invalid account", {
      status: 400,
      headers: ACTIONS_CORS_HEADERS,
    });
  }

  const instruction = await program.methods
    .vote(new BN(1), candidate)
    .accounts({
      signer: voter,
    })
    .instruction();

  const blockhash = await connection.getLatestBlockhash();

  const transaction = new Transaction({
    feePayer: voter,
    blockhash: blockhash.blockhash,
    lastValidBlockHeight: blockhash.lastValidBlockHeight,
  }).add(instruction);

  const response = await createPostResponse({
    fields: {
      transaction: transaction,
      type: "transaction",
    },
  });

  return Response.json(response, { headers: ACTIONS_CORS_HEADERS });
}
