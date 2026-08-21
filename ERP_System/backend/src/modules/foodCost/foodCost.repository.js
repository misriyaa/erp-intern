import prisma from "../../config/prisma.js";

export const getFoodCostingReport = async (restaurantId) => {
  const where = {};
  if (restaurantId) where.restaurantId = restaurantId;

  const menuItems = await prisma.menuItem.findMany({
    where,
    include: {
      category: true,
      recipe: {
        include: {
          ingredients: {
            include: {
              product: true,
            },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return menuItems.map((item) => {
    const sellingPrice = parseFloat(item.sellingPrice) || 0;
    let calculatedCost = 0;

    if (item.recipe && item.recipe.ingredients) {
      calculatedCost = item.recipe.ingredients.reduce((sum, ing) => {
        const prodCost = parseFloat(ing.product?.costPrice) || 0;
        return sum + prodCost * (ing.quantity || 0);
      }, 0);
    } else {
      calculatedCost = parseFloat(item.costPrice) || 0;
    }

    const grossMargin = sellingPrice - calculatedCost;
    const foodCostPercentage = sellingPrice > 0 ? (calculatedCost / sellingPrice) * 100 : 0;

    return {
      menuItemId: item.id,
      name: item.name,
      categoryName: item.category?.name || "Uncategorized",
      sellingPrice,
      recipeCost: calculatedCost,
      grossMargin,
      foodCostPercentage: parseFloat(foodCostPercentage.toFixed(2)),
      hasRecipe: Boolean(item.recipe),
      ingredientCount: item.recipe?.ingredients?.length || 0,
    };
  });
};
