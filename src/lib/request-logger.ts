import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { NextRequest } from "next/server";

export interface RequestLogContext {
  baseDir: string;
  requestFilePath: string;
  responseFilePath: string;
  startedAt: string;
  startedAtMs: number;
}

function getClientIp(request: NextRequest) {
  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) return xForwardedFor.split(",")[0]?.trim() ?? "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}

function getDomain(request: NextRequest) {
  return request.headers.get("host") ?? "unknown";
}

function getProtocol(request: NextRequest) {
  return request.headers.get("x-forwarded-proto") ?? "http";
}

function getDateFolder(dateIso: string) {
  return dateIso.slice(0, 10);
}

function safeSerialize(value: unknown) {
  return JSON.stringify(value, null, 2);
}

export async function createRequestLog(
  request: NextRequest,
  endpoint: string,
  body: unknown,
): Promise<RequestLogContext> {
  const startedAt = new Date().toISOString();
  const startedAtMs = Date.now();
  const dateFolder = getDateFolder(startedAt);
  const requestId = `${startedAt.replace(/[:.]/g, "-")}_${randomUUID()}`;
  const baseDir = path.join(process.cwd(), "datas", dateFolder, requestId);
  const requestFilePath = path.join(baseDir, "request.json");
  const responseFilePath = path.join(baseDir, "response.json");

  await mkdir(baseDir, { recursive: true });

  const requestPayload = {
    endpoint,
    method: request.method,
    path: request.nextUrl.pathname,
    fullUrl: `${getProtocol(request)}://${getDomain(request)}${request.nextUrl.pathname}`,
    domain: getDomain(request),
    ip: getClientIp(request),
    userAgent: request.headers.get("user-agent") ?? "unknown",
    referer: request.headers.get("referer") ?? null,
    startedAt,
    requestBody: body,
  };

  await writeFile(requestFilePath, safeSerialize(requestPayload), "utf8");

  return {
    baseDir,
    requestFilePath,
    responseFilePath,
    startedAt,
    startedAtMs,
  };
}

export async function completeRequestLog(
  context: RequestLogContext,
  status: number,
  responseBody: unknown,
  notes?: string,
) {
  const endedAt = new Date().toISOString();
  const endedAtMs = Date.now();
  const responsePayload = {
    status,
    endedAt,
    responseTimeMs: endedAtMs - context.startedAtMs,
    notes: notes ?? null,
    responseBody,
  };

  await writeFile(context.responseFilePath, safeSerialize(responsePayload), "utf8");
}
