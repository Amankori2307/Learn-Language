import net from "node:net";
import tls from "node:tls";
import { config } from "../../config/runtime.config";
import { FeedbackEmailInput, SocketLike } from "./feedback-email.types";

function parseEmailFromHeader(header: string): string {
  const match = header.match(/<([^>]+)>/);
  return match?.[1]?.trim() ?? header.trim();
}

function createEnvelope(input: FeedbackEmailInput) {
  const username = input.userName?.trim() || "Unknown user";
  const userEmail = input.userEmail?.trim() || "not-provided";
  const lines = [
    `New website feedback received`,
    ``,
    `User ID: ${input.userId}`,
    `Name: ${username}`,
    `Email: ${userEmail}`,
    `Rating: ${input.rating ?? "n/a"}`,
    `Page URL: ${input.pageUrl ?? "n/a"}`,
    ``,
    `Message:`,
    input.message.trim(),
  ];
  return lines.join("\r\n");
}

function ensureSmtpConfig() {
  if (!config.SMTP_HOST || !config.SMTP_USER || !config.SMTP_PASS) {
    throw new Error("SMTP is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS.");
  }
}

function createLineReader(socket: SocketLike) {
  let buffer = "";
  const pending: Array<(line: string) => void> = [];

  socket.on("data", (chunk: Buffer) => {
    buffer += chunk.toString("utf8");
    while (true) {
      const idx = buffer.indexOf("\r\n");
      if (idx < 0) break;
      const line = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      const resolver = pending.shift();
      if (resolver) resolver(line);
    }
  });

  return () =>
    new Promise<string>((resolve) => {
      pending.push(resolve);
    });
}

async function readResponse(readLine: () => Promise<string>) {
  const lines: string[] = [];
  while (true) {
    const line = await readLine();
    lines.push(line);
    if (/^\d{3} /.test(line)) {
      const code = Number.parseInt(line.slice(0, 3), 10);
      return { code, message: lines.join("\n") };
    }
  }
}

async function sendCommand(
  socket: SocketLike,
  readLine: () => Promise<string>,
  command: string,
  expectedPrefix: number,
) {
  socket.write(`${command}\r\n`);
  const response = await readResponse(readLine);
  if (Math.floor(response.code / 100) !== expectedPrefix) {
    throw new Error(`SMTP command failed: ${command}\n${response.message}`);
  }
  return response;
}

export async function sendFeedbackEmail(input: FeedbackEmailInput) {
  ensureSmtpConfig();

  const host = config.SMTP_HOST as string;
  const port = config.SMTP_PORT;
  const secure = config.SMTP_SECURE === true;
  const fromHeader = config.SMTP_FROM;
  const fromAddress = parseEmailFromHeader(fromHeader);
  const toAddress = config.FEEDBACK_EMAIL_TO;
  const messageBody = createEnvelope(input)
    .replace(/\r?\n\./g, "\r\n..");
  const subject = `[Learn Language Feedback] ${input.subject.trim()}`;

  const socket = await new Promise<SocketLike>((resolve, reject) => {
    const created = secure
      ? tls.connect({ host, port, servername: host }, () => resolve(created))
      : net.connect({ host, port }, () => resolve(created));
    created.once("error", reject);
  });

  try {
    const readLine = createLineReader(socket);
    const greeting = await readResponse(readLine);
    if (Math.floor(greeting.code / 100) !== 2) {
      throw new Error(`SMTP greeting failed: ${greeting.message}`);
    }

    await sendCommand(socket, readLine, "EHLO localhost", 2);

    if (!secure) {
      await sendCommand(socket, readLine, "STARTTLS", 2);
      const upgraded = await new Promise<tls.TLSSocket>((resolve, reject) => {
        const tlsSocket = tls.connect({ socket, servername: host }, () => resolve(tlsSocket));
        tlsSocket.once("error", reject);
      });
      const upgradedReadLine = createLineReader(upgraded);
      await sendCommand(upgraded, upgradedReadLine, "EHLO localhost", 2);
      await sendCommand(upgraded, upgradedReadLine, "AUTH LOGIN", 3);
      await sendCommand(upgraded, upgradedReadLine, Buffer.from(config.SMTP_USER as string).toString("base64"), 3);
      await sendCommand(upgraded, upgradedReadLine, Buffer.from(config.SMTP_PASS as string).toString("base64"), 2);
      await sendCommand(upgraded, upgradedReadLine, `MAIL FROM:<${fromAddress}>`, 2);
      await sendCommand(upgraded, upgradedReadLine, `RCPT TO:<${toAddress}>`, 2);
      await sendCommand(upgraded, upgradedReadLine, "DATA", 3);
      upgraded.write(
        `From: ${fromHeader}\r\nTo: ${toAddress}\r\nReply-To: ${input.userEmail ?? fromAddress}\r\nSubject: ${subject}\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n${messageBody}\r\n.\r\n`,
      );
      const dataResponse = await readResponse(upgradedReadLine);
      if (Math.floor(dataResponse.code / 100) !== 2) {
        throw new Error(`SMTP DATA failed: ${dataResponse.message}`);
      }
      await sendCommand(upgraded, upgradedReadLine, "QUIT", 2);
      return;
    }

    await sendCommand(socket, readLine, "AUTH LOGIN", 3);
    await sendCommand(socket, readLine, Buffer.from(config.SMTP_USER as string).toString("base64"), 3);
    await sendCommand(socket, readLine, Buffer.from(config.SMTP_PASS as string).toString("base64"), 2);
    await sendCommand(socket, readLine, `MAIL FROM:<${fromAddress}>`, 2);
    await sendCommand(socket, readLine, `RCPT TO:<${toAddress}>`, 2);
    await sendCommand(socket, readLine, "DATA", 3);
    socket.write(
      `From: ${fromHeader}\r\nTo: ${toAddress}\r\nReply-To: ${input.userEmail ?? fromAddress}\r\nSubject: ${subject}\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n${messageBody}\r\n.\r\n`,
    );
    const dataResponse = await readResponse(readLine);
    if (Math.floor(dataResponse.code / 100) !== 2) {
      throw new Error(`SMTP DATA failed: ${dataResponse.message}`);
    }
    await sendCommand(socket, readLine, "QUIT", 2);
  } finally {
    socket.end();
  }
}
