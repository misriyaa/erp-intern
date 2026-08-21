import prisma from "../../config/prisma.js";

export const upsertRecipe = async (menuItemId, data) => {
  const { ingredients, ...recipeFields } = data;

  return await prisma.$transaction(async (tx) => {
    let recipe = await tx.recipe.findUnique({
      where: { menuItemId },
    });

    if (recipe) {
      await tx.recipeIngredient.deleteMany({
        where: { recipeId: recipe.id },
      });
      recipe = await tx.recipe.update({
        where: { id: recipe.id },
        data: recipeFields,
      });
    } else {
      recipe = await tx.recipe.create({
        data: {
          ...recipeFields,
          menuItemId,
        },
      });
    }

    let calculatedTotalCost = 0;

    if (ingredients && ingredients.length > 0) {
      for (const ing of ingredients) {
        const product = await tx.product.findUnique({
          where: { id: ing.productId },
        });

        const unitCost = product ? parseFloat(product.costPrice) || 0 : 0;
        const ingCost = unitCost * parseFloat(ing.quantity || 0);
        calculatedTotalCost += ingCost;

        await tx.recipeIngredient.create({
          data: {
            recipeId: recipe.id,
            productId: ing.productId,
            quantity: parseFloat(ing.quantity),
            unit: ing.unit || product?.stockUnit || "unit",
            cost: ingCost,
          },
        });
      }
    }

    const updatedRecipe = await tx.recipe.update({
      where: { id: recipe.id },
      data: {
        totalCost: calculatedTotalCost,
      },
      include: {
        ingredients: {
          include: {
            product: true,
          },
        },
        menuItem: true,
      },
    });

    await tx.menuItem.update({
      where: { id: menuItemId },
      data: { costPrice: calculatedTotalCost },
    });

    return updatedRecipe;
  });
};

export const getRecipeByMenuItem = async (menuItemId) => {
  return await prisma.recipe.findUnique({
    where: { menuItemId },
    include: {
      ingredients: {
        include: {
          product: true,
        },
      },
      menuItem: true,
    },
  });
};

export const getAllRecipes = async (restaurantId) => {
  const where = {};
  if (restaurantId) {
    where.menuItem = { restaurantId };
  }

  return await prisma.recipe.findMany({
    where,
    include: {
      ingredients: {
        include: {
          product: true,
        },
      },
      menuItem: {
        include: {
          category: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const deleteRecipe = async (id) => {
  return await prisma.recipe.delete({
    where: { id },
  });
};
