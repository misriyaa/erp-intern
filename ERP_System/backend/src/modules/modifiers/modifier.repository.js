import prisma from "../../config/prisma.js";

export const createModifierGroup = async (data) => {
  const { modifiers, ...groupData } = data;
  return await prisma.modifierGroup.create({
    data: {
      ...groupData,
      ...(modifiers && modifiers.length > 0
        ? {
            modifiers: {
              create: modifiers.map((m) => ({
                name: m.name,
                price: parseFloat(m.price || 0),
                status: m.status || "ACTIVE",
              })),
            },
          }
        : {}),
    },
    include: {
      modifiers: true,
      menuItems: {
        include: {
          menuItem: true,
        },
      },
    },
  });
};

export const getModifierGroups = async (restaurantId) => {
  const where = {};
  if (restaurantId) where.restaurantId = restaurantId;

  return await prisma.modifierGroup.findMany({
    where,
    include: {
      modifiers: true,
      menuItems: {
        include: {
          menuItem: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getModifierGroupById = async (id) => {
  return await prisma.modifierGroup.findUnique({
    where: { id },
    include: {
      modifiers: true,
      menuItems: {
        include: {
          menuItem: true,
        },
      },
    },
  });
};

export const updateModifierGroup = async (id, data) => {
  const { modifiers, ...groupData } = data;

  return await prisma.$transaction(async (tx) => {
    if (modifiers !== undefined) {
      await tx.modifier.deleteMany({
        where: { groupId: id },
      });
      if (modifiers.length > 0) {
        await tx.modifier.createMany({
          data: modifiers.map((m) => ({
            groupId: id,
            name: m.name,
            price: parseFloat(m.price || 0),
            status: m.status || "ACTIVE",
          })),
        });
      }
    }

    return await tx.modifierGroup.update({
      where: { id },
      data: groupData,
      include: {
        modifiers: true,
      },
    });
  });
};

export const linkMenuItemModifierGroup = async (menuItemId, modifierGroupId) => {
  return await prisma.menuItemModifierGroup.upsert({
    where: {
      menuItemId_modifierGroupId: {
        menuItemId,
        modifierGroupId,
      },
    },
    create: {
      menuItemId,
      modifierGroupId,
    },
    update: {},
  });
};

export const unlinkMenuItemModifierGroup = async (menuItemId, modifierGroupId) => {
  return await prisma.menuItemModifierGroup.delete({
    where: {
      menuItemId_modifierGroupId: {
        menuItemId,
        modifierGroupId,
      },
    },
  });
};

export const deleteModifierGroup = async (id) => {
  return await prisma.modifierGroup.delete({
    where: { id },
  });
};
