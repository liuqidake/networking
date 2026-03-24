import {
  makeStyles,
  tokens,
  shorthands,
  Button,
  Textarea,
} from "@fluentui/react-components";
import {
  Dismiss16Regular,
  Send16Filled,
} from "@fluentui/react-icons";
import { useState, useRef, useEffect } from "react";

const useStyles = makeStyles({
  wrapper: {
    padding: "12px 10px 0",
  },
  trigger: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 10px",
    borderRadius: tokens.borderRadiusMedium,
    fontSize: "12.5px",
    color: tokens.colorNeutralForeground3,
    cursor: "pointer",
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    backgroundColor: tokens.colorNeutralBackground3,
    transition: "all 0.15s",
    width: "100%",
    "&:hover": {
      backgroundColor: tokens.colorNeutralBackground1,
      color: tokens.colorNeutralForeground1,
      ...shorthands.borderColor(tokens.colorBrandStroke1),
      boxShadow: `0 0 0 3px ${tokens.colorBrandBackground2}`,
    },
  },
  expanded: {
    display: "flex",
    flexDirection: "column",
    border: `1px solid ${tokens.colorBrandStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
    boxShadow: `0 0 0 3px ${tokens.colorBrandBackground2}, 0 4px 16px rgba(0,0,0,0.08)`,
    overflow: "hidden",
    animationName: {
      from: { opacity: 0, transform: "scaleY(0.9)" },
      to: { opacity: 1, transform: "scaleY(1)" },
    },
    animationDuration: "0.3s",
    animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 12px",
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  headerIcon: {
    width: "22px",
    height: "22px",
    background: `linear-gradient(135deg, ${tokens.colorBrandBackground}, #818cf8)`,
    borderRadius: "5px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10px",
    color: "#fff",
    fontWeight: 700,
  },
  headerTitle: {
    fontSize: "12px",
    fontWeight: 600,
    color: tokens.colorBrandForeground1,
  },
  messages: {
    height: "200px",
    overflowY: "auto",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  welcome: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    textAlign: "center",
    gap: "6px",
    padding: "20px 10px",
    color: tokens.colorNeutralForeground3,
  },
  welcomeIcon: {
    fontSize: "24px",
    marginBottom: "2px",
  },
  welcomeTitle: {
    fontSize: "12.5px",
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
  },
  welcomeDesc: {
    fontSize: "11.5px",
    lineHeight: "1.45",
  },
  msgRow: {
    display: "flex",
    gap: "8px",
    animationName: {
      from: { opacity: 0, transform: "translateY(6px)" },
      to: { opacity: 1, transform: "translateY(0)" },
    },
    animationDuration: "0.2s",
  },
  msgRowUser: {
    flexDirection: "row-reverse",
  },
  avatar: {
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10px",
    flexShrink: 0,
    fontWeight: 700,
  },
  avatarUser: {
    backgroundColor: tokens.colorBrandBackground,
    color: "#fff",
  },
  avatarAssistant: {
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground1,
    border: `1px solid ${tokens.colorBrandStroke2Contrast}`,
  },
  bubble: {
    maxWidth: "80%",
    padding: "7px 11px",
    borderRadius: tokens.borderRadiusMedium,
    fontSize: "12px",
    lineHeight: "1.5",
  },
  bubbleUser: {
    backgroundColor: tokens.colorBrandBackground,
    color: "#fff",
    borderBottomRightRadius: "3px",
  },
  bubbleAssistant: {
    backgroundColor: tokens.colorNeutralBackground3,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    color: tokens.colorNeutralForeground1,
    borderBottomLeftRadius: "3px",
  },
  inputRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: "6px",
    padding: "10px 12px",
    borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  input: {
    flex: 1,
  },
});

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

interface ChatWidgetProps {
  onExpandChange?: (expanded: boolean) => void;
}

export function ChatWidget({ onExpandChange }: ChatWidgetProps) {
  const styles = useStyles();
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  const open = () => {
    setExpanded(true);
    onExpandChange?.(true);
  };

  const close = () => {
    setExpanded(false);
    setInputValue("");
    onExpandChange?.(false);
  };

  const send = () => {
    const msg = inputValue.trim();
    if (!msg) return;
    setMessages((prev) => [...prev, { role: "user", text: msg }]);
    setInputValue("");
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Thanks for your question! I'm a demo assistant — connect me to a backend to get real answers.",
        },
      ]);
    }, 800);
  };

  if (!expanded) {
    return (
      <div className={styles.wrapper}>
        <button className={styles.trigger} onClick={open}>
          <span style={{ fontSize: "13px" }}>&#128269;</span> Search or ask...
        </button>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.expanded}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>AI</div>
            <span className={styles.headerTitle}>Ask anything</span>
          </div>
          <Button
            icon={<Dismiss16Regular />}
            appearance="subtle"
            size="small"
            onClick={close}
          />
        </div>

        <div className={styles.messages} ref={messagesRef}>
          {messages.length === 0 ? (
            <div className={styles.welcome}>
              <div className={styles.welcomeIcon}>&#128172;</div>
              <div className={styles.welcomeTitle}>How can I help?</div>
              <div className={styles.welcomeDesc}>
                Ask about your APIs, get config help, or search resources.
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              <div
                key={i}
                className={`${styles.msgRow} ${m.role === "user" ? styles.msgRowUser : ""}`}
              >
                <div
                  className={`${styles.avatar} ${m.role === "user" ? styles.avatarUser : styles.avatarAssistant}`}
                >
                  {m.role === "user" ? "U" : "AI"}
                </div>
                <div
                  className={`${styles.bubble} ${m.role === "user" ? styles.bubbleUser : styles.bubbleAssistant}`}
                >
                  {m.text}
                </div>
              </div>
            ))
          )}
        </div>

        <div className={styles.inputRow}>
          <Textarea
            className={styles.input}
            placeholder="Type a message..."
            value={inputValue}
            onChange={(_, data) => setInputValue(data.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
              if (e.key === "Escape") close();
            }}
            resize="none"
            size="small"
          />
          <Button
            icon={<Send16Filled />}
            appearance="primary"
            size="small"
            disabled={!inputValue.trim()}
            onClick={send}
          />
        </div>
      </div>
    </div>
  );
}
