import SitemarkIcon from '../components/SitemarkIcon';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

export default function BasePage(props) {
  return (
    <Container id="features" sx={{ pt: { xs: 12, sm: 12 } }}>
      <Box sx={{ width: { sm: '100%', md: '60%' } }}>
        <Typography
          component="h2"
          variant="h4"
          gutterBottom
          sx={{ color: 'text.primary' }}
        >
          Product features
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: 'text.secondary', mb: { xs: 2, sm: 4 } }}
        >
          Using this app, you can pick a precise locatin of where the problem is,
          allowing the proper authorities to have the location of the report. Everything is stored in
          a database which can be accessed using an admin account.
        </Typography>
      </Box>
    </Container>
  );
}
