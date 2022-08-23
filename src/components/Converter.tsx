import {
  AnchorProvider,
  Idl,
  Program,
  utils,
  web3,
} from "@project-serum/anchor";
import {
  clusterApiUrl,
  Commitment,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
} from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccount,
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  createMintToCheckedInstruction,
  createMint,
  getAssociatedTokenAddress,
  getMinimumBalanceForRentExemptMint,
  mintTo,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { ChangeEvent, useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { WalletContextState, useWallet } from "@solana/wallet-adapter-react";
import idl from "../convertion.json";
import { create } from "domain";

const options: { preflightCommitment: Commitment } = {
  preflightCommitment: "processed",
};

const programId = new PublicKey(idl.metadata.address);

interface ConverterProps {
  network: string;
}

export const Converter: React.FC<ConverterProps> = ({ network }) => {
  const wallet = useWallet();

  const vaultKeypair = Keypair.generate();

  const [amount, setAmount] = useState<number>(1);

  const onAmountChange = (event: ChangeEvent<any>) => {
    setAmount(event.target.value);
  };

  const getProgram = () => {
    const connection = new Connection(network, options.preflightCommitment);
    const provider = new AnchorProvider(connection, wallet as any, options);
    const program = new Program(idl as unknown as Idl, programId, provider);
    return program;
  };
  const program = getProgram();

  const yakuMint = "NGK3iHqqQkyRZUj4uhJDQqEyKKcZ7mdawWpqwMffM3s";
  const cosmicMint = "326vsKSXsf1EsPU1eKstzHwHmHyxsbavY4nTJGEm3ugV";

  const conversion = async () => {
    const [vaultPool, bump] = await PublicKey.findProgramAddress(
      [utils.bytes.utf8.encode("vault_yaku"), wallet.publicKey!.toBuffer()],
      program.programId
    );

    //Initialize Vault
    await program.methods
      .initializeVault(bump)
      .accounts({
        authority: wallet.publicKey!,
        vault: vaultKeypair.publicKey!,
        vaultPool,
        // vaultPoolYakuAccount,
        yakuMint,
        rent: SYSVAR_RENT_PUBKEY,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedToken: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();

    // Convert
    await program.methods
      .convert(amount)
      .accounts({
        claimer: wallet.publicKey!,
        // claimerYakuAccount,
        cosmicMint,
        // claimerCosmicAccount: claimerCosmicAccount.key,
        vault: vaultKeypair.publicKey,
        // vaultCosmicAccount,
        vaultPool,
        yakuMint,
        // vaultPoolYakuAccount,
        rent: SYSVAR_RENT_PUBKEY,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();
  };

  return (
    <div>
      <h1 className="mb-25">Convert</h1>
      <h2 className="mb-25">$COSMIC to $YAKU</h2>
      {!wallet.connected && <WalletMultiButton />}
      <div className="mt-25 mb-25">
        <label>Enter amount to convert:</label>
        <div className="input">
          <input onChange={onAmountChange} type="number" value={amount} />
          <div className="cosmic">$COSMIC</div>
        </div>
      </div>
      <div className="mb-25">
        <label className="mb-25">You will receive: {amount / 4} </label>
        $YAKU
      </div>
      <button className="convert-button" onClick={conversion}>
        Convert
      </button>
    </div>
  );
};

export default Converter;
