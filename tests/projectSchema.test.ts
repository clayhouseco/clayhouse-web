import { describe, expect, it } from "vitest";
import { buildProjectJsonLd } from "@/utils/projectSchema";
import { getIndexedProjects } from "@/utils/projects";

describe("Project JSON-LD", () => {
  it("describe el material como tema y no como un Product incompleto", () => {
    for (const project of getIndexedProjects()) {
      const schema = buildProjectJsonLd(project);

      expect(schema["@type"]).toBe("CollectionPage");
      expect(schema.about["@type"]).toBe("Thing");
      expect(schema.about.url).toBe(`https://clayhouse.com.co/productos/${project.product.slug}`);
      expect(JSON.stringify(schema)).not.toContain('"@type":"Product"');
    }
  });
});
