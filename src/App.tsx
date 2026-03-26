import { useState, useCallback } from "react";
import { makeStyles, tokens } from "@fluentui/react-components";
import { Sidebar } from "./components/Sidebar";
import { ApiHub } from "./components/v2/ApiHub";
import { NetworkingHub } from "./components/networking";

const useStyles = makeStyles({
  root: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: tokens.colorNeutralBackground2,
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    minWidth: 0,
  },
});

export type ActiveView = "api-management" | "networking";

function App() {
  const styles = useStyles();
  const [activeView, setActiveView] = useState<ActiveView>("networking");

  const handleNavigate = useCallback((view: ActiveView) => {
    setActiveView(view);
  }, []);

  return (
    <div className={styles.root}>
      <Sidebar activeView={activeView} onNavigate={handleNavigate} />
      <main className={styles.main}>
        {activeView === "api-management" && <ApiHub />}
        {activeView === "networking" && <NetworkingHub />}
      </main>
    </div>
  );
}

export default App;
