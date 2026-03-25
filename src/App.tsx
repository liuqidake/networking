import { makeStyles, tokens } from "@fluentui/react-components";
import { Sidebar } from "./components/Sidebar";
import { ApiHub } from "./components/v2/ApiHub";

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

function App() {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <Sidebar />
      <main className={styles.main}>
        <ApiHub />
      </main>
    </div>
  );
}

export default App;
