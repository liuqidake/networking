import {
  makeStyles,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  Link,
} from "@fluentui/react-components";

const useStyles = makeStyles({
  banner: {
    marginBottom: "16px",
  },
});

export function InfoBanner() {
  const styles = useStyles();

  return (
    <MessageBar intent="info" className={styles.banner}>
      <MessageBarBody>
        <MessageBarTitle>What is API Management?</MessageBarTitle>
        Azure API Management lets you manage, secure, and publish your APIs at
        scale — with rate limiting, auth policies, analytics, and a developer
        portal.{" "}
        <Link href="#" inline>
          Learn more &rarr;
        </Link>
      </MessageBarBody>
    </MessageBar>
  );
}
