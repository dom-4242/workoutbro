import { renderToStaticMarkup } from "react-dom/server";
import AppFooter from "@/components/layout/AppFooter";

describe("AppFooter", () => {
  it("renders the app version from env variable", () => {
    process.env.NEXT_PUBLIC_APP_VERSION = "0.2.0";
    const html = renderToStaticMarkup(<AppFooter />);
    expect(html).toContain("v0.2.0");
  });

  it("renders 'WorkoutBro' label", () => {
    process.env.NEXT_PUBLIC_APP_VERSION = "0.2.0";
    const html = renderToStaticMarkup(<AppFooter />);
    expect(html).toContain("WorkoutBro");
  });

  it("falls back to 'dev' when version env is not set", () => {
    delete process.env.NEXT_PUBLIC_APP_VERSION;
    const html = renderToStaticMarkup(<AppFooter />);
    expect(html).toContain("vdev");
  });
});
