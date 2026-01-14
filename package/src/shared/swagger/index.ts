import type { AzuraClient } from "../../infra/Server";
import { SwaggerGenerator } from "./SwaggerGenerator";
import type { SwaggerConfig } from "../../types/swagger.type";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Resolve o diretório atual de forma compatível com ESM e CJS
function getCurrentDir(): string {
  if (typeof __dirname !== 'undefined') {
    return __dirname;
  }
  return dirname(fileURLToPath(import.meta.url));
}

export class SwaggerIntegration {
  private generator: SwaggerGenerator;
  private app: AzuraClient;

  constructor(app: AzuraClient, config?: SwaggerConfig) {
    this.app = app;
    this.generator = new SwaggerGenerator(config);
  }

  /**
   * Setup Swagger routes
   */
  public setup(): void {
    const config = this.generator.getConfig();

    if (!config.enabled) {
      return;
    }

    // Route to serve OpenAPI spec JSON
    this.app.get(`/api-spec.json`, (_req: any, res: any) => {
      res.json(this.generator.getDocument());
    });

    // Route to serve Swagger UI
    this.app.get(config.path, (_req: any, res: any) => {
      try {
        const currentDir = getCurrentDir();
        const htmlPath = join(currentDir, "swagger-ui-modern.html");
        
        // Fallback para buscar em diferentes locais possíveis
        let finalPath = htmlPath;
        if (!existsSync(htmlPath)) {
          // Tenta buscar na raiz do pacote (para desenvolvimento)
          const srcPath = join(currentDir, "..", "..", "..", "src", "shared", "swagger", "swagger-ui-modern.html");
          if (existsSync(srcPath)) {
            finalPath = srcPath;
          } else {
            throw new Error(`Swagger UI HTML not found at ${htmlPath} or ${srcPath}`);
          }
        }

        let html = readFileSync(finalPath, "utf-8");

        // Replace placeholders
        const doc = this.generator.getDocument();
        html = html.replace(/{{TITLE}}/g, doc.info.title);
        html = html.replace(/{{VERSION}}/g, doc.info.version);
        html = html.replace(/{{DESCRIPTION}}/g, doc.info.description || "");

        res.type("html").send(html);
      } catch (error) {
        console.error("Swagger UI error:", error);
        res.status(500).json({ 
          error: "Failed to load Swagger UI",
          details: error instanceof Error ? error.message : String(error)
        });
      }
    });
  }

  /**
   * Get the generator instance
   */
  public getGenerator(): SwaggerGenerator {
    return this.generator;
  }
}

/**
 * Helper function to setup Swagger in an AzuraClient instance
 */
export function setupSwagger(app: AzuraClient, config?: SwaggerConfig): SwaggerGenerator {
  const integration = new SwaggerIntegration(app, config);
  integration.setup();
  return integration.getGenerator();
}
