import {
  AnchorProvider,
  Idl,
  Program,
  utils,
  web3,
} from "@project-serum/anchor";
import {
  Commitment,
  Connection,
  Keypair,
  PublicKey,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { ChangeEvent, useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import idl from "../convertion.json";

interface ConverterProps {
  network: string;
}

export const Converter: React.FC<ConverterProps> = ({ network }) => {
  const wallet = useWallet();

  const [amount, setAmount] = useState<number>(1);
  const [address, setAddress] = useState<string>("");

  const onAmountChange = (event: ChangeEvent<any>) => {
    setAmount(event.target.value);
  };
  const onAddressChange = (event: ChangeEvent<any>) => {
    setAddress(event.target.value);
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

  const yakuMint = "NGK3iHqqQkyRZUj4uhJDQqEyKKcZ7mdawWpqwMffM3s";
  const cosmicMint = "326vsKSXsf1EsPU1eKstzHwHmHyxsbavY4nTJGEm3ugV";
  const claimerYakuAccount = "";
  const claimerCosmicAccount = "";
  const vaultCosmicAccount = "";

  const conversion = async () => {
    const vaultKeypair = Keypair.generate();

    const [vaultPool, bump] = await PublicKey.findProgramAddress(
      [utils.bytes.utf8.encode("vault_yaku"), wallet.publicKey!.toBuffer()],
      program.programId
    );

    //Initialize Vault
    const initialization = await program.methods
      .initializeVault(bump)
      .accounts({
        authority: wallet.publicKey!,
        vault: vaultKeypair.publicKey!,
        vaultPool: vaultPool,
        vaultPoolYakuAccount: wallet.publicKey!,
        yakuMint: yakuMint,
        rent: SYSVAR_RENT_PUBKEY,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedToken: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();
    console.log(initialization);

    // Convert
    const conversion = await program.methods
      .convert(amount)
      .accounts({
        claimer: address,
        claimerYakuAccount: claimerCosmicAccount,
        cosmicMint: cosmicMint,
        claimerCosmicAccount,
        vault: vaultKeypair.publicKey!,
        vaultCosmicAccount,
        vaultPool: vaultPool,
        yakuMint: yakuMint,
        // vaultPoolYakuAccount,
        rent: SYSVAR_RENT_PUBKEY,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();
    console.log(conversion);
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
        <label>Enter address:</label>
        <div className="input">
          <input onChange={onAddressChange} type="text" value={address} />
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
