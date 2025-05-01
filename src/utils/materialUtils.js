export const aggregateMaterials = (materials) => {
    const materialMap = new Map();

    materials.forEach((material) => {
        const key = material.materialName;
        if (materialMap.has(key)) {
            const existingMaterial = materialMap.get(key);
            existingMaterial.planQty += material.planQty;
        } else {
            materialMap.set(key, { ...material });
        }
    });

    return Array.from(materialMap.values());
};

export const aggregateMaterialsByBeer = (materials) => {
    const materialMap = new Map();

    materials.forEach((material) => {
        const key = `${material.materialName}-${material.stdQty}`;
        if (materialMap.has(key)) {
            const existingMaterial = materialMap.get(key);
            existingMaterial.planQty += material.planQty;
        } else {
            materialMap.set(key, { ...material });
        }
    });

    return Array.from(materialMap.values());
};
