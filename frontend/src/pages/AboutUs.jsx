import SitemarkIcon from '../components/SitemarkIcon';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';


export default function About(props) {
  return (
    <Container id="features" sx={{ pt: { xs: 12, sm: 12 } }}>
      <Box sx={{ width: { sm: '100%', md: '60%' } }}>
        <Typography
          component="h2"
          variant="h4"
          gutterBottom
          sx={{ color: 'text.primary' }}
        >
          Who are we?
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: 'text.secondary', mb: { xs: 2, sm: 4 } }}
        >
          We are a small bunch of wanna-be developers who aim and
          strive for a better future. The application we, along with our mentor,
          managed to create in the limit of 24 hours is a small examples of the many
          posibilities on how to protect ourselves, our cities and our nature.
          </Typography>
      </Box>
    </Container>
  );
}
