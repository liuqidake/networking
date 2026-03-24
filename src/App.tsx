import { useState } from "react";
import { makeStyles, tokens } from "@fluentui/react-components";
import { Sidebar } from "./components/Sidebar";
import { PageHeader } from "./components/PageHeader";
import { InfoBanner } from "./components/InfoBanner";
import { FeaturesGrid } from "./components/FeaturesGrid";
import { LinkForm } from "./components/LinkForm";
import { ProgressView } from "./components/ProgressView";
import { LinkedView } from "./components/LinkedView";
import { UnlinkDialog } from "./components/UnlinkDialog";

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
  content: {
    flex: 1,
    padding: "28px 24px",
    overflowY: "auto",
  },
  contentInner: {
    maxWidth: "960px",
  },
});

type AppState = "not-linked" | "linking" | "linked";

interface LinkedData {
  apimInstance: string;
  apiName: string;
}

function App() {
  const styles = useStyles();
  const [appState, setAppState] = useState<AppState>("not-linked");
  const [linkedData, setLinkedData] = useState<LinkedData | null>(null);
  const [unlinkOpen, setUnlinkOpen] = useState(false);

  const handleLink = (apimInstance: string, apiName: string) => {
    setLinkedData({ apimInstance, apiName });
    setAppState("linking");
  };

  const handleProgressDone = () => {
    setAppState("linked");
  };

  const handleBack = () => {
    setAppState("not-linked");
    setLinkedData(null);
  };

  const handleUnlink = () => {
    setUnlinkOpen(false);
    setAppState("not-linked");
    setLinkedData(null);
  };

  return (
    <div className={styles.root}>
      <Sidebar />
      <main className={styles.main}>
        <div className={styles.content}>
          <div className={styles.contentInner}>
            <PageHeader
              isLinked={appState === "linked"}
              onUnlink={() => setUnlinkOpen(true)}
            />
            <InfoBanner />
            <FeaturesGrid />

            {appState === "not-linked" && (
              <LinkForm onLink={handleLink} />
            )}

            {appState === "linking" && (
              <ProgressView onDone={handleProgressDone} onBack={handleBack} />
            )}

            {appState === "linked" && linkedData && (
              <LinkedView
                apimInstance={linkedData.apimInstance}
                apiName={linkedData.apiName}
              />
            )}
          </div>
        </div>
      </main>

      {linkedData && (
        <UnlinkDialog
          open={unlinkOpen}
          apimInstance={linkedData.apimInstance}
          apiName={linkedData.apiName}
          onClose={() => setUnlinkOpen(false)}
          onConfirm={handleUnlink}
        />
      )}
    </div>
  );
}

export default App;
