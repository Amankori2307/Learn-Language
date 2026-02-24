import net from "node:net";
import tls from "node:tls";

export type SocketLike = net.Socket | tls.TLSSocket;

export type FeedbackEmailInput = {
  userId: string;
  userEmail?: string | null;
  userName?: string | null;
  subject: string;
  message: string;
  pageUrl?: string;
  rating?: number;
};
