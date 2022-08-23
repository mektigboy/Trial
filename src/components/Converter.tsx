import {
  AnchorProvider,
  BN,
  Idl,
  Program,
  utils,
  web3,
} from "@project-serum/anchor";
import { ChangeEvent, useState } from "react";
import { Commitment, Connection, PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import idl from "../convertion.json";

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

  const getProgram = () => {
    const connection = new Connection(network, options.preflightCommitment);
    const provider = new AnchorProvider(connection, wallet as any, options);
    const program = new Program(idl as Idl, programId, provider);
    return program;
  };

  const program = getProgram();

  const onAmountChange = (e: ChangeEvent<any>) => {
    setAmount(e.target.value);
  };

  const convert = async (convertKey: PublicKey) => {
    await program.methods
      .convert(new BN(amount))
      .accounts({
        convert: convertKey,
        user: wallet.publicKey!,
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
      <div>
        <label className="mb-25">You will receive:</label>
        $YAKU
      </div>
      <button className="convert-button" onClick={(convert)}>
        Convert
      </button>
    </div>
  );
};

export default Converter;
