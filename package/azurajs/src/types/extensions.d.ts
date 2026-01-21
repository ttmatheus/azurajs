/**
 * Type extension system for Azura
 * Allows users to extend Request and Response types with custom properties and methods
 * 
 * @example Extending Request with custom property:
 * ```typescript
 * // In your types file
 * declare module 'azura' {
 *   interface RequestServer {
 *     user?: { id: string; name: string };
 *     session?: Session;
 *   }
 * }
 * ```
 * 
 * @example Extending Response with custom methods:
 * ```typescript
 * declare module 'azura' {
 *   interface ResponseServer {
 *     sendSuccess(data: any): this;
 *     sendError(message: string, code?: number): this;
 *   }
 * }
 * 
 * // Implement the methods
 * app.use((req, res, next) => {
 *   res.sendSuccess = function(data: any) {
 *     return this.status(200).json({ success: true, data });
 *   };
 *   
 *   res.sendError = function(message: string, code = 400) {
 *     return this.status(code).json({ success: false, error: message });
 *   };
 *   
 *   next();
 * });
 * ```
 * 
 * @example Extending AzuraClient with custom methods:
 * ```typescript
 * declare module 'azura' {
 *   interface AzuraClient {
 *     health(path?: string): void;
 *   }
 * }
 * 
 * // Implement the method
 * AzuraClient.prototype.health = function(path = '/health') {
 *   this.get(path, (req, res) => {
 *     res.json({ status: 'ok', timestamp: Date.now() });
 *   });
 * };
 * ```
 */

// This file enables declaration merging for Azura types
// Users can extend these interfaces in their own code

export {};
