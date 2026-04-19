"use client";

import { useActionState, useState } from "react";
import { addInterestRateChange } from "./actions";
import styles from "./page.module.css";

type InterestRateButtonProps = {
  accountId: number;
};

export function InterestRateButton({ accountId }: InterestRateButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    addInterestRateChange.bind(null, accountId),
    {},
  );

  return (
    <>
      <button
        className={styles.secondaryButton}
        onClick={() => setIsOpen(true)}
        type="button"
      >
        Adjust rate
      </button>

      {isOpen ? (
        <div
          aria-labelledby="adjust-interest-rate"
          aria-modal="true"
          className={styles.modalBackdrop}
          role="dialog"
        >
          <form action={formAction} className={styles.modal}>
            <h3 id="adjust-interest-rate">Adjust interest rate</h3>
            <p>
              Add a dated rate change for this account. Existing ledger rows
              before that date keep using the prior rate.
            </p>

            <div className={styles.modalFormGrid}>
              <label>
                <span>Effective date</span>
                <input name="effectiveDate" required type="date" />
              </label>

              <label>
                <span>Annual rate</span>
                <input
                  min="0"
                  name="annualRate"
                  placeholder="25"
                  required
                  step="0.01"
                  type="number"
                />
              </label>
            </div>

            {state.error ? <p className={styles.formError}>{state.error}</p> : null}

            <div className={styles.modalActions}>
              <button
                className={styles.secondaryButton}
                disabled={isPending}
                onClick={() => setIsOpen(false)}
                type="button"
              >
                Cancel
              </button>
              <button
                className={styles.primaryButton}
                disabled={isPending}
                type="submit"
              >
                {isPending ? "Saving..." : "Save rate"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}

