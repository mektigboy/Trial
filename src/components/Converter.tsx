import {
  AnchorProvider,
  BN,
  Idl,
  Program,
  utils,
  web3,
} from "@project-serum/anchor";
import { ChangeEvent, useState } from "react";
import {
  Commitment,
  Connection,
  Keypair,
  PublicKey,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import idl from "../convertion.json"; // Smart Contract

const options: { preflightCommitment: Commitment } = {
  preflightCommitment: "processed",
};

const programId = new PublicKey(idl.metadata.address);

interface ConverterProps {
  network: string;
}

export const Converter: React.FC<ConverterProps> = ({ network }) => {
  const wallet = useWallet();

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
    const provider = new AnchorProvider(connection, wallet as any, options);
    const program = new Program(idl as Idl, programId, provider);
    return program;
  };

  const program = getProgram();

  const initializeVault = async () => {
    const authority = Keypair.generate();
    const vaultKeypair = Keypair.generate();

    const [vaultPool, bump] = await PublicKey.findProgramAddress(
      [utils.bytes.utf8.encode("vault_yaku"), wallet.publicKey!.toBuffer()],
      program.programId
    );

    const yakuMint = await Mint.create(program, authority, publicKey, 2);

    await program.methods.initializeVault(bump, {
      accounts: {
        authority: authority.publicKey,
        vault: vaultKeypair.publicKey,
        vaultPool,
        vaultPoolYakuAccount,
        yakuMint: yakuMint.key,
        rent: SYSVAR_RENT_PUBKEY,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedToken: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: web3.SystemProgram.programId,
      },
      signers: [authority, vaultKeypair],
    });
  };

  const handleConversion = async () => {
    initializeVault();
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
          <input
            onChange={onAddressChange}
            type="text
          "
            value={address}
          />
        </div>
      </div>
      <div className="mb-25">
        <label className="mb-25">You will receive: </label>
        $YAKU
      </div>
      <button className="convert-button" onClick={handleConversion}>
        Convert
      </button>
    </div>
  );
};

export default Converter;
