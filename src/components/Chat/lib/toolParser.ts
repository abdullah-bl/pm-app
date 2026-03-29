export interface ToolSchema {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<
      string,
      { type: string; description: string; default?: any; enum?: string[] }
    >;
    required: string[];
  };
}

// JSON-based tool call format
export interface ToolCall {
  name: string;
  arguments: Record<string, any>;
}

export interface ToolCallValidationError {
  field: string;
  message: string;
}

export interface ParsedToolCalls {
  calls: ToolCall[];
  errors: ToolCallValidationError[];
}

// Extract tool calls from LLM response using JSON format
// Format: <|tool_call_start|>[{"name": "tool_name", "arguments": {...}}]<|tool_call_end|>
export function extractToolCalls(content: string): ParsedToolCalls {
  const calls: ToolCall[] = [];
  const errors: ToolCallValidationError[] = [];

  // Look for tool call markers
  const regex = /<\|tool_call_start\|>(.*?)<\|tool_call_end\|>/gs;
  let match;

  while ((match = regex.exec(content)) !== null) {
    const toolCallContent = match[1].trim();

    try {
      // Try to parse as JSON array
      const parsed = JSON.parse(toolCallContent);

      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          const validated = validateToolCallShape(item);
          if (validated) {
            calls.push(validated);
          } else {
            errors.push({ field: "root", message: `Invalid tool call shape: ${JSON.stringify(item)}` });
          }
        }
      } else if (typeof parsed === "object" && parsed !== null) {
        // Single tool call (not in array)
        const validated = validateToolCallShape(parsed);
        if (validated) {
          calls.push(validated);
        } else {
          errors.push({ field: "root", message: `Invalid tool call shape: ${JSON.stringify(parsed)}` });
        }
      }
    } catch (e) {
      // Not valid JSON - try to extract function calls as fallback
      const fallbackCalls = extractFallbackCalls(toolCallContent);
      if (fallbackCalls.length > 0) {
        calls.push(...fallbackCalls);
      } else {
        errors.push({ field: "parse", message: `Failed to parse tool calls: ${toolCallContent}` });
      }
    }
  }

  return { calls, errors };
}

// Validate that an object has the correct shape for a tool call
function validateToolCallShape(obj: any): ToolCall | null {
  if (typeof obj !== "object" || obj === null) return null;
  if (typeof obj.name !== "string") return null;

  return {
    name: obj.name,
    arguments: obj.arguments || obj.params || obj.parameters || {},
  };
}

// Fallback: try to extract simple function calls like name(args)
function extractFallbackCalls(content: string): ToolCall[] {
  const calls: ToolCall[] = [];

  // Match function calls: name(arg1, arg2, key=value)
  const regex = /(\w+)\s*\(([^)]*)\)/g;
  let match;

  while ((match = regex.exec(content)) !== null) {
    const name = match[1];
    const argsStr = match[2].trim();
    const args: Record<string, any> = {};

    if (argsStr) {
      // Parse arguments
      const parts = argsStr.split(",").map(p => p.trim()).filter(Boolean);
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];

        // Check for key=value
        const kvMatch = part.match(/^(\w+)\s*=\s*(.+)$/);
        if (kvMatch) {
          const [, key, value] = kvMatch;
          args[key] = parseValue(value);
        } else {
          // Positional argument - use index as key
          args[`arg${i}`] = parseValue(part);
        }
      }
    }

    calls.push({ name, arguments: args });
  }

  return calls;
}

function parseValue(val: string): any {
  val = val.trim();

  // Try to parse as number
  if (/^-?\d+$/.test(val)) {
    return parseInt(val, 10);
  }
  if (/^-?\d+\.\d+$/.test(val)) {
    return parseFloat(val);
  }

  // Try to parse as boolean
  if (val === "true") return true;
  if (val === "false") return false;
  if (val === "null") return null;

  // Remove surrounding quotes if present
  if ((val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))) {
    return val.slice(1, -1);
  }

  return val;
}

// Validate tool call against schema
export function validateToolCall(
  call: ToolCall,
  schemas: ToolSchema[],
): ToolCallValidationError[] {
  const schema = schemas.find(s => s.name === call.name);
  if (!schema) {
    return [{ field: "name", message: `Unknown tool: ${call.name}` }];
  }

  const errors: ToolCallValidationError[] = [];
  const args = call.arguments;

  // Check required parameters
  for (const required of schema.parameters.required) {
    if (!(required in args) || args[required] === undefined || args[required] === null) {
      errors.push({ field: required, message: `Missing required parameter: ${required}` });
    }
  }

  // Validate parameter types
  for (const [key, value] of Object.entries(args)) {
    const prop = schema.parameters.properties[key];
    if (!prop) {
      errors.push({ field: key, message: `Unknown parameter: ${key}` });
      continue;
    }

    // Type checking
    const expectedType = prop.type.toLowerCase();
    const actualType = getTypeName(value);

    if (expectedType === "string" && typeof value !== "string") {
      errors.push({ field: key, message: `Expected string, got ${actualType}` });
    } else if (expectedType === "number" && typeof value !== "number") {
      errors.push({ field: key, message: `Expected number, got ${actualType}` });
    } else if (expectedType === "boolean" && typeof value !== "boolean") {
      errors.push({ field: key, message: `Expected boolean, got ${actualType}` });
    } else if (expectedType === "array" && !Array.isArray(value)) {
      errors.push({ field: key, message: `Expected array, got ${actualType}` });
    } else if (expectedType === "object" && (typeof value !== "object" || value === null || Array.isArray(value))) {
      errors.push({ field: key, message: `Expected object, got ${actualType}` });
    }

    // Enum checking
    if (prop.enum && !prop.enum.includes(String(value))) {
      errors.push({ field: key, message: `Value must be one of: ${prop.enum.join(", ")}` });
    }
  }

  return errors;
}

function getTypeName(value: any): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

// Build a clean tool description for the system prompt
export function buildToolsDescription(schemas: ToolSchema[]): string {
  const lines: string[] = [];
  lines.push("");
  lines.push("Available tools:");
  lines.push("");

  for (const schema of schemas) {
    lines.push(`## ${schema.name}`);
    lines.push(schema.description);
    lines.push("");

    if (Object.keys(schema.parameters.properties).length > 0) {
      lines.push("Parameters:");
      for (const [name, prop] of Object.entries(schema.parameters.properties)) {
        const required = schema.parameters.required.includes(name);
        const type = prop.type;
        const desc = prop.description;
        lines.push(`  - ${name}${required ? " (required)" : ""}: ${type} - ${desc}`);
      }
      lines.push("");
    }
  }

  lines.push("To use a tool, respond with:");
  lines.push('<|tool_call_start|>[{"name": "tool_name", "arguments": {"param": "value"}}]<|tool_call_end|>');
  lines.push("");
  lines.push("You can call multiple tools at once by including multiple objects in the array.");
  lines.push("If you don't need a tool, respond normally without the tool_call markers.");
  lines.push("");

  return lines.join("\n");
}

// Legacy exports for backward compatibility (deprecated)
export interface ParsedCall {
  name: string;
  positionalArgs: any[];
  keywordArgs: Record<string, any>;
}

// Deprecated: Use extractToolCalls instead
export function extractToolCallContent(content: string): string | null {
  const m = content.match(/<\|tool_call_start\|>(.*?)<\|tool_call_end\|>/s);
  return m ? m[1].trim() : null;
}

// Deprecated: Use extractToolCalls instead
export function extractPythonicCalls(toolCallContent: string): string[] {
  try {
    const clean = toolCallContent.trim();
    try {
      const parsed = JSON.parse(clean);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // fallback
    }
    if (clean.startsWith("[") && clean.endsWith("]")) {
      const inner = clean.slice(1, -1).trim();
      if (!inner) return [];
      return parseArguments(inner).map(c =>
        c.trim().replace(/^[\'"]/g, ""),
      );
    }
    return [clean];
  } catch {
    return [];
  }
}

function parseArguments(argsString: string): string[] {
  const args: string[] = [];
  let current = "";
  let inQuotes = false;
  let quoteChar = "";
  let depth = 0;
  for (let i = 0; i < argsString.length; i++) {
    const ch = argsString[i];
    if (!inQuotes && (ch === '"' || ch === "'")) {
      inQuotes = true;
      quoteChar = ch;
      current += ch;
    } else if (inQuotes && ch === quoteChar) {
      inQuotes = false;
      quoteChar = "";
      current += ch;
    } else if (!inQuotes && ch === "(") {
      depth++;
      current += ch;
    } else if (!inQuotes && ch === ")") {
      depth--;
      current += ch;
    } else if (!inQuotes && ch === "," && depth === 0) {
      args.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim()) args.push(current.trim());
  return args;
}

// Deprecated: Use extractToolCalls and validateToolCall instead
export function parsePythonicCall(command: string): ParsedCall | null {
  const m = command.match(/^(\w+)\s*\((.*)\)$/s);
  if (!m) return null;
  const [, name, argsStr] = m;
  const args = parseArguments(argsStr);
  const positionalArgs: any[] = [];
  const keywordArgs: Record<string, any> = {};
  for (const arg of args) {
    const kwMatch = arg.match(/^(\w+)\s*=\s*(.*)$/);
    if (kwMatch) {
      const [, key, value] = kwMatch;
      try {
        keywordArgs[key] = JSON.parse(value);
      } catch {
        keywordArgs[key] = value;
      }
    } else {
      try {
        positionalArgs.push(JSON.parse(arg));
      } catch {
        positionalArgs.push(arg);
      }
    }
  }
  return { name, positionalArgs, keywordArgs };
}

// Deprecated: Use ToolCall.arguments directly
export function mapArgsToNamedParams(
  paramNames: string[],
  positionalArgs: any[],
  keywordArgs: Record<string, any>,
): Record<string, any> {
  const named: Record<string, any> = Object.create(null);
  positionalArgs.forEach((arg, idx) => {
    if (idx < paramNames.length) named[paramNames[idx]] = arg;
  });
  Object.assign(named, keywordArgs);
  return named;
}
