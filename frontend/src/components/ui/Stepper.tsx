import { Check } from "lucide-react";
import styles from "./Stepper.module.css";

interface StepperProps {
  step: number;
  steps: string[];
  onStepClick: (index: 0 | 1 | 2) => void;
}

export default function Stepper({ step, steps, onStepClick }: StepperProps) {
  return (
    <div className={styles.stepper}>
      {steps.map((label, i) => (
        <button
          key={label}
          className={`${styles.step} ${i === step ? styles.active : ""} ${i < step ? styles.done : ""}`}
          onClick={() => onStepClick(i as 0 | 1 | 2)}
        >
          <span className={styles.circle}>
            {i < step ? <Check size={13} /> : i + 1}
          </span>
          <span className={styles.label}>{label}</span>
        </button>
      ))}
    </div>
  );
}