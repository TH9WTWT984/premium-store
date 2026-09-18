const fs = require("fs");
const path = require("path");

const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");
const source = fs.readFileSync(schemaPath, "utf8");
const reviewBlock = source.match(/model Review \{[\s\S]*?\n\}/m);

if (!reviewBlock) {
  throw new Error("model Review block was not found in prisma/schema.prisma");
}

if (!/^\s*rating\s+Int\s*$/m.test(reviewBlock[0])) {
  throw new Error("The Review model does not contain the expected rating Int field. No changes made.");
}

const updatedReviewBlock = reviewBlock[0].replace(/^\s*rating\s+Int\s*\n/m, "");
const updated = source.replace(reviewBlock[0], updatedReviewBlock);
fs.writeFileSync(schemaPath, updated, "utf8");
console.log("Removed Review.rating from prisma/schema.prisma");
