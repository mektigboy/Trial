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
  Transaction,
} from "@solana/web3.js";
import {
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
  const authority = useWallet();

  const [amount, setAmount] = useState<number>(1);
  const [address, setAddress] = useState("");

  const onAmountChange = (event: ChangeEvent<any>) => {
    setAmount(event.target.value);
  };

  const onAddressChange = (event: ChangeEvent<any>) => {
    setAddress(event.target.value);
  };

  const getProgram = () => {
    const connection = new Connection(network, options.preflightCommitment);
    const provider = new AnchorProvider(connection, authority as any, options);
    const program = new Program(idl as unknown as Idl, programId, provider);
    return program;
  };

  const program = getProgram();

  const mintTokens = async () => {
    const mint = await program.methods.yakuMint(
      program,
      authority,
      authority.publicKey,
      2
    );
    return mint;
  };


  const yakuMint = mintTokens();

  const initializeVault = async () => {
    const vaultKeypair = Keypair.generate();

    const [vaultPool, bump] = await PublicKey.findProgramAddress(
      [utils.bytes.utf8.encode("vault_yaku"), authority.publicKey!.toBuffer()],
      program.programId
    );

  };

  const handleConversion = async () => {
    initializeVault();
  };

  return (
    <div>
      <h1 className="mb-25">Convert</h1>
      <h2 className="mb-25">$COSMIC to $YAKU</h2>
      {!authority.connected && <WalletMultiButton />}
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
          <input
            onChange={onAddressChange}
            type="text
          "
            value={address}
          />
        </div>
      </div>
      <div className="mb-25">
        <label className="mb-25">You will receive: {amount / 4} </label>
        $YAKU
      </div>
      <button className="convert-button" onClick={handleConversion}>
        Convert
      </button>
    </div>
  );
};

export default Converter;
