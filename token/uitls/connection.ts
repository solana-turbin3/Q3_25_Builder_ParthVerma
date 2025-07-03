import { Connection, PublicKey, Commitment } from "@solana/web3.js";
import dotenv from 'dotenv';
import * as fs from "fs";
import path from "path";

dotenv.config();

export const establishConnection = async () => {
  const commitment: Commitment = "confirmed";
  const rpc = process.env.RPC || "";
  const connection = new Connection(rpc, commitment);

  return connection;
}

export const rpc = process.env.RPC || "";

export const mintKey = fs.readFileSync(
  path.join(__dirname, "../spl_ops/mint.txt"),
  'utf-8'
).trim();


export const tokenDecimals: number = 10_000_000;
