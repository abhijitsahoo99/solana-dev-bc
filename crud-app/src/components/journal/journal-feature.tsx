"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletButton } from "../solana/solana-provider";
import { AppHero, ellipsify } from "../ui/ui-layout";
import { ExplorerLink } from "../cluster/cluster-ui";
import { useJournalProgram } from "./journal-data-access";
import { JournalCreate, JournalList } from "./journal-ui";

export default function CrudappFeature() {
  const { publicKey } = useWallet();
  const { program } = useJournalProgram();

  return publicKey ? (
    <div>
      <AppHero
        title="Crudapp"
        subtitle={
          'Create a new account by clicking the "Create" button. The state of a account is stored on-chain and can be manipulated by calling the program\'s methods (increment, decrement, set, and close).'
        }
      >
        <p className="mb-6">
          <ExplorerLink
            path={`account/${program.programId}`}
            label={ellipsify(program.programId.toString())}
          />
        </p>
        <JournalCreate />
      </AppHero>
      <JournalList />
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton />
        </div>
      </div>
    </div>
  );
}
