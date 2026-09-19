const { PrismaClient, ProductStatus } = require('@prisma/client');
const prisma = new PrismaClient();

const CATEGORIES = [
  {
    slug: 'sneakers',
    name: 'Sneakers & Slides',
    description: 'Everyday and statement footwear designed for tactile comfort.',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=85',
    sortOrder: 1,
  },
  {
    slug: 't-shirts',
    name: 'T-Shirts',
    description: 'Everyday T-shirts in considered silhouettes, heavyweight cotton and easy drape.',
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=85',
    sortOrder: 2,
  },
  {
    slug: 'shirts',
    name: 'Shirts',
    description: 'Relaxed camp collars, crisp oxfords and breathable linen layering.',
    imageUrl: 'https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?auto=format&fit=crop&w=1200&q=85',
    sortOrder: 3,
  },
  {
    slug: 'polos',
    name: 'Polos',
    description: 'Refined knit and structured polo silhouettes for understated dressing.',
    imageUrl: 'https://images.unsplash.com/photo-1625910513413-7221379ecb00?auto=format&fit=crop&w=1200&q=85',
    sortOrder: 4,
  },
  {
    slug: 'apparel',
    name: 'Apparel',
    description: 'Quiet garments made with natural fibers and enduring construction.',
    imageUrl: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1200&q=85',
    sortOrder: 5,
  },
  {
    slug: 'home',
    name: 'Home',
    description: 'Ceramics, warm textiles and objects that bring calm into living spaces.',
    imageUrl: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=1200&q=85',
    sortOrder: 6,
  },
  {
    slug: 'objects',
    name: 'Objects',
    description: 'Full-grain leather goods, carryalls and daily companions.',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=85',
    sortOrder: 7,
  },
  {
    slug: 'jeans',
    name: 'Jeans & Denim',
    description: 'Straight-leg, relaxed and selvedge denim built to soften with age.',
    imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=1200&q=85',
    sortOrder: 8,
  },
  {
    slug: 'outerwear',
    name: 'Outerwear',
    description: 'Tactile overshirts, field jackets and protective layers.',
    imageUrl: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=1200&q=85',
    sortOrder: 9,
  },
];

const PRODUCTS = [
  {
    slug: 'slides-2-0-olive-green',
    name: 'Slides 2.0: Olive Green',
    categorySlug: 'sneakers',
    price: 1299,
    compareAtPrice: 1999,
    sku: 'AT-SLD-001-OLV',
    featured: true,
    shortDescription: 'Moulded EVA recovery sliders with sculpted ergonomic footbed.',
    description:
      'Engineered with high-density EVA foam and a sculpted anatomical footbed, the Slides 2.0 offer cloud-like cushioning and restorative arch support. Finished in a matte muted olive green with slip-resistant traction grooves for all-day comfort whether indoors or stepping out.',
    images: [
      { url: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=1200&q=85', alt: 'Slides 2.0 Olive Green side profile view' },
      { url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1200&q=85', alt: 'Slides 2.0 Olive Green top anatomical footbed view' },
      { url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=85', alt: 'Slides 2.0 Olive Green on foot styling' },
      { url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1200&q=85', alt: 'Slides 2.0 Olive Green outsole traction pattern' },
      { url: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1200&q=85', alt: 'Slides 2.0 Olive Green studio light pair' },
      { url: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1200&q=85', alt: 'Slides 2.0 Olive Green angle perspective' },
    ],
    variants: [
      { name: 'UK 6', sku: 'AT-SLD-001-UK6', stock: 0 }, // Out of stock to demonstrate sold out state
      { name: 'UK 7', sku: 'AT-SLD-001-UK7', stock: 5 },  // Low stock to demonstrate "5 Left" alert
      { name: 'UK 8', sku: 'AT-SLD-001-UK8', stock: 18 },
      { name: 'UK 9', sku: 'AT-SLD-001-UK9', stock: 24 },
      { name: 'UK 10', sku: 'AT-SLD-001-UK10', stock: 12 },
      { name: 'UK 11', sku: 'AT-SLD-001-UK11', stock: 8 },
      { name: 'UK 12', sku: 'AT-SLD-001-UK12', stock: 4 },
    ],
  },
  {
    slug: 'slides-2-0-onyx-black',
    name: 'Slides 2.0: Onyx Black',
    categorySlug: 'sneakers',
    price: 1299,
    compareAtPrice: 1999,
    sku: 'AT-SLD-002-BLK',
    featured: true,
    shortDescription: 'Moulded EVA sliders in deep matte onyx black.',
    description:
      'The definitive neutral. Crafted from ultra-lightweight moulded EVA with deep shock absorption and a textured footbed preventing foot slippage in wet or dry conditions.',
    images: [
      { url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1200&q=85', alt: 'Slides 2.0 Onyx Black side' },
      { url: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=1200&q=85', alt: 'Slides 2.0 Onyx Black angle' },
      { url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=85', alt: 'Slides 2.0 Onyx Black footbed' },
      { url: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1200&q=85', alt: 'Slides 2.0 Onyx Black sole' },
    ],
    variants: [
      { name: 'UK 6', sku: 'AT-SLD-002-UK6', stock: 6 },
      { name: 'UK 7', sku: 'AT-SLD-002-UK7', stock: 14 },
      { name: 'UK 8', sku: 'AT-SLD-002-UK8', stock: 22 },
      { name: 'UK 9', sku: 'AT-SLD-002-UK9', stock: 30 },
      { name: 'UK 10', sku: 'AT-SLD-002-UK10', stock: 16 },
      { name: 'UK 11', sku: 'AT-SLD-002-UK11', stock: 8 },
      { name: 'UK 12', sku: 'AT-SLD-002-UK12', stock: 0 },
    ],
  },
  {
    slug: 'slides-2-0-canyon-brown',
    name: 'Slides 2.0: Canyon Brown',
    categorySlug: 'sneakers',
    price: 1299,
    compareAtPrice: 1999,
    sku: 'AT-SLD-003-BRN',
    featured: false,
    shortDescription: 'Earth-toned recovery sliders with dual-density cushioning.',
    description:
      'Warm earthy tone that pairs effortlessly with linen trousers or off-duty shorts. Seamless one-piece construction impervious to water and easy to wash.',
    images: [
      { url: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1200&q=85', alt: 'Slides 2.0 Canyon Brown' },
      { url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1200&q=85', alt: 'Slides 2.0 Canyon Brown footbed' },
      { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=85', alt: 'Slides 2.0 Canyon Brown detail' },
    ],
    variants: [
      { name: 'UK 7', sku: 'AT-SLD-003-UK7', stock: 10 },
      { name: 'UK 8', sku: 'AT-SLD-003-UK8', stock: 15 },
      { name: 'UK 9', sku: 'AT-SLD-003-UK9', stock: 18 },
      { name: 'UK 10', sku: 'AT-SLD-003-UK10', stock: 11 },
      { name: 'UK 11', sku: 'AT-SLD-003-UK11', stock: 0 },
    ],
  },
  {
    slug: 'slides-2-0-steel-grey',
    name: 'Slides 2.0: Steel Grey',
    categorySlug: 'sneakers',
    price: 1299,
    compareAtPrice: 1999,
    sku: 'AT-SLD-004-GRY',
    featured: false,
    shortDescription: 'Clean architectural grey slider in soft matte finish.',
    description:
      'A modern industrial hue crafted for understated luxury. Engineered for post-workout recovery or casual weekend lounging.',
    images: [
      { url: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1200&q=85', alt: 'Slides 2.0 Steel Grey profile' },
      { url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1200&q=85', alt: 'Slides 2.0 Steel Grey studio' },
    ],
    variants: [
      { name: 'UK 7', sku: 'AT-SLD-004-UK7', stock: 9 },
      { name: 'UK 8', sku: 'AT-SLD-004-UK8', stock: 16 },
      { name: 'UK 9', sku: 'AT-SLD-004-UK9', stock: 20 },
      { name: 'UK 10', sku: 'AT-SLD-004-UK10', stock: 8 },
    ],
  },
  {
    slug: 'heavyweight-boxy-tee-bone',
    name: 'Heavyweight Boxy Tee: Bone',
    categorySlug: 't-shirts',
    price: 1499,
    compareAtPrice: 2199,
    sku: 'AT-TEE-001-BNE',
    featured: true,
    shortDescription: '280 GSM combed organic cotton with relaxed drop-shoulder cut.',
    description:
      'Knitted from heavyweight 280 GSM long-staple organic cotton. Cut with clean square proportions, slightly dropped shoulders and a dense ribbed collar that holds its shape wash after wash.',
    images: [
      { url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=85', alt: 'Heavyweight Boxy Tee Bone model front' },
      { url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1200&q=85', alt: 'Heavyweight Boxy Tee Bone fabric texture' },
      { url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=85', alt: 'Heavyweight Boxy Tee Bone back drape' },
      { url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=85', alt: 'Heavyweight Boxy Tee Bone detail' },
    ],
    variants: [
      { name: 'S', sku: 'AT-TEE-001-S', stock: 12 },
      { name: 'M', sku: 'AT-TEE-001-M', stock: 25 },
      { name: 'L', sku: 'AT-TEE-001-L', stock: 30 },
      { name: 'XL', sku: 'AT-TEE-001-XL', stock: 15 },
      { name: 'XXL', sku: 'AT-TEE-001-XXL', stock: 0 },
    ],
  },
  {
    slug: 'washed-oversized-tee-vintage-black',
    name: 'Washed Oversized Tee: Vintage Black',
    categorySlug: 't-shirts',
    price: 1699,
    compareAtPrice: 2299,
    sku: 'AT-TEE-002-BLK',
    featured: true,
    shortDescription: 'Mineral-washed jersey tee with a broken-in, sun-faded feel.',
    description:
      'Understated character through gentle enzyme and stone washing. Delivers a soft, worn-in touch right out of the box with subtle charcoal highs and lows.',
    images: [
      { url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=85', alt: 'Washed Oversized Tee Vintage Black front' },
      { url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=85', alt: 'Washed Oversized Tee Vintage Black side' },
      { url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1200&q=85', alt: 'Washed Oversized Tee collar detail' },
    ],
    variants: [
      { name: 'S', sku: 'AT-TEE-002-S', stock: 8 },
      { name: 'M', sku: 'AT-TEE-002-M', stock: 19 },
      { name: 'L', sku: 'AT-TEE-002-L', stock: 22 },
      { name: 'XL', sku: 'AT-TEE-002-XL', stock: 10 },
      { name: 'XXL', sku: 'AT-TEE-002-XXL', stock: 5 },
    ],
  },
  {
    slug: 'minimalist-crewneck-slate-grey',
    name: 'Minimalist Crewneck: Slate Grey',
    categorySlug: 't-shirts',
    price: 1399,
    compareAtPrice: 1899,
    sku: 'AT-TEE-003-GRY',
    featured: false,
    shortDescription: 'Subtle cool grey tee tailored for effortless layering.',
    description:
      'A versatile foundation piece cut from breathable midweight cotton jersey. Designed to sit cleanly under overshirts, knitwear or blazers.',
    images: [
      { url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1200&q=85', alt: 'Minimalist Crewneck Slate Grey' },
      { url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=85', alt: 'Minimalist Crewneck on hanger' },
    ],
    variants: [
      { name: 'S', sku: 'AT-TEE-003-S', stock: 14 },
      { name: 'M', sku: 'AT-TEE-003-M', stock: 28 },
      { name: 'L', sku: 'AT-TEE-003-L', stock: 20 },
      { name: 'XL', sku: 'AT-TEE-003-XL', stock: 11 },
      { name: 'XXL', sku: 'AT-TEE-003-XXL', stock: 0 },
    ],
  },
  {
    slug: 'linen-camp-collar-shirt-sand',
    name: 'Linen Camp Collar Shirt: Sand',
    categorySlug: 'shirts',
    price: 2999,
    compareAtPrice: 3999,
    sku: 'AT-SHT-001-SND',
    featured: true,
    shortDescription: '100% French flax linen shirt with an open retro camp collar.',
    description:
      'Woven from airy French flax linen and finished with an unstructured Cuban camp collar. Features natural mother-of-pearl buttons and a straight vented hem for untucked ease.',
    images: [
      { url: 'https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?auto=format&fit=crop&w=1200&q=85', alt: 'Linen Camp Collar Shirt Sand model' },
      { url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=85', alt: 'Linen Camp Collar Shirt Sand detail' },
      { url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1200&q=85', alt: 'Linen Camp Collar Shirt texture' },
    ],
    variants: [
      { name: 'S', sku: 'AT-SHT-001-S', stock: 9 },
      { name: 'M', sku: 'AT-SHT-001-M', stock: 16 },
      { name: 'L', sku: 'AT-SHT-001-L', stock: 14 },
      { name: 'XL', sku: 'AT-SHT-001-XL', stock: 7 },
      { name: 'XXL', sku: 'AT-SHT-001-XXL', stock: 3 },
    ],
  },
  {
    slug: 'fine-knit-cotton-polo-navy',
    name: 'Fine-Knit Cotton Polo: Dark Navy',
    categorySlug: 'polos',
    price: 2499,
    compareAtPrice: 3299,
    sku: 'AT-POL-001-NVY',
    featured: true,
    shortDescription: '16-gauge knit polo shirt with buttonless Johnny collar.',
    description:
      'Refined casual elegance. Knitted from ultra-fine combed cotton yarn with a modern buttonless Johnny collar and ribbed micro-cuffs.',
    images: [
      { url: 'https://images.unsplash.com/photo-1625910513413-7221379ecb00?auto=format&fit=crop&w=1200&q=85', alt: 'Fine Knit Cotton Polo Navy front' },
      { url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1200&q=85', alt: 'Fine Knit Cotton Polo Navy side' },
    ],
    variants: [
      { name: 'S', sku: 'AT-POL-001-S', stock: 11 },
      { name: 'M', sku: 'AT-POL-001-M', stock: 20 },
      { name: 'L', sku: 'AT-POL-001-L', stock: 18 },
      { name: 'XL', sku: 'AT-POL-001-XL', stock: 9 },
    ],
  },
  {
    slug: 'linen-overshirt',
    name: 'Linen Overshirt',
    categorySlug: 'apparel',
    price: 12499,
    compareAtPrice: 14999,
    sku: 'AT-OVS-001',
    featured: true,
    shortDescription: 'Relaxed linen overshirt cut from breathable structured drape.',
    description:
      'An architectural silhouette cut from heavyweight pure linen. Features horn buttons, deep chest patch pockets and clean reinforced internal seams.',
    images: [
      { url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1200&q=85', alt: 'Linen Overshirt Natural' },
      { url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1200&q=85', alt: 'Linen Overshirt drape' },
      { url: 'https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?auto=format&fit=crop&w=1200&q=85', alt: 'Linen Overshirt collar' },
    ],
    variants: [
      { name: 'S', sku: 'AT-OVS-001-S', stock: 8 },
      { name: 'M', sku: 'AT-OVS-001-M', stock: 26 },
      { name: 'L', sku: 'AT-OVS-001-L', stock: 18 },
      { name: 'XL', sku: 'AT-OVS-001-XL', stock: 10 },
    ],
  },
  {
    slug: 'stoneware-vessel',
    name: 'Stoneware Vessel',
    categorySlug: 'home',
    price: 5999,
    compareAtPrice: 7500,
    sku: 'AT-VES-002',
    featured: true,
    shortDescription: 'Hand-finished stoneware with softly irregular silhouette.',
    description:
      'Wheel-thrown ceramic stoneware with a tactile unglazed exterior and food-safe glazed interior. Each piece carries subtle organic variations reflecting the artisan’s touch.',
    images: [
      { url: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1200&q=85', alt: 'Stoneware Vessel ceramics' },
      { url: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=1200&q=85', alt: 'Stoneware Vessel styling' },
      { url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=85', alt: 'Stoneware Vessel glaze' },
    ],
    variants: [
      { name: 'Small / 500ml', sku: 'AT-VES-002-SM', stock: 12 },
      { name: 'Medium / 1000ml', sku: 'AT-VES-002-MD', stock: 15 },
      { name: 'Large / 1800ml', sku: 'AT-VES-002-LG', stock: 6 },
    ],
  },
  {
    slug: 'leather-carryall',
    name: 'Leather Carryall',
    categorySlug: 'objects',
    price: 17999,
    compareAtPrice: 22000,
    sku: 'AT-CAR-003',
    featured: true,
    shortDescription: 'Full-grain vegetable-tanned leather carryall designed to age.',
    description:
      'Handcrafted from 2.2mm full-grain vegetable-tanned bovine leather. Solid brass hardware, padded 16” laptop compartment and reinforced saddle-stitched stress points.',
    images: [
      { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=85', alt: 'Leather Carryall Black front' },
      { url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=85', alt: 'Leather Carryall Black side' },
      { url: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=1200&q=85', alt: 'Leather Carryall detail' },
    ],
    variants: [
      { name: 'Black / One Size', sku: 'AT-CAR-003-BLK', stock: 7 },
      { name: 'Cognac / One Size', sku: 'AT-CAR-003-COG', stock: 5 },
    ],
  },
  {
    slug: 'cedar-fig-candle',
    name: 'Cedar & Fig Candle',
    categorySlug: 'home',
    price: 3999,
    compareAtPrice: 4800,
    sku: 'AT-CAN-004',
    featured: false,
    shortDescription: 'Soy wax candle infused with Mediterranean fig leaf and dry cedar.',
    description:
      'Hand-poured 100% soy wax in a reusable matte ceramic vessel. Top notes of wild fig leaf and green stems give way to crushed cedarwood and amber resin. 60 hour clean burn time.',
    images: [
      { url: 'https://images.unsplash.com/photo-1602874801006-e26e5c0c0e0a?auto=format&fit=crop&w=1200&q=85', alt: 'Cedar and Fig Candle lit' },
      { url: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1200&q=85', alt: 'Cedar and Fig Candle vessel' },
    ],
    variants: [
      { name: '220g / 60h', sku: 'AT-CAN-004-220', stock: 32 },
      { name: '450g / 110h', sku: 'AT-CAN-004-450', stock: 14 },
    ],
  },
];

async function main() {
  console.log('=== 1. UPSERTING CATEGORIES WITH VERIFIED HIGH-RES IMAGES ===');
  const categoryMap = {};
  for (const cat of CATEGORIES) {
    const saved = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        imageUrl: cat.imageUrl,
        sortOrder: cat.sortOrder,
        isActive: true,
      },
      create: {
        slug: cat.slug,
        name: cat.name,
        description: cat.description,
        imageUrl: cat.imageUrl,
        sortOrder: cat.sortOrder,
        isActive: true,
      },
    });
    categoryMap[cat.slug] = saved.id;
    console.log(`  ✓ Category [${cat.slug}]: "${cat.name}"`);
  }

  // Clean up incomplete / broken test product "dr doom" if present
  const brokenProduct = await prisma.product.findUnique({ where: { slug: 'marvel-movie' } });
  if (brokenProduct) {
    await prisma.productVariant.deleteMany({ where: { productId: brokenProduct.id } });
    await prisma.productImage.deleteMany({ where: { productId: brokenProduct.id } });
    await prisma.product.delete({ where: { id: brokenProduct.id } });
    console.log('  ✓ Removed broken test product "dr doom"');
  }

  console.log('\n=== 2. UPSERTING REAL PRODUCTS WITH HIGH-RES GALLERIES & VARIANTS ===');
  for (const p of PRODUCTS) {
    const categoryId = categoryMap[p.categorySlug];
    if (!categoryId) {
      console.warn(`Category not found for slug: ${p.categorySlug}`);
      continue;
    }

    const savedProduct = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        categoryId,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        sku: p.sku,
        featured: p.featured,
        shortDescription: p.shortDescription,
        description: p.description,
        status: ProductStatus.ACTIVE,
        seoTitle: `${p.name} — ATELIER`,
        seoDescription: p.shortDescription,
      },
      create: {
        slug: p.slug,
        name: p.name,
        categoryId,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        sku: p.sku,
        featured: p.featured,
        shortDescription: p.shortDescription,
        description: p.description,
        status: ProductStatus.ACTIVE,
        seoTitle: `${p.name} — ATELIER`,
        seoDescription: p.shortDescription,
      },
    });

    // Replace images with clean, high-res gallery
    await prisma.productImage.deleteMany({ where: { productId: savedProduct.id } });
    for (let i = 0; i < p.images.length; i++) {
      const img = p.images[i];
      await prisma.productImage.create({
        data: {
          productId: savedProduct.id,
          url: img.url,
          alt: img.alt,
          sortOrder: i,
          isPrimary: i === 0,
        },
      });
    }

    // Upsert variants
    for (const v of p.variants) {
      await prisma.productVariant.upsert({
        where: { sku: v.sku },
        update: {
          productId: savedProduct.id,
          name: v.name,
          stock: v.stock,
          isActive: true,
          price: p.price,
        },
        create: {
          productId: savedProduct.id,
          sku: v.sku,
          name: v.name,
          stock: v.stock,
          isActive: true,
          price: p.price,
        },
      });
    }

    console.log(`  ✓ Product [${p.slug}]: ${p.name} (${p.images.length} images, ${p.variants.length} variants)`);
  }

  console.log('\nMaster catalog seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
