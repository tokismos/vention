const BROKER_PATH = "/mqtt";

export function brokerUrl(): string {
  const protocol = location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${location.host}${BROKER_PATH}`;
}
