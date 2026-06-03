import { NextRequest, NextResponse } from "next/server";
import { contentIndex, searchContent } from "@/lib/content-index";

// JSON-RPC 2.0 request/response types
interface JsonRpcRequest {
  jsonrpc: "2.0";
  method: string;
  params?: Record<string, unknown>;
  id?: string | number | null;
}

interface JsonRpcResponse {
  jsonrpc: "2.0";
  result?: unknown;
  error?: {
    code: number;
    message: string;
  };
  id?: string | number | null;
}

// MCP tool definitions
interface McpTool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, unknown>;
    required?: string[];
  };
}

const tools: McpTool[] = [
  {
    name: "azimuth_search_docs",
    description: "Search Azimuth documentation by keyword. Returns top 5 matching pages with title, URL, and excerpt.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query keyword or phrase",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "azimuth_get_page",
    description: "Retrieve full content of a specific Azimuth documentation page by path.",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "URL path of the page (e.g., /whitepaper, /docs/signals, /blog/welcome)",
        },
      },
      required: ["path"],
    },
  },
  {
    name: "azimuth_network_info",
    description: "Get static information about the Azimuth network, node tiers, and official links.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
];

// Tool handlers
function handleSearchDocs(params: Record<string, unknown>): unknown {
  const query = params.query as string;
  if (!query) {
    throw new Error("query parameter is required");
  }
  return searchContent(query, 5);
}

function handleGetPage(params: Record<string, unknown>): unknown {
  const path = params.path as string;
  if (!path) {
    throw new Error("path parameter is required");
  }

  const entry = contentIndex[path];
  if (!entry) {
    throw new Error(`Page not found: ${path}`);
  }

  return {
    title: entry.title,
    description: entry.description,
    content: entry.content,
    url: `https://azimuth.day${path}`,
  };
}

function handleNetworkInfo(): unknown {
  return {
    name: "Azimuth",
    status: "Pre-launch",
    description: "A decentralized positioning and timing network built on signals of opportunity.",
    signalTypes: [
      "LTE/5G",
      "Digital TV (ATSC/DVB-T)",
      "FM Radio (RDS)",
      "LEO Satellites (planned)",
    ],
    nodeTiers: [
      "Tier 0: Mobile observer using Android phone sensors",
      "Tier 1: BYOD consumer node ($30 RTL-SDR)",
      "Tier 2: Dedicated purpose-built node with GPS-disciplined timing",
      "Tier 3: Coherent array for angle-of-arrival positioning (coming soon)",
    ],
    links: {
      website: "https://azimuth.day",
      litepaper: "https://azimuth.day/litepaper",
      whitepaper: "https://azimuth.day/whitepaper",
      github: "https://github.com/Azimuth-Official",
      discord: "https://discord.gg/azimuth",
      twitter: "https://x.com/AzimuthDePIN",
    },
  };
}

function processJsonRpc(request: JsonRpcRequest): JsonRpcResponse {
  const { jsonrpc, method, params, id } = request;

  try {
    let result: unknown;

    switch (method) {
      case "initialize":
        result = {
          protocolVersion: "2024-11-05",
          capabilities: {
            tools: {},
          },
          serverInfo: {
            name: "azimuth-mcp",
            version: "0.1.0",
          },
        };
        break;

      case "tools/list":
        result = { tools };
        break;

      case "tools/call":
        {
          const toolParams = params as { name?: string; arguments?: Record<string, unknown> };
          const toolName = toolParams.name;
          const toolArgs = toolParams.arguments || {};

          if (!toolName) {
            throw new Error("tool name is required");
          }

          switch (toolName) {
            case "azimuth_search_docs":
              result = handleSearchDocs(toolArgs);
              break;
            case "azimuth_get_page":
              result = handleGetPage(toolArgs);
              break;
            case "azimuth_network_info":
              result = handleNetworkInfo();
              break;
            default:
              throw new Error(`Unknown tool: ${toolName}`);
          }
        }
        break;

      default:
        return {
          jsonrpc: "2.0",
          error: {
            code: -32601,
            message: "Method not found",
          },
          id,
        };
    }

    return {
      jsonrpc: "2.0",
      result,
      id,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return {
      jsonrpc: "2.0",
      error: {
        code: -32603,
        message,
      },
      id,
    };
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    name: "azimuth-mcp",
    version: "0.1.0",
    description: "MCP-compatible API for Azimuth documentation and network information.",
    tools: tools.map((t) => ({
      name: t.name,
      description: t.description,
    })),
    endpoint: "POST /api/mcp",
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json() as JsonRpcRequest;

    if (!body.jsonrpc || body.jsonrpc !== "2.0" || !body.method) {
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          error: {
            code: -32700,
            message: "Invalid Request",
          },
          id: body.id || null,
        },
        { status: 400 }
      );
    }

    const response = processJsonRpc(body);
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        error: {
          code: -32700,
          message: "Parse error",
        },
        id: null,
      },
      { status: 400 }
    );
  }
}
