const buildFileTree = (files) => {
  const tree = {};

  files.forEach((file) => {
    const path = file.file_path.replace(/\\/g, "/");
    const parts = path.split("/");

    const startIndex = parts.findIndex((p) => p === "backend" || p === "src");

    const cleanParts = startIndex !== -1 ? parts.slice(startIndex) : parts;

    let current = tree;

    cleanParts.forEach((part, index) => {
      if (!current[part]) {
        current[part] = {
          __children: {},
        };
      }

      if (index === cleanParts.length - 1) {
        current[part].file = file;
      }

      current = current[part].__children;
    });
  });

  return tree;
};

export default buildFileTree;
