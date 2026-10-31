import { describe, expect, it } from "vitest";

import { previewAccess } from "../netlify/edge-functions/preview-password";

const basic = (user: string, password: string) => `Basic ${btoa(`${user}:${password}`)}`;

describe("lösenordsskydd för förhandsvisningar", () => {
  it("släpper alltid igenom produktion och okänd kontext", () => {
    expect(previewAccess("production", "hemligt", null)).toBe("pass");
    expect(previewAccess("production", undefined, null)).toBe("pass");
    expect(previewAccess(undefined, "hemligt", null)).toBe("pass");
    expect(previewAccess("dev", "hemligt", null)).toBe("pass");
  });

  it.each(["deploy-preview", "branch-deploy"])("kräver rätt lösenord i %s", (context) => {
    expect(previewAccess(context, "hemligt", null)).toBe("deny");
    expect(previewAccess(context, "hemligt", basic("valfritt", "fel"))).toBe("deny");
    expect(previewAccess(context, "hemligt", basic("valfritt", "hemligt"))).toBe("allow");
    expect(previewAccess(context, "hemligt", basic("", "hemligt"))).toBe("allow");
    expect(previewAccess(context, "hemligt", "Bearer hemligt")).toBe("deny");
    expect(previewAccess(context, "hemligt", "Basic !!!")).toBe("deny");
  });

  it("nekar förhandsvisningar när lösenordet saknas i miljön", () => {
    expect(previewAccess("deploy-preview", undefined, basic("a", ""))).toBe("deny");
    expect(previewAccess("deploy-preview", "", basic("a", ""))).toBe("deny");
  });

  it("klarar lösenord med kolon och å, ä, ö", () => {
    const encoded = `Basic ${btoa(String.fromCharCode(...new TextEncoder().encode("x:lö:sen")))}`;
    expect(previewAccess("deploy-preview", "lö:sen", encoded)).toBe("allow");
  });
});
