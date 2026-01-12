import type { RequestServer } from "../../types/http/request.type";
import type { ResponseServer } from "../../types/http/response.type";

export function adaptRequestHandler(mw: any) {
  if (typeof mw !== "function") return mw;
  return async (ctx: {
    request: RequestServer;
    response: ResponseServer;
    next: (err?: any) => Promise<void>;
  }) => {
    try {
      if (mw.length === 3) {
        await new Promise<void>((resolve, reject) => {
          try {
            const maybe = mw(ctx.request, ctx.response, (err?: any) => {
              if (err) reject(err);
              else resolve();
            });
            if (maybe && typeof (maybe as Promise<any>).then === "function") {
              (maybe as Promise<any>).then(() => resolve()).catch(reject);
            }
          } catch (e) {
            reject(e);
          }
        });
      } else if (mw.length === 1) {
        await mw({
          req: ctx.request,
          res: ctx.response,
          next: ctx.next,
        });
      } else {
        await mw(ctx);
      }
    } catch (err) {
      throw err;
    }
  };
}
