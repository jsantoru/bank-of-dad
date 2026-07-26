"use client";

import { useState } from "react";
import styles from "./DateRangeFilter.module.css";

type DateRangePreset = "all" | "1y" | "6m" | "3m" | "1m" | "custom";

type Props = {
  onDateRangeChange: (startDate: string | null, endDate: string | null) => void;
  minDate?: string;
  maxDate?: string;
};

export function DateRangeFilter({ onDateRangeChange, minDate, maxDate }: Props) {
  const [preset, setPreset] = useState<DateRangePreset>("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const handlePresetChange = (newPreset: DateRangePreset) => {
    setPreset(newPreset);

    if (newPreset === "all") {
      onDateRangeChange(null, null);
      return;
    }

    if (newPreset === "custom") {
      // Don't apply until user sets custom dates
      return;
    }

    // Calculate date range based on preset
    const endDate = new Date();
    const startDate = new Date();

    switch (newPreset) {
      case "1y":
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      case "6m":
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case "3m":
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case "1m":
        startDate.setMonth(endDate.getMonth() - 1);
        break;
    }

    onDateRangeChange(formatDate(startDate), formatDate(endDate));
  };

  const handleCustomDateChange = () => {
    if (customStart && customEnd) {
      onDateRangeChange(customStart, customEnd);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.presets}>
        <button
          className={preset === "all" ? styles.activeButton : styles.button}
          onClick={() => handlePresetChange("all")}
        >
          All time
        </button>
        <button
          className={preset === "1y" ? styles.activeButton : styles.button}
          onClick={() => handlePresetChange("1y")}
        >
          1 Year
        </button>
        <button
          className={preset === "6m" ? styles.activeButton : styles.button}
          onClick={() => handlePresetChange("6m")}
        >
          6 Months
        </button>
        <button
          className={preset === "3m" ? styles.activeButton : styles.button}
          onClick={() => handlePresetChange("3m")}
        >
          3 Months
        </button>
        <button
          className={preset === "1m" ? styles.activeButton : styles.button}
          onClick={() => handlePresetChange("1m")}
        >
          1 Month
        </button>
        <button
          className={preset === "custom" ? styles.activeButton : styles.button}
          onClick={() => handlePresetChange("custom")}
        >
          Custom
        </button>
      </div>

      {preset === "custom" && (
        <div className={styles.customRange}>
          <label>
            <span>Start date</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              min={minDate}
              max={maxDate}
            />
          </label>
          <label>
            <span>End date</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              min={customStart || minDate}
              max={maxDate}
            />
          </label>
          <button
            className={styles.applyButton}
            onClick={handleCustomDateChange}
            disabled={!customStart || !customEnd}
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
