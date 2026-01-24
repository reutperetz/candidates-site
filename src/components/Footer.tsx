import { Box, Typography } from "@mui/material";

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "background.paper",
        color: "text.secondary",
        py: 4,
        px: 2,
        mt: 6,
        borderTop: 1,
        borderColor: "divider",
        textAlign: "center",
      }}
    >
      <Box sx={{ maxWidth: 900, mx: "auto" }}>
        <Typography sx={{ mb: 1 }} fontWeight={500}>
          Created by Reut Peretz & Agam Hulio
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          Â© 2025 Ono Academic College
        </Typography>
      </Box>
    </Box>
  );
}

export default Footer;
