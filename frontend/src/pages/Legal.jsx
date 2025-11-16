import SitemarkIcon from '../components/SitemarkIcon';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

export default function BasePage() {
  return (
    <Container 
      id="features" 
      sx={{ 
        pt: { xs: 12, sm: 12 },
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: "center",
        justifyContent: "space-between",
        gap: 4
      }}
    >
      {/* LEFT SIDE */}
      <Box sx={{ width: { xs: '100%', md: '60%' } }}>
        <Typography
          component="h2"
          variant="h4"
          gutterBottom
          sx={{ color: 'text.primary' }}
        >
          Legal information
        </Typography>

        <Typography
          variant="body1"
          sx={{ color: 'text.secondary', mb: { xs: 2, sm: 4 } }}
        >
          We will call our lawyers, so don't steal. JuniorAccelerator said 
          they'll pay the lawsuit.
        </Typography>
      </Box>

      {/* RIGHT SIDE – IMAGE */}
      <Box
        sx={{
          width: { xs: '100%', md: '40%' },
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <img
          src="https://z6njwbwc7w.ufs.sh/f/kUl7Sde7djOlwhRadbBpStjA1TZUfEDqYWsKzQ7GHaIXd5iM"
          alt="Legal illustration"
          style={{
            width: "100%",
            maxWidth: "420px",
            borderRadius: "12px",
            objectFit: "cover",
          }}
        />
      </Box>
    </Container>
  );
}
