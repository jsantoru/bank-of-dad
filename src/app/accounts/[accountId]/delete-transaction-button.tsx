"use client";

import { useState, useTransition } from "react";
import { removeTransaction } from "./actions";
import styles from "./page.module.css";

type DeleteTransactionButtonProps = {
  accountId: number;
  transaction: {
    id: number;
    date: string;
    type: "deposit" | "withdrawal";
    amount: string;
  };
};

export function DeleteTransactionButton({
  accountId,
  transaction,
}: DeleteTransactionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function closeModal() {
    if (!isPending) {
      setIsOpen(false);
    }
  }

  function confirmDelete() {
    startTransition(async () => {
      await removeTransaction(accountId, transaction.id);
      setIsOpen(false);
    });
  }

  return (
    <>
      <button
        className={styles.deleteButton}
        onClick={() => setIsOpen(true)}
        type="button"
      >
        Delete
      </button>

      {isOpen ? (
        <div
          aria-labelledby={`delete-transaction-${transaction.id}`}
          aria-modal="true"
          className={styles.modalBackdrop}
          role="dialog"
        >
          <div className={styles.modal}>
            <h3 id={`delete-transaction-${transaction.id}`}>
              Delete transaction?
            </h3>
            <p>
              This will remove the {transaction.type} of {transaction.amount} on{" "}
              {transaction.date}. Future balances and interest will recalculate.
            </p>

            <div className={styles.modalActions}>
              <button
                className={styles.secondaryButton}
                disabled={isPending}
                onClick={closeModal}
                type="button"
              >
                Cancel
              </button>
              <button
                className={styles.dangerButton}
                disabled={isPending}
                onClick={confirmDelete}
                type="button"
              >
                {isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

