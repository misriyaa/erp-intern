import prisma from "../../config/prisma.js";

export const createMenuItem = async (data) => {
  return await prisma.menuItem.create({
    data,
    include: {
      category: true,
      product: true,
      tax: true,
      recipe: {
        include: {
          ingredients: {
            include: {
              product: true,
            },
          },
        },
      },
      modifierGroups: {
        include: {
          modifierGroup: {
            include: {
              modifiers: true,
            },
          },
        },
      },
    },
  });
};

export const getMenuItems = async (restaurantId, categoryId) => {
  const where = {};
  if (restaurantId) where.restaurantId = restaurantId;
  if (categoryId) where.categoryId = categoryId;

  return await prisma.menuItem.findMany({
    where,
    include: {
      category: true,
      product: true,
      tax: true,
      recipe: {
        include: {
          ingredients: {
            include: {
              product: true,
            },
          },
        },
      },
      modifierGroups: {
        include: {
          modifierGroup: {
            include: {
              modifiers: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getMenuItemById = async (id) => {
  return await prisma.menuItem.findUnique({
    where: { id },
    include: {
      category: true,
      product: true,
      tax: true,
      recipe: {
        include: {
          ingredients: {
            include: {
              product: true,
            },
          },
        },
      },
      modifierGroups: {
        include: {
          modifierGroup: {
            include: {
              modifiers: true,
            },
          },
        },
      },
    },
  });
};

export const updateMenuItem = async (id, data) => {
  return await prisma.menuItem.update({
    where: { id },
    data,
    include: {
      category: true,
      tax: true,
      recipe: {
        include: {
          ingredients: true,
        },
      },
    },
  });
};

export const deleteMenuItem = async (id) => {
  return await prisma.menuItem.delete({
    where: { id },
  });
};
