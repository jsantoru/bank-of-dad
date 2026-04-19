"use server";

import { revalidatePath } from "next/cache";
import {
  createTransaction,
  deleteTransaction,
  upsertInterestRateChange,
} from "@/db/queries";
import { initializeDatabase, openDatabase } from "@/db";
import { dollarsToCents } from "@/domain/money";

type AddTransactionState = {
  error?: string;
};

type AddInterestRateState = {
  error?: string;
};

export async function addTransaction(
  accountId: number,
  _previousState: AddTransactionState,
  formData: FormData,
): Promise<AddTransactionState> {
  const date = String(formData.get("date") ?? "").trim();
  const type = String(formData.get("type") ?? "").trim();
  const amount = Number(String(formData.get("amount") ?? "").trim());
  const note = String(formData.get("note") ?? "").trim();

  if (!isValidDate(date)) {
    return { error: "Enter a valid transaction date." };
  }

  if (type !== "deposit" && type !== "withdrawal") {
    return { error: "Choose deposit or withdrawal." };
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "Enter an amount greater than zero." };
  }

  const amountCents = dollarsToCents(amount);

  if (amountCents <= 0) {
    return { error: "Enter an amount greater than zero." };
  }

  const db = openDatabase();

  try {
    initializeDatabase(db);
    createTransaction(db, {
      accountId,
      date,
      type,
      amountCents,
      note,
    });
  } finally {
    db.close();
  }

  revalidatePath("/");
  revalidatePath(`/accounts/${accountId}`);

  return {};
}

export async function removeTransaction(
  accountId: number,
  transactionId: number,
) {
  if (!Number.isInteger(accountId) || accountId <= 0) {
    throw new Error("Invalid account.");
  }

  if (!Number.isInteger(transactionId) || transactionId <= 0) {
    throw new Error("Invalid transaction.");
  }

  const db = openDatabase();

  try {
    initializeDatabase(db);
    deleteTransaction(db, accountId, transactionId);
  } finally {
    db.close();
  }

  revalidatePath("/");
  revalidatePath(`/accounts/${accountId}`);
}

export async function addInterestRateChange(
  accountId: number,
  _previousState: AddInterestRateState,
  formData: FormData,
): Promise<AddInterestRateState> {
  const effectiveDate = String(formData.get("effectiveDate") ?? "").trim();
  const annualRate = Number(String(formData.get("annualRate") ?? "").trim());

  if (!isValidDate(effectiveDate)) {
    return { error: "Enter a valid effective date." };
  }

  if (!Number.isFinite(annualRate) || annualRate < 0) {
    return { error: "Enter an annual rate of zero or higher." };
  }

  const annualRateBasisPoints = Math.round(annualRate * 100);

  const db = openDatabase();

  try {
    initializeDatabase(db);
    upsertInterestRateChange(db, {
      accountId,
      effectiveDate,
      annualRateBasisPoints,
    });
  } finally {
    db.close();
  }

  revalidatePath("/");
  revalidatePath(`/accounts/${accountId}`);

  return {};
}

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);

  return !Number.isNaN(date.getTime()) && value === date.toISOString().slice(0, 10);
}
