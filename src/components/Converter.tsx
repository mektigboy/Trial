import { AnchorProvider, BN, Idl, Program, utils } from "@project-serum/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { ChangeEvent, useState } from "react";
import {
  Commitment,
  Connection,
  PublicKey,
  Keypair,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import keypair from "../convertion-keypair.json";
import idl from "../convertion.json";

const vault = new Uint8Array(keypair);
const vaultKeypair = Keypair.fromSecretKey(vault);

interface ConverterProps {
  network: string;
}

export const Converter: React.FC<ConverterProps> = ({ network }) => {
  const wallet = useWallet();

  const [amount, setAmount] = useState<number>(1);

  const onAmountChange = (event: ChangeEvent<any>) => {
    setAmount(event.target.value);
  };

  const options: { preflightCommitment: Commitment } = {
    preflightCommitment: "processed",
  };

  const programId = new PublicKey(
    "FwKcQXnCknsvRgxHK5moPUyEtai61VCftLKS1tungYrA"
  );

  const getConnectionProvider = () => {
    const connection = new Connection(network, options.preflightCommitment);
    const provider = new AnchorProvider(connection, wallet as any, options);
    return provider;
  };
  const provider = getConnectionProvider();

  const getProgram = () => {
    const program = new Program(idl as unknown as Idl, programId, provider);
    return program;
  };
  const program = getProgram();

  const conversion = async () => {
    const [vaultPool, bump] = await PublicKey.findProgramAddress(
      [
        utils.bytes.utf8.encode("vault_yaku"),
        vaultKeypair.publicKey.toBuffer(),
      ],
      program.programId
    );

    const yakuMint = new PublicKey(
      "NGK3iHqqQkyRZUj4uhJDQqEyKKcZ7mdawWpqwMffM3s"
    );
    const vaultPoolYakuAccount = new PublicKey(
      "NGK3iHqqQkyRZUj4uhJDQqEyKKcZ7mdawWpqwMffM3s"
    );

    // Initialize Vault
    await program.methods
      .initializeVault(bump)
      .accounts({
        authority: wallet.publicKey!,
        vault: vaultKeypair.publicKey,
        vaultPool,
        vaultPoolYakuAccount,
        yakuMint,
        rent: SYSVAR_RENT_PUBKEY,
        associatedToken: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([vaultKeypair])
      .rpc();

    const cosmicMint = new PublicKey(
      "326vsKSXsf1EsPU1eKstzHwHmHyxsbavY4nTJGEm3ugV"
    );
    const vaultCosmicAccount = new PublicKey(
      "326vsKSXsf1EsPU1eKstzHwHmHyxsbavY4nTJGEm3ugV"
    );

    const claimerYakuAccount = await getAssociatedTokenAddress(
      yakuMint,
      wallet.publicKey!
    );
    const claimerCosmicAccount = await getAssociatedTokenAddress(
      cosmicMint,
      wallet.publicKey!
    );

    // Convert
    await program.methods
      .convert(new BN(amount))
      .accounts({
        claimer: wallet.publicKey!,
        claimerYakuAccount,
        cosmicMint,
        claimerCosmicAccount,
        vaultCosmicAccount,
        vault: vaultKeypair.publicKey,
        vaultPool,
        yakuMint,
        vaultPoolYakuAccount,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
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
