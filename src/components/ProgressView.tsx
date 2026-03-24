import {
  makeStyles,
  tokens,
  Spinner,
  Button,
  mergeClasses,
} from "@fluentui/react-components";
import {
  Checkmark16Filled,
  Dismiss16Filled,
} from "@fluentui/react-icons";
import { useEffect, useState } from "react";

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    maxWidth: "480px",
    margin: "0 auto",
    padding: "24px 0",
  },
  steps: {
    width: "100%",
    marginBottom: "20px",
  },
  stepRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "11px 0",
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    "&:last-child": {
      borderBottom: "none",
    },
  },
  indicator: {
    width: "26px",
    height: "26px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    flexShrink: 0,
    fontWeight: 700,
  },
  indicatorPending: {
    backgroundColor: tokens.colorNeutralBackground3,
    border: `2px solid ${tokens.colorNeutralStroke1}`,
    color: tokens.colorNeutralForeground4,
  },
  indicatorRunning: {
    backgroundColor: tokens.colorBrandBackground2,
    border: `2px solid ${tokens.colorBrandStroke1}`,
    color: tokens.colorBrandForeground1,
  },
  indicatorDone: {
    backgroundColor: tokens.colorPaletteGreenBackground1,
    border: `2px solid ${tokens.colorPaletteGreenBorder1}`,
    color: tokens.colorPaletteGreenForeground1,
  },
  indicatorError: {
    backgroundColor: tokens.colorPaletteRedBackground1,
    border: `2px solid ${tokens.colorPaletteRedBorder1}`,
    color: tokens.colorPaletteRedForeground1,
  },
  stepTitle: {
    fontSize: "12.5px",
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
  },
  stepLabel: {
    display: "block",
    fontSize: "11.5px",
    marginTop: "1px",
  },
  labelPending: {
    color: tokens.colorNeutralForeground3,
  },
  labelRunning: {
    color: tokens.colorBrandForeground1,
  },
  labelDone: {
    color: tokens.colorPaletteGreenForeground1,
  },
  labelError: {
    color: tokens.colorPaletteRedForeground1,
  },
  resultBox: {
    width: "100%",
    borderRadius: tokens.borderRadiusMedium,
    padding: "12px 14px",
    fontSize: "12.5px",
    fontWeight: 500,
    marginBottom: "16px",
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
  },
  resultSuccess: {
    backgroundColor: tokens.colorPaletteGreenBackground1,
    border: `1px solid ${tokens.colorPaletteGreenBorder1}`,
    color: tokens.colorPaletteGreenForeground1,
  },
  resultError: {
    backgroundColor: tokens.colorPaletteRedBackground1,
    border: `1px solid ${tokens.colorPaletteRedBorder1}`,
    color: tokens.colorPaletteRedForeground1,
  },
  resultBody: {
    "& strong": {
      display: "block",
      marginBottom: "2px",
    },
    "& p": {
      fontWeight: 400,
      fontSize: "11.5px",
      opacity: 0.85,
      margin: 0,
    },
  },
  actions: {
    display: "flex",
    gap: "10px",
    justifyContent: "center",
  },
});

type StepState = "pending" | "running" | "done" | "error";

interface Step {
  title: string;
  state: StepState;
  label: string;
}

interface ProgressViewProps {
  onDone: () => void;
  onBack: () => void;
}

export function ProgressView({ onDone, onBack }: ProgressViewProps) {
  const styles = useStyles();
  const [steps, setSteps] = useState<Step[]>([
    { title: "Connecting to API Management", state: "pending", label: "Waiting..." },
    { title: "Registering API", state: "pending", label: "Waiting..." },
    { title: "Linking to App Service", state: "pending", label: "Waiting..." },
  ]);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

      // Step 1
      setSteps((s) => s.map((st, i) => (i === 0 ? { ...st, state: "running", label: "Connecting..." } : st)));
      await delay(1400);
      if (cancelled) return;
      setSteps((s) => s.map((st, i) => (i === 0 ? { ...st, state: "done", label: "Connected" } : st)));

      // Step 2
      setSteps((s) => s.map((st, i) => (i === 1 ? { ...st, state: "running", label: "Registering..." } : st)));
      await delay(1800);
      if (cancelled) return;
      setSteps((s) => s.map((st, i) => (i === 1 ? { ...st, state: "done", label: "API registered" } : st)));

      // Step 3
      setSteps((s) => s.map((st, i) => (i === 2 ? { ...st, state: "running", label: "Linking..." } : st)));
      await delay(1400);
      if (cancelled) return;
      setSteps((s) => s.map((st, i) => (i === 2 ? { ...st, state: "done", label: "Linked" } : st)));

      setFinished(true);
    };

    run();
    return () => { cancelled = true; };
  }, []);

  const indicatorClass = (state: StepState) => {
    switch (state) {
      case "pending": return styles.indicatorPending;
      case "running": return styles.indicatorRunning;
      case "done": return styles.indicatorDone;
      case "error": return styles.indicatorError;
    }
  };

  const labelClass = (state: StepState) => {
    switch (state) {
      case "pending": return styles.labelPending;
      case "running": return styles.labelRunning;
      case "done": return styles.labelDone;
      case "error": return styles.labelError;
    }
  };

  const renderIndicatorContent = (state: StepState, idx: number) => {
    switch (state) {
      case "running": return <Spinner size="tiny" />;
      case "done": return <Checkmark16Filled />;
      case "error": return <Dismiss16Filled />;
      default: return idx + 1;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.steps}>
        {steps.map((step, i) => (
          <div key={i} className={styles.stepRow}>
            <div className={mergeClasses(styles.indicator, indicatorClass(step.state))}>
              {renderIndicatorContent(step.state, i)}
            </div>
            <div>
              <div className={styles.stepTitle}>{step.title}</div>
              <span className={mergeClasses(styles.stepLabel, labelClass(step.state))}>
                {step.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      {finished && (
        <div className={mergeClasses(styles.resultBox, styles.resultSuccess)}>
          <span>&#9989;</span>
          <div className={styles.resultBody}>
            <strong>API linked successfully</strong>
            <p>Your app is now connected to the API Management instance. You can manage it from the APIM portal.</p>
          </div>
        </div>
      )}

      {finished && (
        <div className={styles.actions}>
          <Button appearance="outline" size="small" onClick={onBack}>
            Back
          </Button>
          <Button appearance="primary" size="small" onClick={onDone}>
            Go to API Management &#8599;
          </Button>
        </div>
      )}
    </div>
  );
}
