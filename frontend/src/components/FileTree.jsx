import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const FileTree = ({ tree, level = 0, onSelect }) => {
  return Object.keys(tree).map((key) => {
    const node = tree[key];
    const isFile = !!node.file;

    return (
      <Box key={key} sx={{ pl: level * 1 }}>
        <Typography
          onClick={() => isFile && onSelect(node.file)}
          sx={{
            fontSize: "13px",
            cursor: isFile ? "pointer" : "default",
            mb: 0.5,
            "&:hover": isFile ? { color: "#60a5fa" } : {},
          }}
        >
          {isFile ? "📄" : "📁"} {key}
        </Typography>

        {Object.keys(node.__children).length > 0 && (
          <FileTree
            tree={node.__children}
            level={level + 1}
            onSelect={onSelect}
          />
        )}
      </Box>
    );
  });
};

export default FileTree;
