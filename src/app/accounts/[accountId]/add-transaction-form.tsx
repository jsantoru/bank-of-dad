"use client";

import { useActionState } from "react";
import { addTransaction } from "./actions";
import styles from "./page.module.css";

type AddTransactionFormProps = {
  accountId: number;
};

export function AddTransactionForm({ accountId }: AddTransactionFormProps) {
  const [state, formAction, isPending] = useActionState(
    addTransaction.bind(null, accountId),
    {},
  );

  return (
    <form action={formAction} className={styles.transactionForm}>
      <div className={styles.formGrid}>
        <label>
          <span>Date</span>
          <input name="date" required type="date" />
        </label>

        <label>
          <span>Type</span>
          <select defaultValue="deposit" name="type">
            <option value="deposit">Deposit</option>
            <option value="withdrawal">Withdrawal</option>
          </select>
        </label>

        <label>
          <span>Amount</span>
          <input
            min="0.01"
            name="amount"
            placeholder="0.00"
            required
            step="0.01"
            type="number"
          />
        </label>

        <label className={styles.noteField}>
          <span>Note</span>
          <input name="note" placeholder="Optional" type="text" />
        </label>
      </div>

      <div className={styles.formFooter}>
        {state.error ? <p className={styles.formError}>{state.error}</p> : null}
        <button disabled={isPending} type="submit">
          {isPending ? "Adding..." : "Add transaction"}
        </button>
      </div>
    </form>
  );
}

